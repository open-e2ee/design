#!/usr/bin/env node
/*
 * Measures the generated lockups against the two fit rules, and asserts them.
 *
 *   node scripts/measure-lockup-fit.mjs
 *     Prints every generated lockup with the drawn height of its symbol, the
 *     cap height of the wordmark beside it, the ratio between them, and the
 *     narrowest clear space any edge of the artwork holds.
 *
 *   node scripts/measure-lockup-fit.mjs --assert-cap-ratio 1.15
 *     No symbol stands more than that many cap heights. Design contract
 *     condition DC-V19.
 *
 *   node scripts/measure-lockup-fit.mjs --assert-clear-space
 *     Nothing drawn enters the clear space DESIGN.md keeps empty on every
 *     side. Design contract condition DC-V19.
 *
 * The reading comes out of the generated SVG files and the extracted font
 * metrics, never out of brand/source/lockups.json. A guard that reads the
 * ratios its subject was drawn from reports those ratios back whatever the
 * drawing became.
 *
 * The symbol height is what the transform draws, not what the manifest says.
 * The cap height is the font size in the file multiplied by the cap ratio of
 * the pinned face. Those two numbers are what a reader compares, because the
 * capitals beside the mark are the only other thing at mark scale.
 *
 * Ink, for the clear space, runs from the cap top of a line down to its
 * descender. `Open` carries a descender, so a wordmark that fits by its
 * capitals can still stand in the space the mark reserves.
 *
 * The measurement is separate from the verdict. Each assertion prints the
 * number it read before it decides, so a failure says how far off it is.
 */
import { readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readJson, textWidth } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generated = join(root, 'brand', 'generated');

const manifest = await readJson(join(generated, 'manifest.json'));
const geometry = await readJson(join(root, 'brand', 'source', 'geometry.json'));
const typeMetrics = await readJson(
  join(root, 'brand', 'source', 'public-sans-metrics.json'),
);

const capRatio = typeMetrics.capHeight / typeMetrics.unitsPerEm;
const descenderRatio = typeMetrics.descender / typeMetrics.unitsPerEm;

/** One bracket stem, the space DESIGN.md keeps empty on every side. */
const clearSpace = manifest.lockups.symbolSize * geometry.clearSpaceRatio;

/*
 * Coordinates, sizes and letter spacing all reach the file rounded to two
 * places, and the width here is rebuilt from the rounded letter spacing once
 * per character. An eight-character wordmark therefore reads up to about 0.04
 * units narrow. A real encroachment drops a whole geometry term and runs to
 * tens of units, so a tenth of a unit separates the two without hiding either.
 */
const TOLERANCE = 0.1;

const number = (value) => Number.parseFloat(value);
const round = (value) => Math.round(value * 100) / 100;

/**
 * The symbol as the file draws it: a group that translates to a corner and
 * scales the 512-unit artwork down. Height is the scaled artwork.
 */
function symbolBox(svg) {
  const match = svg.match(
    /<g transform="translate\(([-\d.]+) ([-\d.]+)\) scale\(([\d.]+)\)">/,
  );
  if (match === null) return null;
  const bounds = geometry.full.construction.artwork;
  const scale = number(match[3]);
  return {
    x: number(match[1]) + bounds.x * scale,
    y: number(match[2]) + bounds.y * scale,
    width: bounds.width * scale,
    height: bounds.height * scale,
  };
}

/** Every `<text>` in the file, with the weight and tracking of each run. */
function textLines(svg) {
  const lines = [];
  for (const element of svg.matchAll(/<text\b([^>]*)>([\s\S]*?)<\/text>/g)) {
    const attributes = element[1];
    const x = number(/\bx="([-\d.]+)"/.exec(attributes)[1]);
    const y = number(/\by="([-\d.]+)"/.exec(attributes)[1]);
    const size = number(/\bfont-size="([\d.]+)"/.exec(attributes)[1]);
    const runs = [];
    for (const span of element[2].matchAll(/<tspan\b([^>]*)>([\s\S]*?)<\/tspan>/g)) {
      runs.push({
        text: span[2],
        weight: Number(/\bfont-weight="(\d+)"/.exec(span[1])[1]),
        tracking: number(/\bletter-spacing="([-\d.]+)"/.exec(span[1])[1]),
      });
    }
    if (runs.length === 0) {
      runs.push({
        text: element[2].trim(),
        weight: Number(/\bfont-weight="(\d+)"/.exec(attributes)?.[1] ?? 400),
        tracking: 0,
      });
    }
    lines.push({ x, y, size, runs });
  }
  return lines;
}

/** The drawn width of one text line, from the advances of the pinned face. */
function lineWidth(line) {
  let width = 0;
  for (const run of line.runs) {
    width += textWidth(typeMetrics, run.text, {
      size: line.size,
      weight: run.weight,
      tracking: run.tracking / line.size,
    });
  }
  return width;
}

async function readLockup(asset) {
  const svg = await readFile(join(generated, asset.svg), 'utf8');
  const symbol = symbolBox(svg);
  const lines = textLines(svg);
  const boxes = [];
  if (symbol !== null) boxes.push(symbol);
  for (const line of lines) {
    boxes.push({
      x: line.x,
      y: line.y - line.size * capRatio,
      width: lineWidth(line),
      height: line.size * (capRatio + descenderRatio),
    });
  }
  return { asset, symbol, lines, boxes };
}

/** The narrowest gap between the drawn content and any edge of the artwork. */
function clearance({ asset, boxes }) {
  const left = Math.min(...boxes.map((box) => box.x));
  const top = Math.min(...boxes.map((box) => box.y));
  const right = asset.width - Math.max(...boxes.map((box) => box.x + box.width));
  const bottom = asset.height - Math.max(...boxes.map((box) => box.y + box.height));
  return { left, top, right, bottom, narrowest: Math.min(left, top, right, bottom) };
}

/** The symbol height in cap heights of the wordmark drawn beside it. */
function capRatioOf({ symbol, lines }) {
  if (symbol === null || lines.length === 0) return null;
  const capHeight = lines[0].size * capRatio;
  return { capHeight, ratio: symbol.height / capHeight };
}

const lockups = [];
for (const asset of manifest.lockups.assets) {
  lockups.push(await readLockup(asset));
}

function table() {
  const rows = [
    ['lockup', 'mode', 'symbol', 'cap', 'ratio', 'clear space'].join('\t'),
  ];
  for (const lockup of lockups) {
    const fit = capRatioOf(lockup);
    const space = clearance(lockup);
    rows.push(
      [
        lockup.asset.lockup,
        lockup.asset.mode,
        fit === null ? '—' : round(lockup.symbol.height),
        fit === null ? '—' : round(fit.capHeight),
        fit === null ? '—' : round(fit.ratio),
        round(space.narrowest),
      ].join('\t'),
    );
  }
  return rows.join('\n');
}

function assertCapRatio(limit) {
  let failed = 0;
  for (const lockup of lockups) {
    const fit = capRatioOf(lockup);
    if (fit === null) continue;
    const { lockup: name, mode } = lockup.asset;
    if (fit.ratio > limit || fit.ratio < 1.09) {
      failed += 1;
      process.stdout.write(
        `FAIL ${name}-${mode} draws a ${round(lockup.symbol.height)}-unit symbol ` +
          `beside a ${round(fit.capHeight)}-unit cap height, a ratio of ` +
          `${round(fit.ratio)} outside the allowed 1.09–${limit} range\n`,
      );
      continue;
    }
    process.stdout.write(
      `PASS ${name}-${mode} stands ${round(fit.ratio)} cap heights, within ${limit}\n`,
    );
  }
  return failed;
}

function assertClearSpace() {
  let failed = 0;
  for (const lockup of lockups) {
    const space = clearance(lockup);
    const { lockup: name, mode } = lockup.asset;
    if (space.narrowest < clearSpace - TOLERANCE) {
      failed += 1;
      const edge = ['left', 'top', 'right', 'bottom'].find(
        (side) => space[side] === space.narrowest,
      );
      process.stdout.write(
        `FAIL ${name}-${mode} leaves ${round(space.narrowest)} units at the ${edge} ` +
          `edge, inside the ${round(clearSpace)} units of clear space\n`,
      );
      continue;
    }
    process.stdout.write(
      `PASS ${name}-${mode} holds ${round(space.narrowest)} units on every side, ` +
        `clear of ${round(clearSpace)}\n`,
    );
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

let failures = 0;
let asserted = false;

if (options.has('assert-cap-ratio')) {
  const limit = Number(options.get('assert-cap-ratio'));
  if (!Number.isFinite(limit)) {
    process.stderr.write('--assert-cap-ratio needs a number\n');
    process.exit(2);
  }
  failures += assertCapRatio(limit);
  asserted = true;
}

if (options.has('assert-clear-space')) {
  failures += assertClearSpace();
  asserted = true;
}

if (!asserted) {
  process.stdout.write(`${table()}\n`);
  process.exit(0);
}

process.exit(failures === 0 ? 0 : 1);
