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

function luminance(hex) {
  const channels = hex
    .match(/[0-9a-f]{2}/gi)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4,
    );
  return (
    0.2126 * channels[0] +
    0.7152 * channels[1] +
    0.0722 * channels[2]
  );
}

function contrast(foreground, background) {
  const values = [luminance(foreground), luminance(background)].sort(
    (left, right) => right - left,
  );
  return (values[0] + 0.05) / (values[1] + 0.05);
}

const contrastPairs = [
  ['light foreground/canvas', semantic.light.foreground, semantic.light.canvas, 4.5],
  ['light muted/canvas', semantic.light.muted, semantic.light.canvas, 4.5],
  ['light accent/canvas', semantic.light.accent, semantic.light.canvas, 4.5],
  ['light primary button', semantic.light['primary-foreground'], semantic.light.primary, 4.5],
  ['dark foreground/canvas', semantic.dark.foreground, semantic.dark.canvas, 4.5],
  ['dark muted/canvas', semantic.dark.muted, semantic.dark.canvas, 4.5],
  ['dark accent/canvas', semantic.dark.accent, semantic.dark.canvas, 4.5],
  ['dark primary button', semantic.dark['primary-foreground'], semantic.dark.primary, 4.5],
];

for (const [label, foreground, background, minimum] of contrastPairs) {
  const ratio = contrast(foreground, background);
  assert.ok(
    ratio >= minimum,
    `${label} contrast ${ratio.toFixed(2)} is below ${minimum}:1`,
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
  'packages/design/dist/assets/open-e2ee-shield-adaptive.svg',
  'packages/design/dist/assets/svg/open-e2ee-shield-light.svg',
  'packages/design/dist/assets/svg/open-e2ee-shield-dark.svg',
  'packages/design/dist/assets/png/32/open-e2ee-shield-light.png',
  'packages/design/dist/assets/png/1024/open-e2ee-shield-dark.png',
  'packages/design/dist/assets/social/open-e2ee-design-og.png',
];

for (const file of requiredFiles) await access(join(root, file));

const tokenCss = await readFile(
  join(root, 'packages/design/dist/css/tokens.css'),
  'utf8',
);
assert.match(tokenCss, /--oe-canvas: #f6f8fc;/);
assert.match(tokenCss, /:root\.dark/);
assert.match(tokenCss, /--oe-control-height-md: 2\.75rem;/);

const tailwindCss = await readFile(
  join(root, 'packages/design/dist/css/tailwind.css'),
  'utf8',
);
assert.match(tailwindCss, /--color-canvas: var\(--oe-canvas\);/);
assert.match(tailwindCss, /@custom-variant dark/);

const [socialSource, socialDistribution] = await Promise.all([
  readFile(join(root, 'brand/templates/social/open-e2ee-design-og.png')),
  readFile(
    join(
      root,
      'packages/design/dist/assets/social/open-e2ee-design-og.png',
    ),
  ),
]);
assert.deepEqual(
  socialDistribution,
  socialSource,
  'The distributed social card must match its source template.',
);

process.stdout.write(
  `Verified ${contrastPairs.length} contrast pairs and ${requiredFiles.length} package artifacts.\n`,
);
