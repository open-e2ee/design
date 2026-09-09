#!/usr/bin/env python3
"""Extract portable wordmark paths from the pinned Public Sans font.

Run after a font or wordmark change with fonttools[woff] installed.
The Node build reads the committed paths without a Python dependency.
"""
import json
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

ROOT = Path(__file__).resolve().parent.parent
source = ROOT / 'node_modules/@fontsource-variable/public-sans/files/public-sans-latin-wght-normal.woff2'
font = TTFont(source)
lockup = json.loads((ROOT / 'brand/source/lockups.json').read_text())['wordmark']
result = {'source': '@fontsource-variable/public-sans@5.3.0', 'unitsPerEm': font['head'].unitsPerEm, 'runs': []}
for text, weight, tracking in [(lockup['open'], lockup['openWeight'], lockup['openTracking']), (lockup['e2ee'], lockup['e2eeWeight'], lockup['e2eeTracking'])]:
    face = instantiateVariableFont(font, {'wght': weight}, inplace=False)
    glyphs = face.getGlyphSet()
    cmap = face.getBestCmap()
    run = {'text': text, 'weight': weight, 'tracking': tracking, 'glyphs': []}
    for character in text:
        glyph = glyphs[cmap[ord(character)]]
        pen = SVGPathPen(glyphs)
        glyph.draw(pen)
        bounds = BoundsPen(glyphs)
        glyph.draw(bounds)
        run['glyphs'].append({'path': pen.getCommands(), 'advance': glyph.width, 'bounds': bounds.bounds})
    result['runs'].append(run)
(ROOT / 'brand/source/wordmark-outlines.json').write_text(json.dumps(result, indent=2) + '\n')
