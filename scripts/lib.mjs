import { createHash } from 'node:crypto';
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative } from 'node:path';

export async function readJson(path) {
  return JSON.parse(await readFile(path, 'utf8'));
}

export async function writeText(path, value) {
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, value.endsWith('\n') ? value : `${value}\n`);
}

export function getAtPath(object, dottedPath) {
  return dottedPath.split('.').reduce((value, key) => value?.[key], object);
}

export function resolveReferences(value, primitives) {
  if (typeof value === 'string') {
    const match = value.match(/^\{([^}]+)\}$/);
    if (!match) return value;
    const resolved = getAtPath(primitives, match[1]);
    if (resolved === undefined) {
      throw new Error(`Unknown token reference: ${value}`);
    }
    return resolveReferences(resolved, primitives);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => resolveReferences(entry, primitives));
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [
        key,
        resolveReferences(entry, primitives),
      ]),
    );
  }

  return value;
}

export function flatten(object, prefix = []) {
  const entries = [];
  for (const [key, value] of Object.entries(object)) {
    const path = [...prefix, key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      entries.push(...flatten(value, path));
    } else {
      entries.push([path.join('-'), value]);
    }
  }
  return entries;
}

export async function filesIn(directory, root = directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (
      entry.name === '.DS_Store' ||
      entry.name === '.source.json' ||
      entry.name === 'manifest.json'
    ) continue;
    const path = join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await filesIn(path, root));
    if (entry.isFile()) files.push(relative(root, path));
  }
  return files.sort();
}

export async function digestDirectory(directory) {
  const hash = createHash('sha256');
  for (const file of await filesIn(directory)) {
    hash.update(file);
    hash.update('\0');
    hash.update(await readFile(join(directory, file)));
    hash.update('\0');
  }
  return hash.digest('hex');
}

export function cssDeclarations(entries, prefix = '--oe-') {
  return entries.map(([name, value]) => `  ${prefix}${name}: ${value};`).join('\n');
}
