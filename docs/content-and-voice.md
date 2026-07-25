# Content and voice

`DESIGN.md` holds the binding summary. This page is the working reference.

## Character

OpenE2EE is calm, exact, candid, and developer-native. It explains boundaries
instead of borrowing credibility from dramatic security language. The reader is
a competent adult holding production responsibilities.

## Writing rules

- **Evidence over adjectives.** A quote, a number, a spec citation, or real code
  beats any intensifier.
- **State the limit next to the claim.** Every capability statement that could
  be over-read carries its boundary in the same breath and the same viewport.
  Candour is the differentiator; it is never buried in a footnote.
- Lead with the user outcome, then name the actor responsible for storage,
  transport, identity, or recovery.
- Prefer concrete verbs such as `encrypt`, `verify`, `store`, and `rotate`.
- Explain tradeoffs and failure states directly.
- Second person for guides ("you"), first person plural for commitments ("we
  document…"). Never "simply," "just," or "easy" anywhere near cryptography.
- No fear marketing, no urgency, no exclamation marks.
- **Mono is for values only** — packages, versions, identifiers, fingerprints,
  field names. Never for prose, never for emphasis.
- **Maturity is stated verbatim** wherever maturity is relevant: `0.1.0-alpha;
  public APIs and persisted formats may change before 1.0.`
- **The relay formula is fixed:** "the relay never needs message plaintext or
  device private keys." Do not paraphrase it into an absolute.

## Naming

- `OpenE2EE` — organization and brand
- `Signal Protocol SDK` — the product, always typeset beside the organization
  identity and never given a mark of its own
- `@open-e2ee/signal-protocol-sdk` — the package
- `OpenE2EE Docs` — documentation surface
- `OpenE2EE Console` — licensing and account surface
- `Open E2EE LLC` — legal entity only
- `open-e2ee` — slugs, domains, and repository names only

Use `end-to-end encrypted` in prose when describing a property. Use `E2EE` when
space is constrained or the audience already understands the term.

## Glossary

| Term | Means |
| --- | --- |
| Signal Protocol | The published specification family |
| Signal Messenger | The unaffiliated product. Never interchangeable with the above |
| relay | What carries envelopes. Say "relay," not "server," when transport is meant |
| storage | The local encryption-state owner for one user and device |
| vault | The secure store for key material |
| object store | Opaque encrypted blob storage |
| device | The cryptographic identity unit. A user is a changing set of devices, not an account row |
| envelope | The sealed unit the relay carries: outside visible, inside not |
| safety number | User-facing name for an identity key fingerprint |
| identity key fingerprint | Technical name for the same value |

E2EE is not TLS, is not anonymity, and is not compliance.

## Banned claims

- "military-grade," "unbreakable," "complete privacy," "100% secure," "zero
  risk"
- "zero knowledge" — not technically exact in this context
- "the server sees nothing" — use the relay formula
- Any compliance-mandate framing. Almost no regulation mandates E2EE; sell
  breach-notification safe harbor and liability reduction instead
- Any claim that adopting the SDK makes a product compliant
- Anonymity claims for sealed sender beyond its documented limits
- Any FIPS implication — pure-JS crypto is not FIPS 140-validated, and the
  honest answer when asked is to say so
- Any implication of Signal Messenger affiliation or wire compatibility
- "audited" until an audit exists. The truthful line is "not yet audited;
  independent review is planned"
- "production-ready" for anything whose own documentation does not say so

## Retired copy

"Technical clarity. Security without theater." was used as design-site hero copy
and is retired as customer-facing language. "Security without theater" survives
as an internal design principle only; see `DESIGN.md`.

Current taglines are **pending founder sign-off** and any surface using them
must say so.
