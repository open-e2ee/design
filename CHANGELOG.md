# Changelog

## 0.8.0

Renders the license as `AGPLv3` on the two social cards that name it. Not
breaking: no token, class, or export changes, and the two cards keep their
slugs, dimensions, and every other plate row.

### Changed

- **`open-e2ee-signal-protocol-sdk-og` and `open-e2ee-website-og`.** The third
  plate row reads `AGPLv3 · commercial` in place of `AGPL-3.0-or-later ·
  commercial`. A plate row is a label a reader meets, not a field a machine
  parses, and AGPLv3 is how the rest of the identity sets it — DESIGN.md's
  typography rule already names `AGPLv3` among the strings Public Sans has to
  carry. The SPDX identifier stays wherever it is genuinely an identifier: a
  `license` field, a LICENSE link, a package manifest.

  A consumer repins and runs `brand:sync` to take the redrawn cards.

## 0.7.0

Replaces the theme switch's bordered square with one icon-control shape.
Breaking for `components.css` consumers: `.oe-theme-toggle` is gone and its
markup takes `.oe-icon-button`.

### Added

- **`.oe-icon-button`.** The shape of any control that is a drawing: the small
  control's 40px tap target, muted, going to the foreground on hover, with no
  border and no background. The icon's size is the caller's, through
  `--oe-icon-size` on the control or the row that holds it.

### Removed

- **`.oe-theme-toggle`.** The border it painted measured 1.31:1 against the
  light canvas and 1.49:1 against the dark, under the 3:1 a meaningful
  boundary owes, while being the largest shape in the header row. The icon
  inside it clears the text floor at 6.12:1 and 7.08:1, so nothing that was
  carrying meaning was lost. A consumer swaps the class name; the control
  keeps its size and its tap target.

## 0.6.0

Records the founder's 2026-08-09 tagline review in the registry. Breaking for
`@open-e2ee/design/taglines` consumers: the registry shrinks to two entries
and each gains a field.

### Changed

- **`TAGLINES` carries sign-off status.** Each entry gains
  `status: 'approved' | 'proposed'`. The product hero (*"The Signal Protocol,
  where your app actually runs."*) is approved; the primary (*"Opaque to the
  relay. Open to inspection."*) remains proposed.
- **`checkTaglineAnnotation` requires the annotation only for proposed
  taglines.** A page using only approved taglines passes with no annotation.
  The result shape is unchanged.

### Removed

- **The homepage-hero entry.** *"Your relay carries it. Your relay can't read
  it."* was retired unshipped — the website homepage leads with its job
  statement instead.

## 0.5.0

Adds three chrome icons. Purely additive: every 0.4.0 export is unchanged.

### Added

- **`external`, `menu`, and `close` in `@open-e2ee/design/icons`.** Octicons
  19.32.0 geometry (`link-external`, `three-bars`, `x`), copied unmodified
  like the rest of the set. The console needs them for external-link
  indicators, the small-viewport navigation menu, and the account menu.

## 0.4.0

Adds the shared interface controls and the chrome icon set. Purely additive:
every 0.3.0 token name and export is unchanged, and no existing value moved.

### Added

- **`@open-e2ee/design/components.css`.** The controls both products had been
  writing out separately: `oe-button` with its secondary, small, and full
  variants, `oe-theme-toggle`, `oe-icon`, `oe-icon-link`, `oe-visually-hidden`,
  and the focus ring. Every rule is a token reference, and a test rejects a
  literal color in the file — a hex here renders correctly in the theme it was
  written for and wrongly in the other.
- **`@open-e2ee/design/icons`.** Six Octicons paths (`github`, `sun`, `moon`,
  `desktop`, `copy`, `check`) as geometry, plus `themeIcons` mapping the three
  theme preferences to their glyphs. Geometry only: an Astro consumer emits
  markup at build time and a React consumer returns a node, so the element
  stays theirs and the path data becomes ours. The MIT license text ships at
  `brand/third-party/Octicons-MIT.txt`, and a test asserts it is in `files` —
  naming a license without shipping it does not satisfy it.
- Button tokens for what the two copies had disagreed on: `font-size-sm`,
  `font-size-md`, `gap`, and `disabled-opacity`, plus `icon.size`.

### Why

The two implementations had already drifted. Buttons were 15px on the website
and 13.6px in the console; secondary buttons filled on hover in one and darkened
their border in the other; and the theme toggle showed an icon on the website
and the word "system" in the console — under a console comment calling it "the
same three-state cycling control the website uses". Two copies of a control are
two controls, and the comment claiming otherwise is the reason to move them here
rather than reconcile them in place again.

Consumers adopting this will see those differences resolve. The website's
values win, because they are the ones reviewed into the current site.

## 0.3.0

Adds the diagram grammar as published code, the lockup assets, a license, and
the corrections an audit of 0.2.x turned up. Additive for existing token names;
the diagram tokens are new and the `sync` state color has moved.

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
  colors stay distinct from each other.
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
- **`sync` and `device` state colors** in both themes, with contrast pairs
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
- Rebuild the palette on warm paper rather than cool gray, with a brass seal
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
