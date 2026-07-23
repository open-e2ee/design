# OpenE2EE identity assets

`source/geometry.json` and the token files are the only production sources.
`generated/` is replaced by `npm run build` and must not be edited manually.

## Production variants

| Context | Asset |
| --- | --- |
| Light interface, 64 px or larger | `svg/open-e2ee-shield-light.svg` |
| Dark interface, 64 px or larger | `svg/open-e2ee-shield-dark.svg` |
| Light interface, 16–63 px | `svg/open-e2ee-shield-light-small.svg` |
| Dark interface, 16–63 px | `svg/open-e2ee-shield-dark-small.svg` |
| OS-responsive web UI | `open-e2ee-shield-adaptive.svg` |
| Compact OS-responsive web UI | `open-e2ee-shield-adaptive-small.svg` |

PNG exports are available at 32, 64, 128, 512, and 1024 px. The 32 and 64 px
exports use the simplified optical-size mark.

## Rules

- Preserve clear space equal to 12.5% of the mark width.
- Do not render below 16 px.
- Keep the shield upright and preserve its aspect ratio.
- Do not reverse the facets: the lighter facet remains on the left.
- Do not add gradients, glow, bevels, textures, transparency, or shadows.
- Do not recolor individual glyphs.
- Use explicit light or dark assets in renderers that strip SVG media queries.

The `O` and `E` are geometric paths, so production assets have no runtime font
dependency. The geometry originated from an earlier JetBrains Mono-based
exploration; the repository still needs an explicit asset and trademark
licensing decision before third parties are granted reuse rights.

