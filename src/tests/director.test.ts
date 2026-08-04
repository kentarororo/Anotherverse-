import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { createEmptyGameState, type CanonicalGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';

function campaign(seed = 'director-seed') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

function choose(state: CanonicalGameState, choiceIndex = 0) {
  const choice = state.currentScenario!.choices[choiceIndex]!;
  return applyGameCommand(
    state.pendingPlan.situationChoiceId === choice.id
      ? state
      : applyGameCommand(state, { type: 'CHOOSE_SITUATION', choiceId: choice.id }),
    { type: 'COMMIT_TURN' },
  );
}

function sequence(seed: string) {
  let state = campaign(seed);
  const scenarios = [];
  for (let turn = 1; turn <= 20; turn += 1) {
    scenarios.push(state.currentScenario!);
    state = choose(state);
  }
  return { state, scenarios };
}

describe('world quest director', () => {
  it('plays one readable four-act quest across twenty unique chapters', () => {
    let state = campaign('twenty-turn-quest-seed');
    const titles = new Set<string>();
    const sentences = new Set<string>();
    const questId = state.currentScenario!.quest.id;

    for (let turn = 1; turn <= 20; turn += 1) {
      const scenario = state.currentScenario!;
      titles.add(scenario.title);
      expect(scenario.quest.id).toBe(questId);
      expect(scenario.quest.chapter).toBe(turn);
      expect(scenario.quest.act).toBe(Math.min(4, Math.ceil(turn / 5)));
      expect(scenario.quest.objective).not.toMatch(/\{[^}]+\}/);
      expect(scenario.premiseFactIds).toHaveLength(2);
      expect(Object.values(scenario.sceneBeats).every((beat) => beat.length > 20)).toBe(true);
      expect(scenario.premise).not.toMatch(
        /Soul Ledger entry left|Turn \d+ (?:operation|personal|discovery|rival|social) decision|becomes a fact|live campaign facts|\+\-/i,
      );
      for (const sentence of scenario.premise.split(/(?<=[.!?])\s+/)) {
        expect(sentences.has(sentence)).toBe(false);
        sentences.add(sentence);
      }

      const selected = scenario.choices[0]!;
      const next = choose(state);
      const written = next.worldFacts.find((fact) => fact.id === `fact-scenario-result-${turn}`)!;
      const possibleResults =
        selected.outcomeConsequences === undefined
          ? [selected.consequence]
          : Object.values(selected.outcomeConsequences);
      expect(possibleResults).toContain(written.value);
      if (turn < 20) expect(next.currentScenario!.sceneBeats.cause).toBe(written.value);
      state = next;
    }

    expect(titles.size).toBe(20);
    expect(state.storyThreads.some((thread) => thread.stage > 0)).toBe(true);
    expect(state.scenarioFingerprints).toHaveLength(20);
  });

  it('turns six opposite choices into different authored causes and truthful results', () => {
    for (const targetTurn of [4, 5, 7, 8, 9, 10, 19]) {
      let before = campaign(`branch-cause-${targetTurn}`);
      while (before.turn < targetTurn) before = choose(before);
      const scenario = before.currentScenario!;
      expect(scenario.choices).toHaveLength(2);

      const afterA = choose(before, 0);
      const afterB = choose(before, 1);
      expect(afterA.currentScenario!.sceneBeats.cause).toBe(scenario.choices[0]!.consequence);
      expect(afterB.currentScenario!.sceneBeats.cause).toBe(scenario.choices[1]!.consequence);
      expect(afterA.currentScenario!.sceneBeats.cause).not.toBe(
        afterB.currentScenario!.sceneBeats.cause,
      );
      expect({
        title: afterA.currentScenario!.title,
        decision: afterA.currentScenario!.sceneBeats.decision,
      }).not.toEqual({
        title: afterB.currentScenario!.title,
        decision: afterB.currentScenario!.sceneBeats.decision,
      });
      expect(afterA.aftermathReports.at(-1)!.summary).toBe(scenario.choices[0]!.consequence);
      expect(afterB.aftermathReports.at(-1)!.summary).toBe(scenario.choices[1]!.consequence);
      expect({
        renown: afterA.reputation,
        supplies: afterA.supplies,
        danger: afterA.threat,
      }).not.toEqual({
        renown: afterB.reputation,
        supplies: afterB.supplies,
        danger: afterB.threat,
      });
    }
  });

  it('varies whole authored scenes across three fresh campaign seeds', () => {
    const runs = ['semantic-run-a', 'semantic-run-b', 'semantic-run-c'].map(
      (seed) => sequence(seed).scenarios,
    );
    const variedPremiseTurns = Array.from({ length: 20 }, (_, index) => index).filter(
      (index) => new Set(runs.map((run) => run[index]!.premise)).size > 1,
    );
    const variedDilemmaTurns = Array.from({ length: 20 }, (_, index) => index).filter(
      (index) =>
        new Set(runs.map((run) => run[index]!.choices.map((choice) => choice.label).join('|')))
          .size > 1,
    );
    expect(variedPremiseTurns.length).toBeGreaterThanOrEqual(10);
    expect(variedDilemmaTurns.length).toBeGreaterThanOrEqual(8);
  });

  it('uses different adventures, dilemmas, and endings for the two worlds', () => {
    const samples = Array.from({ length: 30 }, (_, index) => `world-quest-${index}`).map(
      (seed) => ({
        seed,
        cityId: campaign(seed).campaignBible!.city.id,
      }),
    );
    const fallenSeed = samples.find((sample) => sample.cityId.includes('fallen-heavens'))!.seed;
    const tideSeed = samples.find((sample) => sample.cityId.includes('underworld-tide'))!.seed;
    const fallen = sequence(fallenSeed).scenarios;
    const tide = sequence(tideSeed).scenarios;

    expect(fallen[0]!.quest.title).not.toBe(tide[0]!.quest.title);
    expect(
      fallen.filter((scenario, index) => scenario.premise !== tide[index]!.premise).length,
    ).toBeGreaterThanOrEqual(18);
    expect(
      fallen.filter(
        (scenario, index) =>
          scenario.choices.map((choice) => choice.label).join('|') !==
          tide[index]!.choices.map((choice) => choice.label).join('|'),
      ).length,
    ).toBeGreaterThanOrEqual(14);
  });

  it('places battles at the opening and each later act break', () => {
    const operationTurns = sequence('operation-spine-seed')
      .scenarios.filter((scenario) => scenario.category === 'operation')
      .map((scenario) => scenario.quest.chapter);
    expect(operationTurns).toEqual([1, 6, 11, 20]);
  });

  it('replays the same quest byte-for-byte from the same seed and commands', () => {
    const first = sequence('quest-replay-seed');
    const second = sequence('quest-replay-seed');
    expect(first.scenarios).toEqual(second.scenarios);
    expect(first.state).toEqual(second.state);
  });
});
