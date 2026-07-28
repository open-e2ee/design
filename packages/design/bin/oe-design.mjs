#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, parse, relative, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';
import { checkTaglineAnnotation } from '../dist/taglines.mjs';

const binDirectory = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(binDirectory, '..', '..', '..');
const packageJson = JSON.parse(
  await readFile(resolve(packageRoot, 'package.json'), 'utf8'),
);
const sourceDirectory = resolve(
  packageRoot,
  'packages',
  'design',
  'dist',
  'assets',
);

async function filesIn(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (
      entry.name === '.DS_Store' ||
      entry.name === '.source.json' ||
      entry.name === 'manifest.json'
    ) continue;
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path, root));
    if (entry.isFile()) files.push(relative(root, path));
  }
  return files.sort();
}

async function digest(directory) {
  const hash = createHash('sha256');
  for (const file of await filesIn(directory)) {
    hash.update(file);
    hash.update('\0');
    hash.update(await readFile(resolve(directory, file)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

function targetFromArgument(value) {
  if (!value) {
    throw new Error('Provide an explicit target directory.');
  }
  const target = resolve(value);
  const root = parse(target).root;
  const workingDirectory = resolve('.');
  if (
    target === root ||
    target === workingDirectory ||
    target === packageRoot ||
    target === homedir() ||
    !target.startsWith(`${workingDirectory}${sep}`)
  ) {
    throw new Error(`Refusing unsafe target: ${target}`);
  }
  return target;
}

async function exportAssets(target) {
  const temporary = `${target}.oe-design-tmp`;
  await rm(temporary, { recursive: true, force: true });
  await mkdir(temporary, { recursive: true });
  await cp(sourceDirectory, temporary, { recursive: true });
  const sha256 = await digest(temporary);
  await writeFile(
    resolve(temporary, '.source.json'),
    `${JSON.stringify({
      package: packageJson.name,
      version: packageJson.version,
      source: 'packages/design/dist/assets',
      sha256,
    }, null, 2)}\n`,
  );
  await rm(target, { recursive: true, force: true });
  await mkdir(dirname(target), { recursive: true });
  await cp(temporary, target, { recursive: true });
  await rm(temporary, { recursive: true, force: true });
  process.stdout.write(`Exported ${packageJson.name} ${packageJson.version} to ${target}\n`);
}

async function checkAssets(target) {
  const manifest = JSON.parse(
    await readFile(resolve(target, '.source.json'), 'utf8'),
  );
  const [sourceDigest, targetDigest] = await Promise.all([
    digest(sourceDirectory),
    digest(target),
  ]);
  if (manifest.package !== packageJson.name) {
    throw new Error(`Expected package ${packageJson.name}, found ${manifest.package}.`);
  }
  if (manifest.version !== packageJson.version) {
    throw new Error(
      `Asset snapshot is ${manifest.version}; installed package is ${packageJson.version}.`,
    );
  }
  if (manifest.sha256 !== targetDigest || sourceDigest !== targetDigest) {
    throw new Error('Asset snapshot differs from the installed package.');
  }
  process.stdout.write(`Verified ${packageJson.name} ${packageJson.version} in ${target}\n`);
}

/*
 * Read-only, so it does not carry the export guards. Those exist because
 * `export` deletes its target; refusing to *read* a directory outside the
 * working tree would only stop someone pointing the checker at a build output
 * that lives beside the repository.
 */
async function checkTaglines(target) {
  const pages = (await filesIn(target)).filter((file) => /\.html?$/i.test(file));
  if (pages.length === 0) {
    throw new Error(
      `No HTML found in ${target}. Point this at built output, not source.`,
    );
  }
  const results = [];
  for (const page of pages) {
    const html = await readFile(resolve(target, page), 'utf8');
    results.push(checkTaglineAnnotation(html, { source: page }));
  }
  const failures = results.filter((result) => !result.ok);
  const using = results.filter((result) => result.taglines.length > 0);
  for (const failure of failures) process.stderr.write(`${failure.message}\n`);
  if (failures.length > 0) {
    throw new Error(
      `${failures.length} of ${pages.length} page(s) use a tagline with no annotation.`,
    );
  }
  process.stdout.write(
    `Checked ${pages.length} page(s) in ${target}: ${using.length} use a tagline, all annotated.\n`,
  );
}

const USAGE =
  'Usage: oe-design <export|check> <target-directory>\n' +
  '       oe-design taglines <built-html-directory>\n' +
  '       oe-design check --taglines <built-html-directory>';

const argv = process.argv.slice(2);
const taglineFlag = argv.indexOf('--taglines');
if (taglineFlag !== -1) argv.splice(taglineFlag, 1);
const [command, targetArgument] = argv;

if (command === 'taglines' || (command === 'check' && taglineFlag !== -1)) {
  if (!targetArgument) throw new Error(USAGE);
  await checkTaglines(resolve(targetArgument));
} else if (command === 'export') {
  await exportAssets(targetFromArgument(targetArgument));
} else if (command === 'check') {
  await checkAssets(targetFromArgument(targetArgument));
} else {
  throw new Error(USAGE);
}
