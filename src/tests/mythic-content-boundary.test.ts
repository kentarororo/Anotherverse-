import { describe, expect, it } from 'vitest';
import { encounterForOperationTemplate } from '../content/milestone-one';
import { generateCampaignDraft } from '../engine/generation/campaign';

describe('mythic production content boundary', () => {
  it('selects operation ecology from the active world', () => {
    for (let operation = 1; operation <= 4; operation += 1) {
      const fallen = encounterForOperationTemplate(`operation-${operation}`, 'fallen-heavens');
      const tide = encounterForOperationTemplate(`operation-${operation}`, 'underworld-tide');

      expect(fallen.enemyIds).not.toContain('drowned-lancer');
      expect(fallen.enemyIds).not.toContain('bell-wraith');
      expect(tide.enemyIds.every((id) => id === 'drowned-lancer' || id === 'bell-wraith')).toBe(
        true,
      );
    }
  });

  it('derives the draft fingerprint from selected content rather than the seed string', () => {
    const seed = 'fingerprint-must-not-be-copied';
    const draft = generateCampaignDraft(seed);
    expect(draft.semanticFingerprint).not.toContain(seed);
    expect(draft.semanticFingerprint).toContain(draft.bible.city.name);
    for (const hero of draft.characters) expect(draft.semanticFingerprint).toContain(hero.origin);
  });
});
