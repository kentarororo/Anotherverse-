import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';
import { renderWorldFact } from '../narrative/realiser/facts';

describe('world fact realiser', () => {
  it('names generated entities and prior choices in player-readable causes', () => {
    let state = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed: 'visible-cause-seed',
      selectedDraftIndex: 0,
    });
    const origin = state.worldFacts.find((fact) => fact.relation === 'comes-from')!;
    expect(renderWorldFact(state, origin)).toContain(
      state.generatedDefinitions.characters.find((hero) => hero.id === origin.subjectId)!.name,
    );
    state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    const choiceFact = state.worldFacts.find((fact) => fact.id === 'fact-scenario-result-1')!;
    expect(renderWorldFact(state, choiceFact)).toMatch(/^Turn 1: .+ chose “.+”\.$/);
  });
});
