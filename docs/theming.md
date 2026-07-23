# Theming

## Theme states

OpenE2EE supports `light`, `dark`, and `system`. Store the preference as
`oe-theme`. The resolved DOM state is intentionally binary: `.dark` is present
on `<html>` for dark colors and absent for light colors.

Use the package resolver before application styles:

```html
<script type="module">
  import { applyStoredTheme } from "@open-e2ee/design/theme";
  applyStoredTheme();
</script>
```

Frameworks may provide their own no-flash integration as long as they preserve
the storage key and root-class contract.

## Framework-neutral CSS

```css
@import "@open-e2ee/design/fonts.css";
@import "@open-e2ee/design/tokens.css";
```

This provides primitive variables such as `--oe-color-blue-800`, semantic
variables such as `--oe-canvas`, and component variables such as
`--oe-control-height-md`.

Applications should use semantic variables:

```css
.panel {
  border: 1px solid var(--oe-border);
  border-radius: var(--oe-panel-radius);
  background: var(--oe-surface);
  color: var(--oe-foreground);
}
```

## Tailwind CSS v4

```css
@import "tailwindcss";
@import "@open-e2ee/design/fonts.css";
@import "@open-e2ee/design/tailwind.css";
```

The adapter creates semantic utilities including `bg-canvas`,
`bg-surface`, `text-foreground`, `text-muted`, `border-border`,
`outline-focus`, and status colors.

Primitive utilities remain available for brand artwork, but application
surfaces should not use them as a substitute for semantic roles.

## Product overrides

An application may add semantic roles that are genuinely local. It must not
redefine shared tokens under the same name. If multiple surfaces need the same
new role, propose it here instead.

