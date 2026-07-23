# OpenE2EE design

This document is the governing design contract for OpenE2EE. It defines the
parts of the identity that remain consistent across every surface and the
parts that products are expected to adapt to their context.

## Design principles

### Technical clarity

Interfaces should feel precise, legible, and built for sustained developer
use. Structure and language do more work than decoration.

### Security without theater

Communicate privacy and trust through understandable behavior, explicit state,
and calm visual hierarchy. Avoid decorative locks, neon glow, metallic
effects, and fear-based security imagery.

### Composable by default

The system provides stable foundations without forcing every OpenE2EE surface
into the same layout or framework. Marketing may be expressive; documentation
should optimize scanning; consoles should optimize decisions and tasks.

### Semantics before appearance

Components consume roles such as `canvas`, `surface`, `foreground`, and
`danger`. Primitive palette names are reserved for artwork and exceptional
brand moments.

### Accessible in every mode

Light, dark, system preference, keyboard focus, reduced motion, forced colors,
zoom, and readable contrast are product requirements rather than optional
polish.

## Brand hierarchy

- **Organization:** OpenE2EE
- **Primary product:** OpenE2EE SDK
- **Product surfaces:** OpenE2EE Docs and OpenE2EE Console
- **Legal entity:** Open E2EE LLC, used only where legal identification is
  required

The organization mark identifies OpenE2EE. Product names are descriptors next
to the organization identity, not independently redrawn logos.

## Identity

The split shield containing geometric `O` and `E` forms is the current primary
mark. Its geometry is defined in `brand/source/geometry.json`, while all color
values come from design tokens.

Use the small optical variant from 16–63 px and the full mark from 64 px.
Preserve clear space equal to one eighth of the mark width on every side. Never
stretch, rotate, bevel, shadow, texture, or selectively recolor the mark.

The current mark remains version 1 while broader wordmark exploration is
reviewed. Experimental identity work must not replace generated production
assets without an explicit design decision and a major package release.

## Token model

Tokens have three layers:

1. **Primitive tokens** describe raw palette, type, spacing, radius, shadow,
   and motion values. Product components should rarely use them directly.
2. **Semantic tokens** describe roles such as canvas, action, border, code, and
   status. These values can change by theme.
3. **Component tokens** capture durable decisions shared by a recognizable
   pattern, without prescribing component markup or framework.

Token names are a public API. Renaming or removing a token requires a major
package release. Additions are minor releases; value corrections are patch
releases unless they intentionally change the visual language.

## Theme contract

Applications offer `light`, `dark`, and `system` preferences. Persist the
preference under `oe-theme`. Resolve it by applying `.dark` to the root
`<html>` element when dark colors should be active; remove it for light.

The `.dark` contract matches Tailwind and the documentation framework. The
preference resolver in `@open-e2ee/design/theme` should run before first paint
when possible.

Components must use semantic tokens and must not duplicate mode-specific
hexadecimal values. Theme selection never changes information hierarchy,
meaning, or available actions.

## Typography

Inter Variable is the interface and prose family. JetBrains Mono Variable is
reserved for code, commands, identifiers, versions, fingerprints, timestamps,
and compact metadata labels.

Consumers must import `@open-e2ee/design/fonts.css` or deliberately document a
system-font exception. Monospace is not used for long prose.

## Layout and visual language

- Base spacing follows a 4 px scale.
- Default controls are at least 44 px tall.
- Corners are deliberate and moderate; nested surfaces should not accumulate
  unrelated radii.
- Shadows communicate elevation, not decoration.
- Motion is short, reversible, and disabled when reduced motion is requested.
- Dense technical information favors alignment and whitespace over extra
  borders.

## Content and voice

Write directly, accurately, and without security hype. State what the system
does, what the application owns, and where trust boundaries exist. Prefer
concrete verbs and specific nouns over claims such as “military-grade,”
“unbreakable,” or “zero risk.”

Use `OpenE2EE` for the organization and brand. Use `Open E2EE LLC` only for the
legal entity. Product descriptors use title case in navigation and sentence
case in prose.

## Accessibility baseline

- Normal text and meaningful icons meet at least 4.5:1 contrast.
- Large text and non-text controls meet at least 3:1 contrast.
- Focus is visible and is not conveyed by color alone.
- Status always includes text, an icon, or both.
- Interfaces work at 200% zoom and 320 CSS px width.
- Motion respects `prefers-reduced-motion`.
- Forced-colors and high-contrast modes retain structure and actions.

See `docs/accessibility.md` for verification requirements.

## Surface ownership

This repository owns identity, tokens, themes, shared assets, and stable design
guidance. Application repositories own their product-specific layouts,
information architecture, copy, and components.

Each application may keep a short local `DESIGN.md` that records:

- the installed `@open-e2ee/design` version;
- the surface type and density;
- intentional exceptions;
- local component ownership;
- links back to this document.

## Governance and releases

Changes arrive through pull requests with generated artifacts, light and dark
evidence, accessibility checks, and migration notes when consumers are
affected.

Generated files are never edited directly. The build reads `tokens/` and
`brand/source/`, writes `brand/generated/` and `packages/design/dist/`, and CI
rejects uncommitted generated changes.

The default reviewer should evaluate brand fit, consumer compatibility,
accessibility, and whether a proposed component is genuinely shared.

