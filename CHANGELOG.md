# Changelog

## 0.2.0

Breaking. This release replaces the identity, the palette, and the typeface
stack. There are no aliases for the old token names — update call sites.

- Adopt the Opaque Carrier mark: two open brackets around a payload that is
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
