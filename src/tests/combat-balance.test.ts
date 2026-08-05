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

function openingOutcome(seed: string, plan: 'sound' | 'reckless' | 'reserve') {
  let state = start(seed);
  while (state.turn < 3) {
    state = applyGameCommand(state, {
      type: 'CHOOSE_SITUATION',
      choiceId: state.currentScenario!.choices[0]!.id,
    });
    state = applyGameCommand(state, { type: 'COMMIT_TURN' });
  }
  if (plan === 'reckless') {
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
    state = applyGameCommand(state, { type: 'SET_TEAM_PRIORITY', priorityId: 'focus-weakest' });
  } else if (plan === 'reserve') {
    state = applyGameCommand(state, { type: 'SET_TEAM_PRIORITY', priorityId: 'conserve-power' });
  }
  return applyGameCommand(state, { type: 'COMMIT_TURN' }).battleReports.at(-1)!.outcome;
}

function soloOpeningOutcome(seed: string) {
  let state = start(seed);
  state = applyGameCommand(state, {
    type: 'CHOOSE_SITUATION',
    choiceId: state.currentScenario!.choices[0]!.id,
  });
  return applyGameCommand(state, { type: 'COMMIT_TURN' }).battleReports.at(-1)!.outcome;
}

function sixTurnPath(seed: string) {
  let state = start(seed);
  const outcomes: string[] = [];
  while (state.turn <= 6) {
    if (state.pendingPlan.situationChoiceId === null) {
      const affordable = state.currentScenario!.choices.find(
        (choice) => state.supplies + choice.effects.provisionsDelta >= 0,
      );
      expect(affordable).toBeDefined();
      state = applyGameCommand(state, { type: 'CHOOSE_SITUATION', choiceId: affordable!.id });
    }
    const battlesBefore = state.battleReports.length;
    state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    if (state.battleReports.length > battlesBefore)
      outcomes.push(state.battleReports.at(-1)!.outcome);
    expect(state.supplies).toBeGreaterThanOrEqual(0);
    expect(state.coins).toBeGreaterThanOrEqual(0);
  }
  return outcomes;
}

describe('combat balance gates', () => {
  it('makes the solo opening a fair fight instead of a scripted loss', () => {
    const seeds = Array.from({ length: 60 }, (_, index) => `solo-balance-${index}`);
    const wins = seeds.filter((seed) => soloOpeningOutcome(seed) === 'victory').length;
    expect(wins).toBeGreaterThanOrEqual(39);
    expect(wins).toBeLessThanOrEqual(54);
  });

  it('makes a sound opening plan materially safer than a reckless one', () => {
    const seeds = Array.from({ length: 60 }, (_, index) => `balance-${index}`);
    const defaultWins = seeds.filter((seed) => openingOutcome(seed, 'sound') === 'victory').length;
    const recklessWins = seeds.filter(
      (seed) => openingOutcome(seed, 'reckless') === 'victory',
    ).length;
    expect(defaultWins).toBeGreaterThan(recklessWins);
    expect(defaultWins).toBeGreaterThanOrEqual(39);
    expect(defaultWins).toBeLessThanOrEqual(54);
    expect(recklessWins).toBeLessThanOrEqual(24);
    expect(defaultWins - recklessWins).toBeGreaterThanOrEqual(12);
  });

  it('keeps the reserve policy viable instead of suppressing every technique', () => {
    const seeds = Array.from({ length: 60 }, (_, index) => `reserve-${index}`);
    const wins = seeds.filter((seed) => openingOutcome(seed, 'reserve') === 'victory').length;
    expect(wins).toBeGreaterThanOrEqual(12);
    expect(wins).toBeLessThanOrEqual(48);
  });

  it('keeps the six-turn story path affordable and exactly replayable', () => {
    const seeds = Array.from({ length: 20 }, (_, index) => `six-turn-${index}`);
    const firstRun = seeds.map(sixTurnPath);
    const replay = seeds.map(sixTurnPath);
    expect(replay).toEqual(firstRun);
    const victoriesByBattle = [0, 1, 2].map(
      (battleIndex) => firstRun.filter((outcomes) => outcomes[battleIndex] === 'victory').length,
    );
    expect(victoriesByBattle[0]).toBeGreaterThanOrEqual(13);
    expect(victoriesByBattle[0]).toBeLessThanOrEqual(17);
    expect(victoriesByBattle[1]).toBeGreaterThanOrEqual(11);
    expect(victoriesByBattle[1]).toBeLessThanOrEqual(17);
    expect(victoriesByBattle[2]).toBeGreaterThanOrEqual(7);
    expect(victoriesByBattle[2]).toBeLessThanOrEqual(13);
    expect(firstRun.every((outcomes) => outcomes.length >= 3)).toBe(true);
    expect(firstRun.flat().filter((outcome) => outcome === 'victory').length).toBeGreaterThan(0);
  });
});
