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
