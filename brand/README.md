# OpenE2EE identity assets

`source/geometry.json` and the token files are the only production sources.
`generated/` is replaced by `npm run build` and must not be edited manually.

The mark is **The Opaque Carrier**: two open brackets holding a filled payload
that never touches them. `DESIGN.md` is the governing contract; this file is the
operational index.

## Production variants

| Context | Asset |
| --- | --- |
| Light interface, 32 px or larger | `svg/open-e2ee-mark-light.svg` |
| Dark interface, 32 px or larger | `svg/open-e2ee-mark-dark.svg` |
| Light interface, 16–31 px | `svg/open-e2ee-mark-light-small.svg` |
| Dark interface, 16–31 px | `svg/open-e2ee-mark-dark-small.svg` |
| Single-color print, stamping, embroidery | `svg/open-e2ee-mark-mono.svg`, `-mono-small.svg` |
| OS-responsive web UI | `open-e2ee-mark-adaptive.svg` |
| Compact OS-responsive web UI | `open-e2ee-mark-adaptive-small.svg` |
| Browser tab | `open-e2ee-favicon.svg` |

PNG exports cover 16, 24, 32, 48, 64, 128, 256, 512, and 1024 px in both modes.

## The variant rule

Two silhouettes exist, and shipping the wrong one is the failure this repository
is most likely to have:

- **16–31 px** uses the `optical` variant: thicker stems, squared payload, no
  shear.
- **32 px and up** uses the `full` mark, whose payload is sheared to read as
  cargo in transit.
- **Below 16 px** the mark is not reproduced at all.

The build applies the rule, `generated/manifest.json` publishes it under
`variants`, and `npm test` fails if a raster came from the wrong silhouette. You
should not need to choose by eye.

## Rules

- Preserve clear space equal to 12.5% of the artwork width on every side.
- Never let the payload touch or overlap a bracket. That gap is the trust
  boundary; it is geometry, not spacing.
- Never fill the brackets' interior or outline the payload — open is outlined,
  opaque is filled.
- Never rotate, mirror, re-shear, or change the aspect ratio.
- Never animate the mark. Diagrams may move; the mark does not.
- Never add gradients, glow, bevels, textures, transparency, or shadows.
- Never recolor one part differently from another; the mark is single-color by
  construction.
- Never place the mark on a photograph.
- Use explicit light or dark assets in renderers that strip SVG media queries.

The full misuse list, the lockup proportions, and the wordmark treatment are in
`DESIGN.md`.

## Open items

- A **trademark and visual-similarity search** on the bracket-and-payload
  silhouette must clear before the mark appears on a public launch surface.
- The repository still needs an explicit asset and trademark licensing decision
  before third parties are granted reuse rights.

The mark is original geometry on a 32-unit grid: no runtime font dependency and
no outlines from any licensed typeface. See `THIRD_PARTY_NOTICES.md`.
