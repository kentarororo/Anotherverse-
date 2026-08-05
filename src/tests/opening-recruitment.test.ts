import { describe, expect, it } from 'vitest';
import { OPENING_JOURNEYS } from '../content/opening-recruitment';

describe('authored recruitment opening', () => {
  it('keeps recruitment and the first trio battle in the same three-turn arc', () => {
    for (const journey of Object.values(OPENING_JOURNEYS)) {
      expect(journey.chapters.map((chapter) => chapter.turn)).toEqual([1, 2, 3]);
      expect(journey.chapters.map((chapter) => chapter.category)).toEqual([
        'operation',
        'personal',
        'operation',
      ]);
      expect(journey.chapters[0].choices).toHaveLength(1);
      expect(journey.chapters[1].choices).toHaveLength(2);
      expect(journey.chapters[2].choices).toHaveLength(1);
      expect(journey.chapters[0].choices[0]!.encounterId).toMatch(/^opening-/);
      expect(journey.chapters[2].choices[0]!.encounterId).toBeDefined();
      expect(journey.chapters[2].decision).toContain('three hunters');
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
    expect(fallen.chapters[1].hook).toContain('broken bridge');
    expect(fallen.chapters[2].choices[0]!.consequence).toContain('godbone');
    expect(tide.chapters[0].hook).toContain('sea retreats');
    expect(tide.chapters[1].hook).toContain('rescue skiff');
    expect(tide.chapters[2].choices[0]!.consequence).toContain('dead king');
    expect(fallen.chapters[2].choices[0]!.encounterId).not.toBe(
      tide.chapters[2].choices[0]!.encounterId,
    );
    expect(fallen.chapters.map((chapter) => chapter.title)).not.toEqual(
      tide.chapters.map((chapter) => chapter.title),
    );
  });
});
