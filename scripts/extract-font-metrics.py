#!/usr/bin/env python3
"""Extract Public Sans metrics into brand/source/public-sans-metrics.json.

Not part of `npm run build`: the build must run with Node alone, and these
numbers only change when the pinned @fontsource-variable/public-sans version
changes. Run this by hand after a font bump and commit the result.

    python3 -m pip install 'fonttools[woff]'
    python3 scripts/extract-font-metrics.py

The build uses the advances to lay out generated text — wordmark, lockup
product line, social-card copy — and to fail when a string does not fit the box
drawn for it. Without them the build would be guessing at text width, which is
how a card ships with its description running under the plate.
"""

import json
import pathlib
import sys

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = pathlib.Path(__file__).resolve().parent.parent
SOURCE = (
    ROOT
    / "node_modules/@fontsource-variable/public-sans/files"
    / "public-sans-latin-wght-normal.woff2"
)
OUTPUT = ROOT / "brand/source/public-sans-metrics.json"

# The weights the design system sets: wordmark "Open", wordmark "E2EE", and the
# 600 used for headings and small-size wordmarks.
WEIGHTS = [400, 500, 600, 800]

# Printable ASCII plus the punctuation the brand copy actually uses.
CHARACTERS = [chr(code) for code in range(0x20, 0x7F)] + [
    "·",  # middle dot, the separator in metadata rows
    "‘",
    "’",
    "“",
    "”",
    "–",
    "—",
    "…",
]


def main() -> int:
    if not SOURCE.exists():
        print(f"Missing {SOURCE}. Run npm install first.", file=sys.stderr)
        return 1

    base = TTFont(SOURCE)
    units_per_em = base["head"].unitsPerEm
    metrics = {
        "family": "Public Sans",
        "source": f"@fontsource-variable/public-sans, {SOURCE.name}",
        "generatedBy": "scripts/extract-font-metrics.py",
        "unitsPerEm": units_per_em,
        "capHeight": base["OS/2"].sCapHeight,
        "ascender": base["OS/2"].sTypoAscender,
        "descender": abs(base["OS/2"].sTypoDescender),
        "advances": {},
    }

    for weight in WEIGHTS:
        instance = instantiateVariableFont(
            TTFont(SOURCE), {"wght": weight}, inplace=True, updateFontNames=False
        )
        cmap = instance.getBestCmap()
        hmtx = instance["hmtx"]
        advances = {}
        for character in CHARACTERS:
            glyph = cmap.get(ord(character))
            if glyph is None:
                print(f"No glyph for {character!r} at {weight}", file=sys.stderr)
                return 1
            advances[character] = hmtx[glyph][0]
        metrics["advances"][str(weight)] = advances

    OUTPUT.write_text(json.dumps(metrics, indent=2, ensure_ascii=False) + "\n")
    print(f"Wrote {OUTPUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
