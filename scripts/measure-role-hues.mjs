#!/usr/bin/env node
/*
 * Measures the role layer and asserts two properties of it.
 *
 *   node scripts/measure-role-hues.mjs
 *     Prints every role with its measured OKLCH lightness, chroma, and hue,
 *     and the contrast of each role against the ground it sits on.
 *
 *   node scripts/measure-role-hues.mjs --assert-separation <degrees>
 *     Information clears the accent, and warning clears danger, by at least
 *     that many degrees in both themes. Design contract condition DC-V15.
 *
 *   node scripts/measure-role-hues.mjs --assert-tint-offset
 *     The four semantic tints share one lightness within a theme, and the
 *     paper ramp stays warm neutral. Design contract condition DC-V16.
 *
 * The measurement is separate from the verdict. Each assertion prints the
 * number it read before it decides, so a failure says how far off it is.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  contrast,
  hueDistance,
  oklch,
  oklchHex,
  readJson,
  resolveReferences,
} from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const primitives = await readJson(join(root, 'tokens', 'primitives.json'));
const tintRule = await readJson(join(root, 'tokens', 'tint-rule.json'));
const roles = resolveReferences(
  await readJson(join(root, 'tokens', 'roles.json')),
  primitives,
);

for (const members of Object.values(roles)) {
  if (!('derive' in (members.tint ?? {}))) continue;
  const { hue } = oklch(members.tint.derive);
  members.tint = {
    light: oklchHex({ ...tintRule.light, hue }),
    dark: oklchHex({ ...tintRule.dark, hue }),
  };
}

const THEMES = ['light', 'dark'];
const SEMANTICS = ['info', 'success', 'warning', 'danger'];

const value = (group, suffix, theme) => roles[group][suffix][theme];

/*
 * Each role is measured against the surface it actually meets. An ink sits on
 * its own solid, a tint carries the primary text, and everything else sits on
 * the canvas. Measuring an ink against the canvas reports a number no reader
 * ever sees.
 */
function reference(group, suffix, theme) {
  if (suffix === 'ink') return [`${group}`, value(group, '', theme)];
  if (suffix === 'tint') return ['text-1', value('text', '1', theme)];
  return ['ground-canvas', value('ground', 'canvas', theme)];
}

function table() {
  const rows = [];
  for (const [group, members] of Object.entries(roles)) {
    for (const [suffix, pair] of Object.entries(members)) {
      const name = suffix === '' ? group : `${group}-${suffix}`;
      for (const theme of THEMES) {
        const measured = oklch(pair[theme]);
        const [against, hex] = reference(group, suffix, theme);
        rows.push([
          name,
          theme,
          pair[theme],
          measured.lightness.toFixed(4),
          measured.chroma.toFixed(4),
          measured.hue.toFixed(1),
          against,
          contrast(pair[theme], hex).toFixed(2),
        ]);
      }
    }
  }
  const header = ['role', 'theme', 'hex', 'L', 'C', 'h', 'against', 'ratio'];
  const widths = header.map((cell, column) =>
    Math.max(cell.length, ...rows.map((row) => row[column].length)),
  );
  const line = (cells) =>
    cells.map((cell, column) => cell.padEnd(widths[column])).join('  ');
  return [line(header), ...rows.map(line)].join('\n');
}

function assertSeparation(degrees) {
  const pairs = [
    ['information', 'accent', ['info', ''], ['accent', '']],
    ['warning', 'danger', ['warning', ''], ['danger', '']],
  ];
  let failed = 0;
  for (const [leftName, rightName, left, right] of pairs) {
    for (const theme of THEMES) {
      const measured = hueDistance(
        oklch(value(left[0], left[1], theme)).hue,
        oklch(value(right[0], right[1], theme)).hue,
      );
      const verdict = measured >= degrees ? 'PASS' : 'FAIL';
      if (verdict === 'FAIL') failed += 1;
      process.stdout.write(
        `${verdict} ${theme} ${leftName} clears ${rightName} by ${measured.toFixed(1)} degrees, target ${degrees}\n`,
      );
    }
  }
  return failed;
}

function assertTintOffset() {
  let failed = 0;
  for (const theme of THEMES) {
    const measured = SEMANTICS.map((group) => ({
      group,
      lightness: oklch(value(group, 'tint', theme)).lightness,
    }));
    const spread =
      Math.max(...measured.map((entry) => entry.lightness)) -
      Math.min(...measured.map((entry) => entry.lightness));
    const verdict = spread <= 0.005 ? 'PASS' : 'FAIL';
    if (verdict === 'FAIL') failed += 1;
    const read = measured
      .map((entry) => `${entry.group} ${entry.lightness.toFixed(4)}`)
      .join(', ');
    process.stdout.write(
      `${verdict} ${theme} tint lightness spread ${spread.toFixed(4)}, limit 0.005 (${read})\n`,
    );
  }

  /*
   * The paper chroma lint. DC-V16 covers it because a tint rule that reaches
   * for more chroma is the edit that pulls the neutral ramp with it.
   */
  for (const [step, hex] of Object.entries(primitives.color.paper)) {
    const { chroma } = oklch(hex);
    if (chroma <= 0.014) continue;
    failed += 1;
    process.stdout.write(
      `FAIL paper-${step} chroma ${chroma.toFixed(4)} exceeds the 0.014 warm neutral limit\n`,
    );
  }
  process.stdout.write(`PASS paper ramp stays under 0.014 chroma\n`);
  return failed;
}

const [flag, argument] = process.argv.slice(2);

if (flag === '--assert-separation') {
  const degrees = Number(argument);
  if (!Number.isFinite(degrees)) {
    process.stderr.write('--assert-separation needs a number of degrees\n');
    process.exit(2);
  }
  process.exit(assertSeparation(degrees) === 0 ? 0 : 1);
} else if (flag === '--assert-tint-offset') {
  process.exit(assertTintOffset() === 0 ? 0 : 1);
} else if (flag === undefined) {
  process.stdout.write(`${table()}\n`);
} else {
  process.stderr.write(`Unknown option ${flag}\n`);
  process.exit(2);
}
