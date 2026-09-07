#!/usr/bin/env node
/*
 * Reports which role names each color ramp, and asserts that every ramp is
 * named by one.
 *
 *   node scripts/check-ramp-roles.mjs
 *     Prints every ramp with the roles that reach it, and every role with the
 *     ramps it draws from.
 *
 *   node scripts/check-ramp-roles.mjs --require-all
 *     Every ramp carries at least one role, and every role reaches a variable
 *     in the built stylesheet. Design contract condition DC-V20.
 *
 * A ramp with no role is a color nobody can reach. The steps are published in
 * tokens.css, so a consumer can write one by hand, but a hand-written step is
 * a value outside the theme contract: it holds one lightness across both modes
 * and the role layer stops deciding what the surface is made of.
 *
 * The reachability half is why the built stylesheet is read here rather than
 * the source alone. A role that tokens/roles.json declares and scripts/build.mjs
 * does not publish is an assignment no consumer can use, and it would satisfy
 * a check that reads the source and stops.
 */
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFile } from 'node:fs/promises';

import { readJson, resolveReferences } from './lib.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const primitives = await readJson(join(root, 'tokens', 'primitives.json'));
const roles = await readJson(join(root, 'tokens', 'roles.json'));
const stylesheet = await readFile(
  join(root, 'packages', 'design', 'dist', 'css', 'roles.css'),
  'utf8',
);

const ramps = Object.keys(primitives.color);

/* The variable a role is published as. The empty member is the family itself,
   which build.mjs writes as --oe-accent rather than as --oe-accent-. */
const variable = (family, member) => `--oe-${member ? `${family}-${member}` : family}`;

/*
 * The ramps one role reads.
 *
 * A member is either a light and dark pair or a single derive, and both carry
 * primitive references in the same {color.ramp.step} form. resolveReferences
 * throws on a reference to a step that does not exist, so a role that names a
 * ramp is a role that reaches a value in it.
 */
function rampsOf(definition) {
  resolveReferences(definition, primitives);
  const found = new Set();
  for (const value of Object.values(definition)) {
    const match = /^\{color\.([a-z]+)\./.exec(value);
    if (match) found.add(match[1]);
  }
  return found;
}

const byRamp = new Map(ramps.map((ramp) => [ramp, []]));
const unpublished = [];

for (const [family, members] of Object.entries(roles)) {
  for (const [member, definition] of Object.entries(members)) {
    const name = variable(family, member);
    if (!stylesheet.includes(`${name}:`)) unpublished.push(name);
    for (const ramp of rampsOf(definition)) byRamp.get(ramp)?.push(name);
  }
}

for (const [ramp, names] of byRamp) {
  console.log(`${ramp.padEnd(8)} ${String(names.length).padStart(2)}  ${names.join(' ') || '—'}`);
}

if (!process.argv.includes('--require-all')) process.exit(0);

const unreached = [...byRamp].filter(([, names]) => names.length === 0).map(([ramp]) => ramp);

for (const ramp of unreached) {
  console.error(`FAIL ${ramp} carries no role, so nothing in the role layer can reach it`);
}
for (const name of unpublished) {
  console.error(`FAIL ${name} is declared in tokens/roles.json and absent from roles.css`);
}

if (unreached.length > 0 || unpublished.length > 0) process.exit(1);

console.log(`PASS ${ramps.length} ramps, each carrying a role published in roles.css`);
