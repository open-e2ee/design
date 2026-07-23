#!/usr/bin/env node

import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, parse, relative, resolve, sep } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { readdir } from 'node:fs/promises';

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

const [command, targetArgument] = process.argv.slice(2);
const target = targetFromArgument(targetArgument);

if (command === 'export') {
  await exportAssets(target);
} else if (command === 'check') {
  await checkAssets(target);
} else {
  throw new Error('Usage: oe-design <export|check> <target-directory>');
}
