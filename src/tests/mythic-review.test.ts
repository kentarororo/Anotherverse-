import { describe, expect, it } from 'vitest';
import {
  generateMythicReviewDraft,
  MYTHIC_REVIEW_SEEDS,
  type MythicHero,
} from '../content/mythic-review';

const UNRESOLVED_SLOT = /\{[^}]+\}/;
const TECHNO_JARGON =
  /telemetry|licen[cs]e|bureau|platform|signal|concourse|contract squad|performance record|protocol|network/i;

function heroText(hero: MythicHero) {
  return [
    hero.name,
    hero.pathName,
    hero.introduction,
    hero.desire,
    hero.flaw,
    hero.voiceLine,
    ...hero.techniques.flatMap((technique) => [
      technique.name,
      technique.visibleAction,
      technique.tacticalPurpose,
      technique.mechanicRule,
    ]),
  ].join(' ');
}

describe('Mythic Narrative v2 controlled generation', () => {
  it('is deterministic for the same seed and meaningfully varied across review seeds', () => {
    const repeated = generateMythicReviewDraft(MYTHIC_REVIEW_SEEDS[0]);
    expect(generateMythicReviewDraft(MYTHIC_REVIEW_SEEDS[0])).toEqual(repeated);

    const drafts = MYTHIC_REVIEW_SEEDS.map(generateMythicReviewDraft);
    expect(new Set(drafts.map((draft) => draft.fingerprint)).size).toBeGreaterThanOrEqual(2);
    expect(new Set(drafts.map((draft) => draft.world.id)).size).toBeGreaterThanOrEqual(2);
    expect(
      new Set(drafts.map((draft) => draft.trio.map((hero) => hero.id).join('|'))).size,
    ).toBeGreaterThanOrEqual(2);
  });

  it('selects whole authored heroes and keeps every character-mechanic bond intact', () => {
    for (const seed of MYTHIC_REVIEW_SEEDS) {
      const draft = generateMythicReviewDraft(seed);
      expect(draft.trio).toHaveLength(3);
      expect(draft.trio.map((hero) => hero.role)).toEqual(['vanguard', 'striker', 'support']);
      expect(new Set(draft.trio.map((hero) => hero.id)).size).toBe(3);

      for (const hero of draft.trio) {
        expect(hero.introduction).toContain(hero.name);
        expect(hero.introduction).toContain(hero.pathName);
        expect(hero.techniques).toHaveLength(2);
        expect(Object.values(hero.stats).every((value) => value >= 5 && value <= 14)).toBe(true);
        expect(heroText(hero)).not.toMatch(UNRESOLVED_SLOT);
        expect(heroText(hero)).not.toMatch(TECHNO_JARGON);

        for (const technique of hero.techniques) {
          expect(technique.cost).toBeGreaterThan(0);
          expect(technique.cooldown).toBeGreaterThan(0);
          expect(technique.mechanicRule).toContain(`${technique.cost} AP`);
          expect(technique.visibleAction).toMatch(/[.!?]$/);
          expect(technique.tacticalPurpose).toMatch(/[.!?]$/);
        }
      }
    }
  });

  it('binds connected chapter prose to its lead hero without synthetic meta-language', () => {
    const expectedLeadRole = ['vanguard', 'support', 'striker'] as const;
    for (const seed of MYTHIC_REVIEW_SEEDS) {
      const draft = generateMythicReviewDraft(seed);
      expect(draft.chapters).toHaveLength(3);

      draft.chapters.forEach((chapter, index) => {
        const lead = draft.trio.find((hero) => hero.role === expectedLeadRole[index])!;
        const sentenceCount = chapter.paragraph.match(/[.!?](?:\s|$)/g)?.length ?? 0;
        expect(chapter.paragraph).toContain(lead.name);
        expect(chapter.paragraph).toContain(lead.pathName);
        expect(chapter.paragraph).not.toMatch(UNRESOLVED_SLOT);
        expect(chapter.paragraph).not.toMatch(TECHNO_JARGON);
        expect(sentenceCount).toBeGreaterThanOrEqual(4);
        expect(chapter.choices).toHaveLength(2);
        expect(chapter.choiceDescriptions).toHaveLength(2);
        expect(chapter.choiceDescriptions.every((description) => description.length > 20)).toBe(
          true,
        );
        expect([...chapter.choiceDescriptions, ...chapter.choiceResults].join(' ')).not.toMatch(
          UNRESOLVED_SLOT,
        );
      });
    }
  });

  it('keeps opening identities and promised choice effects truthful', () => {
    const drafts = MYTHIC_REVIEW_SEEDS.map(generateMythicReviewDraft);
    const fallen = drafts.find((draft) => draft.world.id === 'fallen-heavens')!;
    const striker = fallen.trio.find((hero) => hero.role === 'striker')!;
    expect(fallen.chapters[1]!.choiceResults.every((result) => result.includes(striker.name))).toBe(
      true,
    );
    expect(fallen.chapters[1]!.choiceResults[1]).toContain('returned the bone');

    const tide = drafts.find((draft) => draft.world.id === 'underworld-tide')!;
    expect(tide.chapters[1]!.choiceEffects).toEqual([
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: -1, bondDelta: -2 },
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 2, bondDelta: 1 },
    ]);
  });

  it('varies presentation while preserving the canonical combat rules for each role', () => {
    const expectedRules = {
      vanguard: [
        'Spend 2 AP to attack with +3 Power and apply Exposed for 2 rounds.',
        'Spend 1 AP to grant the front hero 3 Ward for 2 rounds.',
      ],
      striker: [
        'Spend 2 AP to make a high-damage attack with +8 Power.',
        'Spend 1 AP to attack with +4 Power from rear position or Tactical stance.',
      ],
      support: [
        'Spend 2 AP to heal Focus + 5 HP, grant Inspired, and add a 3-point Ward.',
        'Spend 2 AP to attack with +2 Power and apply Staggered for 2 rounds.',
      ],
    } as const;

    for (const seed of MYTHIC_REVIEW_SEEDS) {
      const draft = generateMythicReviewDraft(seed);
      for (const hero of draft.trio) {
        expect(hero.techniques.map((technique) => technique.mechanicRule)).toEqual(
          expectedRules[hero.role],
        );
        const relic = draft.relics.find((candidate) => candidate.ownerId === hero.id);
        expect(relic).toBeDefined();
        expect(relic!.mechanic).toMatch(/^\+2 (Vitality|Power|Guard|Speed|Focus)(?:\.| )/);
        expect(`${relic!.name} ${relic!.description} ${relic!.mechanic}`).not.toMatch(
          TECHNO_JARGON,
        );
      }
    }
  });
});
