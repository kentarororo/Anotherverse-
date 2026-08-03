import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { generateCampaignDraft } from '../engine/generation/campaign';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';

const seeds = Array.from({ length: 100 }, (_, index) => `generation-fixture-${index}`);

describe('generated campaigns and trios', () => {
  it('is deterministic and produces distinct complete campaign drafts', () => {
    const first = generateCampaignDraft('draft-repeat');
    const second = generateCampaignDraft('draft-repeat');
    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(first.bible.seed).toBe('draft-repeat');
    expect(first.premise).toContain(first.bible.city.name);
  });

  it('satisfies the 100-seed trio coverage and uniqueness gate', () => {
    const drafts = seeds.map(generateCampaignDraft);
    const fingerprints = new Set(drafts.map((draft) => draft.semanticFingerprint));
    expect(fingerprints.size).toBeGreaterThanOrEqual(90);

    for (const draft of drafts) {
      const names = draft.characters.map((hero) => hero.name);
      expect(new Set(names).size).toBe(3);
      const coverage = new Set(draft.characters.flatMap((hero) => hero.coverageTags));
      expect(coverage.has('defence') || coverage.has('control')).toBe(true);
      expect(coverage.has('damage')).toBe(true);
      expect(coverage.has('sustain') || coverage.has('resource')).toBe(true);
      expect(new Set(draft.characters.map((hero) => hero.signatureRuleId)).size).toBe(3);
      for (const hero of draft.characters) {
        expect(hero.techniques).toHaveLength(2);
        expect(hero.personalHooks.length).toBeGreaterThanOrEqual(2);
        expect(hero.awakeningCondition.length).toBeGreaterThan(10);
        expect(hero.signature.length).toBeGreaterThan(10);
        expect(hero.reaction.length).toBeGreaterThan(10);
        expect(hero.reactionRuleId.length).toBeGreaterThan(3);
        expect(hero.limitation.length).toBeGreaterThan(10);
      }
    }
  });

  it('binds generated definitions to executable mechanics and terminating battles', () => {
    for (const seed of seeds.slice(0, 25)) {
      const campaign = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
        type: 'START_CAMPAIGN',
        seed,
        selectedDraftIndex: 0,
      });
      const resolved = applyGameCommand(campaign, { type: 'COMMIT_TURN' });
      const report = resolved.battleReports[0]!;
      expect(report.rounds).toBeLessThanOrEqual(12);
      expect(report.events.length).toBeGreaterThan(0);
      for (const hero of campaign.generatedDefinitions.characters) {
        expect(campaign.generatedDefinitions.combatants[hero.id]?.signatureRuleId).toBe(
          hero.signatureRuleId,
        );
        expect(campaign.generatedDefinitions.combatants[hero.id]?.limitationRuleId).toBe(
          hero.limitationRuleId,
        );
      }
    }
  });
});
