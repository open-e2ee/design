import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, resolveReferences } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const primitives = await readJson(join(root, 'tokens', 'primitives.json'));
const semantic = resolveReferences(
  await readJson(join(root, 'tokens', 'semantic.json')),
  primitives,
);
const geometry = await readJson(join(root, 'brand', 'source', 'geometry.json'));

function channels(hex) {
  return hex
    .match(/[0-9a-f]{2}/gi)
    .map((channel) => Number.parseInt(channel, 16) / 255);
}

function toLinear(channel) {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

function luminance(hex) {
  const [red, green, blue] = channels(hex).map(toLinear);
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function contrast(foreground, background) {
  const [high, low] = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (high + 0.05) / (low + 0.05);
}

function oklch(hex) {
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
  const a = 1.9779984951 * long - 2.428592205 * medium + 0.4505937099 * short;
  const b = 0.0259040371 * long + 0.7827717662 * medium - 0.808675766 * short;
  const hue = (Math.atan2(b, a) * 180) / Math.PI;
  return { chroma: Math.hypot(a, b), hue: hue < 0 ? hue + 360 : hue };
}

/*
 * Contrast. Every ratio below was published in the identity specification and
 * is re-derived here, so a palette edit that quietly degrades a pair fails the
 * build rather than shipping.
 */
const light = semantic.light;
const dark = semantic.dark;
const contrastPairs = [
  ['light foreground/canvas', light.foreground, light.canvas, 4.5, 18.75],
  ['light foreground/surface', light.foreground, light.surface, 4.5, 17.76],
  ['light muted/canvas', light.muted, light.canvas, 4.5, 6.12],
  ['light muted/surface', light.muted, light.surface, 4.5, 5.8],
  ['light subtle/canvas', light.subtle, light.canvas, 3, 3.93],
  ['light link/canvas', light.link, light.canvas, 4.5, 7.94],
  ['light link/surface', light.link, light.surface, 4.5, 7.52],
  ['light accent button', light['accent-foreground'], light.accent, 4.5, 6.1],
  ['light verified/canvas', light.verified, light.canvas, 4.5, 5.67],
  ['light sealed/canvas', light.sealed, light.canvas, 4.5, 8.8],
  ['light danger/canvas', light.danger, light.canvas, 4.5, 6.97],
  ['light border-control/canvas', light['border-control'], light.canvas, 3, 3.93],
  ['light focus/canvas', light.focus, light.canvas, 3, 5.81],
  ['light focus/surface', light.focus, light.surface, 3, 5.5],
  ['light code', light['code-foreground'], light.code, 4.5, 11.48],
  ['light sealed chip', light.sealed, light['sealed-surface'], 4.5, 7.96],
  ['light verified chip', light.verified, light['verified-surface'], 4.5, 5.25],
  ['light danger chip', light.danger, light['danger-surface'], 4.5, 6.27],
  ['light accent chip', light.link, light['accent-surface'], 4.5, 6.73],
  ['dark foreground/canvas', dark.foreground, dark.canvas, 4.5, 17.76],
  ['dark foreground/surface-raised', dark.foreground, dark['surface-raised'], 4.5, 16.45],
  ['dark muted/canvas', dark.muted, dark.canvas, 4.5, 7.35],
  ['dark muted/surface', dark.muted, dark.surface, 4.5, 7.08],
  ['dark subtle/canvas', dark.subtle, dark.canvas, 4.5, 4.77],
  ['dark link/canvas', dark.link, dark.canvas, 4.5, 9.17],
  ['dark accent button', dark['accent-foreground'], dark.accent, 4.5, 9.17],
  ['dark verified/canvas', dark.verified, dark.canvas, 4.5, 11.38],
  ['dark sealed/canvas', dark.sealed, dark.canvas, 4.5, 10.73],
  ['dark danger/canvas', dark.danger, dark.canvas, 4.5, 9.65],
  ['dark border-control/canvas', dark['border-control'], dark.canvas, 3, 4.77],
  ['dark focus/canvas', dark.focus, dark.canvas, 3, 9.17],
  ['dark code', dark['code-foreground'], dark.code, 4.5, 13.76],
  ['dark sealed chip', dark.sealed, dark['sealed-surface'], 4.5, 7.12],
  ['dark verified chip', dark.verified, dark['verified-surface'], 4.5, 5.14],
  ['dark danger chip', dark.danger, dark['danger-surface'], 4.5, 4.94],
  ['dark accent chip', dark.link, dark['accent-surface'], 4.5, 6.7],
];

for (const [label, foreground, background, minimum, expected] of contrastPairs) {
  const ratio = contrast(foreground, background);
  assert.ok(
    ratio >= minimum,
    `${label} contrast ${ratio.toFixed(2)} is below ${minimum}:1`,
  );
  assert.ok(
    Math.abs(ratio - expected) < 0.02,
    `${label} contrast ${ratio.toFixed(2)} no longer matches the published ${expected}:1`,
  );
}

/*
 * Warm-neutral lint. The single neutral ramp sits at OKLCH hue 80. Above about
 * 0.014 chroma it stops reading as warm neutral and starts reading as beige,
 * which is the documented way this palette drifts.
 */
for (const [step, hex] of Object.entries(primitives.color.paper)) {
  const { chroma, hue } = oklch(hex);
  assert.ok(
    chroma <= 0.014,
    `paper-${step} chroma ${chroma.toFixed(4)} exceeds 0.014 and reads as beige`,
  );
  if (chroma >= 0.002) {
    assert.ok(
      hue >= 66 && hue <= 96,
      `paper-${step} hue ${hue.toFixed(1)} has left the warm neutral band`,
    );
  }
}

const rampHues = {
  ultra: [266, 274],
  seal: [70, 80],
  verify: [154, 162],
  alert: [22, 32],
};
for (const [ramp, [low, high]] of Object.entries(rampHues)) {
  for (const [step, hex] of Object.entries(primitives.color[ramp])) {
    const { hue } = oklch(hex);
    assert.ok(
      hue >= low && hue <= high,
      `${ramp}-${step} hue ${hue.toFixed(1)} is outside ${low}–${high}`,
    );
  }
}

/*
 * Mark geometry. The payload never touching a bracket is the trust boundary
 * drawn as absence, so it is asserted rather than described.
 */
function pathPoints(definition) {
  const tokens = definition.match(/[MHVLZ]|-?\d+(?:\.\d+)?/gi) ?? [];
  const points = [];
  let cursor = { x: 0, y: 0 };
  let command = null;
  let index = 0;
  while (index < tokens.length) {
    if (/^[MHVLZ]$/i.test(tokens[index])) {
      command = tokens[index].toUpperCase();
      index += 1;
      if (command === 'Z') continue;
    }
    if (command === 'M' || command === 'L') {
      cursor = { x: Number(tokens[index]), y: Number(tokens[index + 1]) };
      index += 2;
    } else if (command === 'H') {
      cursor = { x: Number(tokens[index]), y: cursor.y };
      index += 1;
    } else if (command === 'V') {
      cursor = { x: cursor.x, y: Number(tokens[index]) };
      index += 1;
    } else {
      throw new Error(`Unsupported path command in ${definition}`);
    }
    points.push(cursor);
  }
  return points;
}

function edges(points) {
  return points.map((point, index) => [point, points[(index + 1) % points.length]]);
}

function pointToSegment(point, [start, end]) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared,
          ),
        );
  return Math.hypot(point.x - (start.x + t * dx), point.y - (start.y + t * dy));
}

function polygonDistance(a, b) {
  let smallest = Infinity;
  for (const edgeA of edges(a)) {
    for (const edgeB of edges(b)) {
      smallest = Math.min(
        smallest,
        pointToSegment(edgeA[0], edgeB),
        pointToSegment(edgeA[1], edgeB),
        pointToSegment(edgeB[0], edgeA),
        pointToSegment(edgeB[1], edgeA),
      );
    }
  }
  return smallest;
}

function bracketPath({ x, y, arm, thickness, height }) {
  return `M${x} ${y} H${x + arm} V${y + thickness} H${x + thickness} V${y + height - thickness} H${x + arm} V${y + height} H${x} Z`;
}

function mirroredBracketPath({ x, y, width, arm, thickness, height }) {
  const right = x + width;
  return `M${right} ${y} H${right - arm} V${y + thickness} H${right - thickness} V${y + height - thickness} H${right - arm} V${y + height} H${right} Z`;
}

const expectedDiagonalEdges = { full: 2, optical: 0 };

for (const variant of ['full', 'optical']) {
  const shape = geometry[variant];
  const { artwork, arm, thickness, shear } = shape.construction;
  const parameters = {
    x: artwork.x,
    y: artwork.y,
    width: artwork.width,
    height: artwork.height,
    arm,
    thickness,
  };

  assert.equal(
    shape.carrierLeftPath,
    bracketPath(parameters),
    `${variant} left bracket is not the parametric carrier bracket`,
  );
  assert.equal(
    shape.carrierRightPath,
    mirroredBracketPath(parameters),
    `${variant} right bracket is not an exact mirror of the left`,
  );

  const payload = pathPoints(shape.payloadPath);
  const brackets = [
    pathPoints(shape.carrierLeftPath),
    pathPoints(shape.carrierRightPath),
  ];

  for (const bracket of brackets) {
    for (const [start, end] of edges(bracket)) {
      assert.ok(
        start.x === end.x || start.y === end.y,
        `${variant} carrier has a non-orthogonal edge; only the payload may shear`,
      );
    }
  }

  const diagonals = edges(payload).filter(
    ([start, end]) => start.x !== end.x && start.y !== end.y,
  );
  assert.equal(
    diagonals.length,
    expectedDiagonalEdges[variant],
    `${variant} payload should have ${expectedDiagonalEdges[variant]} sheared edges`,
  );

  const declared = Math.min(...Object.values(shape.payloadClearance));
  for (const bracket of brackets) {
    const clearance = polygonDistance(payload, bracket);
    assert.ok(
      clearance > 0,
      `${variant} payload touches a carrier bracket`,
    );
    assert.equal(
      Math.round(clearance * 1000) / 1000,
      declared,
      `${variant} payload clearance ${clearance} does not match the declared ${declared}`,
    );
  }

  const xs = payload.map((point) => point.x);
  assert.equal(
    (Math.min(...xs) + Math.max(...xs)) / 2,
    256,
    `${variant} payload is not centered on the canvas`,
  );
  assert.equal(
    shear,
    variant === 'full' ? 24 : 0,
    `${variant} shear has changed`,
  );
}

assert.equal(geometry.clearSpaceRatio, 0.125);
assert.equal(geometry.minimumSize, 16);
assert.equal(geometry.smallMaximumSize, 31);
assert.equal(geometry.opticalCenterOffset, '0px');
for (const rule of ['rotation', 'mirroring', 'animation', 'payload-contact']) {
  assert.ok(
    geometry.rules.forbidden.includes(rule),
    `The mark rules must keep forbidding ${rule}`,
  );
}

const requiredFiles = [
  'packages/design/dist/css/tokens.css',
  'packages/design/dist/css/fonts.css',
  'packages/design/dist/css/tailwind.css',
  'packages/design/dist/index.d.ts',
  'packages/design/dist/theme.mjs',
  'packages/design/dist/theme.d.ts',
  'packages/design/dist/tokens.json',
  'packages/design/dist/assets/open-e2ee-mark-adaptive.svg',
  'packages/design/dist/assets/open-e2ee-mark-adaptive-small.svg',
  'packages/design/dist/assets/open-e2ee-favicon.svg',
  'packages/design/dist/assets/svg/open-e2ee-mark-light.svg',
  'packages/design/dist/assets/svg/open-e2ee-mark-dark.svg',
  'packages/design/dist/assets/svg/open-e2ee-mark-mono.svg',
  'packages/design/dist/assets/svg/open-e2ee-mark-light-small.svg',
  'packages/design/dist/assets/svg/open-e2ee-mark-dark-small.svg',
  'packages/design/dist/assets/svg/open-e2ee-mark-mono-small.svg',
  'packages/design/dist/assets/png/16/open-e2ee-mark-light.png',
  'packages/design/dist/assets/png/32/open-e2ee-mark-light.png',
  'packages/design/dist/assets/png/1024/open-e2ee-mark-dark.png',
  'packages/design/dist/assets/social/open-e2ee-design-og.svg',
  'packages/design/dist/assets/social/open-e2ee-design-og.png',
];

for (const file of requiredFiles) await access(join(root, file));

/*
 * Variant discipline. Two silhouettes exist, and shipping the wrong one at the
 * wrong size is the failure this repository is most likely to have.
 */
const manifest = await readJson(join(root, 'brand/generated/manifest.json'));
assert.equal(manifest.mark, 'opaque-carrier');
for (const [size, variant] of Object.entries(manifest.variants.png)) {
  const expected = Number(size) <= geometry.smallMaximumSize ? 'optical' : 'full';
  assert.equal(
    variant,
    expected,
    `The ${size} px PNG uses the ${variant} mark; the rule requires ${expected}`,
  );
  assert.ok(
    Number(size) >= geometry.minimumSize,
    `The ${size} px PNG is below the ${geometry.minimumSize} px floor`,
  );
}

for (const [file, variant] of [
  ['brand/generated/svg/open-e2ee-mark-light.svg', 'full'],
  ['brand/generated/svg/open-e2ee-mark-dark-small.svg', 'optical'],
  ['brand/generated/open-e2ee-mark-adaptive.svg', 'full'],
  ['brand/generated/open-e2ee-mark-adaptive-small.svg', 'optical'],
  ['brand/generated/open-e2ee-favicon.svg', 'optical'],
]) {
  const markup = await readFile(join(root, file), 'utf8');
  const other = variant === 'full' ? 'optical' : 'full';
  assert.ok(
    markup.includes(geometry[variant].payloadPath),
    `${file} should carry the ${variant} payload`,
  );
  assert.ok(
    !markup.includes(geometry[other].payloadPath),
    `${file} carries the ${other} payload as well`,
  );
  assert.ok(
    !/gradient|filter|stroke=|opacity/.test(markup),
    `${file} introduced a gradient, stroke, filter, or opacity`,
  );
}

const tokenCss = await readFile(
  join(root, 'packages/design/dist/css/tokens.css'),
  'utf8',
);
assert.match(tokenCss, /--oe-canvas: #faf7f3;/);
assert.match(tokenCss, /--oe-color-paper-500: #807b74;/);
assert.match(tokenCss, /--oe-diagram-boundary: #a5700d;/);
assert.match(tokenCss, /:root\.dark/);
assert.match(tokenCss, /--oe-control-height-md: 2\.75rem;/);

const tailwindCss = await readFile(
  join(root, 'packages/design/dist/css/tailwind.css'),
  'utf8',
);
assert.match(tailwindCss, /--color-canvas: var\(--oe-canvas\);/);
assert.match(tailwindCss, /--color-sealed: var\(--oe-sealed\);/);
assert.match(tailwindCss, /@custom-variant dark/);

process.stdout.write(
  `Verified ${contrastPairs.length} contrast pairs, both mark variants, and ${requiredFiles.length} package artifacts.\n`,
);
