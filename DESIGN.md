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

The document has two parts. Part I governs the identity that stays constant on
every surface. Part II governs the product interfaces built on it. Where the
two meet, Part I wins.

## Part I, identity

## The material law

**Open is outlined. Opaque is filled.**

An outlined form has a transparent interior: you can see into it, so its
contents are readable. A filled form has no interior detail at all: you cannot
see into it, so its contents are not readable. There is no third state. Nothing
in this system is ever half-transparent, gradient-filled, frosted, or blurred,
because "partly readable" is not a thing encryption does.

The outline is a claim about the container, not about everything the container
holds. Outlined means inspectable: you can see in. What you find there carries
the readability claim in its own right — content bars are readable, filled slabs
are not. An open container holding filled slabs is therefore not a
contradiction. It says "you can inspect this, and what it holds is still
sealed," which is the sentence a relay the reader operates has to be able to
say. What an outline never does is make its contents readable by enclosing them.

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
- **Products:** **Signal Protocol SDK** and **Relay** — typeset descriptors set
  beside the organization identity. A product never gets its own symbol, never
  gets its own color, and never appears on a first-impression surface without
  `OpenE2EE`. Relay remains unpublished until its launch reaches REL1.
- **Surfaces:** OpenE2EE Docs, OpenE2EE Console.
- **Legal entity:** OpenE2EE LLC, used only where legal identification is
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
| 16–31 px | `optical` | Stems thickened to 56 units so they survive favicon scale |
| 32 px and up | `full` | Square payload with 40-unit clearance on all sides |
| Below 16 px | none | Do not reproduce the mark |

Variant selection by size is a rule, not a judgment call. The build encodes it,
`manifest.json` publishes it under `variants`, and the test suite fails if a
raster is generated from the wrong silhouette.

### Clear space and placement

Clear space is one bracket stem on every side: `0.125` of the artwork width.
Nothing enters it. The mark is optically centered as drawn — there is no
correction offset.

**The mark does not move, with one named exception.** It has no hover state, no
loading spinner variant, and no animation a product invents for itself. Diagrams
may animate to teach a sequence; the mark is static everywhere the exception
below does not reach.

The exception is the star field in the website's closing band, where the
horizontal lockup is drawn as a field of small lights that a pointer pushes
aside and that fall back into place when it leaves. It holds only there, only on
these conditions, and it implies no second exception:

- The field settles into the artwork it was sampled from. That artwork is what a
  reader with no script, or with a preference for reduced motion, sees at all
  times, and the two are the same drawing rather than two drawings kept in step.
- The lights are sampled from `packages/design/dist/assets/`. A redrawing is
  still a redrawing, moving or still.
- Payload, carrier and wordmark light alike, in one color. Recoloring any of
  them differently stays misuse.
- Clear space still holds, and no other element enters it.

Be clear about what the exception costs, because three rules elsewhere in this
document yield to it while the field is in motion. *Misuse* forbids a
semi-transparent payload and a glow, and a light's opacity and halo both grow
with how far it has been pushed. *Wordmark* says the wordmark needs no
decoration, and a field of lights is decoration. More seriously, the gap between
payload and bracket is called load-bearing geometry above — it is the trust
boundary — and a field that comes apart lets lights cross it. All three hold
again the moment the field settles, which is the whole reason the settled state
is a condition rather than a nicety.

(Rule changed 2026-08-15: the mark was static in every context, forever. The
founder granted this exception after the previous rule, and each cost above, was
put to him in writing.)

### Lockups

| Asset | Composition | Use |
|---|---|---|
| Org symbol | mark alone | Favicon, avatar, app icon, the branded diagram relay, anything under ~120 px wide |
| Horizontal lockup | mark + `OpenE2EE` | Site header, README hero, social preview, docs nav |
| Stacked lockup | mark above `OpenE2EE` | Square and portrait crops, print, conference |
| Product lockup | horizontal lockup + a registered product descriptor on a second line | Product hero, SDK README, npm, docs product switcher |

Registered descriptors are `Signal Protocol SDK` and `Relay`. A future product
adds a descriptor to the generator; it does not add a mark or color.

With symbol height `S`: wordmark cap height `0.62 S`; symbol-to-wordmark gap
`0.375 S`; symbol and wordmark centered on each other vertically, never
baseline-aligned. Stacked gap `0.31 S`. The product line sets at `0.62` of the
wordmark cap height, baseline `1.55` cap heights below the wordmark, left edges
flush with the mark's left edge.

Both ratios are of `S`, the symbol height — not of the font size. Public Sans
has a cap height of 0.723 em, so a lockup built by setting the wordmark to
`0.62em` is about a sixth too large. All four lockups are generated into
`brand/generated/lockup/` in light, dark, and mono from
`brand/source/lockups.json` and real font metrics; use those rather than
rebuilding the proportions by hand, and if you must rebuild them in CSS, read
the computed numbers out of `manifest.json` under `lockups`.

### Misuse

Do not fill the brackets' interior; outline the payload; make the payload
semi-transparent or gradient-filled; let the payload touch or overlap a bracket;
rotate or mirror the mark; shear or skew the payload; recolor payload and carrier
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

Casing is fixed. Never `Open E2EE` — the spaced form is not the entity name and
is reserved only as a brand asset in `LICENSE-BRAND.md` — never
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
`E2EE`, `PQXDH`, `ML-KEM`, and `AGPLv3`. Weights 400 body, 500 emphasis and
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

The neutral ramp is warm paper, not cool gray. A lint in the test suite holds
every step of `paper` under `0.014` OKLCH chroma in the yellow band, so the ramp
cannot drift blue through incremental edits.

| Ramp | Role |
|---|---|
| `paper` | Canvas, surfaces, text, borders. Light and dark share the `paper-500` step, which is why one value can serve as a border and a subtle-text color in both modes |
| `ultra` | Action. Links, focus, the accent. One accent per view |
| `info` | Information. Sky blue, measured at 242 degrees OKLCH, held below the accent chroma at every step so the accent stays the loudest call |
| `seal` | Metadata and the trust boundary in a diagram, and the warning state in a product interface. Brass. A diagram never uses it to warn: there it marks what the relay can see |
| `verify` | Verified state |
| `alert` | Danger and failure |

Brass carries both meanings because the warm quadrant holds no third hue. At
the 500 step `alert` sits at 27.2 degrees and `seal` at 75.3 degrees. A
conventional amber lands 17 degrees from brass, and a conventional orange lands
14 degrees from danger. Neither clears both, so a sixth warm family would read
as one of the two it stands beside.

A semantic tint states a hue and nothing else. `tokens/tint-rule.json` supplies
one lightness and one chroma ceiling per theme. The four tints then sit at one
optical weight, so a row of status pills is level. A tint whose hue leaves the
sRGB gamut at that lightness lands at the closest chroma that exists. Its
lightness does not move.

Semantic tokens are the public surface; primitives are for artwork. Every
published contrast ratio is asserted in `scripts/test.mjs` to two decimal
places, so a palette edit that quietly regresses accessibility fails the build
rather than shipping.

## Diagram grammar

The diagram grammar and the logo are the same construction, so every diagram
reinforces the mark and the mark explains every diagram. This is the brand's
workhorse.

**The grammar is published as code.** `@open-e2ee/design` exports the
primitives — slabs, the key silhouette, carrier brackets, metadata ticks, content
bars, device outlines, boundary lines, the ratchet ramp — and the assets in this
repository are drawn with the same functions a consumer imports, so an asset
here and a diagram in an app cannot drift apart. Do not reimplement a primitive
privately; if the grammar lacks a shape, add one. See
[`docs/diagram-grammar.md`](./docs/diagram-grammar.md).

### The five rules

1. **Open forms are outlined; opaque forms are filled.** 4 px stroke with a
   transparent interior means readable. Flat fill with no interior detail means
   not readable.
2. **Overlap occludes.** Never multiply, never alpha, never a visible
   intersection. Where a diagram needs a lighter mark than the plaintext
   stroke — content bars, ratchet steps — it uses the solid
   `--oe-diagram-content-bar` and `--oe-diagram-ratchet-1…4` tokens. Alpha is
   not a lighter color, it is a claim that something is partly readable, and
   the test suite fails any primitive that emits one.
3. **Diagonal means in transit.** Sheared forms are moving; orthogonal forms are
   at rest. Arrows are thin (2 px), straight, orthogonal, and unremarkable — the
   cargo carries the motion, not the arrows.
4. **The trust boundary is a gap, not a wall.** Draw it as a vertical gutter of
   empty canvas at least 48 px wide, marked with a fine dotted `seal` rule and a
   one-word label (`seal` / `open`). Never a dashed rounded rectangle around a
   group. Encryption happens *at a place*; it is not a fence around a region.
5. **One accent per diagram.** Diagrams are neutral. Brass marks the boundary;
   ultramarine marks the one thing the reader should look at now. That
   ultramarine is `--oe-accent`. There is no accent in the `--oe-diagram-*`
   family and there should not be one: that family is the neutral material a
   diagram is drawn *in*, and its neutrality is the point rather than an
   omission. An accent is a claim about attention, so it comes from the ramp
   that owns attention everywhere else in the system.

### Element vocabulary

| Concept | Form |
|---|---|
| Device | Open rectangle, 4 px plaintext stroke, 3:2 landscape, with 2–3 interior content bars — visibly holding readable content |
| Local store | Open rectangle with one full-width divider a third from the top, attached to the device edge and never floating. It draws what it holds: content bars for readable material, filled key silhouettes for keys. A store holding only key material carries no bars — see *What a store draws* |
| Relay, branded | The org symbol: two brackets with an opaque slab between them. An empty relay renders the brackets with nothing between them, which is a diagram in itself. Brand-bearing — see *Two relay forms* |
| Relay, unbranded | An open container holding opaque slabs with metadata ticks and no content bars, standing between two trust boundaries. The form for a relay the reader operates — see *Two relay forms* |
| Object store | The same brackets, wider apart, holding 2–3 stacked opaque slabs of unequal size. Brand-bearing for the same reason the branded relay is: the brackets are the mark's construction |
| Ciphertext / envelope | Solid slab, sheared in transit and upright at rest. Never labeled with content, never given an icon |
| Plaintext | Open outlined form with visible content bars |
| Private key | A small filled key silhouette drawn inside a device outline. Never outside a device — see *Key material* |
| Public key / prekey bundle | The same silhouette, outlined. It travels and it is readable; the shape rhyme with the private key is the point — see *Key material* |
| Trust boundary | Vertical gutter of canvas, dotted brass rule, label |
| Session / ratchet state | A short run of small upright slabs at even intervals, each a discrete solid step toward the ciphertext fill (`--oe-diagram-ratchet-1…4`) — sequence without cartoon gears, and without an opacity ramp |
| Metadata | Thin brass ticks along the outside top edge of a slab. Always drawn |

### Two relay forms

The carrier brackets are the mark's own construction. `carrierBracketPaths`
reproduces the mark's geometry from the mark's own values, the test suite
asserts it character for character, and `CarrierConstruction.thickness` is
documented as the value the mark's geometry calls `thickness`. Drawing the
brackets is drawing the identity. That is the point everywhere but one: the
relay is the node the customer runs, and putting the vendor's mark on it claims
a piece of infrastructure this project insists the reader owns.

So there are two relay forms, and the choice between them is not stylistic.

**The branded relay** — the brackets — belongs in diagrams whose subject is
OpenE2EE: the mark, the social cards, the signature diagram, the product.

**The unbranded relay** — the open container — belongs in any diagram of
infrastructure the reader operates. If a reader can point at a node and say
"that one is mine," it does not wear the mark.

The unbranded relay is an open container at the same 4 px open stroke a device
carries, holding one or more opaque slabs. Four things make it read as a relay
and not as a device. Drop one and it is not this form:

1. **No content bars, in any state.** A single bar makes it a device holding
   readable content, which is the one claim this form exists to deny.
2. **Metadata ticks on every slab it holds**, by the second corollary of the
   material law. The ticks are the affirmative half of the drawing: they are
   what the relay *can* see.
3. **No filled key glyph inside it, ever**, by the third corollary. A device
   holds a filled key silhouette; a relay holds none, and the absence is the
   argument.
4. **A trust boundary on both sides.** A form standing between two dotted brass
   gutters is a third party. A form with a gutter on one side is the far end of
   the trip. Nothing else in the grammar draws that difference.

An empty unbranded relay is the container with nothing in it, and it says what
the empty branded one says.

Both forms are compositions of published primitives. Neither needs a shape the
grammar does not already have.

### What a store draws

A local store draws its contents, and its contents are not always readable
material. A store holding identity and signed prekeys holds key material, and
the honest drawing of it is filled key silhouettes under the divider with no
content bars anywhere in the form.

Bars in that store would be a claim, not a decoration. A content bar means
readable material is present — that is the whole of what it means, and it is why
one bar in a relay makes the relay a device. Putting bars in a key store asserts
plaintext at rest in a box that holds no plaintext, and it does so in the one
diagram whose subject is where plaintext is allowed to exist.

The divider carries the distinction the bars used to. Label above it, contents
below, and what sits below is whatever the device actually keeps there.

`deviceOutline` has always accepted `bars: 0` and renders the outline and its
divider without them; `contentBarRects` still refuses a count below one, because
a form that draws bars draws at least one. Zero bars is not a bar count — it is
the decision not to claim readability.

### Key material

A key is drawn as a key: a small silhouette in the grammar's own language —
geometric, flat, orthogonal strokes, a faceted hexagonal bow, a straight
shaft, square teeth. No gradients, no opacity, the same two prohibitions
every other primitive in this grammar carries. The facets are the choice: a
round bow is the one curve the grammar would otherwise carry, and the
hexagon keeps the silhouette inside the same angular language as the
brackets and the slabs.

**Filled is private.** It is drawn only inside a device outline and never
outside one. A private key anywhere else is the drawing making a claim the
system does not make.

**Outlined is public.** A public key or a prekey bundle travels and it is
readable, so it is drawn open. The shape rhyme between the filled and
outlined forms is the argument: they are the same key, and the fill is the
only thing that changes between "only this device has it" and "this is
meant to be handed out."

(Rule changed 2026-08-12: the notched slab read as nothing to a lay reader
in the interactive demo, and the founder reversed the earlier ban on a
literal key shape for key glyphs. The silhouette is the only key form now;
[`docs/diagram-grammar.md`](./docs/diagram-grammar.md) carries its
construction.)

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
  for the candor the voice requires, and the natural place for the operational
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
  exempt: it never moves. A figure that teaches by stepping is the one case
  needing more than that — see *Motion under reduced motion*.
- Dense technical information favors alignment and whitespace over extra rules.

### Motion under reduced motion

`--oe-duration-fast`, `--oe-duration-normal` and `--oe-duration-slow` are
**transition** durations, and they collapse to `0.01ms` under
`prefers-reduced-motion`. That is correct for an interface. There the
transition *is* the motion, so removing the duration removes the motion and
takes nothing else with it.

A figure that teaches by stepping is not that. Its per-step **dwell** — the
time a step stays legible — is not a transition duration and must never be
derived from one. Dwell holds still; there is no movement in it to remove, so
shortening it costs the reader information rather than motion. A dwell read
from a duration token plays an entire protocol flow in a single frame, which
is the whole figure withheld from exactly the reader who asked for less
movement.

So, for any figure that advances through steps:

> **Under reduced motion a teaching sequence keeps every step and drops the
> transitions between them.** Same steps, same order, arriving without
> animation.

There is no dwell token, and a dwell held in a local constant is the correct
implementation of this rule rather than a workaround to be tidied away later.
Every `--oe-duration-*` collapses under reduced motion; a dwell token would
exist precisely to *not* do that, and a value whose only job is to break its
own family's contract is a trap for whoever reads it next. If a second surface
ever needs the same dwell, that is when it earns a name.

## Content and voice

Full canon lives with the verbal identity; the binding summary:

- **Positioning.** OpenE2EE builds open-source, protocol-level end-to-end
  encryption SDKs for TypeScript developers — pure TypeScript that runs where
  apps actually run: Expo and React Native, browsers, and Node. AGPLv3 for open
  source, commercial licenses for proprietary products.
- **Promise.** Opaque to the relay, open to inspection.
- **Taglines.** Product hero — **approved 2026-08-09**: *"The Signal Protocol,
  where your app actually runs."* Primary — proposed, pending founder
  sign-off: *"Opaque to the relay. Open to inspection."* The homepage-hero
  line (*"Your relay carries it. Your relay can't read it."*) was retired
  unshipped on 2026-08-09; the website homepage leads with its job statement.
  Any surface using a *proposed* line must annotate it as proposed — an
  approved line needs no annotation. `oe-design taglines <built-html-dir>`
  enforces that against built output, and `checkTaglineAnnotation` from
  `@open-e2ee/design/taglines` does it in process.
- **Evidence over adjectives.** A quote, a number, a spec citation, or real code
  beats any intensifier.
- **State the limit next to the claim.** Every capability statement that could
  be over-read carries its boundary in the same breath, in the same viewport.
  Candor is the differentiator and is never buried in a footnote.
- **Plain, exact, calm.** Short sentences. No fear marketing, no urgency, no
  exclamation marks. The reader is a competent adult with production
  responsibilities.
- **Maturity is the version number:** `<major>.<minor>.x — public APIs and
  persisted formats may change before 1.0.`, composed from the shipped
  release's own version rather than typed. A consumer that hard-codes the
  numbers states a maturity its next release contradicts, so read them from
  the package: `package.json` in the SDK repository, the installed manifest on
  the marketing site, the registry in the console. No stage adjective — not
  alpha, beta, early access, or preview.
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
knowledge," "the server sees nothing," "audited" unqualified — along with
"independently audited," "third-party audited," and any promise of a future
firm engagement — "production-ready" for anything whose own docs do not say so,
any compliance mandate framing, any FIPS implication, and any suggestion of
Signal Messenger affiliation or wire compatibility.

On audit status there is one fixed line, used verbatim:

> Reviewed continuously by adversarial AI agents; not audited by any
> independent firm.

Its two halves never separate. The AI review stated alone reads as assurance
with the limit filed off, and the limit stated alone understates what runs.
`docs/messaging.md` §7 in the org workspace governs the wording and holds the
longer expansion.

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

## Licensing

The code in this repository — tokens, CSS, theme module, diagram grammar, CLI,
build scripts, tests, docs — is Apache-2.0 (`LICENSE`). The visual identity is
**reserved, not open source** (`LICENSE-BRAND.md`): `brand/source/`,
`brand/generated/`, the published copies under `packages/design/dist/assets/`,
and the names, mark, and wordmark. Reproducing them unmodified to refer to
OpenE2EE is permitted; redrawing them, or using them as your own identity, is
not.

The reservation exists because the trademark and visual-similarity search noted
at the top of this document has not been run. It is a position while that
resolves, not a permanent one.

## Part II, product UI

Part I governs identity. Part II governs the product interfaces. It covers the
console, the documentation host, the website chrome, and the blog. It states
the shell, the density, the display grammar, the interface states, and the
interface voice. A product surface follows it and invents no local answer.

The role token layer in `@open-e2ee/design` is the executable form of this
part. A component reads a role. It never reads a ramp step, and it never
writes a hex value.

### The laws

These laws resolve an ambiguous interface decision:

1. **One accent, four jobs.** `--oe-accent` marks the primary action, the
   link, the focus ring, and the current item. Everything else is a neutral or
   a semantic role. One accent per view.
2. **Mono is the voice of data.** A machine value renders in mono, tabular,
   and selectable. That covers the identifier, the key, the fingerprint, the
   price, the count, the latency, and the timestamp. Body prose is never mono.
3. **Borders are elevation.** Surfaces stack by ground plus a 1 px hairline. A
   shadow belongs only above the page plane, on a popover, a dropdown, or a
   dialog. Each shadow carries an inset 1 px ring.
4. **Role-mapped neutrals.** A component names a ground, a border weight, and
   a text step. The theme swaps the values under it.
5. **Weight stops at 600. Tracking applies at 20 px and above.**
6. **Dense tables, calm pages.** Density belongs inside a data surface. The
   page chrome around it stays airy.
7. **Color means state.** A colored pixel is interactive, or it reports a
   condition. Decorative color does not exist.
8. **The interface states the outcome.** It describes no mechanism of its own.
   The voice rule below states this in full.

### The shell

The console and the documentation host share one shell.

- The **sidebar width** is 256 px. It carries the `panel` ground and a 1 px
  `border-1` right edge.
- The **collapsed rail** is 56 px. It shows the icon and the current marker
  only. The collapse state persists under `oe-nav-collapsed`.
- A navigation item uses weight 500 text at 14 px. Its padding is 8 px and
  12 px, and its radius is 6 px.
- The current item carries the `hover` ground, the `text-1` step, and a 2 px
  accent bar on its left edge. Another item carries `text-3` and moves to
  `text-2` on hover.
- The **sheet breakpoint** is 768 px. Below it the sidebar becomes a left
  sheet behind a 48 px top bar. That bar holds the menu trigger, the wordmark,
  and the command trigger.
- The collapse state belongs to the wide layout. It never applies inside the
  sheet.
- The content region is at most 1,200 px wide. Gutters are 32 px above the
  sheet breakpoint and 16 px below it.
- A **skip link** is the first focusable element on every page. It stays
  offscreen until focus reaches it, then it moves focus to the main region.

### The chrome

The website, the documentation host, and the console are three hosts. A reader
crosses them in one session, so the chrome around the content is one set of
measures and not three. Each measure is a `--oe-chrome-*` token. A host reads
the token. It writes no literal of its own.

| Measure | Token | Value |
|---|---|---|
| Header height | `--oe-chrome-header-height` | 64 px |
| Header height below the sheet breakpoint | `--oe-chrome-header-height-compact` | 48 px |
| Footer space above | `--oe-chrome-footer-padding-block-start` | 48 px |
| Footer space below | `--oe-chrome-footer-padding-block-end` | 32 px |
| Lockup size | `--oe-chrome-lockup-size` | 20 px |
| Title | `--oe-chrome-title-size` | 34 px to 60 px |
| Section | `--oe-chrome-section-size` | 26 px to 36 px |
| Subsection | `--oe-chrome-subsection-size` | 18 px |
| Minor heading | `--oe-chrome-minor-size` | 16 px |

The header and the footer each carry a 1 px `border-1` rule against the page.
The lockup size sets the wordmark. The mark sizes from it through the ratio in
*Lockups*, so one token fixes the whole composition on every host.

The focus ring and the spacing base are already single-valued. `roles.css`
carries one `:focus-visible` rule for every host. The 4 px scale in
`tokens.css` is the only spacing source. Neither needs a chrome token.

### The page header

Every page carries the same header. The title sits at 20 px and weight 600.
One line of `text-3` description sits under it. The page's single primary
action sits on the right. An optional tab row sits beneath. The current tab
carries `text-1` and a 2 px accent underline. Pages carry no breadcrumb.

### Density

Two modes exist. A surface picks one and improvises no third.

- **Compact** governs a data surface. That covers the project table, the
  license table, the key table, the member table, and the invoice table.
- A compact row is 40 px tall. Cell padding is 10 px and 16 px, and text is
  13 px.
- A hairline divides one row from the next. The hovered row takes the `hover`
  ground.
- **Comfortable** governs a reading surface. That covers the overview, the
  settings pages, the trust page, the documentation body, the blog, and every
  interface state below.
- A comfortable surface sets body text at 16 px and card padding at 24 px.
  Sections sit 48 px apart.

A card holds a discrete object such as one project, one figure, or one key.
Sequential content uses a flat section with a hairline divider instead.

### The 44 px minimum and a dense row

Part I sets a 44 px minimum height for a control. A 40 px compact row keeps
that rule, because a table row is content and not a control. The rule binds
the controls inside the row and beside it.

- A row that navigates carries one link across the whole row. The pointer
  target is the full 40 px band, and the keyboard target is one stop.
- A control inside a row has a hit area of at least 44 px. It grows by padding
  and an expanded target, so the visible icon stays inside the 40 px band.
- A row that needs a second action moves both into a row menu behind one 44 px
  trigger.

### Data display

- **Identifiers.** Mono at 13 px in a chip on the `raised` ground, with a
  `border-1` edge and a 6 px radius. A copy control appears on hover.
- A truncated identifier shows its head and its tail. A copy takes the whole
  value and confirms it.
- **Secrets.** A license key or an API key appears in full once. Creation
  shows it in a dialog with a copy control.
- The interface masks it after that, in mono, and offers a rotation in place
  of a reveal.
- **Fingerprints.** An identity key fingerprint and a safety number group into
  fixed blocks. A block never wraps in the middle.
- **Prices.** Mono, tabular, and right-aligned in a table. A plan reads
  `$99 / month`, and an overage reads `$0.05 per Relay MAU`. An unknown price
  renders an em dash and never `$0`.
- **Counts.** Exact below 10,000, and compact above it, such as `12.4k` and
  `1.2M`. A count of zero renders `0` and never an em dash, because zero is a
  measurement.
- **Latency.** Milliseconds below one second, and seconds with two decimals
  above it, such as `740ms` and `2.81s`.
- **Timestamps.** A row shows relative time, such as `4m ago`, and carries the
  absolute UTC value on the element.
- A table under an active date filter shows the absolute value instead. A
  relative time inside a fixed range is noise.
- **Status.** A dot and a label report liveness. A tinted pill reports a
  lifecycle state. One vocabulary serves every page.

### The five interface states

Every data surface defines all five. A surface that defines fewer falls back
to a blank region, and a blank region tells a reader nothing.

1. **Loading.** A skeleton in the shape of the result, and never a spinner
   over an empty page. The skeleton holds the row height of its surface, so
   the page does not jump when the data arrives.
2. **Failed read.** The state names what did not load. It carries the retry
   control and the identifier a support request needs. A failed read never
   renders as an empty result.
3. **Empty result.** One sentence naming what would appear here, and one
   primary action that creates the first one. A mono snippet joins it when a
   command is the fix.
4. **Precondition unmet.** Something else has to happen before this surface
   has anything to show. The state names the missing thing and links to it.
   Authorization outcomes render here, and the console authorization contract
   owns their wording.
5. **Filtered to nothing.** The data exists, and the current filter excludes
   it. The state says so and offers to clear the filter. It offers no creation
   action, because a second object does not answer a filter.

A partial result is no sixth state. A surface that loaded some of its regions
renders each region in its own state.

### Interface voice

Decision D4 of the UI redesign plan governs interface copy. Reader-facing copy
states what the reader gets. It explains nothing about how the interface
produces it.

- Write the outcome. Narrate no mechanism behind it.
- A caption about recording, replay pacing, or where a computation ran is
  mechanism. Remove it.
- An error states what failed and what to do next. It names no layer that
  raised it.
- A label names the object in the terminology of Part I. The console says
  project, relay, license, device, and envelope.
- The banned-claims list in Part I binds interface copy exactly as it binds
  marketing copy.
