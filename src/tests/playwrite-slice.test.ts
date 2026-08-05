import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { buildHeroActionPreview, PRIORITY_RULES, STANCE_RULES } from '../engine/combat/planning';
import { generateCampaignDraft } from '../engine/generation/campaign';
import { createEmptyGameState } from '../engine/model/state';
import { buildBattleCausality } from '../engine/reports/battle-causality';
import { applyGameCommand } from '../engine/simulation/apply-command';

const TECHNO_DRIFT = /telemetry|licen[cs]e|bureau|network|contract squad|concourse/i;

function start(seed = 'playwrite-slice') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

function battleStart(seed = 'playwrite-slice') {
  let state = start(seed);
  while (state.turn < 3) {
    state = applyGameCommand(state, {
      type: 'CHOOSE_SITUATION',
      choiceId: state.currentScenario!.choices[0]!.id,
    });
    state = applyGameCommand(state, { type: 'COMMIT_TURN' });
  }
  return state;
}

describe('canonical mythic playwrite slice', () => {
  it('binds whole mythic characters to exact, readable combat rules', () => {
    const draft = generateCampaignDraft('whole-character-kits');
    const playerText = JSON.stringify({
      premise: draft.premise,
      bible: draft.bible,
      characters: draft.characters,
    });
    expect(playerText).not.toMatch(TECHNO_DRIFT);
    expect(draft.characters.map((hero) => hero.role)).toEqual(['vanguard', 'striker', 'support']);
    for (const hero of draft.characters) {
      expect(hero.story.portrait).toContain(hero.name);
      expect(hero.story.portrait).toContain(hero.callingName);
      expect(hero.techniques.every((technique) => technique.mechanicLabel.includes('AP'))).toBe(
        true,
      );
    }
  });

  it('previews what the opening plan will do before the player commits', () => {
    const state = battleStart();
    const previews = buildHeroActionPreview(state);
    expect(previews).toHaveLength(3);
    expect(previews.every((preview) => preview.actionName.length > 3)).toBe(true);
    expect(PRIORITY_RULES.every((rule) => /target|damage|AP|attack/i.test(rule.effect))).toBe(true);
    expect(STANCE_RULES.map((rule) => rule.effect).join(' ')).toMatch(/\+5 Guard/);
    expect(STANCE_RULES.map((rule) => rule.effect).join(' ')).toMatch(/\+3 damage/);
  });

  it('turns the battle into pressure, plan, turning point, and remembered consequence', () => {
    const state = battleStart('causal-aftermath');
    const resolved = applyGameCommand(state, { type: 'COMMIT_TURN' });
    const report = resolved.battleReports.at(-1)!;
    const beats = buildBattleCausality(resolved, report);
    expect(beats.map((beat) => beat.label)).toEqual([
      'Enemy pressure',
      'Your plan',
      'Turning point',
    ]);
    expect(beats[1]!.detail).toMatch(/techniques? and triggered \d+ reactions?/);
    const memory = resolved.worldFacts.find((fact) => fact.id === 'fact-scenario-result-3')!;
    const choice = state.currentScenario!.choices[0]!;
    expect([choice.consequence, ...Object.values(choice.outcomeConsequences ?? {})]).toContain(
      memory.value,
    );
    expect(resolved.currentScenario!.sceneBeats.cause).toBe(memory.value);
    expect(resolved.currentScenario!.premiseFactIds).toContain(memory.id);
  });
});
