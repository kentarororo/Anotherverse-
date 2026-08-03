import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { selectNextScenario } from '../engine/director/scenario-director';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';

function campaign(seed = 'director-seed') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

describe('causal scenario director', () => {
  it('runs 20 deterministic turns with live premises, memory writes, coverage, and no duplicates', () => {
    let state = campaign('twenty-turn-seed');
    const categories = new Set<string>();
    const encountered: string[] = [];
    let causalCallbacks = 0;

    for (let index = 0; index < 20; index += 1) {
      const scenario = state.currentScenario!;
      categories.add(scenario.category);
      encountered.push(scenario.semanticFingerprint);
      expect(scenario.premiseFactIds).toHaveLength(2);
      expect(
        scenario.premiseFactIds.every((id) =>
          state.worldFacts.some((fact) => fact.id === id && fact.active),
        ),
      ).toBe(true);
      if (
        scenario.premiseFactIds.some(
          (id) => (state.worldFacts.find((fact) => fact.id === id)?.createdTurn ?? 0) > 0,
        )
      ) {
        causalCallbacks += 1;
      }
      if (state.pendingPlan.situationChoiceId === null) {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: scenario.choices[0]!.id,
        });
      }
      const factsBefore = state.worldFacts.length;
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
      expect(state.worldFacts.length).toBe(factsBefore + 1);
    }

    expect(categories).toEqual(new Set(['operation', 'personal', 'discovery', 'rival', 'social']));
    expect(new Set(encountered).size).toBe(20);
    expect(state.scenarioFingerprints).toEqual(encountered);
    expect(state.storyThreads.some((thread) => thread.stage > 0)).toBe(true);
    expect(causalCallbacks).toBeGreaterThanOrEqual(3);

    let replay = campaign('twenty-turn-seed');
    for (let index = 0; index < 20; index += 1) {
      const scenario = replay.currentScenario!;
      if (replay.pendingPlan.situationChoiceId === null) {
        replay = applyGameCommand(replay, {
          type: 'CHOOSE_SITUATION',
          choiceId: scenario.choices[0]!.id,
        });
      }
      replay = applyGameCommand(replay, { type: 'COMMIT_TURN' });
    }
    expect(JSON.stringify(replay)).toBe(JSON.stringify(state));
  });

  it('prioritises an eligible high-urgency thread and exposes selection reasons', () => {
    const state = campaign('urgent-thread-seed');
    const urgent = {
      ...state,
      turn: 3,
      storyThreads: state.storyThreads.map((thread, index) =>
        index === 0 ? { ...thread, urgency: 90, nextEligibleTurn: 3 } : thread,
      ),
    };
    const selected = selectNextScenario(urgent, 3, urgent.rngStreams!);
    expect(selected.scenario.category).toBe('personal');
    expect(selected.scenario.advancesThreadId).toBe(urgent.storyThreads[0]!.id);
    expect(selected.debug.some((candidate) => candidate.selected)).toBe(true);
    expect(selected.debug.flatMap((candidate) => candidate.reasons)).toContain(
      'story-continuity:+18',
    );
  });

  it('rejects a contradictory candidate with a visible debug reason', () => {
    const state = campaign('contradiction-seed');
    const constrained = {
      ...state,
      worldFacts: [
        ...state.worldFacts,
        {
          id: 'fact-no-public-challenge',
          kind: 'constraint',
          subjectId: 'licensed-squad',
          relation: 'forbids-public-challenge',
          value: true,
          createdTurn: 3,
          sourceEventId: 'test-constraint',
          tags: ['contradiction'],
          active: true,
        },
      ],
    };
    const selected = selectNextScenario(constrained, 4, constrained.rngStreams!);
    const rejected = selected.debug.find((candidate) => candidate.templateId === 'rival-3')!;
    expect(rejected.selected).toBe(false);
    expect(rejected.reasons).toContain('contradiction-risk:-100');
  });

  it('uses shared relationship memory in later rival selection and premise text', () => {
    let state = campaign('relationship-director-seed');
    while (state.turn < 4) {
      if (state.currentScenario!.category !== 'operation') {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: state.currentScenario!.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
    expect(state.currentScenario!.category).toBe('rival');
    expect(state.currentScenario!.premise).toContain('recorded bond');
    expect(
      state.directorDebug.some((candidate) =>
        candidate.reasons.some(
          (reason) =>
            reason.startsWith('relationship-memory:+') && reason !== 'relationship-memory:+0',
        ),
      ),
    ).toBe(true);
  });

  it('uses licence reputation to change rival candidate weight and visible terms', () => {
    const initial = campaign('reputation-director-seed');
    const reputable = {
      ...initial,
      turn: 4,
      rank: 'Bronze',
      reputation: 9,
    };
    const selected = selectNextScenario(reputable, 4, reputable.rngStreams!);
    expect(selected.scenario.category).toBe('rival');
    expect(selected.scenario.premise).toContain('Bronze licence and +9 reputation');
    expect(selected.debug.flatMap((candidate) => candidate.reasons)).toContain(
      'reputation-relevance:+9',
    );
  });

  it('selects four distinct world-consistent operation encounters in the first 20 turns', () => {
    let state = campaign('operation-variety-seed');
    const encounters = new Set<string>();
    for (let turn = 1; turn <= 20; turn += 1) {
      if (state.currentScenario!.category === 'operation') {
        expect(state.currentEncounter).not.toBeNull();
        expect(state.currentScenario!.threatIds).toEqual(state.currentEncounter!.enemyIds);
        expect(state.currentScenario!.title).toBe(state.currentEncounter!.title);
        encounters.add(state.currentEncounter!.id);
      } else {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: state.currentScenario!.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
    expect(encounters.size).toBe(4);
  });
});
