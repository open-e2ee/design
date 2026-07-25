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
- 1280×640 social card, generated in the diagram grammar

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

## The social card is generated, not drawn

`social/open-e2ee-design-og.svg` is built from the same primitives as
everything else: the mark, the wordmark, and a manifest plate whose annotation
rows count the files this package actually ships. Repository cards vary only the
description line and the plate contents.

Its annotations must stay true. A plate that labels a slab with a number nobody
checked is worse than a plate with no annotation, because the whole point of the
imagery system is that it is a legible technical object rather than decoration.

The rasterized PNG is produced by `rsvg-convert`, which cannot load webfonts, so
its text renders in whatever system fonts are available on the build host. The
SVG is the source of truth; treat the PNG as a fallback for renderers that
cannot take SVG.

## Planned identity work

- Outlined `wordmark.svg` with the four craft corrections recorded in
  `DESIGN.md`
- Horizontal, stacked, and product lockup assets
- GitHub organization and npm avatar exports
- Mask icon and touch icon set
- Manifest plates for the editorial program
- Presentation and README header templates

Planned assets should be reviewed as an identity family rather than added as
unrelated one-offs.
