import { readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

function productionFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return entry.name === 'tests' ? [] : productionFiles(path);
    return ['.ts', '.tsx'].includes(extname(entry.name)) ? [path] : [];
  });
}

describe('production randomness guard', () => {
  it('contains no direct calls to the unseeded platform random function', () => {
    const forbiddenCall = ['Math', 'random'].join('.');
    const violations = productionFiles(join(process.cwd(), 'src')).filter((file) =>
      readFileSync(file, 'utf8').includes(forbiddenCall),
    );

    expect(violations).toEqual([]);
  });
});
