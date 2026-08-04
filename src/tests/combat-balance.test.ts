import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';

function start(seed: string) {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

function openingOutcome(seed: string, badPlan: boolean) {
  let state = start(seed);
  if (badPlan) {
    const striker = state.generatedDefinitions.characters.find((hero) => hero.role === 'striker')!;
    state = applyGameCommand(state, {
      type: 'SET_POSITION',
      characterId: striker.id,
      position: 'front',
    });
    for (const hero of state.generatedDefinitions.characters) {
      state = applyGameCommand(state, {
        type: 'SET_STANCE',
        characterId: hero.id,
        stanceId: 'aggressive',
      });
    }
    state = applyGameCommand(state, { type: 'SET_TEAM_PRIORITY', priorityId: 'conserve-power' });
  }
  return applyGameCommand(state, { type: 'COMMIT_TURN' }).battleReports[0]!.outcome;
}

describe('combat balance gates', () => {
  it('makes a sound opening plan materially safer than a reckless one', () => {
    const seeds = Array.from({ length: 60 }, (_, index) => `balance-${index}`);
    const defaultWins = seeds.filter((seed) => openingOutcome(seed, false) === 'victory').length;
    const recklessWins = seeds.filter((seed) => openingOutcome(seed, true) === 'victory').length;
    expect(defaultWins).toBeGreaterThan(recklessWins);
    expect(defaultWins).toBeGreaterThanOrEqual(45);
    expect(defaultWins).toBeLessThanOrEqual(58);
    expect(recklessWins).toBeLessThanOrEqual(18);
    expect(defaultWins - recklessWins).toBeGreaterThanOrEqual(30);
  });
});
