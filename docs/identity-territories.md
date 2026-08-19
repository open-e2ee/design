# Identity territories

Why the mark is a carrier and not something else.

This page has an unusual evidence problem, so it states its standard up front:
**every claim here is sourced to a commit, a file, or a token value, and where
the record is silent this page says so instead of filling the gap.** An identity
rationale that invents its own history is worse than no rationale, because the
next person to revisit the mark would be arguing with fiction.

## The brief

The identity work was commissioned with this instruction, recorded in
`FABLE-PROMPT.md`:

> Develop **three genuinely distinct identity territories** (not three shield
> recolors). For each: strategic idea; relationship to E2EE and developer
> tooling; logo concept; wordmark behavior; typography; palette logic; light and
> dark expression; diagram and imagery language; example homepage hero; example
> documentation page; example console workflow; strengths, risks, likely failure
> modes. Then select the strongest, justify it against the product, audiences,
> and educational mission, carry it through implementation, and document why the
> others were rejected.

The selection happened. The documentation of the rejected two did not.

## What the record actually contains

The repository has five commits. Searching every one of them, plus `DESIGN.md`,
`docs/`, `README.md`, `brand/README.md`, and the body of PR #1, for "territory"
or "rejected" returns exactly one relevant hit: the clause in `78b0575` quoted
below. There is no exploration directory, no rejected-concepts file, and no
design-review thread in the repository.

| Territory | Where it survives | How complete |
|---|---|---|
| Opaque Carrier — **selected** | `78b0575` commit body, `DESIGN.md`, `brand/source/geometry.json`, the token layers | Complete, and still executing |
| Split Shield — superseded | `94d87d8` in full: geometry, tokens, `DESIGN.md` as it then stood | Complete as an artifact; its *rationale* was never written down |
| Third territory | Nothing | Not recorded at all |

## Opaque Carrier — selected

**Strategic idea.** Draw what the SDK does rather than how it should make you
feel. `78b0575`:

> The shield asserted safety; it did not describe the product. The Opaque
> Carrier draws what the SDK actually does: two open brackets (the relay,
> inspectable) holding a filled payload (the ciphertext, opaque), with a gap
> between them that is the trust boundary and may never be closed.

That sentence is the whole territory. Everything below is a consequence of it.

**Logo concept.** Two open brackets around a sealed payload, on a 512 grid, in
two silhouettes: the full mark shears the payload 24 units so it reads as cargo
in transit, and the optical variant squares the payload and thickens the stems
so the form survives rasterization. Which one you use is a build rule — optical
from 16 to 31 px, full from 32 px, nothing below 16 — published in the asset
manifest and asserted in `scripts/test.mjs` rather than left to a designer's eye.
The mark is single-color by construction; the two-tone brand tokens were deleted
in the same commit so that recoloring part of the mark is unrepresentable, not
merely discouraged.

The construction generalizes, which is the strongest thing about it: the same
`carrierBracketPaths` function draws the logo and every relay in every product
diagram, and the test suite asserts the two are character-for-character identical.
See [`diagram-grammar.md`](./diagram-grammar.md).

**Typography.** Public Sans for interface, Newsreader for editorial prose,
JetBrains Mono reserved for values. From `78b0575`:

> Public Sans is a Libre Franklin derivative and Libre Franklin is a Franklin
> Gothic revival, which puts the American civic and postal lineage in the
> typeface by descent rather than by pastiche.

Postal lineage, for a mark about carrying sealed things, arrived by descent
rather than costume. The practical reasons were sturdier caps and figures than
Inter for strings like E2EE, PQXDH, ML-KEM, AGPL-3.0, and a genuine 800 weight
for the wordmark. Newsreader is load-bearing rather than decorative: serif means
"we are explaining", sans means "we are operating", so a reader can classify a
page before reading a word.

The wordmark performs the material law instead of illustrating it — `Open` at
500 against `E2EE` at 800, one variable font, no second asset — and collapses to
a uniform 600 below 14 px, where the weight contrast would read as a rendering
bug.

**Palette logic.** Warm paper neutral instead of cool gray, with `ultra` for
action, `seal` (brass) reserved for metadata and the trust boundary, plus
`verify` and `alert`. Reserving a whole ramp for metadata is the palette
expressing the honesty position: the thing the relay *can* still see gets its own
color and is never allowed to borrow the action color. A chroma lint keeps the
neutral ramp warm (chroma ≤ 0.014, hue 66–96) so incremental edits cannot drift
it back to blue, and every published contrast ratio is asserted to two decimal
places.

**Light and dark.** Light is a first-class theme, not a dark theme inverted.
Both modes carry the full surface ladder — canvas, surface, raised, sunken — and
`scripts/test.mjs` asserts the sunken step exists in both. It is worth recording
that this took two attempts: 0.2.0 claimed sunken surfaces in both themes and
dark's resolved to the same value as canvas until 0.3.0 fixed it. The dark
ladder's steps are also smaller than light's (ΔL 0.029 against 0.048) because the
paper ramp is compressed at its dark end; the test asserts that relationship
rather than pretending the two modes are symmetric.

**Failure modes.** Named honestly, because the territory has real ones:

- **Visual-similarity collision.** A bracket-and-payload construction is simple,
  which is what makes it legible at 16 px and also what makes it likely to
  resemble an existing mark. No trademark or similarity search has been run.
  `DESIGN.md` carries this as an open review item and it gates anything
  public-facing.
- **Bracket-as-code-syntax.** Two brackets in a developer-tools context can read
  as `[ ]` — a JSON array, a shell glob — rather than as a carrier. The shear on
  the payload is the main defense and it is the first thing lost at small sizes,
  which is precisely why the optical variant exists.
- **One bracket is a different mark.** The pair is the concept; a single bracket
  is a corner. This one is not hypothetical: the generated social card in this
  repository drew its right bracket off-canvas for two releases while its own
  `<desc>` claimed two, and nobody caught it. Fixed in 0.3.0 with a
  bracket-on-canvas assertion.
- **The material law is demanding.** No alpha, no gradients, no half-states means
  every "just fade this out" reaches for something the system refuses to provide.
  0.3.0 added solid `diagram-content-bar` and four-step ratchet tokens because
  consumers had already reached for 28% alpha twice.

## Split Shield — the superseded incumbent

Recoverable in full from `94d87d8`, the first commit, where it was the shipped
identity. **What is recoverable is the artifact, not the argument**: that commit
documents what the shield *was* and how to use it, but nowhere states what
strategic idea it was meant to carry. The characterization below is reconstructed
from the artifact and should be read as such.

**Logo concept.** A split shield containing geometric `O` and `E` forms, on a 512
grid. `brand/source/geometry.json` at that commit:

```json
"shieldPath": "M256 36C305 61 355 74 420 79V238C420 340 355 418 256 470C157 418 92 340 92 238V79C157 74 207 61 256 36Z",
"oGlyphPath": "M148 174H244V338H148ZM174 199V313H218V199Z",
"eGlyphPath": "M270 174H370V199H298V240H360V265H298V313H370V338H270Z",
"opticalCenterOffset": "-8px",
"clearSpaceRatio": 0.125,
"minimumSize": 16,
"smallMaximumSize": 63
```

The `opticalCenterOffset` is a detail worth keeping: a shield's visual center
sits above its geometric center, so it needed an 8 px nudge to look centered. The
carrier needs no such correction, which is a small argument for the carrier —
one fewer number that has to be right by hand.

**Typography.** Inter for interface, JetBrains Mono for code. A competent,
entirely conventional developer-tools pairing, and that is the criticism: it
carried no argument.

**Palette logic.** Cool gray and blue — `slate` 50–500 (`#f6f8fc` through
`#5d6f87`), `blue` 200–950 centered on `#4c78d0`, with `green`, `amber`, and `red`
status ramps of two stops each. The neutral is cool by construction; `slate.50`
is `#f6f8fc`, which is blue-tinted white. No color was reserved for metadata.
There was no way for that palette to say "the relay sees this much" because it
had no vocabulary for it.

**Light and dark.** Both themes existed and the accessibility requirements were
already stated in the original `DESIGN.md`, but contrast was not asserted
numerically — that discipline arrived with the carrier.

**Failure modes.** The shield's central problem is stated flatly in `78b0575`:
*the shield asserted safety; it did not describe the product.* A shield is a
claim about outcome that the user has to take on faith, which is the opposite of
a product whose entire pitch is that you can verify it. It also sat against the
system's own stated principle — the original `DESIGN.md` already banned
"decorative locks, neon glow, metallic effects, and fear-based security imagery"
under a principle called *Security without theater*, and then used a shield. The
principle was later rewritten as *Show the boundary, don't dramatize it*, and
"security without theater" was retired as customer-facing copy.

Two further limits: the shield's geometry generalizes to nothing — it draws a
logo and stops, where the carrier's brackets draw every relay in every diagram —
and the `O`/`E` glyphs make the mark a monogram, which locks it to the current
name at exactly the moment trademark clearance might force a rename.

The first commit itself flagged the shield as provisional: *"The current mark
remains version 1 while broader wordmark exploration is reviewed."*

## The third territory — not recorded

There is no record of it. Not a name, not a sketch, not a sentence.

The only trace that the exploration happened at all is a clause in `78b0575`
describing what was carried across from the work that lost:

> the editorial devices grafted from the rejected territories: docs front-matter
> blocks, Failure mode and Not covered callouts, the forward-only lifecycle
> stepper, and the Opacity Ledger.

Those four devices are alive in `DESIGN.md` under *Editorial devices*, and they
tell you something about what the rejected work was reaching for: all four are
mechanisms for *structured disclosure* — a manifest at the top of every docs
page, a permanent place in the layout for failure and non-coverage, a state
machine that cannot move backward, and a four-column table naming exactly where
every byte lives. That is a coherent editorial instinct, and it was strong enough
to survive its own territory's rejection.

It would be easy to write a plausible third territory around that instinct and
call it reconstruction. This page does not, because it would be invention, and
the next person to reopen the identity would be unable to tell which parts of
this document were evidence.

**What is genuinely unknown:** how many territories were carried to full
presentation; whether the shield was one of the three or the incumbent all three
were measured against; the third territory's strategic idea, logo concept,
typography, or palette; and whether the carrier won on argument, on execution, or
on both.

## Why the carrier was selected

Reconstructed from `78b0575` and the shape of the system it produced. Four
reasons hold up on the evidence:

1. **It describes the product instead of asserting a feeling.** A relay that
   holds something it cannot read *is* the SDK, drawn. The shield was a promise;
   the carrier is a diagram.
2. **It generalizes into a grammar.** One construction draws the logo, every
   relay, every object store, and the org mark. The material law — open is
   outlined, opaque is filled, no third state — extends from the mark into
   diagrams, into tokens, into what the tests will let you ship. No other part of
   the system needed a separate visual language invented for it.
3. **Its honesty is structural, not editorial.** The gap between the brackets is
   the trust boundary and may never be closed. Metadata ticks are always drawn.
   A private key never appears outside a device outline. These are enforced in
   `scripts/test.mjs`, so the identity's central claim cannot be quietly walked
   back by a well-meaning diagram. For a product whose value proposition is
   verifiability, an identity that is *checkable* is worth more than one that is
   merely attractive.
4. **It costs zero artwork per product.** OpenE2EE is the only thing with a drawn
   mark; Signal Protocol SDK is a typeset descriptor beside it. A second protocol
   package needs no new logo. `DESIGN.md` forbids product marks rather than
   discouraging them, which is what makes that hold.

What the carrier does not settle: trademark and visual-similarity clearance is
still outstanding, and it is the one open question that could invalidate the
selection outright. Until it clears, the brand assets are reserved rather than
released — see [`LICENSE-BRAND.md`](../LICENSE-BRAND.md).

## For the next identity review

Two process notes, earned the hard way by writing this page:

- Rejected work needs a file, in the repository, at the time of rejection. A
  commit body records what was chosen; nothing records what was not. The cost is
  invisible until someone asks "why not X" and the honest answer is "we no longer
  know whether we considered X."
- The reasons in section [Why the carrier was selected](#why-the-carrier-was-selected)
  are the criteria a future territory has to beat. If a replacement is proposed,
  it should be argued against those four, and the losing options should be
  written down here before the branch merges.
