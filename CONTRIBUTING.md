# Contributing

Design changes are API changes. Start with the intent and affected surfaces,
then update sources rather than generated files.

1. Edit `tokens/`, `brand/source/`, `DESIGN.md`, or focused guidance in `docs/`.
2. Run `npm run check`.
3. Inspect `gallery/` in light and dark mode.
4. Include migration notes for changed token meaning or asset paths.
5. Commit source and generated output together.

Do not add an application component to this repository until it has a stable
contract and at least two real consumers.

