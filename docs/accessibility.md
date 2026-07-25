# Accessibility verification

Every design-system change must preserve:

- 4.5:1 contrast for normal text and meaningful icons;
- 3:1 contrast for large text, focus indicators, and component boundaries;
- visible keyboard focus;
- non-color status labels;
- usability at 200% zoom and 320 CSS px;
- reduced-motion behavior;
- structure in forced-colors mode.

The automated token check covers the intended foreground/background pairs, and
it asserts each published ratio to two decimal places rather than only checking
the minimum. A palette edit that leaves a pair technically passing but visibly
worse still fails the build, and the fix is to update the expected value
deliberately rather than to relax the assertion.

A second lint keeps the neutral ramp warm: every `paper` step stays under
`0.014` OKLCH chroma in the yellow band. Warmth is an identity decision, but it
is also why light mode is comfortable enough to be the default rather than an
inverted afterthought.

Application visual tests remain responsible for typography size, layered
surfaces, opacity, images, focus clipping, interaction, and responsive layout.

Required visual snapshots:

- light and dark;
- 320 px and desktop width;
- default and keyboard-focus states;
- at least one status/error state for interactive products.

