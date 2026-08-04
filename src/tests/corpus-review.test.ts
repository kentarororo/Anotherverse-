import { describe, expect, it } from 'vitest';
import {
  buildCorpusReviewEntries,
  corpusReviewStorageKey,
  CORPUS_REVIEW_SEEDS,
  LEGACY_CORPUS_REVIEW_STORAGE_KEY,
} from '../engine/reports/corpus-review';

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
    expect(first.every((entry) => entry.sentenceCount >= 4 && entry.sentenceCount <= 8)).toBe(true);
    expect(new Set(first.map((entry) => entry.paragraph)).size).toBeGreaterThanOrEqual(95);
    expect(
      first.every((entry) =>
        entry.castNames.every(
          (name) => entry.paragraph.includes(name) || entry.category === 'operation',
        ),
      ),
    ).toBe(true);
    const incoherentMetaLanguage =
      /two recorded facts matter now|record shows that|campaign record says|recorded bond|shared decisions?|Turn 0 decision|links .+ to chose-/i;
    expect(first.every((entry) => !incoherentMetaLanguage.test(entry.paragraph))).toBe(true);
    expect(
      first
        .filter((entry) => entry.turn === 1)
        .every(
          (entry) =>
            !/earlier closure|last closure|returns the squad|Turn 0/i.test(entry.paragraph),
        ),
    ).toBe(true);
    for (const seed of CORPUS_REVIEW_SEEDS) {
      const seedEntries = first.filter((entry) => entry.seed === seed);
      expect(seedEntries).toHaveLength(20);
      expect(new Set(seedEntries.map((entry) => entry.semanticFingerprint)).size).toBe(20);
      expect(
        seedEntries
          .slice(1)
          .every((entry) => entry.factContext.some((context) => context.startsWith('Turn '))),
      ).toBe(true);
    }
  });

  it('uses a content hash so legacy or rewritten-corpus judgments cannot carry forward', () => {
    const entries = buildCorpusReviewEntries();
    const currentKey = corpusReviewStorageKey(entries);
    expect(currentKey).toMatch(/^anotherverse\.corpus-review\.v2\.[0-9a-f]{8}$/);
    expect(currentKey).not.toBe(LEGACY_CORPUS_REVIEW_STORAGE_KEY);
    const rewritten = entries.map((entry, index) =>
      index === 0 ? { ...entry, paragraph: `${entry.paragraph} Revised.` } : entry,
    );
    expect(corpusReviewStorageKey(rewritten)).not.toBe(currentKey);
  });
});
