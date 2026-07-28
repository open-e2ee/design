/*
 * The diagram grammar, as code.
 *
 * DESIGN.md specifies the grammar in prose; this module is the executable
 * copy, so a diagram in a docs page, a marketing site, or the generated social
 * card is drawn from one implementation instead of eight hand-rolled ones.
 *
 * Every function is framework-neutral. The `*Path` and `*Rects` functions
 * return plain geometry — path `d` strings and rectangle objects — for JSX
 * consumers that build their own elements. The functions that return markup
 * emit SVG-attribute syntax (`stroke-width`), which is what an SVG file, an
 * Astro template, or `dangerouslySetInnerHTML` wants; React callers should use
 * the geometry functions instead of the markup ones.
 *
 * Two rules from the material law are enforced here rather than documented:
 * nothing in this module emits an `opacity` attribute, and the fills default to
 * solid semantic tokens. "Partly readable" is not a thing encryption does, so a
 * content bar or a ratchet step that is 28% of something else is a bug even
 * when it looks right.
 */

/** Open forms carry a 4 px stroke. Filled forms carry none. */
export const STROKE_WIDTH = 4;

/** Arrows are thin and unremarkable: the cargo carries the motion. */
export const ARROW_STROKE_WIDTH = 2;

/** Metadata ticks: 2 px wide, 10 px long, 16 px apart, 4 px clear of the slab. */
export const TICK_WIDTH = 2;
export const TICK_LENGTH = 10;
export const TICK_SPACING = 16;
export const TICK_GAP = 4;

/** The trust boundary is a gutter of canvas at least this wide. */
export const BOUNDARY_MIN_GUTTER = 48;

/** Session state is a run of four solid steps. Never an opacity ramp. */
export const RATCHET_STEPS = 4;
export const RATCHET_FILLS = Object.freeze([
  'var(--oe-diagram-ratchet-1)',
  'var(--oe-diagram-ratchet-2)',
  'var(--oe-diagram-ratchet-3)',
  'var(--oe-diagram-ratchet-4)',
]);

export const CONTENT_BAR_FILL = 'var(--oe-diagram-content-bar)';
export const PLAINTEXT_STROKE = 'var(--oe-diagram-plaintext-stroke)';
export const CIPHERTEXT_FILL = 'var(--oe-diagram-ciphertext-fill)';
export const CARRIER_STROKE = 'var(--oe-diagram-carrier-stroke)';
export const BOUNDARY_STROKE = 'var(--oe-diagram-boundary)';

/* Numbers are rounded so two callers computing the same shape by different
 * routes produce byte-identical output, which is what makes golden tests and
 * the generated-drift check meaningful. */
const round = (value) => {
  const rounded = Math.round(value * 1000) / 1000;
  return Object.is(rounded, -0) ? 0 : rounded;
};

const attributes = (pairs) =>
  Object.entries(pairs)
    .filter(([, value]) => value !== undefined && value !== null)
    .map(([name, value]) => `${name}="${value}"`)
    .join(' ');

const rectMarkup = (rect, fill) =>
  `<rect ${attributes({ ...rect, fill })}/>`;

function check(condition, message) {
  if (!condition) throw new TypeError(message);
}

/**
 * A slab: ciphertext at rest when `shear` is 0, in transit when it is not.
 * The shear leans the top edge in the direction of travel; the footprint is
 * unchanged, so a row of slabs still sits on one baseline.
 */
export function slabPath({ x, y, width, height, shear = 0 }) {
  check(width > 0 && height > 0, 'A slab needs a positive width and height.');
  const top = round(x + shear);
  return `M${top} ${round(y)} L${round(top + width)} ${round(y)} L${round(x + width)} ${round(y + height)} L${round(x)} ${round(y + height)} Z`;
}

/**
 * A notched slab. Solid is a private key and may only be drawn inside a device
 * outline; outlined is a public key or prekey bundle and travels. The shape
 * rhyme between them is the argument, so both come from one path.
 */
export function notchedSlabPath({ x, y, width, height, notch = 18 }) {
  check(
    notch > 0 && notch < Math.min(width, height),
    'The notch must be smaller than the slab it is cut from.',
  );
  return `M${round(x)} ${round(y)} H${round(x + width - notch)} L${round(x + width)} ${round(y + notch)} V${round(y + height)} H${round(x)} Z`;
}

/**
 * The carrier: two open brackets. This is the same construction as the org
 * mark — `carrierBracketPaths` with the mark's own construction values
 * reproduces `geometry.full.carrierLeftPath` and `carrierRightPath` exactly,
 * which is what "the diagrams and the logo are the same construction" means in
 * practice.
 */
export function carrierBracketPaths({ x, y, width, height, thickness, arm }) {
  check(
    arm >= thickness,
    'A carrier arm shorter than its stem is not the bracket form.',
  );
  check(
    height > thickness * 2,
    'A carrier bracket needs an open interior between its arms.',
  );
  const right = x + width;
  return [
    `M${round(x)} ${round(y)} H${round(x + arm)} V${round(y + thickness)} H${round(x + thickness)} V${round(y + height - thickness)} H${round(x + arm)} V${round(y + height)} H${round(x)} Z`,
    `M${round(right)} ${round(y)} H${round(right - arm)} V${round(y + thickness)} H${round(right - thickness)} V${round(y + height - thickness)} H${round(right - arm)} V${round(y + height)} H${round(right)} Z`,
  ];
}

export function carrierBrackets({ fill = CARRIER_STROKE, ...construction }) {
  return carrierBracketPaths(construction)
    .map((path) => `<path d="${path}" fill="${fill}"/>`)
    .join('\n');
}

/**
 * Metadata ticks along the outside top edge of a slab: what the relay can
 * still see. Every sealed envelope carries them. A diagram that leaves them
 * off is a bug, not a simplification.
 */
export function metadataTickRects({
  x,
  y,
  count,
  spacing = TICK_SPACING,
  length = TICK_LENGTH,
  width = TICK_WIDTH,
  gap = TICK_GAP,
}) {
  check(count >= 1, 'A sealed slab carries at least one metadata tick.');
  return Array.from({ length: count }, (_, index) => ({
    x: round(x + index * spacing),
    y: round(y - length - gap),
    width: round(width),
    height: round(length),
  }));
}

export function metadataTicks({ fill = BOUNDARY_STROKE, ...options }) {
  return metadataTickRects(options)
    .map((rect) => rectMarkup(rect, fill))
    .join('');
}

/**
 * The content bars inside an open form: visible evidence that the thing is
 * readable. Solid, never alpha.
 */
export function contentBarRects({
  x,
  y,
  width,
  count = 3,
  height = 9,
  gap = 13,
  ratios = [0.75, 0.85, 0.6],
}) {
  check(count >= 1, 'An open form shows at least one content bar.');
  return Array.from({ length: count }, (_, index) => ({
    x: round(x),
    y: round(y + index * (height + gap)),
    width: round(width * ratios[index % ratios.length]),
    height: round(height),
  }));
}

/**
 * A device: an open rectangle holding readable content. The stroke is the
 * device edge, the bars are what it can read. A local store or vault is the
 * same form with `divider` set, attached to the device edge by the caller —
 * a store that floats free of its device is a different claim.
 */
export function deviceOutline({
  x,
  y,
  width,
  height,
  stroke = PLAINTEXT_STROKE,
  strokeWidth = STROKE_WIDTH,
  fill = 'none',
  bars = 3,
  barFill = CONTENT_BAR_FILL,
  padding = 20,
  divider = null,
}) {
  check(width > 0 && height > 0, 'A device needs a positive width and height.');
  const parts = [
    `<rect ${attributes({
      x: round(x),
      y: round(y),
      width: round(width),
      height: round(height),
      fill,
      stroke,
      'stroke-width': strokeWidth,
    })}/>`,
  ];

  if (divider !== null) {
    parts.push(
      `<line ${attributes({
        x1: round(x),
        y1: round(y + divider),
        x2: round(x + width),
        y2: round(y + divider),
        stroke,
        'stroke-width': strokeWidth,
      })}/>`,
    );
  }

  if (bars > 0) {
    const rects = contentBarRects({
      x: x + padding,
      y: y + padding + strokeWidth / 2,
      width: width - padding * 2,
      count: bars,
    });
    parts.push(...rects.map((rect) => rectMarkup(rect, barFill)));
  }

  return parts.join('\n');
}

/**
 * The trust boundary: a fine dotted brass rule standing in a gutter of empty
 * canvas, with a one-word label. Never a dashed box around a group —
 * encryption happens at a place, it is not a fence around a region.
 */
export function boundaryLine({
  x,
  top,
  bottom,
  stroke = BOUNDARY_STROKE,
  strokeWidth = ARROW_STROKE_WIDTH,
  dash = '2 6',
}) {
  check(bottom > top, 'A boundary runs down the canvas, not up it.');
  return `<line ${attributes({
    x1: round(x),
    y1: round(top),
    x2: round(x),
    y2: round(bottom),
    stroke,
    'stroke-width': strokeWidth,
    'stroke-dasharray': dash,
  })}/>`;
}

/**
 * Session and ratchet state: a short run of upright slabs at even intervals,
 * each a discrete solid step toward the ciphertext fill. Sequence without
 * cartoon gears — and without the opacity ramp this used to be drawn with.
 */
export function ratchetRects({
  x,
  y,
  width,
  height,
  count = RATCHET_STEPS,
  gap = 12,
}) {
  check(
    count >= 2 && count <= RATCHET_FILLS.length,
    `A ratchet run is between 2 and ${RATCHET_FILLS.length} steps.`,
  );
  return Array.from({ length: count }, (_, index) => ({
    x: round(x + index * (width + gap)),
    y: round(y),
    width: round(width),
    height: round(height),
  }));
}

export function ratchetRamp({ fills = RATCHET_FILLS, ...options }) {
  const rects = ratchetRects(options);
  check(
    fills.length >= rects.length,
    'A ratchet step without its own solid fill would have to use alpha.',
  );
  /* The last step is always the ciphertext fill itself, so the run reads as
   * arriving somewhere rather than fading out. */
  const steps = fills.slice(fills.length - rects.length);
  return rects.map((rect, index) => rectMarkup(rect, steps[index])).join('');
}
