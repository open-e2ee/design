# OpenE2EE design

The shared source of truth for OpenE2EE brand identity, design tokens,
theming, product-surface guidance, and reusable assets.

The identity is **the Carrier**: a carrier that cannot read what it
carries. Open forms are outlined, opaque forms are filled, and that one rule
governs the mark, the diagrams, and the imagery alike. Read
[`DESIGN.md`](./DESIGN.md) before changing anything visual.

The repository publishes the framework-neutral `@open-e2ee/design` package.
Marketing, documentation, console, SDK, social, and presentation surfaces
should consume a pinned package release rather than copy values from another
application repository.

## What lives here

- [`DESIGN.md`](./DESIGN.md) — the governing design contract.
- [`brand/`](./brand/) — logo geometry, usage rules, and generated exports.
- [`tokens/`](./tokens/) — the source values for primitives, semantics, and
  component decisions.
- [`packages/design/`](./packages/design/) — distributable CSS, JSON,
  JavaScript, assets, and the `oe-design` CLI.
- [`docs/`](./docs/) — focused guidance for theming, accessibility, content,
  and asset delivery.
- [`site/`](./site/) — the deployable `design.open-e2ee.dev` reference site and
  a real consumer of the package.

## Development

Requires Node.js 22+ and `rsvg-convert` from librsvg.

```sh
npm install
npm run check
npm run pack:check
bash scripts/verify-design-contract.sh
```

`scripts/verify-design-contract.sh` holds the eighteen conditions of the UI
redesign design contract. With no argument it reports each condition and exits
non-zero while any one fails.

CI runs it with `--ratchet` on every pull request. That mode compares the
pass count against `scripts/redesign-baseline/passing.txt` and fails on any
difference, so an open condition does not block unrelated work. A change
that turns a condition green records the new count in the same commit.

To run the reference site:

```sh
npm run dev --prefix site
```

## Consumer setup

**`@open-e2ee/design` is not on npm yet — npm publication is pending.** Install
from a GitHub release tag and pin it:

```sh
npm install github:open-e2ee/design#v0.9.1
```

or, equivalently, from the tag tarball:

```sh
npm install https://github.com/open-e2ee/design/archive/refs/tags/v0.9.1.tar.gz
```

Pin an exact tag rather than a branch. The generated distribution is committed,
so a tag install needs no build step and no `rsvg-convert` on the consumer's
machine — you get exactly the artifacts CI verified.

Framework-neutral CSS:

```css
@import "@open-e2ee/design/fonts.css";
@import "@open-e2ee/design/tokens.css";
@import "@open-e2ee/design/wordmark.css";
```

Tailwind CSS v4:

```css
@import "tailwindcss";
@import "@open-e2ee/design/fonts.css";
@import "@open-e2ee/design/tailwind.css";
```

Static-file consumers can export a versioned asset snapshot:

```sh
oe-design export public/brand
oe-design check public/brand
```

The snapshot manifest records both the package version and content digest, so
checks fail when a consumer updates the dependency without refreshing assets.

## Package policy

`@open-e2ee/design` is intentionally limited to foundations and assets.
Application-specific marketing, documentation, and console components remain
with their applications. A future `@open-e2ee/ui` package should be introduced
only for stable components shared by multiple interactive products.

The repository is public, but no software, asset, or trademark license has
been selected yet. Until that decision is documented, `package.json` uses
`UNLICENSED`.
