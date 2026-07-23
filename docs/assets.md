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

- Full and small-size light SVG marks
- Full and small-size dark SVG marks
- Adaptive full and small-size SVG marks
- Transparent PNG exports at 32, 64, 128, 512, and 1024 px
- Light/dark presentation sheet
- 1200×630 OpenE2EE Design social card

## Planned identity work

- Horizontal and stacked wordmark lockups
- True monochrome and print-safe marks
- SDK, Docs, and Console descriptor lockups
- GitHub organization and npm avatar exports
- Mask icon, touch icon, and favicon set
- Additional product and announcement social-card templates
- Presentation and README header templates

Planned assets should be reviewed as an identity family rather than added as
unrelated one-offs.
