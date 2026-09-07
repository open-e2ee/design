#!/usr/bin/env node
/*
 * Measures how warm a primitive ramp runs, and asserts two properties of it.
 *
 *   node scripts/measure-ramp-warmth.mjs --ramp paper
 *     Prints every step with its OKLCH lightness, chroma, and hue, and with
 *     the HSL saturation that a reader sees as a color cast.
 *
 *   node scripts/measure-ramp-warmth.mjs --ramp paper --from 800 \
 *     --assert-saturation 4
 *     No step at or after that one carries more than that saturation. Design
 *     contract condition DC-V22.
 *
 *   node scripts/measure-ramp-warmth.mjs --ramp paper \
 *     --assert-lightness-within 1
 *     Every step holds the lightness recorded in the baseline file, so a
 *     recut moves no contrast ratio. Design contract condition DC-V23.
 *
 * OKLCH chroma is the wrong instrument for the dark end. Chroma falls with
 * lightness, so a near black reports a small number while the eye still reads
 * a brown cast. HSL saturation divides the channel spread by the room that
 * lightness leaves for it, so it reports the cast at the strength it is seen.
 *
 * The measurement is separate from the verdict. Each assertion prints the
 * number it read before it decides, so a failure says how far off it is.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { oklch, readJson } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const BASELINE = join(root, 'scripts', 'redesign-baseline', 'ramp-lightness.json');

/*
 * The baseline is a separate checked-in file, never a value derived from the
 * ramp under test. A guard that reads its subject for its own expectation
 * passes whatever the subject becomes.
 */
const primitives = await readJson(join(root, 'tokens', 'primitives.json'));
const baseline = await readJson(BASELINE);

/** The share of the room that lightness leaves, taken up by the channel spread. */
function saturation(hex) {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;
  const high = Math.max(red, green, blue);
  const low = Math.min(red, green, blue);
  const middle = (high + low) / 2;
  if (high === low) return 0;
  return ((high - low) / (1 - Math.abs(2 * middle - 1))) * 100;
}

function stepsOf(name) {
  const ramp = primitives.color[name];
  if (ramp === undefined) {
    process.stderr.write(`No ramp named ${name}\n`);
    process.exit(2);
  }
  return Object.entries(ramp).filter(([, hex]) => typeof hex === 'string');
}

function table(name) {
  const rows = stepsOf(name).map(([step, hex]) => {
    const measured = oklch(hex);
    return [
      step,
      hex,
      (measured.lightness * 100).toFixed(2),
      measured.chroma.toFixed(4),
      measured.hue.toFixed(1),
      saturation(hex).toFixed(1),
    ];
  });
  const header = ['step', 'hex', 'L', 'C', 'h', 'sat%'];
  const widths = header.map((cell, column) =>
    Math.max(cell.length, ...rows.map((row) => row[column].length)),
  );
  const line = (cells) =>
    cells.map((cell, column) => cell.padEnd(widths[column])).join('  ');
  return [line(header), ...rows.map(line)].join('\n');
}

function assertSaturation(name, limit, from) {
  let failed = 0;
  for (const [step, hex] of stepsOf(name)) {
    if (from !== undefined && Number(step) < from) continue;
    const measured = saturation(hex);
    const verdict = measured <= limit ? 'PASS' : 'FAIL';
    if (verdict === 'FAIL') failed += 1;
    process.stdout.write(
      `${verdict} ${name}-${step} ${hex} saturation ${measured.toFixed(1)} percent, limit ${limit}\n`,
    );
  }
  return failed;
}

function assertLightnessWithin(name, points) {
  const recorded = baseline[name];
  if (recorded === undefined) {
    process.stderr.write(`The baseline file holds no ramp named ${name}\n`);
    return 1;
  }
  let failed = 0;
  const steps = stepsOf(name);
  for (const [step, hex] of steps) {
    if (!(step in recorded)) {
      failed += 1;
      process.stdout.write(`FAIL ${name}-${step} has no recorded baseline\n`);
      continue;
    }
    const measured = oklch(hex).lightness * 100;
    const drift = measured - recorded[step];
    const verdict = Math.abs(drift) <= points ? 'PASS' : 'FAIL';
    if (verdict === 'FAIL') failed += 1;
    process.stdout.write(
      `${verdict} ${name}-${step} lightness ${measured.toFixed(2)}, baseline ${recorded[step].toFixed(2)}, drift ${drift.toFixed(2)} of ${points}\n`,
    );
  }
  for (const step of Object.keys(recorded)) {
    if (steps.some(([name_]) => name_ === step)) continue;
    failed += 1;
    process.stdout.write(`FAIL ${name}-${step} is recorded but the ramp dropped it\n`);
  }
  return failed;
}

const options = new Map();
const argv = process.argv.slice(2);
for (let index = 0; index < argv.length; index += 1) {
  if (!argv[index].startsWith('--')) {
    process.stderr.write(`Unknown argument ${argv[index]}\n`);
    process.exit(2);
  }
  options.set(argv[index].slice(2), argv[index + 1]);
  index += 1;
}

const ramp = options.get('ramp') ?? 'paper';

function number(key) {
  const value = Number(options.get(key));
  if (!Number.isFinite(value)) {
    process.stderr.write(`--${key} needs a number\n`);
    process.exit(2);
  }
  return value;
}

if (options.has('assert-saturation')) {
  const from = options.has('from') ? number('from') : undefined;
  process.exit(assertSaturation(ramp, number('assert-saturation'), from) === 0 ? 0 : 1);
} else if (options.has('assert-lightness-within')) {
  process.exit(
    assertLightnessWithin(ramp, number('assert-lightness-within')) === 0 ? 0 : 1,
  );
} else {
  process.stdout.write(`${table(ramp)}\n`);
}
