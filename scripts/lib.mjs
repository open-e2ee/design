import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function writeText(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value.endsWith('\n') ? value : `${value}\n`);
}

/*
 * Color math. One implementation, because the build derives values from it,
 * the suite asserts against it, and scripts/measure-role-hues.mjs reports it.
 * Two copies drift, and a drift here reads as a palette change.
 */
export function channels(hex) {
  return hex
    .match(/[0-9a-f]{2}/gi)
    .map((channel) => Number.parseInt(channel, 16) / 255);
}

const toLinear = (channel) =>
  channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;

const toGamma = (channel) =>
  channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;

export function luminance(hex) {
  const [red, green, blue] = channels(hex).map(toLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

export function contrast(foreground, background) {
  const [high, low] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (high + 0.05) / (low + 0.05);
}

export function oklch(hex) {
  const [red, green, blue] = channels(hex).map(toLinear);
  const long = Math.cbrt(
    0.4122214708 * red + 0.5363325363 * green + 0.0514459929 * blue,
  );
  const medium = Math.cbrt(
    0.2119034982 * red + 0.6806995451 * green + 0.1073969566 * blue,
  );
  const short = Math.cbrt(
    0.0883024619 * red + 0.2817188376 * green + 0.6299787005 * blue,
  );
  const lightness =
    0.2104542553 * long + 0.793617785 * medium - 0.0040720468 * short;
  const a = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
  const b = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short;
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return { lightness, chroma: Math.hypot(a, b), hue: hue < 0 ? hue + 360 : hue };
}

function oklchRgb(lightness, chroma, hue) {
  const radians = (hue * Math.PI) / 180;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const long = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const medium = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const short = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * long - 3.3077115913 * medium + 0.2309699292 * short,
    -1.2684380046 * long + 2.6097574011 * medium - 0.3413193965 * short,
    -0.0041960863 * long - 0.7034186147 * medium + 1.707614701 * short,
  ];
}

/*
 * OKLCH to sRGB hex. A requested chroma outside the sRGB gamut is reduced by
 * bisection until it fits, so a tint rule states one intent and every hue
 * lands at the closest color that exists.
 */
export function oklchHex({ lightness, chroma, hue }) {
  const fits = (value) =>
    oklchRgb(lightness, value, hue).every(
      (channel) => channel >= -1e-4 && channel <= 1 + 1e-4,
    );
  let value = chroma;
  if (!fits(value)) {
    let low = 0;
    let high = chroma;
    for (let step = 0; step < 40; step += 1) {
      const middle = (low + high) / 2;
      if (fits(middle)) low = middle;
      else high = middle;
    }
    value = low;
  }
  return `#${oklchRgb(lightness, value, hue)
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, toGamma(channel))) * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;
}

/*
 * The shortest signed distance between two hue angles, in degrees.
 */
export function hueDistance(left, right) {
  const delta = Math.abs(left - right) % 360;
  return delta > 180 ? 360 - delta : delta;
}

export function getAtPath(object, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], object);
}

export function resolveReferences(value, primitives) {
  if (typeof value === 'string') {
    const match = value.match(/^\{([^}]+)\}$/);
    if (!match) return value;
    const resolved = getAtPath(primitives, match[1]);
    if (resolved === undefined) {
      throw new Error(`Unknown token reference: ${value}`);
    }
    return resolveReferences(resolved, primitives);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveReferences(entry, primitives));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        resolveReferences(entry, primitives),
      ]),
    );
  }

  return value;
}

export function flatten(object, prefix = []) {
  const entries = [];
  for (const [key, value] of Object.entries(object)) {
    const path = [...prefix, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flatten(value, path));
    } else {
      entries.push([path.join('-'), value]);
    }
  }
  return entries;
}

export async function filesIn(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (
      entry.name === '.DS_Store' ||
      entry.name === '.source.json' ||
      entry.name === 'manifest.json'
    ) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path, root));
    if (entry.isFile()) files.push(relative(root, path));
  }
  return files.sort();
}

export async function digestDirectory(directory) {
  const hash = createHash('sha256');
  for (const file of await filesIn(directory)) {
    hash.update(file);
    hash.update('\0');
    hash.update(await readFile(join(directory, file)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export function cssDeclarations(entries, prefix = '--oe-') {
  return entries.map(([name, value]) => `  ${prefix}${name}: ${value};`).join('\n');
}

/*
 * Text measurement.
 *
 * Generated SVG has no layout engine behind it. The build measures every string
 * it draws against the box drawn for it, and the test suite re-measures the
 * generated files to check nothing collides — both from here, so a card cannot
 * pass its test by being measured with a different ruler than it was laid out
 * with.
 */

/* JetBrains Mono is monospaced at 600/1000 em across the Latin set. */
export const MONO_ADVANCE = 0.6;

export const monoWidth = (text, size) => text.length * MONO_ADVANCE * size;

export function textWidth(metrics, text, { size, weight = 500, tracking = 0 }) {
  const advances = metrics.advances[String(weight)];
  if (!advances) {
    throw new Error(`No ${metrics.family} metrics for weight ${weight}.`);
  }
  let units = 0;
  for (const character of text) {
    const advance = advances[character];
    if (advance === undefined) {
      throw new Error(
        `No advance for ${JSON.stringify(character)} in brand copy ${JSON.stringify(text)}. Re-run scripts/extract-font-metrics.py with the character added.`,
      );
    }
    units += advance;
  }
  /* Tracking is applied after every character, matching CSS letter-spacing. */
  return (units / metrics.unitsPerEm + text.length * tracking) * size;
}
