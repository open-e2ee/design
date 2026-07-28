# Asset delivery

## Source and generated output

Logo geometry and design tokens generate every production variant. Generated
assets are committed so websites, documentation renderers, package pages, and
non-JavaScript consumers can use stable files.

The npm package exports files under `@open-e2ee/design/assets/*`. Applications
that require public-directory URLs use the CLI:

```sh
oe-design export public/brand
oe-design check public/brand
```

The exporter records:

- package name and version;
- a SHA-256 digest of the exported files;
- the source package path.

`check` compares both version and content, preventing an unchanged local
snapshot from silently passing after a dependency update.

## Current inventory

- Light, dark, and monochrome SVG marks in both silhouettes
- Adaptive SVG marks that follow `prefers-color-scheme`, in both silhouettes
- An SVG favicon
- Transparent PNG exports at 16, 24, 32, 48, 64, 128, 256, 512, and 1024 px in
  both modes
- Light/dark presentation sheet, which also shows the variant rule at size
- Symbol, horizontal, stacked, and product lockups in light, dark, and mono
  (`lockup/`, SVG only — see below)
- 1280×640 social cards, one per repository plus an org-generic card, generated
  in the diagram grammar

## Choosing a variant

`manifest.json` publishes the rule and the per-size decision:

```json
"variants": {
  "rule": "optical from 16 to 31 px, full from 32 px",
  "minimumSize": 16,
  "smallMaximumSize": 31,
  "png": { "16": "optical", "32": "full", "…": "…" }
}
```

Consumers picking an SVG by hand use the `-small` files below 32 px and the
plain files at or above it. Nothing renders below 16 px.

## Lockups

`lockup/` holds the four lockups `DESIGN.md` specifies, each in three modes:

| File stem | What it is |
|---|---|
| `open-e2ee-lockup-symbol-*` | The mark alone, in its clear-space box |
| `open-e2ee-lockup-horizontal-*` | Mark and wordmark side by side — the default |
| `open-e2ee-lockup-stacked-*` | Mark above wordmark, for square and narrow spaces |
| `open-e2ee-lockup-product-*` | Horizontal lockup with a product descriptor beneath |

The modes are `-light`, `-dark`, and `-mono` (drawn in `currentColor`, so it
inherits from its context).

Every proportion is computed from `brand/source/lockups.json` and the real
Public Sans advance widths in `brand/source/public-sans-metrics.json`, then
published in `manifest.json` under `lockups`. Cap height is 0.62 of the symbol
size and the gap is 0.375 of the symbol size — **of the symbol size, not of the
font size**. Deriving them from the font size instead gives a wordmark about a
third too large, which is the mistake to check for when a consumer reimplements
the lockup in CSS.

These are SVG only. `rsvg-convert` has no webfont support, so a rasterization
here would silently set the wordmark in a fallback face. Render the SVG in a
browser with `@open-e2ee/design/fonts.css` loaded if you need a bitmap.

## The social cards are generated, not drawn

The cards in `social/` are built from the same primitives as everything else:
the mark, the wordmark, and a manifest plate whose annotation rows count the
files the subject actually ships. One card exists per repository, plus an
org-generic card, defined in `brand/source/social-cards.json` — title,
description, footer, and plate rows per card — so adding a card is a config
entry rather than a new template.

Their annotations must stay true. A plate that labels a slab with a number
nobody checked is worse than a plate with no annotation, because the whole point
of the imagery system is that it is a legible technical object rather than
decoration. Rows describing *this* package are computed from the build; rows
describing another repository are literal reviewed copy, because the build
cannot verify a claim about a repository it cannot see.

The card also carries a real carrier — two brackets, not one. The build asserts
both are on canvas and that no text collides with a tick band, because this
repository shipped a card with one bracket off the right edge for two releases
while its own `<desc>` described two.

The rasterized PNG is produced by `rsvg-convert`, which cannot load webfonts, so
its text renders in whatever system fonts are available on the build host. The
SVG is the source of truth; treat the PNG as a fallback for renderers that
cannot take SVG.

## Licensing

The generated assets are **reserved, not Apache-licensed** — see
`LICENSE-BRAND.md`. `oe-design export` copies them into your public directory,
which is a permitted use; redrawing them is not.

## Planned identity work

- Outlined `wordmark.svg` with the four craft corrections recorded in
  `DESIGN.md`
- GitHub organization and npm avatar exports
- Mask icon and touch icon set
- Manifest plates for the editorial program
- Presentation and README header templates

Planned assets should be reviewed as an identity family rather than added as
unrelated one-offs.
