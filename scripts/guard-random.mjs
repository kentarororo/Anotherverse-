import { readdir, readFile } from 'node:fs/promises';
import { extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const sourceRoot = new URL('../src/', import.meta.url);
const forbiddenCall = ['Math', 'random'].join('.');
const sourceExtensions = new Set(['.ts', '.tsx']);

async function collectFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== 'tests') files.push(...(await collectFiles(path)));
    } else if (sourceExtensions.has(extname(entry.name))) {
      files.push(path);
    }
  }

  return files;
}

const rootPath = fileURLToPath(sourceRoot);
const violations = [];

for (const file of await collectFiles(rootPath)) {
  const source = await readFile(file, 'utf8');
  if (source.includes(forbiddenCall)) violations.push(relative(rootPath, file));
}

if (violations.length > 0) {
  console.error(`Forbidden nondeterministic call found in: ${violations.join(', ')}`);
  process.exitCode = 1;
} else {
  console.log('Determinism guard passed: production source contains no forbidden random calls.');
}
