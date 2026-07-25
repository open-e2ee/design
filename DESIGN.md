# OpenE2EE design

This document is the governing design contract for OpenE2EE. It defines the
parts of the identity that stay constant across every surface, and the parts
products are expected to adapt to their context.

The identity is called **the Carrier**. One idea runs through the mark,
the palette, the diagrams, and the words: *a carrier that cannot read what it
carries*. Everything below is an application of that idea, and a change that
weakens it is a change to reject regardless of how good it looks.

> **Open review item.** A trademark and visual-similarity search on the
> bracket-and-payload silhouette has not yet been commissioned. It must clear
> before the mark is used on a public launch surface. Internal, documentation,
> and pre-launch use is fine.

## The material law

**Open is outlined. Opaque is filled.**

An outlined form has a transparent interior: you can see into it, so its
contents are readable. A filled form has no interior detail at all: you cannot
see into it, so its contents are not readable. There is no third state. Nothing
in this system is ever half-transparent, gradient-filled, frosted, or blurred,
because "partly readable" is not a thing encryption does.

Three corollaries, all enforceable in review:

1. **Overlap occludes; it never blends.** When two forms overlap, the front one
   is fully opaque and hides the back one. No multiply, no alpha, no visible
   intersection. If you can see through it, it is not encrypted.
2. **Metadata ticks are always drawn.** Every sealed envelope carries brass tick
   marks along its outside top edge, representing the metadata the relay can
   still see. A diagram showing an envelope with no ticks is a bug, not a
   simplification. This is the system's honesty rendered as geometry.
3. **A private key never appears outside a device outline.** Anywhere. Including
   error diagrams, recovery diagrams, and marketing illustration. The absence is
   the argument.

## Design principles

### Technical clarity

Interfaces should feel precise, legible, and built for sustained developer use.
Structure and language do more work than decoration.

### Show the boundary, don't dramatize it

Communicate privacy through explicit state, drawn boundaries, and calm
hierarchy. No decorative padlocks, no neon glow, no metallic shields, no
fear-based imagery. (This principle was previously phrased "security without
theater." That phrasing is retained here as an internal design principle only —
it is not customer-facing copy and must not be used as a headline or tagline.)

### Composable by default

The system provides stable foundations without forcing every surface into the
same layout or framework. Marketing may be expressive; documentation optimizes
scanning; consoles optimize decisions and tasks.

### Semantics before appearance

Components consume roles such as `canvas`, `surface`, `foreground`, and
`danger`. Primitive palette names are reserved for artwork and exceptional brand
moments.

### Accessible in every mode

Light, dark, system preference, keyboard focus, reduced motion, forced colors,
zoom, and readable contrast are product requirements, not optional polish. Light
mode is a first-class design target, not a dark-mode inversion — developer tools
default to dark by convention, and matching that convention is the opposite of
distinctive.

## Brand hierarchy

- **Organization:** OpenE2EE — the only thing that ever gets a drawn mark.
- **Product family:** the `@open-e2ee/*` namespace. The organization is
  deliberately positioned as a family, not as a single product.
- **Product:** **Signal Protocol SDK** — a typeset descriptor set beside the
  organization identity. It never gets its own symbol, never gets its own color,
  and never appears on a first-impression surface without `OpenE2EE`.
- **Surfaces:** OpenE2EE Docs, OpenE2EE Console.
- **Legal entity:** Open E2EE LLC, used only where legal identification is
  required.

A future protocol package (MLS, for instance) slots into the same second line
with zero new artwork. That is what a product-family namespace requires, and it
is why product marks are forbidden rather than merely discouraged.

## The mark

Two open brackets — the carrier, outlined, inspectable — holding a filled
payload that never touches them. The gap between payload and bracket is the
trust boundary; it is load-bearing geometry, not spacing, and it may never be
tightened.

Geometry lives in `brand/source/geometry.json` on a 512-unit grid with a
32-unit module. All color comes from tokens. Generated assets in
`brand/generated/` and `packages/design/dist/assets/` are never hand-edited.

### Two silhouettes, one rule

| Size | Variant | Why |
|---|---|---|
| 16–31 px | `optical` | Stems thickened to 56 units, payload squared, shear removed — the shear and the thin stems both disintegrate at favicon scale |
| 32 px and up | `full` | Payload sheared 24 units: the cargo is in transit |
| Below 16 px | none | Do not reproduce the mark |

Variant selection by size is a rule, not a judgement call. The build encodes it,
`manifest.json` publishes it under `variants`, and the test suite fails if a
raster is generated from the wrong silhouette.

### Clear space and placement

Clear space is one bracket stem on every side: `0.125` of the artwork width.
Nothing enters it. The mark is optically centered as drawn — there is no
correction offset.

**The mark does not move.** It has no animation, no hover state, no loading
spinner variant, no draw-on reveal. Diagrams may animate to teach a sequence;
the mark is static in every context, forever.

### Lockups

| Asset | Composition | Use |
|---|---|---|
| Org symbol | mark alone | Favicon, avatar, app icon, diagram relay glyph, anything under ~120 px wide |
| Horizontal lockup | mark + `OpenE2EE` | Site header, README hero, social preview, docs nav |
| Stacked lockup | mark above `OpenE2EE` | Square and portrait crops, print, conference |
| Product lockup | horizontal lockup + `Signal Protocol SDK` on a second line | Product hero, SDK README, npm, docs product switcher |

With symbol height `S`: wordmark cap height `0.62 S`; symbol-to-wordmark gap
`0.375 S`; symbol and wordmark centered on each other vertically, never
baseline-aligned. Stacked gap `0.31 S`. The product line sets at `0.62` of the
wordmark cap height, baseline `1.55` cap heights below the wordmark, left edges
flush.

### Misuse

Do not fill the brackets' interior; outline the payload; make the payload
semi-transparent or gradient-filled; let the payload touch or overlap a bracket;
rotate or mirror the mark; change the shear angle; recolor payload and carrier
differently; add a second payload; place the mark on a photograph; apply a
shadow, bevel, or glow; use the full mark below 32 px; use the optical variant
above 31 px; or set the wordmark in a single uniform weight above 14 px.

## Wordmark

`OpenE2EE`, set in Public Sans: **`Open` at weight 500, `E2EE` at weight 800**,
tracked `−1%` and `−1.5%` respectively. The light, open-countered half says
*open*; the dense, closed half names the encryption. Read left to right it is an
open thing becoming an opaque thing — which is the transformation the product
performs. It needs no rule, box, color split, or other decoration.

Below 14 px the wordmark reverts to one uniform weight 600; the contrast stops
resolving at that size and starts reading as a rendering fault.

Import `@open-e2ee/design/wordmark.css` and use:

```html
<span class="oe-wordmark"><span>Open</span><span>E2EE</span></span>
```

Casing is fixed. Never `Open E2EE` (reserved for the legal entity), never
`OPENE2EE`, never `openE2EE`, and never `open-e2ee` outside package names, npm
scopes, domains, and repository slugs.

**TODO — outlined wordmark.** The wordmark currently ships as live text plus
tokens. A future `brand/generated/wordmark.svg` should be drawn once as outlines
and exported, never re-derived from live font metrics, applying four craft
corrections that live text cannot express:

1. **The `nE` join.** Add `+8/1000 em` sidebearing after `n` so the 500-to-800
   weight cliff reads as intentional rather than as a rendering artifact.
2. **The `2`.** Condense horizontally to `97%` and slightly reduce stroke
   contrast so it does not out-weigh the flanking `E`s. Never set it as a
   superscript, subscript, or lowered figure.
3. **`EE`.** Tighten the final pair by `−12/1000 em`; matched rectangular forms
   at 800 optically drift apart.
4. **Arm lengths.** In the 800 weight, cut the top and bottom arms of all three
   `E`s to the middle arm's length. Equalizing gives the uppercase forms a
   blunt, shared manifest-stamp rhythm that ties them to the mark's brackets.

## Typography

Three families, all SIL OFL 1.1, all self-hosted from package dependencies. No
runtime third-party font request is made.

**Public Sans Variable** — interface, wordmark, headings. A Libre Franklin
derivative, and Libre Franklin is a Franklin Gothic revival, which puts the
American civic and postal lineage in the typeface by descent rather than by
pastiche. Practically: sturdy caps and figures, which the interface needs for
`E2EE`, `PQXDH`, `ML-KEM`, and `AGPL-3.0`. Weights 400 body, 500 emphasis and
labels, 600 subheads, 700 headings, 800 wordmark. Headings track `−1.5%` at
24 px and above, `0` below.

**Newsreader Variable** — editorial prose. Articles, Learn pages, and long-form
explanation set in a serif. **Serif means "we are explaining"; sans means "we
are operating."** The split is doctrinal: reference and task-oriented docs stay
in Public Sans, conceptual pages switch to Newsreader, and a reader can tell
which kind of page they are on before reading a word. Prose sets at weight 400,
line height 1.7, measure 68ch.

**JetBrains Mono Variable** — code, identifiers, metadata. Code blocks 400 at
13.5 px / 1.65; inline code at `0.92em` of its surrounding text; metadata,
versions, fingerprints, and timestamps at 500 / 12 px / `+2%` tracking, never
uppercase.

Consumers import `@open-e2ee/design/fonts.css` or document a deliberate
system-font exception. **Mono is for values only** — packages, versions,
identifiers, fingerprints, field names. Never for prose, never for emphasis.

> **Open review item.** Public Sans is provisional pending founder reaction; the
> "government form" association is a real risk. The fallback is Libre Franklin
> for display with Public Sans for UI, which preserves the lineage argument.
> Newsreader ships with the editorial program; if the blog stalls, cut it.

## Color

The neutral ramp is warm paper, not cool grey. A lint in the test suite holds
every step of `paper` under `0.014` OKLCH chroma in the yellow band, so the ramp
cannot drift blue through incremental edits.

| Ramp | Role |
|---|---|
| `paper` | Canvas, surfaces, text, borders. Light and dark share the `paper-500` step, which is why one value can serve as a border and a subtle-text color in both modes |
| `ultra` | Action. Links, focus, the accent. One accent per view |
| `seal` | Metadata and the trust boundary. Brass. It is never a warning color first — it marks what the relay can see |
| `verify` | Verified state |
| `alert` | Danger and failure |

Semantic tokens are the public surface; primitives are for artwork. Every
published contrast ratio is asserted in `scripts/test.mjs` to two decimal
places, so a palette edit that quietly regresses accessibility fails the build
rather than shipping.

## Diagram grammar

The diagram grammar and the logo are the same construction, so every diagram
reinforces the mark and the mark explains every diagram. This is the brand's
workhorse.

### The five rules

1. **Open forms are outlined; opaque forms are filled.** 4 px stroke with a
   transparent interior means readable. Flat fill with no interior detail means
   not readable.
2. **Overlap occludes.** Never multiply, never alpha, never a visible
   intersection.
3. **Diagonal means in transit.** Sheared forms are moving; orthogonal forms are
   at rest. Arrows are thin (2 px), straight, orthogonal, and unremarkable — the
   cargo carries the motion, not the arrows.
4. **The trust boundary is a gap, not a wall.** Draw it as a vertical gutter of
   empty canvas at least 48 px wide, marked with a fine dotted `seal` rule and a
   one-word label (`seal` / `open`). Never a dashed rounded rectangle around a
   group. Encryption happens *at a place*; it is not a fence around a region.
5. **One accent per diagram.** Diagrams are neutral. Brass marks the boundary;
   ultramarine marks the one thing the reader should look at now.

### Element vocabulary

| Concept | Form |
|---|---|
| Device | Open rectangle, 4 px plaintext stroke, 3:2 landscape, with 2–3 interior content bars — visibly holding readable content |
| Local store | Open rectangle with one full-width divider a third from the top, content bars present, attached to the device edge and never floating |
| Relay | The org symbol: two brackets with an opaque slab between them. An empty relay renders the brackets with nothing between them, which is a diagram in itself |
| Object store | The same brackets, wider apart, holding 2–3 stacked opaque slabs of unequal size |
| Ciphertext / envelope | Solid slab, sheared in transit and upright at rest. Never labeled with content, never given an icon |
| Plaintext | Open outlined form with visible content bars |
| Private key | A small solid notched slab drawn inside a device outline. Never a key shape. Never outside a device |
| Public key / prekey bundle | A small outlined notched slab. It travels and it is readable; the shape rhyme with the private key is the point |
| Trust boundary | Vertical gutter of canvas, dotted brass rule, label |
| Session / ratchet state | A short run of small upright slabs at even intervals, each slightly darker than the last — sequence without cartoon gears |
| Metadata | Thin brass ticks along the outside top edge of a slab. Always drawn |

### The signature diagram

Device outlines with visible content bars at both ends; sheared opaque slabs
crossing the gaps; the org mark in the middle as the relay; brass dotted gutters
where sealing and opening happen. It reads without labels: the eye registers "I
can see into the ends and not into the middle," which is the whole product in
one image.

**At most one signature device per viewport.** A page that repeats the mark, a
manifest plate, and the signature diagram in one screen has over-applied the
identity and lost all three. Over-application is the most likely failure mode of
this system.

### Imagery

No photography of people. No abstract 3D. No particles. The editorial image
system is **manifest plates**: poster-scale compositions built from the same
primitives, arranged like a freight manifest, annotated in monospace with real
things — actual byte lengths, actual protocol step names, actual export paths.
They are legible technical objects, not decoration, and **every one of them must
be true**. The generated social card in `brand/generated/social/` is the
reference implementation.

## Editorial devices

Adopted alongside the identity and expected on the surfaces named:

- **Docs front-matter block** — status, applies-to version, platforms,
  prerequisites, and reading time as a ruled monospace block at the top of every
  docs page. A manifest is front matter; it also improves `llms.txt` extraction.
- **`Failure mode` and `Not covered` callouts** — a permanent home in the layout
  for the candour the voice requires, and the natural place for the operational
  failures developers actually hit.
- **Forward-only lifecycle stepper** — evaluating, licensed, active, renewal
  due. Rendered as a linear stepper in the console; it never moves backward.
- **Opacity Ledger** — a four-column table (Stays on device / Sent to relay /
  In object store / Visible as metadata) that appears on every Build page. The
  object-store column is load-bearing: attachment and blob pages have a fourth
  place things live, and the ledger must name it.
  It is the honesty line in tabular form.

## Token model

Three layers:

1. **Primitives** — raw palette, type, spacing, radius, shadow, motion. Product
   components should rarely use them directly.
2. **Semantic** — roles such as canvas, accent, border, code, and status. These
   change by theme.
3. **Component** — durable decisions shared by a recognizable pattern, without
   prescribing markup or framework.

Token names are a public API. Pre-launch, breaking changes are direct: no
aliases, shims, or compatibility layers for retired names. Once there are
consumers on a published version, renaming or removing a token requires a major
release; additions are minor; value corrections are patch unless they
intentionally change the visual language.

## Theme contract

Applications offer `light`, `dark`, and `system`. Persist the preference under
`oe-theme`. Resolve it by applying `.dark` to the root `<html>` element when
dark colors should be active and removing it for light. The resolver in
`@open-e2ee/design/theme` should run before first paint where possible.

Components use semantic tokens and never duplicate mode-specific hex values.
Theme selection never changes information hierarchy, meaning, or available
actions.

## Layout and visual language

- Base spacing follows a 4 px scale.
- Default controls are at least 44 px tall.
- Radii are small and deliberate; nested surfaces do not accumulate unrelated
  corner values.
- Shadows communicate elevation, not decoration.
- Motion is short, reversible, and disabled under reduced motion. The mark is
  exempt: it never moves.
- Dense technical information favors alignment and whitespace over extra rules.

## Content and voice

Full canon lives with the verbal identity; the binding summary:

- **Positioning.** OpenE2EE builds open-source, protocol-level end-to-end
  encryption SDKs for TypeScript developers — pure TypeScript that runs where
  apps actually run: Expo and React Native, browsers, and Node. AGPL for open
  source, commercial licenses for proprietary products.
- **Promise.** Opaque to the relay, open to inspection.
- **Taglines — pending founder sign-off.** Primary: *"Opaque to the relay. Open
  to inspection."* Homepage hero: *"Your relay carries it. Your relay can't read
  it."* Product hero: *"The Signal Protocol, where your app actually runs."*
  Until sign-off lands, any surface using these must annotate them as proposed.
- **Evidence over adjectives.** A quote, a number, a spec citation, or real code
  beats any intensifier.
- **State the limit next to the claim.** Every capability statement that could
  be over-read carries its boundary in the same breath, in the same viewport.
  Candour is the differentiator and is never buried in a footnote.
- **Plain, exact, calm.** Short sentences. No fear marketing, no urgency, no
  exclamation marks. The reader is a competent adult with production
  responsibilities.
- **Maturity is stated verbatim:** `0.1.0-alpha; public APIs and persisted
  formats may change before 1.0.`
- **The relay formula is fixed:** "the relay never needs message plaintext or
  device private keys." Do not paraphrase it into an absolute.

### Terminology

`Signal Protocol` is the published specification family; `Signal Messenger` is
the unaffiliated product; the two are never interchangeable. A **relay** carries
envelopes — say "relay," not "server," when transport is meant. **Storage** is
the local encryption-state owner for one user and device; a **vault** stores key
material; an **object store** holds opaque encrypted blobs; these are never
blurred. A **device** is the cryptographic identity unit — a user is a changing
set of devices, not an account row. An **envelope** is the sealed unit the relay
carries: its outside is visible, its inside is not. Use **safety number** with
users and **identity key fingerprint** with engineers.

E2EE is not TLS, is not anonymity, and is not compliance.

### Banned

"Military-grade," "unbreakable," "complete privacy," "100% secure," "zero
knowledge," "the server sees nothing," "audited" (until an audit exists — the
truthful line is "not yet audited; independent review is planned"),
"production-ready" for anything whose own docs do not say so, any compliance
mandate framing, any FIPS implication, and any suggestion of Signal Messenger
affiliation or wire compatibility.

## Accessibility baseline

- Normal text and meaningful icons meet at least 4.5:1 contrast.
- Large text and non-text controls meet at least 3:1.
- Focus is visible and never conveyed by color alone.
- Status always includes text, an icon, or both.
- Interfaces work at 200% zoom and 320 CSS px width.
- Motion respects `prefers-reduced-motion`.
- Forced-colors and high-contrast modes retain structure and actions; generated
  mark SVGs already carry a `forced-colors` rule.

See `docs/accessibility.md` for verification requirements.

## Surface ownership

This repository owns identity, tokens, themes, shared assets, and stable design
guidance. Application repositories own their product-specific layouts,
information architecture, copy, and components.

Each application may keep a short local `DESIGN.md` recording the installed
`@open-e2ee/design` version, the surface type and density, intentional
exceptions, local component ownership, and links back to this document.

## Governance and releases

Changes arrive through pull requests with generated artifacts, light and dark
evidence, accessibility checks, and migration notes when consumers are affected.

Generated files are never edited directly. The build reads `tokens/` and
`brand/source/`, writes `brand/generated/` and `packages/design/dist/`, and CI
rejects uncommitted generated changes.

Reviewers evaluate brand fit, consumer compatibility, accessibility, and whether
a proposed component is genuinely shared. For identity work specifically, the
enforceable review items are: binary opacity, occlusion never blending, metadata
ticks always drawn, private key never outside a device, correct mark variant for
size, and at most one signature device per viewport.
