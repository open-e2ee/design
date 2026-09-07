import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  contrast,
  filesIn,
  luminance,
  monoWidth,
  oklch,
  oklchHex,
  readJson,
  resolveReferences,
  textWidth,
} from './lib.mjs';
import { AMERICAN_SPELLINGS } from './spellings.mjs';
import * as diagram from '../packages/design/src/diagram.mjs';
import {
  ANNOTATION_PATTERN,
  TAGLINES,
  checkTaglineAnnotation,
  findTaglines,
} from '../packages/design/src/taglines.mjs';
import {
  ICON_VIEW_BOX,
  iconNames,
  iconPaths,
  themeIcons,
} from '../packages/design/src/icons.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const primitives = await readJson(join(root, 'tokens', 'primitives.json'));
const semantic = resolveReferences(
  await readJson(join(root, 'tokens', 'semantic.json')),
  primitives,
);
const components = resolveReferences(
  await readJson(join(root, 'tokens', 'components.json')),
  primitives,
);
const geometry = await readJson(join(root, 'brand', 'source', 'geometry.json'));

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
  ['light foreground/surface-sunken', light.foreground, light['surface-sunken'], 4.5, 16.25],
  ['light muted/canvas', light.muted, light.canvas, 4.5, 6.12],
  ['light muted/surface', light.muted, light.surface, 4.5, 5.8],
  ['light muted/surface-sunken', light.muted, light['surface-sunken'], 4.5, 5.31],
  ['light subtle/canvas', light.subtle, light.canvas, 3, 3.93],
  ['light link/canvas', light.link, light.canvas, 4.5, 7.94],
  ['light link/surface', light.link, light.surface, 4.5, 7.52],
  ['light accent button', light['accent-foreground'], light.accent, 4.5, 6.1],
  ['light verified/canvas', light.verified, light.canvas, 4.5, 5.67],
  ['light sealed/canvas', light.sealed, light.canvas, 4.5, 8.8],
  ['light danger/canvas', light.danger, light.canvas, 4.5, 6.97],
  ['light sync/canvas', light.sync, light.canvas, 4.5, 10.79],
  ['light device/canvas', light.device, light.canvas, 4.5, 9.09],
  ['light border-control/canvas', light['border-control'], light.canvas, 3, 3.93],
  ['light focus/canvas', light.focus, light.canvas, 3, 5.81],
  ['light focus/surface', light.focus, light.surface, 3, 5.5],
  ['light code', light['code-foreground'], light.code, 4.5, 11.53],
  ['light sealed chip', light.sealed, light['sealed-surface'], 4.5, 7.96],
  ['light verified chip', light.verified, light['verified-surface'], 4.5, 5.25],
  ['light danger chip', light.danger, light['danger-surface'], 4.5, 6.27],
  ['light accent chip', light.link, light['accent-surface'], 4.5, 6.73],
  ['light sync chip', light.sync, light['sync-surface'], 4.5, 9.14],
  ['light device chip', light.device, light['device-surface'], 4.5, 7.88],
  ['dark foreground/canvas', dark.foreground, dark.canvas, 4.5, 17.12],
  ['dark foreground/surface', dark.foreground, dark.surface, 4.5, 16.45],
  ['dark foreground/surface-raised', dark.foreground, dark['surface-raised'], 4.5, 15.13],
  ['dark foreground/surface-sunken', dark.foreground, dark['surface-sunken'], 4.5, 17.76],
  ['dark muted/canvas', dark.muted, dark.canvas, 4.5, 7.08],
  ['dark muted/surface', dark.muted, dark.surface, 4.5, 6.8],
  ['dark muted/surface-sunken', dark.muted, dark['surface-sunken'], 4.5, 7.35],
  ['dark subtle/canvas', dark.subtle, dark.canvas, 4.5, 4.6],
  ['dark link/canvas', dark.link, dark.canvas, 4.5, 8.84],
  ['dark accent button', dark['accent-foreground'], dark.accent, 4.5, 9.17],
  ['dark verified/canvas', dark.verified, dark.canvas, 4.5, 10.98],
  ['dark sealed/canvas', dark.sealed, dark.canvas, 4.5, 10.34],
  ['dark danger/canvas', dark.danger, dark.canvas, 4.5, 9.31],
  ['dark sync/canvas', dark.sync, dark.canvas, 4.5, 12.26],
  ['dark device/canvas', dark.device, dark.canvas, 4.5, 10.64],
  ['dark border-control/canvas', dark['border-control'], dark.canvas, 3, 4.6],
  ['dark focus/canvas', dark.focus, dark.canvas, 3, 8.84],
  ['dark code', dark['code-foreground'], dark.code, 4.5, 13.22],
  ['dark sealed chip', dark.sealed, dark['sealed-surface'], 4.5, 7.12],
  ['dark verified chip', dark.verified, dark['verified-surface'], 4.5, 5.14],
  ['dark danger chip', dark.danger, dark['danger-surface'], 4.5, 4.94],
  ['dark accent chip', dark.link, dark['accent-surface'], 4.5, 6.7],
  ['dark sync chip', dark.sync, dark['sync-surface'], 4.5, 9.29],
  ['dark device chip', dark.device, dark['device-surface'], 4.5, 8.35],
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
 * Elevation. A sunken surface that resolves to the canvas is not a surface, it
 * is a claim in the token file that the renderer cannot honor: an inset well
 * simply disappears. Both themes must put a real step between them, and the
 * four elevation levels must all be distinct.
 */
for (const [theme, tokens] of [
  ['light', light],
  ['dark', dark],
]) {
  const levels = ['surface-raised', 'canvas', 'surface', 'surface-sunken'];
  const seen = new Map();
  for (const level of levels) {
    assert.ok(
      !seen.has(tokens[level]),
      `${theme} ${level} and ${seen.get(tokens[level])} are the same color; one of them is not an elevation level`,
    );
    seen.set(tokens[level], level);
  }
  const step = contrast(tokens['surface-sunken'], tokens.canvas);
  assert.ok(
    step > 1.02,
    `${theme} surface-sunken sits ${step.toFixed(3)}:1 from the canvas, which will not read as sunken`,
  );
}

/*
 * The dark ramp is compressed at its dark end, so the sunken step is a smaller
 * ratio there than in light. That is a property of the ramp rather than of the
 * mapping, and it is asserted so a later ramp change has to face it.
 */
assert.ok(
  contrast(light['surface-sunken'], light.canvas) >
    contrast(dark['surface-sunken'], dark.canvas),
  'The light sunken step is no longer the larger of the two; re-check docs/theming.md before changing the published numbers',
);

/*
 * State colors. Each state must be legible on its own, and distinguishable
 * from the others: a `sync` badge that is byte-identical to a link tells the
 * reader nothing that the word alone did not.
 */
for (const [theme, tokens] of [
  ['light', light],
  ['dark', dark],
]) {
  const states = ['verified', 'sealed', 'danger', 'offline', 'sync', 'device'];
  const seen = new Map();
  for (const state of states) {
    assert.ok(tokens[state], `${theme} is missing the ${state} state color`);
    assert.ok(
      tokens[`${state}-surface`] || state === 'offline',
      `${theme} ${state} has no chip surface to pair with`,
    );
    assert.ok(
      !seen.has(tokens[state]),
      `${theme} ${state} and ${seen.get(tokens[state])} are the same color`,
    );
    seen.set(tokens[state], state);
  }
  assert.notEqual(
    tokens.sync,
    tokens.link,
    `${theme} sync is the link color exactly; the state carries no information`,
  );
}

/*
 * The ratchet ramp. DESIGN.md asks for a run of steps "each slightly darker
 * than the last", arriving at ciphertext. Four discrete solid steps, monotonic
 * toward the ciphertext fill, is what replaces the opacity ramp consumers were
 * hand-rolling.
 */
for (const [theme, tokens] of [
  ['light', light],
  ['dark', dark],
]) {
  const ramp = [1, 2, 3, 4].map((step) => tokens[`diagram-ratchet-${step}`]);
  for (const [index, value] of ramp.entries()) {
    assert.ok(value, `${theme} is missing diagram-ratchet-${index + 1}`);
  }
  const luminances = ramp.map(luminance);
  const towardCiphertext =
    luminance(tokens['diagram-ciphertext-fill']) < luminance(tokens.canvas)
      ? (a, b) => a > b
      : (a, b) => a < b;
  for (let index = 1; index < luminances.length; index += 1) {
    assert.ok(
      towardCiphertext(luminances[index - 1], luminances[index]),
      `${theme} ratchet step ${index + 1} does not advance toward the ciphertext fill`,
    );
  }
  assert.equal(
    ramp.at(-1),
    tokens['diagram-ciphertext-fill'],
    `${theme} ratchet does not arrive at the ciphertext fill, so the run reads as fading out`,
  );
  /*
   * Every diagram token reaches 3:1 against the canvas, the non-text minimum a
   * graphical object has to meet to be read. The canvas is the reference for
   * the whole family: an open form leaves its interior transparent, a filled
   * slab sits on the ground, and metadata ticks run along the outside edge of
   * a slab. scripts/measure-diagram-contrast.mjs prints the same numbers.
   */
  for (const token of Object.keys(tokens).filter((name) =>
    name.startsWith('diagram-'),
  )) {
    const ratio = contrast(tokens[token], tokens.canvas);
    assert.ok(
      ratio >= 3,
      `${theme} ${token} measures ${ratio.toFixed(2)}:1 against the canvas, under 3:1`,
    );
  }
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

/*
 * The neutral ramp is read as an ordering: paper-350 must sit between 300 and
 * 400 or every semantic mapping built on "one step darker" is quietly wrong.
 */
const paperSteps = Object.entries(primitives.color.paper).sort(
  ([left], [right]) => Number(left) - Number(right),
);
for (let index = 1; index < paperSteps.length; index += 1) {
  const [step, hex] = paperSteps[index];
  const [previousStep, previousHex] = paperSteps[index - 1];
  assert.ok(
    luminance(hex) < luminance(previousHex),
    `paper-${step} is lighter than paper-${previousStep}; the ramp is no longer monotonic`,
  );
}

const rampHues = {
  ultra: [266, 274],
  info: [236, 246],
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

const expectedDiagonalEdges = { full: 0, optical: 0 };

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

  /*
   * The published primitive draws the mark. This is the whole claim that the
   * diagrams and the logo are one construction, so it is asserted against the
   * shipped function rather than a copy of it kept here.
   */
  const [left, right] = diagram.carrierBracketPaths(parameters);
  assert.equal(
    shape.carrierLeftPath,
    left,
    `${variant} left bracket is not the published carrier bracket primitive`,
  );
  assert.equal(
    shape.carrierRightPath,
    right,
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
  assert.equal(shear, 0, `${variant} payload must be square (shear 0)`);
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

/*
 * The diagram grammar, as golden strings.
 *
 * These are exact because the point of publishing the grammar is that every
 * consumer draws the same shape. A primitive that quietly changes its output
 * changes eight diagrams in four repositories at once, so it has to change
 * here first, deliberately.
 */
const goldenPaths = [
  [
    'slab at rest',
    diagram.slabPath({ x: 10, y: 20, width: 120, height: 64 }),
    'M10 20 L130 20 L130 84 L10 84 Z',
  ],
  [
    'slab in transit',
    diagram.slabPath({ x: 10, y: 20, width: 120, height: 64, shear: 12 }),
    'M22 20 L142 20 L130 84 L10 84 Z',
  ],
  [
    'key silhouette at its construction box',
    diagram.keySilhouettePath({ x: 0, y: 0, width: 26, height: 15 }),
    'M10 5.5 H25 V13 H22 V8.5 H18 V13 H15 V8.5 H10 L7.5 12 H3 L0.5 7 L3 2 H7.5 Z',
  ],
  [
    'key silhouette without a box falls back to that construction',
    diagram.keySilhouettePath({ x: 0, y: 0 }),
    'M10 5.5 H25 V13 H22 V8.5 H18 V13 H15 V8.5 H10 L7.5 12 H3 L0.5 7 L3 2 H7.5 Z',
  ],
  [
    'key silhouette placed and scaled',
    diagram.keySilhouettePath({ x: 10, y: 20, width: 52, height: 30 }),
    'M30 31 H60 V46 H54 V37 H46 V46 H40 V37 H30 L25 44 H16 L11 34 L16 24 H25 Z',
  ],
  [
    'carrier left bracket',
    diagram.carrierBracketPaths({
      x: 0,
      y: 0,
      width: 200,
      height: 160,
      thickness: 16,
      arm: 56,
    })[0],
    'M0 0 H56 V16 H16 V144 H56 V160 H0 Z',
  ],
  [
    'carrier right bracket',
    diagram.carrierBracketPaths({
      x: 0,
      y: 0,
      width: 200,
      height: 160,
      thickness: 16,
      arm: 56,
    })[1],
    'M200 0 H144 V16 H184 V144 H144 V160 H200 Z',
  ],
  [
    'metadata ticks',
    diagram.metadataTicks({ x: 100, y: 200, count: 2 }),
    '<rect x="100" y="186" width="2" height="10" fill="var(--oe-diagram-boundary)"/>' +
      '<rect x="116" y="186" width="2" height="10" fill="var(--oe-diagram-boundary)"/>',
  ],
  [
    'device outline',
    diagram.deviceOutline({ x: 0, y: 0, width: 160, height: 120, bars: 0 }),
    '<rect x="0" y="0" width="160" height="120" fill="none" stroke="var(--oe-diagram-plaintext-stroke)" stroke-width="4"/>',
  ],
  [
    'device outline with a store divider',
    diagram.deviceOutline({
      x: 0,
      y: 0,
      width: 160,
      height: 120,
      bars: 0,
      divider: 80,
    }),
    '<rect x="0" y="0" width="160" height="120" fill="none" stroke="var(--oe-diagram-plaintext-stroke)" stroke-width="4"/>\n' +
      '<line x1="0" y1="80" x2="160" y2="80" stroke="var(--oe-diagram-plaintext-stroke)" stroke-width="4"/>',
  ],
  [
    'boundary line',
    diagram.boundaryLine({ x: 300, top: 40, bottom: 400 }),
    '<line x1="300" y1="40" x2="300" y2="400" stroke="var(--oe-diagram-boundary)" stroke-width="2" stroke-dasharray="2 6"/>',
  ],
  [
    'ratchet ramp',
    diagram.ratchetRamp({ x: 0, y: 0, width: 24, height: 64 }),
    '<rect x="0" y="0" width="24" height="64" fill="var(--oe-diagram-ratchet-1)"/>' +
      '<rect x="36" y="0" width="24" height="64" fill="var(--oe-diagram-ratchet-2)"/>' +
      '<rect x="72" y="0" width="24" height="64" fill="var(--oe-diagram-ratchet-3)"/>' +
      '<rect x="108" y="0" width="24" height="64" fill="var(--oe-diagram-ratchet-4)"/>',
  ],
  [
    /* A short run still arrives at ciphertext: the fills come off the end. */
    'ratchet ramp of three',
    diagram.ratchetRamp({ x: 0, y: 0, width: 24, height: 64, count: 3 }),
    '<rect x="0" y="0" width="24" height="64" fill="var(--oe-diagram-ratchet-2)"/>' +
      '<rect x="36" y="0" width="24" height="64" fill="var(--oe-diagram-ratchet-3)"/>' +
      '<rect x="72" y="0" width="24" height="64" fill="var(--oe-diagram-ratchet-4)"/>',
  ],
];

for (const [label, actual, expected] of goldenPaths) {
  assert.equal(actual, expected, `The ${label} primitive changed shape`);
}

assert.deepEqual(
  diagram.metadataTickRects({ x: 100, y: 200, count: 3 }),
  [
    { x: 100, y: 186, width: 2, height: 10 },
    { x: 116, y: 186, width: 2, height: 10 },
    { x: 132, y: 186, width: 2, height: 10 },
  ],
  'Metadata tick geometry changed',
);
assert.deepEqual(
  diagram.contentBarRects({ x: 0, y: 0, width: 100 }),
  [
    { x: 0, y: 0, width: 75, height: 9 },
    { x: 0, y: 22, width: 85, height: 9 },
    { x: 0, y: 44, width: 60, height: 9 },
  ],
  'Content bar geometry changed',
);

/*
 * The grammar's constants are the ones the component tokens publish. Two
 * numbers for one rule is how a diagram ends up with a 3 px "open" stroke.
 */
assert.equal(`${diagram.STROKE_WIDTH}px`, components.diagram['open-stroke-width']);
assert.equal(`${diagram.ARROW_STROKE_WIDTH}px`, components.diagram['arrow-width']);
assert.equal(`${diagram.TICK_WIDTH}px`, components.diagram['metadata-tick-width']);
assert.equal(`${diagram.TICK_LENGTH}px`, components.diagram['metadata-tick-length']);
assert.equal(`${diagram.BOUNDARY_MIN_GUTTER}px`, components.diagram['boundary-gutter']);
assert.equal(diagram.RATCHET_FILLS.length, diagram.RATCHET_STEPS);

/*
 * The material law, enforced rather than documented. Open is outlined, opaque
 * is filled, and there is no third state — so no primitive may emit alpha, in
 * any of its spellings.
 */
const alphaPattern =
  /\bopacity\s*[=:]|fill-opacity|stroke-opacity|rgba\(|hsla\(|Gradient/i;
const primitiveOutput = [
  diagram.carrierBrackets({
    x: 0,
    y: 0,
    width: 200,
    height: 160,
    thickness: 16,
    arm: 56,
  }),
  diagram.metadataTicks({ x: 0, y: 40, count: 4 }),
  diagram.deviceOutline({ x: 0, y: 0, width: 200, height: 140 }),
  diagram.boundaryLine({ x: 100, top: 0, bottom: 200 }),
  diagram.ratchetRamp({ x: 0, y: 0, width: 24, height: 64 }),
];
for (const markup of primitiveOutput) {
  assert.ok(
    !alphaPattern.test(markup),
    `A diagram primitive emitted alpha: ${markup.slice(0, 120)}`,
  );
}

/*
 * Alpha is banned in the module's source too, not only in one sampling of its
 * output. An `opacity` reachable through an option is still an opacity.
 */
const diagramSource = await readFile(
  join(root, 'packages/design/src/diagram.mjs'),
  'utf8',
);
assert.ok(
  !/\bopacity\b/.test(diagramSource.replace(/\/\*[\s\S]*?\*\//g, '')),
  'The diagram grammar mentions opacity outside its comments',
);

/*
 * Every diagram token a primitive names must exist in both themes, or the
 * primitive draws with an unresolved var() and the shape vanishes.
 */
for (const constant of [
  diagram.CONTENT_BAR_FILL,
  diagram.PLAINTEXT_STROKE,
  diagram.CIPHERTEXT_FILL,
  diagram.CARRIER_STROKE,
  diagram.BOUNDARY_STROKE,
  ...diagram.RATCHET_FILLS,
]) {
  const token = constant.replace(/^var\(--oe-|\)$/g, '');
  assert.ok(light[token], `The light theme has no ${token} token`);
  assert.ok(dark[token], `The dark theme has no ${token} token`);
}

/*
 * Taglines. Each carries its sign-off status, and the helper that enforces
 * annotation on consumers has to hold three ways: catch an unannotated page
 * using a proposed tagline, pass a page whose proposed tagline is broken
 * across elements but properly annotated, and pass an approved tagline with
 * no annotation at all.
 */
assert.equal(TAGLINES.length, 2);
assert.equal(TAGLINES[0].status, 'proposed');
assert.equal(TAGLINES[1].status, 'approved');
const taglineText = TAGLINES[0].text;
const approvedText = TAGLINES[1].text;
assert.equal(
  checkTaglineAnnotation('<p>Nothing to see here.</p>').ok,
  true,
  'A page with no tagline should pass',
);
assert.equal(
  checkTaglineAnnotation(`<h1>${taglineText}</h1>`).ok,
  false,
  'An unannotated tagline should fail',
);
assert.equal(
  checkTaglineAnnotation(
    `<h1>${taglineText}</h1><small>Proposed, pending founder sign-off.</small>`,
  ).ok,
  true,
  'An annotated tagline should pass',
);
assert.equal(
  findTaglines('<h1>Opaque to the <em>relay</em>. Open to inspection.</h1>')
    .length,
  1,
  'A tagline split across elements is still the tagline',
);
assert.equal(
  checkTaglineAnnotation(`<h1>${approvedText}</h1>`).ok,
  true,
  'An approved tagline needs no annotation',
);
assert.equal(
  findTaglines(
    '<h1>The Signal Protocol, where your app actually runs.</h1>',
  ).length,
  1,
  'A tagline still matches through the text-level normalizer',
);
assert.equal(
  checkTaglineAnnotation(
    `<script>const copy = ${JSON.stringify(taglineText)};</script><p>proposed</p>`,
  ).taglines.length,
  0,
  'A tagline inside a script tag is not on the page',
);
assert.ok(ANNOTATION_PATTERN.test('This copy is provisional.'));
assert.ok(!ANNOTATION_PATTERN.test('This copy is final.'));

const requiredFiles = [
  'packages/design/dist/css/tokens.css',
  'packages/design/dist/css/fonts.css',
  'packages/design/dist/css/wordmark.css',
  'packages/design/dist/css/components.css',
  'packages/design/dist/css/tailwind.css',
  'packages/design/dist/css/roles.css',
  'packages/design/dist/icons.mjs',
  'packages/design/dist/icons.d.ts',
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
  'packages/design/dist/assets/social/open-e2ee-signal-protocol-sdk-og.svg',
  'packages/design/dist/assets/social/open-e2ee-website-og.svg',
  'packages/design/dist/assets/social/open-e2ee-org-og.svg',
  'packages/design/dist/assets/lockup/open-e2ee-lockup-symbol-light.svg',
  'packages/design/dist/assets/lockup/open-e2ee-lockup-horizontal-light.svg',
  'packages/design/dist/assets/lockup/open-e2ee-lockup-stacked-light.svg',
  'packages/design/dist/assets/lockup/open-e2ee-lockup-product-light.svg',
  'packages/design/dist/assets/lockup/open-e2ee-lockup-horizontal-mono.svg',
  'packages/design/dist/diagram.mjs',
  'packages/design/dist/diagram.d.ts',
  'packages/design/dist/taglines.mjs',
  'packages/design/dist/taglines.d.ts',
  'LICENSE',
  'brand/third-party/PublicSans-OFL.txt',
  'brand/third-party/Newsreader-OFL.txt',
  'brand/third-party/JetBrainsMono-OFL.txt',
  'docs/diagram-grammar.md',
  'docs/identity-territories.md',
];

for (const file of requiredFiles) await access(join(root, file));

/*
 * The published index has to actually re-export the new modules, or a consumer
 * following docs/diagram-grammar.md imports undefined.
 */
const distributionIndex = await import(
  join(root, 'packages/design/dist/index.mjs')
);
for (const name of [
  'slabPath',
  'keySilhouettePath',
  'carrierBracketPaths',
  'metadataTicks',
  'deviceOutline',
  'boundaryLine',
  'ratchetRamp',
  'checkTaglineAnnotation',
  'applyTheme',
]) {
  assert.equal(
    typeof distributionIndex[name],
    'function',
    `The package index does not export ${name}`,
  );
}

/*
 * Variant discipline. Two silhouettes exist, and shipping the wrong one at the
 * wrong size is the failure this repository is most likely to have.
 */
const manifest = await readJson(join(root, 'brand/generated/manifest.json'));
assert.equal(manifest.mark, 'carrier');
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
  if (geometry[other].payloadPath !== geometry[variant].payloadPath) {
    assert.ok(
      !markup.includes(geometry[other].payloadPath),
      `${file} carries the ${other} payload as well`,
    );
  }
  assert.ok(
    !markup.includes(geometry[other].carrierLeftPath),
    `${file} carries the ${other} carrier as well`,
  );
  assert.ok(
    !/gradient|filter|stroke=|opacity/.test(markup),
    `${file} introduced a gradient, stroke, filter, or opacity`,
  );
}

/*
 * Generated social cards.
 *
 * The card once drew its right carrier bracket at x=1400 on a 1280-wide canvas,
 * so the file claimed a carrier and rendered a single bracket — a different
 * mark, shipped as the repository's public face. Nothing about that was
 * detectable from the SVG source by reading it, so it is checked geometrically:
 * two brackets, mirrored, both on the canvas, and no annotation touching the
 * metadata ticks it annotates.
 */
function svgElements(markup, name) {
  const pattern = new RegExp(`<${name}\\b([^>]*?)/?>`, 'g');
  return [...markup.matchAll(pattern)].map((match) =>
    Object.fromEntries(
      [...match[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [
        key,
        value,
      ]),
    ),
  );
}

function boundingBox(points) {
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);
  return {
    left: Math.min(...xs),
    right: Math.max(...xs),
    top: Math.min(...ys),
    bottom: Math.max(...ys),
  };
}

const overlaps = (a, b) =>
  a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;

const socialSource = await readJson(
  join(root, 'brand/source/social-cards.json'),
);
const typeMetrics = await readJson(
  join(root, 'brand/source/public-sans-metrics.json'),
);
const capRatio = typeMetrics.capHeight / typeMetrics.unitsPerEm;
const descenderRatio = typeMetrics.descender / typeMetrics.unitsPerEm;

assert.equal(
  socialSource.cards.length,
  manifest.social.assets.length,
  'The manifest does not list one card per configured repository',
);

for (const card of socialSource.cards) {
  const entry = manifest.social.assets.find((asset) => asset.slug === card.slug);
  assert.ok(entry, `The manifest has no entry for ${card.slug}`);
  assert.equal(entry.subject, card.subject);

  const file = `brand/generated/social/${card.slug}.svg`;
  const markup = await readFile(join(root, file), 'utf8');
  const [, , viewWidth, viewHeight] = markup
    .match(/viewBox="([\d.-]+) ([\d.-]+) ([\d.-]+) ([\d.-]+)"/)
    .slice(1)
    .map(Number);

  assert.ok(
    markup.includes(`<title id="title">${card.title}</title>`),
    `${file} does not carry its configured title`,
  );

  /*
   * A card has two layers: its own carrier, drawn at card scale, and the org
   * mark embedded in a transformed group. Both are bracket pairs, and the
   * mark's coordinates are in the mark's own 512 space, so counting or bounding
   * them together would both miscount the carrier and let an off-canvas mark
   * pass because 512 is inside 1280.
   */
  const markGroups = [
    ...markup.matchAll(/<g transform="[^"]*">([\s\S]*?)<\/g>/g),
  ];
  assert.equal(
    markGroups.length,
    1,
    `${file} embeds the org mark ${markGroups.length} times; a card carries it exactly once`,
  );
  const markBrackets = svgElements(markGroups[0][1], 'path')
    .map((attributes) => pathPoints(attributes.d))
    .filter((points) => points.length === 8);
  assert.equal(
    markBrackets.length,
    2,
    `${file} embeds a mark with ${markBrackets.length} brackets rather than a pair`,
  );

  const cardLayer = markup.replace(/<g transform="[^"]*">[\s\S]*?<\/g>/g, '');
  const paths = svgElements(cardLayer, 'path').map((attributes) =>
    pathPoints(attributes.d),
  );
  const brackets = paths.filter((points) => points.length === 8);
  assert.equal(
    brackets.length,
    2,
    `${file} draws ${brackets.length} carrier brackets; the carrier is a pair and one bracket is a different mark`,
  );

  const [leftBracket, rightBracket] = brackets
    .map(boundingBox)
    .sort((a, b) => a.left - b.left);
  for (const bracket of [leftBracket, rightBracket]) {
    assert.ok(
      bracket.left >= 0 &&
        bracket.right <= viewWidth &&
        bracket.top >= 0 &&
        bracket.bottom <= viewHeight,
      `${file} draws a carrier bracket outside the canvas: ${JSON.stringify(bracket)}`,
    );
  }
  assert.equal(
    rightBracket.right - rightBracket.left,
    leftBracket.right - leftBracket.left,
    `${file} carrier brackets are not the same width`,
  );
  assert.equal(
    rightBracket.top,
    leftBracket.top,
    `${file} carrier brackets do not share a top edge`,
  );

  /* Every drawn shape stays on the canvas, not only the brackets. */
  for (const points of paths) {
    const box = boundingBox(points);
    assert.ok(
      box.left >= 0 &&
        box.right <= viewWidth &&
        box.top >= 0 &&
        box.bottom <= viewHeight,
      `${file} draws a shape outside the canvas: ${JSON.stringify(box)}`,
    );
  }

  const rects = svgElements(cardLayer, 'rect')
    .filter((attributes) => attributes.x !== undefined)
    .map((attributes) => ({
      left: Number(attributes.x),
      right: Number(attributes.x) + Number(attributes.width),
      top: Number(attributes.y),
      bottom: Number(attributes.y) + Number(attributes.height),
      width: Number(attributes.width),
    }));
  const ticks = rects.filter((rect) => rect.width === diagram.TICK_WIDTH);
  assert.ok(
    ticks.length >= card.plateRows.length,
    `${file} has fewer metadata tick runs than parcels; every sealed parcel carries ticks`,
  );

  /*
   * Label boxes. A baseline sits cap-height above and one descender below, and
   * the string is measured with the same metrics the build laid it out with.
   */
  const labels = [...cardLayer.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)].map(
    ([, attributeText, content]) => {
      const attributes = Object.fromEntries(
        [...attributeText.matchAll(/([\w:-]+)="([^"]*)"/g)].map(
          ([, key, value]) => [key, value],
        ),
      );
      const size = Number(attributes['font-size']);
      const mono = attributes['font-family'].includes('JetBrains');
      const text = content.replace(/<[^>]*>/g, '').trim();
      const width = mono
        ? monoWidth(text, size)
        : textWidth(typeMetrics, text, {
            size,
            weight: Number(attributes['font-weight'] ?? 500),
          });
      return {
        text,
        left: Number(attributes.x),
        right: Number(attributes.x) + width,
        top: Number(attributes.y) - size * capRatio,
        bottom: Number(attributes.y) + size * descenderRatio,
      };
    },
  );

  for (const label of labels) {
    assert.ok(
      label.left >= 0 &&
        label.right <= viewWidth &&
        label.top >= 0 &&
        label.bottom <= viewHeight,
      `${file} sets ${JSON.stringify(label.text)} outside the canvas`,
    );
    for (const tick of ticks) {
      assert.ok(
        !overlaps(label, tick),
        `${file} runs ${JSON.stringify(label.text)} into a run of metadata ticks`,
      );
    }
  }
}

/*
 * Generated brand SVGs carry no alpha, in either direction: the material law
 * holds for the assets, not only for the primitives that draw them.
 */
for (const family of ['social', 'lockup']) {
  for (const file of await filesIn(join(root, 'brand/generated', family))) {
    if (!file.endsWith('.svg')) continue;
    const markup = await readFile(
      join(root, 'brand/generated', family, file),
      'utf8',
    );
    assert.ok(
      !alphaPattern.test(markup),
      `brand/generated/${family}/${file} introduced alpha or a gradient`,
    );
  }
}

/*
 * Lockup proportions. These are DESIGN.md's table, and the whole reason to
 * generate lockups is that consumers deriving them by hand got them wrong.
 */
const lockupSource = await readJson(join(root, 'brand/source/lockups.json'));
const symbolSize = manifest.lockups.symbolSize;
assert.equal(
  manifest.lockups.wordmarkCapHeight,
  Number((symbolSize * lockupSource.proportions.wordmarkCapHeight).toFixed(2)),
  'The wordmark cap height is no longer 0.62 S',
);
assert.equal(
  manifest.lockups.symbolGap,
  Number((symbolSize * lockupSource.proportions.symbolGap).toFixed(2)),
  'The symbol-to-wordmark gap is no longer 0.375 S',
);
assert.equal(
  manifest.lockups.stackedGap,
  Number((symbolSize * lockupSource.proportions.stackedGap).toFixed(2)),
  'The stacked gap is no longer 0.31 S',
);
assert.equal(
  manifest.lockups.productBaselineDrop,
  Number(
    (
      manifest.lockups.wordmarkCapHeight *
      lockupSource.proportions.productBaseline
    ).toFixed(2),
  ),
  'The product baseline is no longer 1.55 wordmark cap heights below the wordmark',
);
assert.equal(
  Number((manifest.lockups.wordmarkFontSize * capRatio).toFixed(2)),
  manifest.lockups.wordmarkCapHeight,
  'The wordmark font size does not produce the specified cap height',
);
for (const name of ['symbol', 'horizontal', 'stacked', 'product']) {
  for (const mode of ['light', 'dark', 'mono']) {
    const entry = manifest.lockups.assets.find(
      (asset) => asset.lockup === name && asset.mode === mode,
    );
    assert.ok(entry, `The manifest has no ${name} lockup for ${mode}`);
    const markup = await readFile(join(root, 'brand/generated', entry.svg), 'utf8');
    assert.ok(
      markup.includes(geometry.full.payloadPath),
      `${entry.svg} does not carry the full mark; every lockup sets the symbol at ${symbolSize} px`,
    );
  }
}
/* The mono lockup has to be recolorable in one place, so it sets no hex. */
const monoLockup = await readFile(
  join(root, 'brand/generated/lockup/open-e2ee-lockup-product-mono.svg'),
  'utf8',
);
assert.ok(
  !/fill="#/.test(monoLockup),
  'The mono lockup hard-codes a color instead of inheriting currentColor',
);

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

/*
 * The role layer, DESIGN.md Part II. Every role is declared once and picks its
 * value with light-dark(), so a second declaration under a dark selector is
 * the regression to catch: it reintroduces the two-copy drift the layer exists
 * to remove.
 */
const roleCss = await readFile(
  join(root, 'packages/design/dist/css/roles.css'),
  'utf8',
);
for (const role of [
  'ground-canvas',
  'ground-panel',
  'ground-raised',
  'ground-hover',
  'border-1',
  'border-2',
  'border-3',
  'text-1',
  'text-2',
  'text-3',
  'text-4',
  'accent',
  'accent-hover',
  'accent-ink',
  'accent-link',
  'info',
  'info-tint',
  'info-ink',
  'success',
  'success-tint',
  'success-ink',
  'warning',
  'warning-tint',
  'warning-ink',
  'danger',
  'danger-tint',
  'danger-ink',
]) {
  const declarations = roleCss.match(
    new RegExp(`^\\s*--oe-${role}:`, 'gm'),
  );
  assert.equal(
    declarations?.length,
    1,
    `--oe-${role} is declared ${declarations?.length ?? 0} times, not once`,
  );
  assert.match(
    roleCss,
    new RegExp(`--oe-${role}: light-dark\\(`),
    `--oe-${role} does not pick its value with light-dark()`,
  );
  assert.match(
    roleCss,
    new RegExp(`--color-${role}: var\\(--oe-${role}\\);`),
    `--oe-${role} is not exposed as a utility`,
  );
}
assert.match(roleCss, /^@theme inline \{$/m);
assert.equal(
  roleCss.match(/:focus-visible/g)?.length,
  1,
  'The role layer holds more than one focus-visible rule',
);

/*
 * The shadcn bridge. A registry file writes bg-primary and text-muted-foreground
 * and knows nothing about OpenE2EE roles, so the layer resolves each of those
 * names to the role that carries its meaning. A name that resolves to nothing
 * renders a generated component colorless, and a name that resolves to the
 * wrong role renders it in a color no role chose.
 */
const bridge = new Map(
  [...roleCss.matchAll(/^  --color-([a-z-]+): var\(--oe-([a-z0-9-]+)\);$/gm)]
    .map((match) => [match[1], match[2]]),
);
for (const [name, role] of [
  ['background', 'ground-canvas'],
  ['foreground', 'text-1'],
  ['card', 'ground-raised'],
  ['card-foreground', 'text-1'],
  ['popover', 'ground-raised'],
  ['popover-foreground', 'text-1'],
  ['primary', 'accent'],
  ['primary-foreground', 'accent-ink'],
  ['secondary', 'ground-panel'],
  ['secondary-foreground', 'text-2'],
  ['muted', 'ground-panel'],
  ['muted-foreground', 'text-3'],
  ['destructive', 'danger'],
  ['destructive-foreground', 'danger-ink'],
  ['border', 'border-1'],
  ['input', 'border-1'],
  ['ring', 'accent'],
]) {
  assert.equal(
    bridge.get(name),
    role,
    `The shadcn name ${name} resolves to ${bridge.get(name) ?? 'nothing'}, not ${role}`,
  );
  assert.ok(
    roleCss.includes(`--oe-${role}: light-dark(`),
    `The shadcn name ${name} resolves to ${role}, which no role declares`,
  );
}

/*
 * shadcn spells a subtle hover ground "accent" and OpenE2EE spells the brand
 * blue "accent". The role keeps the name. Bridging the shadcn meaning would
 * repaint every OpenE2EE surface that already writes bg-accent, so a registry
 * file writes bg-ground-hover instead.
 */
assert.equal(
  bridge.get('accent'),
  'accent',
  'The shadcn bridge took the accent name away from the OpenE2EE accent',
);
assert.equal(
  bridge.get('accent-foreground'),
  undefined,
  'The role layer bridges accent-foreground, which no OpenE2EE role owns',
);

/*
 * The role layer's measured values. The declarations above prove the shape of
 * the file; these prove the colors in it. Each role is read against the
 * surface it meets, so an ink is measured on its own solid and a tint is
 * measured under the primary text.
 */
const tintRule = await readJson(join(root, 'tokens', 'tint-rule.json'));
const roleTokens = resolveReferences(
  await readJson(join(root, 'tokens', 'roles.json')),
  primitives,
);
for (const members of Object.values(roleTokens)) {
  if (!('derive' in (members.tint ?? {}))) continue;
  const { hue } = oklch(members.tint.derive);
  members.tint = {
    light: oklchHex({ ...tintRule.light, hue }),
    dark: oklchHex({ ...tintRule.dark, hue }),
  };
}

for (const theme of ['light', 'dark']) {
  const canvas = roleTokens.ground.canvas[theme];
  const primary = roleTokens.text['1'][theme];
  for (const step of ['1', '2', '3']) {
    assert.ok(
      contrast(roleTokens.text[step][theme], canvas) >= 4.5,
      `${theme} text-${step} does not reach 4.5:1 on the canvas`,
    );
  }
  for (const [name, token] of [
    ['text-4', roleTokens.text['4']],
    ['border-3', roleTokens.border['3']],
  ]) {
    assert.ok(
      contrast(token[theme], canvas) >= 3,
      `${theme} ${name} does not reach 3:1 on the canvas`,
    );
  }
  for (const group of ['accent', 'info', 'success', 'warning', 'danger']) {
    const solid = roleTokens[group][''][theme];
    assert.ok(
      contrast(solid, canvas) >= 4.5,
      `${theme} ${group} does not reach 4.5:1 on the canvas`,
    );
    assert.ok(
      contrast(roleTokens[group].ink[theme], solid) >= 4.5,
      `${theme} ${group}-ink does not reach 4.5:1 on its own solid`,
    );
    if (!roleTokens[group].tint) continue;
    assert.ok(
      contrast(primary, roleTokens[group].tint[theme]) >= 4.5,
      `${theme} ${group}-tint does not carry the primary text at 4.5:1`,
    );
  }

  /*
   * One tint rule. The four tints sit at one lightness, so a row of status
   * pills is optically level. Chroma is a ceiling, not a value: sky blue and
   * red leave the sRGB gamut near this lightness and land lower.
   */
  const tintLightness = ['info', 'success', 'warning', 'danger'].map(
    (group) => oklch(roleTokens[group].tint[theme]).lightness,
  );
  assert.ok(
    Math.max(...tintLightness) - Math.min(...tintLightness) <= 0.005,
    `${theme} semantic tints span more than 0.005 lightness`,
  );
}

/*
 * Typography. The wordmark's weight contrast is the concept, so a build that
 * flattens it or that loses a family from the self-hosted set is a failure
 * even though every color still passes.
 */
const packageJson = await readJson(join(root, 'package.json'));
for (const family of ['public-sans', 'newsreader', 'jetbrains-mono']) {
  assert.ok(
    packageJson.dependencies[`@fontsource-variable/${family}`],
    `${family} is no longer a dependency`,
  );
}
assert.ok(
  !JSON.stringify(packageJson.dependencies).includes('inter'),
  'Inter is still a dependency',
);

const fontsCss = await readFile(
  join(root, 'packages/design/dist/css/fonts.css'),
  'utf8',
);
for (const family of ['public-sans', 'newsreader', 'jetbrains-mono']) {
  assert.match(fontsCss, new RegExp(`@fontsource-variable/${family}`));
}

assert.match(tokenCss, /--oe-font-sans: "Public Sans Variable"/);
assert.match(tokenCss, /--oe-font-serif: "Newsreader Variable"/);
assert.match(tokenCss, /--oe-font-mono: "JetBrains Mono Variable"/);
assert.match(tailwindCss, /--font-brand-serif: "Newsreader Variable"/);

const wordmarkCss = await readFile(
  join(root, 'packages/design/dist/css/wordmark.css'),
  'utf8',
);
assert.match(wordmarkCss, /--oe-wordmark-open-weight/);
assert.match(wordmarkCss, /--oe-wordmark-e2ee-weight/);
assert.match(wordmarkCss, /oe-wordmark-small/);
assert.notEqual(
  components.wordmark['open-weight'],
  components.wordmark['e2ee-weight'],
  'The wordmark lost its weight contrast',
);
assert.equal(components.prose['font-family'], primitives.font.serif);
assert.equal(components.metadata['font-family'], primitives.font.mono);

const componentsCss = await readFile(
  join(root, 'packages/design/dist/css/components.css'),
  'utf8',
);

/*
 * Every control is a token reference. A literal color, length, or duration
 * here is the same drift the file exists to end: it would render correctly on
 * the surface it was written for and wrongly in the other theme.
 */
for (const name of [
  'oe-button',
  'oe-button-secondary',
  'oe-button-small',
  'oe-button-full',
  'oe-icon-button',
  'oe-icon',
  'oe-icon-link',
  'oe-visually-hidden',
]) {
  assert.match(
    componentsCss,
    new RegExp(`\\.${name}[\\s:{,]`),
    `components.css no longer ships .${name}`,
  );
}
assert.match(componentsCss, /:focus-visible \{/);
assert.doesNotMatch(
  componentsCss,
  /:\s*#[0-9a-fA-F]{3,8}\b/,
  'A literal color in components.css cannot follow the theme',
);

/*
 * The icons are geometry, not markup. Two products render two different
 * elements from them, so a name that resolves to nothing is a blank square on
 * one surface and a build error on neither.
 */
for (const name of iconNames) {
  const subpaths = iconPaths[name];
  assert.ok(
    Array.isArray(subpaths) && subpaths.length > 0,
    `Icon ${name} has no path data`,
  );
  for (const d of subpaths) {
    assert.match(d, /^M/, `Icon ${name} has a subpath that does not start with a move`);
  }
}
for (const [preference, icon] of Object.entries(themeIcons)) {
  assert.ok(
    iconNames.includes(icon),
    `The ${preference} theme maps to ${icon}, which this package does not ship`,
  );
}
assert.equal(ICON_VIEW_BOX, '0 0 16 16');

/*
 * Redistributing MIT-licensed paths requires shipping the license, and `files`
 * decides what a consumer actually receives.
 */
assert.match(
  await readFile(join(root, 'THIRD_PARTY_NOTICES.md'), 'utf8'),
  /Octicons/,
);
assert.ok(
  packageJson.files.some((entry) => 'brand/third-party/'.startsWith(entry)),
  'The Octicons license text is not in the published files',
);

/*
 * Consumers install by tag, so the tag the READMEs print is the whole install
 * instruction. Nothing resolves it at read time — a reader copies the line —
 * and the version it has to match already lives in `package.json`. Left
 * unchecked it drifts silently on every release: both files sat at `v0.2.0`
 * through six minor versions, telling consumers to install a release that
 * predated most of the system they were reading about.
 */
const installTag = `v${packageJson.version}`;
for (const readme of ['README.md', join('packages', 'design', 'README.md')]) {
  const text = await readFile(join(root, readme), 'utf8');
  const tags = [...text.matchAll(/(?:design#|refs\/tags\/)(v\d+\.\d+\.\d+)/g)].map(
    (match) => match[1],
  );
  assert.ok(tags.length > 0, `${readme} prints no install tag to check`);
  for (const tag of tags) {
    assert.equal(tag, installTag, `${readme} tells consumers to install ${tag}`);
  }
}

/*
 * Spelling. Every written surface here is American English. A mixed spelling
 * reads as two authors rather than one voice, and it survives review because
 * each word on its own is correct English. The pairs live in `spellings.mjs`,
 * the one place where the British form is the right thing to write.
 * Third-party license texts under `brand/third-party/` quote their originals
 * word for word, so they stay out of scope. The generated assets stay out too,
 * where `aria-labelledby` names an ARIA attribute rather than a spelling.
 */
/*
 * Both halves of the lint spell the words out, so both skip themselves.
 * `spellings.mjs` carries the entries, and the two lists below prove each
 * pattern bites. Everything else here is written in American English.
 */
const spellingTables = new Set([
  join('scripts', 'spellings.mjs'),
  join('scripts', 'test.mjs'),
]);

const proseFiles = [
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'DESIGN.md',
  'LICENSE-BRAND.md',
  'README.md',
  join('packages', 'design', 'README.md'),
];
for (const directory of [
  'docs',
  'scripts',
  join('packages', 'design', 'src'),
  join('packages', 'design', 'bin'),
  join('site', 'app'),
  join('site', 'tests'),
]) {
  for (const file of await filesIn(join(root, directory))) {
    const path = join(directory, file);
    if (!spellingTables.has(path)) proseFiles.push(path);
  }
}

/*
 * The patterns have to separate the two directions, because the American form
 * of several entries contains the British stem. A pattern that quietly lost its
 * boundary would still pass every file here. It would fail the day somebody
 * wrote "characteristic".
 */
for (const british of [
  'colour',
  'flavoured',
  'neighbour',
  'rumour',
  'endeavour',
  'grey',
  'greyscale',
  'centre',
  'centred',
  'licence',
  'defence',
  'offence',
  'pretence',
  'honour',
  'candour',
  'judgement',
  'acknowledgement',
  'artefact',
  'sceptical',
  'behaviour',
  'programme',
  'analyse',
  'travelling',
  'travelled',
  'labelled',
  'unlabelled',
  'mislabelled',
  'remodelled',
  'signalled',
  'organise',
  'characterised',
  'recognised',
  'standardises',
  'prioritises',
  'scrutinised',
  'summarised',
  'normalised',
  'serialises',
  'authorised',
  'optimised',
  'initialised',
  'uninitialised',
  'catalogued',
  'stylised',
]) {
  assert.ok(
    AMERICAN_SPELLINGS.some(({ pattern }) => pattern.test(british)),
    `the spelling lint does not catch "${british}"`,
  );
}
for (const american of [
  'color',
  'flavor',
  'neighbor',
  'gray',
  'grayscale',
  'greyhound',
  'center',
  'concentrate',
  'license',
  'defense',
  'judgment',
  'acknowledgment',
  'artifact',
  'skeptical',
  'behavior',
  'program',
  'programmed',
  'programmer',
  'analyses',
  'analysis',
  'traveled',
  'labeled',
  'aria-labelledby',
  'organism',
  'characteristic',
  'generalist',
  'optimistic',
  'stylist',
  'catalog',
  'initialized',
]) {
  assert.ok(
    !AMERICAN_SPELLINGS.some(({ pattern }) => pattern.test(american)),
    `the spelling lint rejects "${american}", which is already American`,
  );
}

for (const file of proseFiles) {
  const text = await readFile(join(root, file), 'utf8');
  for (const { pattern, british, american } of AMERICAN_SPELLINGS) {
    const hit = text.match(pattern);
    assert.ok(
      !hit,
      `${file} spells it "${hit?.[0]}"; this repository writes American English, so write it the way "${british}" becomes "${american}"`,
    );
  }
}

process.stdout.write(
  `Verified ${contrastPairs.length} contrast pairs, both mark variants, ${iconNames.length} icons, ${requiredFiles.length} package artifacts, ${proseFiles.length} files for American spelling, and the ${installTag} install instructions.\n`,
);
