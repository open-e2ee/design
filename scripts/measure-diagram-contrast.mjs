#!/usr/bin/env node
/*
 * Measures the diagram token family and asserts a floor under it.
 *
 *   node scripts/measure-diagram-contrast.mjs
 *     Prints every `diagram-*` token in both themes with its measured
 *     contrast against the canvas, and prints the ratchet step separations.
 *
 *   node scripts/measure-diagram-contrast.mjs --assert-minimum <ratio>
 *     Every diagram token reaches that ratio against the canvas in both
 *     themes. Design contract condition DC-V17.
 *
 * The canvas is the reference for the whole family. A diagram is drawn on the
 * page ground: an open form leaves its interior transparent, a filled slab
 * sits on the ground, and metadata ticks run along the outside edge of a slab
 * rather than across it.
 *
 * The measurement is separate from the verdict. Each assertion prints the
 * number it read before it decides, so a failure says how far off it is.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { contrast, readJson, resolveReferences } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const primitives = await readJson(join(root, 'tokens', 'primitives.json'));
const semantic = resolveReferences(
  await readJson(join(root, 'tokens', 'semantic.json')),
  primitives,
);

const THEMES = ['light', 'dark'];
const RATCHET = [1, 2, 3, 4].map((step) => `diagram-ratchet-${step}`);

const names = Object.keys(semantic.light).filter((name) =>
  name.startsWith('diagram-'),
);

function table() {
  const rows = [];
  for (const name of names) {
    for (const theme of THEMES) {
      const hex = semantic[theme][name];
      rows.push([
        name,
        theme,
        hex,
        contrast(hex, semantic[theme].canvas).toFixed(2),
      ]);
    }
  }
  for (const theme of THEMES) {
    for (let index = 1; index < RATCHET.length; index += 1) {
      const previous = semantic[theme][RATCHET[index - 1]];
      const current = semantic[theme][RATCHET[index]];
      rows.push([
        `${RATCHET[index - 1]} to ${RATCHET[index]}`,
        theme,
        current,
        contrast(previous, current).toFixed(2),
      ]);
    }
  }
  const header = ['token', 'theme', 'hex', 'ratio'];
  const widths = header.map((cell, column) =>
    Math.max(cell.length, ...rows.map((row) => row[column].length)),
  );
  const line = (cells) =>
    cells.map((cell, column) => cell.padEnd(widths[column])).join('  ');
  return [line(header), ...rows.map(line)].join('\n');
}

function assertMinimum(target) {
  let failed = 0;
  for (const theme of THEMES) {
    for (const name of names) {
      const measured = contrast(semantic[theme][name], semantic[theme].canvas);
      const verdict = measured >= target ? 'PASS' : 'FAIL';
      if (verdict === 'FAIL') failed += 1;
      process.stdout.write(
        `${verdict} ${theme} ${name} measures ${measured.toFixed(2)}:1 against the canvas, target ${target.toFixed(2)}\n`,
      );
    }
  }
  return failed;
}

const [flag, argument] = process.argv.slice(2);

if (flag === '--assert-minimum') {
  const target = Number(argument);
  if (!Number.isFinite(target)) {
    process.stderr.write('--assert-minimum needs a contrast ratio\n');
    process.exit(2);
  }
  process.exit(assertMinimum(target) === 0 ? 0 : 1);
} else if (flag === undefined) {
  process.stdout.write(`${table()}\n`);
} else {
  process.stderr.write(`Unknown option ${flag}\n`);
  process.exit(2);
}
