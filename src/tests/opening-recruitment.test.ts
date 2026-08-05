import { describe, expect, it } from 'vitest';
import { OPENING_JOURNEYS } from '../content/opening-recruitment';

describe('authored recruitment opening', () => {
  it('keeps recruitment and the first trio battle in the same three-turn arc', () => {
    for (const journey of Object.values(OPENING_JOURNEYS)) {
      expect(journey.chapters.map((chapter) => chapter.turn)).toEqual([1, 2, 3]);
      expect(journey.chapters.map((chapter) => chapter.category)).toEqual([
        'social',
        'personal',
        'operation',
      ]);
      expect(journey.chapters[0].choices).toHaveLength(2);
      expect(journey.chapters[1].choices).toHaveLength(2);
      expect(journey.chapters[2].choices).toHaveLength(1);
      expect(journey.chapters[2].templateId).toMatch(/^operation-\d+$/);
      expect(journey.chapters[2].stakes).toContain('all three Mythic Awakenings');
    }
  });

  it('uses one player-facing power term and complete authored consequences', () => {
    for (const journey of Object.values(OPENING_JOURNEYS)) {
      const prose = journey.chapters.flatMap((chapter) => [
        chapter.title,
        chapter.objective,
        chapter.hook,
        chapter.cause,
        chapter.stakes,
        chapter.decision,
        ...chapter.choices.flatMap((choice) => [
          choice.label,
          choice.description,
          choice.consequence,
          ...(choice.outcomeConsequences === undefined
            ? []
            : Object.values(choice.outcomeConsequences)),
        ]),
      ]);
      expect(prose.join(' ')).toContain('Mythic Awakening');
      expect(prose.join(' ')).not.toMatch(/\bCalling\b|\bMythic Path\b/i);
      for (const passage of prose) {
        expect(passage).not.toMatch(/\b(?:module|template|fact id|generated paragraph)\b/i);
        expect(passage).not.toMatch(
          /\{(?!lead|leadAwakening|firstCompanion|firstAwakening|secondCompanion|secondAwakening|enemyOne|enemyTwo)[^}]+\}/,
        );
      }
    }
  });

  it('gives each world its own places, pressure, and operation result', () => {
    const fallen = OPENING_JOURNEYS['fallen-heavens'];
    const tide = OPENING_JOURNEYS['underworld-tide'];
    expect(fallen.chapters[0].hook).toContain('Starfall Road');
    expect(fallen.chapters[1].hook).toContain('god-rib');
    expect(fallen.chapters[2].choices[0]!.consequence).toContain('Godgrave');
    expect(tide.chapters[0].hook).toContain('sea withdraws');
    expect(tide.chapters[1].hook).toContain('forgotten their own name');
    expect(tide.chapters[2].choices[0]!.consequence).toContain('royal seal');
    expect(fallen.chapters[2].templateId).not.toBe(tide.chapters[2].templateId);
    expect(fallen.chapters.map((chapter) => chapter.title)).not.toEqual(
      tide.chapters.map((chapter) => chapter.title),
    );
  });
});
