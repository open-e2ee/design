# Changelog

## 0.3.0

Adds the diagram grammar as published code, the lockup assets, a license, and
the corrections an audit of 0.2.x turned up. Additive for existing token names;
the diagram tokens are new and the `sync` state colour has moved.

### Fixed

- **The social card drew one carrier bracket, not two.** The right bracket was
  placed at x=1400 on a 1280-wide canvas, so it rendered off the edge while the
  card's own `<desc>` described a pair. The card is relaid out and the test
  suite now asserts that both brackets are on canvas, the same width, and share
  a top edge, and that no label or metadata tick collides with another element.
- **Dark `surface-sunken` was the canvas.** Both resolved to `paper.1000`, so an
  inset well simply disappeared in dark mode — the 0.2.0 entry claiming "sunken
  surfaces in both themes" was true only in light. Dark sunken now sits a real
  step below the canvas, and both themes carry contrast assertions for it. The
  dark step is smaller than light's (ΔL 0.029 against 0.048) because the paper
  ramp is compressed at its dark end; that relationship is asserted rather than
  papered over, so a later ramp change has to face it.
- **`sync` was byte-identical to `link`.** It resolved to the same value in both
  themes, so a sync badge carried no information the word did not. It now sits
  at `ultra.800` in light and `ultra.200` in dark, and a test asserts the state
  colours stay distinct from each other.
- `findTaglines` missed a tagline broken across inline elements, because the
  markup left a space before the punctuation. Whitespace is now discarded
  rather than collapsed, so `the <em>relay</em>.` is caught.

### Added

- **The diagram grammar ships as code.** `@open-e2ee/design` (and
  `@open-e2ee/design/diagram`) now export `slabPath`, `notchedSlabPath`,
  `carrierBracketPaths`, `carrierBrackets`, `metadataTickRects`,
  `metadataTicks`, `contentBarRects`, `deviceOutline`, `boundaryLine`,
  `ratchetRects`, and `ratchetRamp`, with types and golden-string tests.
  Framework-neutral: geometry functions for JSX, markup functions for SVG and
  Astro. `scripts/build.mjs` consumes the same module, so there is one
  implementation rather than eight private copies. See
  `docs/diagram-grammar.md`.
- **Solid diagram tokens.** `diagram-content-bar` and a four-step
  `diagram-ratchet-1…4` ramp, in both themes, matched to what the previous
  alpha composites produced. The material law has no half-transparent state, so
  the test suite now fails any primitive that emits `opacity`, `fill-opacity`,
  `stroke-opacity`, `rgba()`, or a gradient, and any generated SVG that contains
  one.
- **`sync` and `device` state colours** in both themes, with contrast pairs
  asserted alongside the existing trust, sealed, and offline states.
- **Lockup assets.** Symbol, horizontal, stacked, and product lockups in light,
  dark, and mono under `brand/generated/lockup/`, generated from
  `brand/source/lockups.json` and real Public Sans metrics, with the computed
  proportions published in the manifest. SVG only — `rsvg-convert` has no
  webfont support and a rasterized wordmark would silently fall back.
- **Per-repository social cards.** `socialSvg` is a template driven by
  `brand/source/social-cards.json`; cards now exist for this repository, the
  Signal Protocol SDK, the website, and the organization.
- **A license.** Code is Apache-2.0 (`LICENSE`). The visual identity is reserved
  rather than open-sourced (`LICENSE-BRAND.md`) while trademark clearance is
  outstanding.
- **A tagline check consumers can run.** `oe-design taglines <dir>` (or
  `oe-design check --taglines <dir>`) scans built HTML and fails any page that
  uses one of the three proposed taglines without annotating it as unapproved.
  Also exported as `checkTaglineAnnotation` from `@open-e2ee/design/taglines`.
- `docs/identity-territories.md`, recording why the mark is a carrier — and
  stating plainly which of the rejected alternatives the repository's history
  does not preserve, rather than reconstructing them.
- The OFL texts for Public Sans and Newsreader, which `THIRD_PARTY_NOTICES.md`
  named without shipping.

## 0.2.0

Breaking. This release replaces the identity, the palette, and the typeface
stack. There are no aliases for the old token names — update call sites.

- Adopt the Carrier mark: two open brackets around a payload that is
  sealed shut, in a full and an optical variant. The build picks the variant
  by size (optical from 16 to 31 px, the full mark from 32 px) and publishes
  that rule in the asset manifest. The shield is gone.
- Rebuild the palette on warm paper rather than cool grey, with a brass seal
  ramp for metadata and the trust boundary. `white`, `ink`, and `slate`
  collapse into one `paper` ramp; `blue` becomes `ultra`, `green` becomes
  `verify`, `red` becomes `alert`, and `amber` becomes `seal`.
- Swap Inter for Public Sans and add Newsreader for editorial prose. JetBrains
  Mono stays, and is now reserved for values.
- Add wordmark tokens and `@open-e2ee/design/wordmark.css`, which sets `Open`
  lighter than `E2EE` so the wordmark performs the material law.
- Give sunken surfaces their own step in both themes.
- Rewrite `DESIGN.md` around the material law, the diagram grammar, and the
  rules the build enforces.
- Document installation from a GitHub tag; npm publication is still pending.

## 0.1.0

- Establish the OpenE2EE design contract.
- Centralize primitive, semantic, and component tokens.
- Generate light, dark, adaptive, and small-size shield assets.
- Export CSS, Tailwind mappings, resolved JSON, fonts, and theme utilities.
- Add versioned static-asset export and verification.
