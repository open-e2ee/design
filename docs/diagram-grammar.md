# Diagram grammar

`DESIGN.md` specifies the grammar in prose. This module is the executable copy.

```js
import { slabPath, metadataTicks, carrierBrackets } from '@open-e2ee/design';
// or: import { ... } from '@open-e2ee/design/diagram';
```

There is one implementation. The generated social cards in this repository are
drawn with the same functions a consumer imports, so an asset here and a diagram
in your app cannot drift apart.

## Why this is code

Before it was published, six Astro components, one React component, and this
repository's build script each carried a private copy of `slabPath`,
`metadataTicks`, and `carrierBrackets`. They were not identical. A grammar that
lives in eight places is a grammar that means eight things, and the failure is
invisible: every diagram looks fine on its own page.

Two rules are enforced here rather than documented, because they are the two the
copies broke:

- **Nothing emits an `opacity` attribute.** "Partly readable" is not a thing
  encryption does. A content bar at 28% alpha, or a ratchet run drawn as an
  opacity ramp, is a bug even when it looks right. Use the solid
  `--oe-diagram-content-bar` and `--oe-diagram-ratchet-*` tokens; see
  [Solid fills, never alpha](#solid-fills-never-alpha).
- **Metadata ticks are always drawn.** `metadataTickRects` rejects a count below
  one. A sealed envelope with no ticks claims the relay sees nothing, which is
  the one thing this product must never claim.

## Two shapes of API

Every primitive comes in one or both of two forms, because JSX and SVG files
want different things:

| Form | Returns | Use from |
|---|---|---|
| `*Path`, `*Rects` | Path `d` strings and plain `{x, y, width, height}` objects | React/JSX — build your own elements |
| everything else | SVG markup with SVG attribute syntax (`stroke-width`) | `.svg` files, Astro, `dangerouslySetInnerHTML` |

React callers should use the geometry functions. The markup functions emit
`stroke-width`, not `strokeWidth`, and React will warn.

Nothing imports a framework, reads the DOM, or touches `document`. The module is
plain functions over numbers, so it runs the same at build time, on the server,
and in the browser.

## Primitives

### Slabs — ciphertext

```js
slabPath({ x, y, width, height, shear = 0 })
```

An upright slab is ciphertext at rest; a sheared one is in transit. The shear
leans the top edge in the direction of travel and leaves the footprint alone, so
a row of slabs still sits on one baseline.

```js
notchedSlabPath({ x, y, width, height, notch = 18 })
```

Keys. Filled is a private key and may only be drawn inside a device outline;
outlined is a public key or prekey bundle, and it travels. The shape rhyme
between them is the argument, so both come from one function.

### The carrier

```js
carrierBracketPaths({ x, y, width, height, thickness, arm }) // → [left, right]
carrierBrackets({ ...construction, fill })                   // → markup
```

Two open brackets: a relay, an object store, the org mark. This is literally the
same construction as the logo — the test suite asserts that
`carrierBracketPaths` with the mark's own construction values reproduces
`brand/source/geometry.json`'s `carrierLeftPath` and `carrierRightPath`
character for character.

The carrier is a **pair**. One bracket is a different mark. If your layout only
has room for one, the layout is wrong; this repository shipped that bug on its
own social card for two releases.

### Metadata ticks

```js
metadataTickRects({ x, y, count, spacing = 16, length = 10, width = 2, gap = 4 })
metadataTicks({ ...options, fill })
```

Brass ticks along the outside top edge of a slab: what the relay can still see.
`y` is the top edge of the slab, and the ticks are placed above it.

### Devices and content

```js
contentBarRects({ x, y, width, count = 3, height = 9, gap = 13, ratios })
deviceOutline({ x, y, width, height, bars = 3, padding = 20, divider = null })
```

An open rectangle holding readable content. Pass `divider` — a distance from the
top edge — for a local store or vault; attach it to the device edge yourself,
because a store floating free of its device is a different claim.

### Trust boundary

```js
boundaryLine({ x, top, bottom, dash = '2 6' })
```

A fine dotted brass rule standing in a gutter of empty canvas at least
`BOUNDARY_MIN_GUTTER` (48 px) wide, with a one-word label you draw yourself.
Never a dashed box around a group: encryption happens at a place, it is not a
fence around a region.

### Ratchet state

```js
ratchetRects({ x, y, width, height, count = 4, gap = 12 })
ratchetRamp({ ...options, fills = RATCHET_FILLS })
```

A short run of upright slabs, each a discrete solid step toward the ciphertext
fill. For runs shorter than four steps the fills are taken from the *end* of the
ramp, so the run always arrives at the ciphertext fill rather than fading out.

## Solid fills, never alpha

The material law says open is outlined and opaque is filled. There is no third
state, so there is nothing for `opacity` to mean.

Alpha was being used for two things. Both now have solid tokens:

| Was | Use |
|---|---|
| `opacity={0.28}` on a content bar | `--oe-diagram-content-bar` |
| `opacity` ramp `[0.4, 0.58, 0.76, 1]` on ratchet steps | `--oe-diagram-ratchet-1` … `-4` |

The token values were chosen to match what the alpha composites produced against
the canvas, so nothing shifts visually — but they now survive being drawn over a
raised surface, in a PNG, or in forced-colors mode, none of which alpha did.

`scripts/test.mjs` fails the build if a diagram primitive emits an `opacity`,
`fill-opacity`, `stroke-opacity`, `rgba()`, or gradient, and if any generated
brand SVG contains one.

The exported constants (`CONTENT_BAR_FILL`, `CIPHERTEXT_FILL`,
`PLAINTEXT_STROKE`, `CARRIER_STROKE`, `BOUNDARY_STROKE`, `RATCHET_FILLS`) are
`var(--oe-…)` references and are the defaults, so a diagram themes itself if the
tokens are loaded.

## Usage

### Astro

Markup functions return SVG-attribute syntax, which is exactly what an Astro
template wants.

```astro
---
import { slabPath, metadataTicks, carrierBrackets, CIPHERTEXT_FILL } from '@open-e2ee/design';

const parcel = { x: 120, y: 80, width: 220, height: 64 };
---

<svg viewBox="0 0 480 240" role="img" aria-labelledby="relay-title">
  <title id="relay-title">A relay holding one sealed envelope</title>
  <Fragment set:html={carrierBrackets({ x: 80, y: 40, width: 320, height: 160, thickness: 12, arm: 44 })} />
  <path d={slabPath(parcel)} fill={CIPHERTEXT_FILL} />
  <Fragment set:html={metadataTicks({ x: parcel.x + 4, y: parcel.y, count: 7 })} />
</svg>
```

### React

Use the geometry functions and build the elements yourself. Do not pass markup
strings through `dangerouslySetInnerHTML` when a `*Rects` function exists.

```tsx
import {
  slabPath,
  metadataTickRects,
  carrierBracketPaths,
  contentBarRects,
  CIPHERTEXT_FILL,
  CONTENT_BAR_FILL,
  CARRIER_STROKE,
  STROKE_WIDTH,
} from '@open-e2ee/design';

const parcel = { x: 120, y: 80, width: 220, height: 64 };

export function Relay() {
  return (
    <svg viewBox="0 0 480 240" role="img" aria-labelledby="relay-title">
      <title id="relay-title">A relay holding one sealed envelope</title>
      {carrierBracketPaths({ x: 80, y: 40, width: 320, height: 160, thickness: 12, arm: 44 }).map((d) => (
        <path key={d} d={d} fill={CARRIER_STROKE} />
      ))}
      <path d={slabPath(parcel)} fill={CIPHERTEXT_FILL} />
      {metadataTickRects({ x: parcel.x + 4, y: parcel.y, count: 7 }).map((rect) => (
        <rect key={rect.x} {...rect} fill="var(--oe-diagram-boundary)" />
      ))}
    </svg>
  );
}
```

`contentBarRects` spreads the same way. Where you do need a stroke in JSX, spell
it `strokeWidth={STROKE_WIDTH}`.

## Constants

| Constant | Value | Meaning |
|---|---|---|
| `STROKE_WIDTH` | `4` | Open forms carry it; filled forms carry none |
| `ARROW_STROKE_WIDTH` | `2` | Arrows are thin and unremarkable |
| `TICK_WIDTH` / `TICK_LENGTH` | `2` / `10` | Metadata ticks |
| `TICK_SPACING` / `TICK_GAP` | `16` / `4` | Tick pitch, and clearance from the slab |
| `BOUNDARY_MIN_GUTTER` | `48` | Minimum trust-boundary gutter |
| `RATCHET_STEPS` | `4` | Steps in a full ratchet run |

Every one of these is asserted against the matching entry in
`tokens/components.json`. Two numbers for one rule is how a diagram ends up with
a 3 px "open" stroke.

## Changing a primitive

`scripts/test.mjs` holds golden output strings for every primitive. Changing one
changes every diagram in every consuming repository at once, so the golden
strings have to be updated deliberately, in the same commit, with the reason in
the commit message. If a diagram needs a shape the grammar does not have, add a
primitive; do not pass unusual numbers to an existing one.
