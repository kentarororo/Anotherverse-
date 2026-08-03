import { describe, expect, it } from 'vitest';
import { buildCorpusReviewEntries, CORPUS_REVIEW_SEEDS } from '../engine/reports/corpus-review';

describe('fixed human corpus review pack', () => {
  it('contains 100 deterministic, resolved, context-backed paragraphs', () => {
    const first = buildCorpusReviewEntries();
    const second = buildCorpusReviewEntries();
    expect(first).toEqual(second);
    expect(first).toHaveLength(100);
    expect(new Set(first.map((entry) => entry.seed))).toEqual(new Set(CORPUS_REVIEW_SEEDS));
    expect(first.every((entry) => entry.premiseFactIds.length >= 2)).toBe(true);
    expect(
      first.every((entry) => entry.factContext.every((fact) => !fact.startsWith('Missing'))),
    ).toBe(true);
    expect(first.every((entry) => !/[{][^}]+[}]/.test(entry.paragraph))).toBe(true);
    expect(first.every((entry) => /[.!?]$/.test(entry.paragraph))).toBe(true);
    expect(first.every((entry) => !/\s{2,}/.test(entry.paragraph))).toBe(true);
    expect(first.every((entry) => !entry.paragraph.includes('two recorded facts matter now'))).toBe(
      true,
    );
    for (const seed of CORPUS_REVIEW_SEEDS) {
      const seedEntries = first.filter((entry) => entry.seed === seed);
      expect(seedEntries).toHaveLength(20);
      expect(new Set(seedEntries.map((entry) => entry.semanticFingerprint)).size).toBe(20);
    }
  });
});
