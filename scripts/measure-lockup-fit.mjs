#!/usr/bin/env node
/* Measure visible symbol bounds, wordmark ink alignment, and clear space.
 * Run with --assert-ink-fit and --assert-clear-space to enforce the contract.
 * Measurements come from the generated SVG and pinned glyph outlines.
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

const outlines = await readJson(join(root, 'brand/source/wordmark-outlines.json'));
const glyphBounds = outlines.runs.flatMap((run) => run.glyphs.map((glyph) => glyph.bounds));
const inkTop = Math.max(...glyphBounds.map((bounds) => bounds[3])) / outlines.unitsPerEm;
const inkBottom = -Math.min(...glyphBounds.map((bounds) => bounds[1])) / outlines.unitsPerEm;
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
  for (const [index, line] of lines.entries()) {
    const top = index === 0 ? inkTop : capRatio;
    const bottom = index === 0 ? inkBottom : descenderRatio;
    boxes.push({
      x: line.x,
      y: line.y - line.size * top,
      width: lineWidth(line),
      height: line.size * (top + bottom),
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

function assertInkFit() {
  let failed = 0;
  for (const { asset, symbol, lines } of lockups) {
    if (symbol === null || lines.length === 0) continue;
    const line = lines[0];
    const top = line.y - line.size * inkTop;
    const bottom = line.y + line.size * inkBottom;
    const heightError = Math.abs(symbol.height - line.size);
    const alignmentError = asset.lockup === 'stacked' ? 0 : Math.abs(
      symbol.y + symbol.height / 2 - (top + bottom) / 2,
    );
    const pass = heightError <= TOLERANCE && alignmentError <= TOLERANCE;
    if (!pass) failed += 1;
    process.stdout.write(`${pass ? 'PASS' : 'FAIL'} ${asset.lockup}-${asset.mode}: height error ${round(heightError)}, alignment error ${round(alignmentError)} units\n`);
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

const options = new Set(process.argv.slice(2));
for (const option of options) {
  if (!['--assert-ink-fit', '--assert-clear-space'].includes(option)) {
    throw new Error(`Unknown argument ${option}`);
  }
}
let failures = 0;
let asserted = false;
if (options.has('--assert-ink-fit')) {
  failures += assertInkFit();
  asserted = true;
}

if (options.has('--assert-clear-space')) {
  failures += assertClearSpace();
  asserted = true;
}

if (!asserted) {
  process.stdout.write(`${table()}\n`);
  process.exit(0);
}

process.exit(failures === 0 ? 0 : 1);
