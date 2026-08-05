import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { generateCampaignDraft } from '../engine/generation/campaign';
import { createEmptyGameState } from '../engine/model/state';
import { EXECUTABLE_TECHNIQUES } from '../engine/model/executable-technique';
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
    const worldIds = new Set(drafts.map((draft) => draft.bible.city.id));
    const kitCombinations = new Set(
      drafts.map((draft) => draft.characters.map((hero) => hero.callingId).join('|')),
    );
    const worldKitCombinations = new Set(
      drafts.map(
        (draft) =>
          `${draft.bible.city.id}|${draft.characters.map((hero) => hero.callingId).join('|')}`,
      ),
    );
    expect(worldIds.size).toBe(2);
    expect(kitCombinations.size).toBe(8);
    expect(worldKitCombinations.size).toBeGreaterThanOrEqual(14);

    for (const draft of drafts) {
      const names = draft.characters.map((hero) => hero.name);
      expect(new Set(names).size).toBe(3);
      const coverage = new Set(draft.characters.flatMap((hero) => hero.coverageTags));
      expect(coverage.has('defence') || coverage.has('control')).toBe(true);
      expect(coverage.has('damage')).toBe(true);
      expect(coverage.has('sustain') || coverage.has('resource')).toBe(true);
      expect(new Set(draft.characters.map((hero) => hero.signatureRuleId)).size).toBe(3);
      expect(new Set(draft.characters.map((hero) => hero.origin)).size).toBe(3);
      for (const hero of draft.characters) {
        expect(hero.origin).not.toBe(draft.bible.city.name);
        expect(hero.formativeEvent.length).toBeGreaterThan(20);
        expect(hero.drive.length).toBeGreaterThan(20);
        expect(hero.contradiction.length).toBeGreaterThan(20);
        expect(hero.story.fear).toBe(hero.contradiction);
        expect(hero.story.portrait).toContain(hero.name);
        expect(hero.story.portrait).toContain(hero.callingName);
        expect(hero.story.portrait).toContain(hero.origin);
        expect(hero.story.portrait).not.toMatch(/\{[^}]+\}|the prior event|two recorded facts/i);
        expect(hero.story.portrait).not.toMatch(
          /telemetry|licen[cs]e|bureau|network|contract squad/i,
        );
        expect(hero.techniques).toHaveLength(2);
        expect(hero.personalHooks.length).toBeGreaterThanOrEqual(2);
        expect(hero.awakeningCondition.length).toBeGreaterThan(10);
        expect(hero.signature.length).toBeGreaterThan(10);
        expect(hero.reaction.length).toBeGreaterThan(10);
        expect(hero.reactionRuleId.length).toBeGreaterThan(3);
        expect(hero.limitation.length).toBeGreaterThan(10);
        for (const technique of hero.techniques) {
          expect(technique.storyDescription).toMatch(/^[A-Z].*[.!?]$/);
          expect(technique.storyDescription).not.toBe(technique.mechanicLabel);
          expect(technique.storyDescription.length).toBeLessThan(180);
          expect(technique.storyDescription).not.toMatch(
            /(?:[+-]\d+|\b\d+\s*(?:resource|rounds?|vitality|ward)\b)/i,
          );
          expect(technique.mechanicLabel.length).toBeGreaterThan(10);
        }
      }
    }
  });

  it('binds generated definitions to executable mechanics and terminating battles', () => {
    for (const seed of seeds.slice(0, 25)) {
      let campaign = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
        type: 'START_CAMPAIGN',
        seed,
        selectedDraftIndex: 0,
      });
      while (campaign.turn < 3) {
        campaign = applyGameCommand(campaign, {
          type: 'CHOOSE_SITUATION',
          choiceId: campaign.currentScenario!.choices[0]!.id,
        });
        campaign = applyGameCommand(campaign, { type: 'COMMIT_TURN' });
      }
      const resolved = applyGameCommand(campaign, { type: 'COMMIT_TURN' });
      const report = resolved.battleReports.at(-1)!;
      expect(report.rounds).toBeLessThanOrEqual(12);
      expect(report.events.length).toBeGreaterThan(0);
      for (const hero of campaign.generatedDefinitions.characters) {
        const combatant = campaign.generatedDefinitions.combatants[hero.id]!;
        expect(combatant.signatureRuleId).toBe(hero.signatureRuleId);
        expect(combatant.limitationRuleId).toBe(hero.limitationRuleId);
        for (const contract of EXECUTABLE_TECHNIQUES[
          hero.role as 'vanguard' | 'striker' | 'support'
        ]) {
          expect(combatant.techniqueCosts?.[contract.id]).toBe(contract.resourceCost);
          expect(combatant.techniqueCooldowns?.[contract.id]).toBe(contract.cooldownRounds);
        }
      }
    }
  });
});
