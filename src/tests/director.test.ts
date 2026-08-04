import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import {
  selectNextScenario,
  worldFactMatchesSceneRole,
} from '../engine/director/scenario-director';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';
import { SCENARIO_MODULES } from '../narrative/corpus/scenario-modules';

function campaign(seed = 'director-seed') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

function advanceToTurn(state: ReturnType<typeof campaign>, targetTurn: number) {
  let current = state;
  while (current.turn < targetTurn) {
    if (current.pendingPlan.situationChoiceId === null) {
      current = applyGameCommand(current, {
        type: 'CHOOSE_SITUATION',
        choiceId: current.currentScenario!.choices[0]!.id,
      });
    }
    current = applyGameCommand(current, { type: 'COMMIT_TURN' });
  }
  return current;
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
      expect(scenario.premise).not.toMatch(
        /\{[^}]+\}|the prior event|two recorded facts|something happened|the situation unfolds/i,
      );
      expect(
        Object.values(state.campaignBible!.sceneVocabulary).some((value) =>
          scenario.premise.includes(value),
        ),
      ).toBe(true);
      for (const factId of scenario.premiseFactIds) {
        const fact = state.worldFacts.find((candidate) => candidate.id === factId)!;
        if (fact.createdTurn > 0 && typeof fact.value === 'string') {
          expect(scenario.premise.toLowerCase()).toContain(
            fact.value.replace(/[.!?]+$/, '').toLowerCase(),
          );
        }
      }
      if (scenario.semanticFingerprint.startsWith('mythic:')) {
        expect(scenario.premise).toContain(state.campaignBible!.city.name);
        expect(scenario.premise).toContain(state.campaignBible!.activeFactions[0]!.name);
      } else {
        const module = SCENARIO_MODULES[scenario.category].find(
          (candidate) => candidate.id === scenario.templateId,
        )!;
        const roles =
          state.turn === 1 && module.initialFactRoles !== undefined
            ? module.initialFactRoles
            : module.continuationFactRoles;
        roles.forEach((role, roleIndex) => {
          const fact = state.worldFacts.find(
            (candidate) => candidate.id === scenario.premiseFactIds[roleIndex],
          )!;
          expect(worldFactMatchesSceneRole(role, fact, scenario.castIds[0]!)).toBe(true);
          if (role === 'city') expect(scenario.premise).toContain(state.campaignBible!.city.name);
          if (role === 'faction') {
            expect(scenario.premise).toContain(state.campaignBible!.activeFactions[0]!.name);
          }
          if (role === 'origin') expect(scenario.premise).toContain(String(fact.value));
        });
      }
      if (state.turn === 5) {
        expect(scenario.templateId).not.toBe('social-3');
        expect(
          state.directorDebug
            .find((candidate) => candidate.templateId === 'social-3')
            ?.reasons.includes('missing-fact-role:prior-social'),
        ).toBe(true);
      }
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
    const relationshipFactIds = state.relationships.flatMap((relationship) => relationship.factIds);
    expect(relationshipFactIds.length).toBeGreaterThan(0);
    expect(
      relationshipFactIds.every((factId) => {
        const fact = state.worldFacts.find((candidate) => candidate.id === factId);
        return fact?.tags.some((tag) => tag === 'rival' || tag === 'social') ?? false;
      }),
    ).toBe(true);
    expect(
      Math.max(...state.relationships.map((relationship) => relationship.factIds.length)),
    ).toBeLessThanOrEqual(6);

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
    const state = advanceToTurn(campaign('urgent-thread-seed'), 3);
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
      'story-continuity:+30',
    );
  });

  it('rejects a contradictory candidate with a visible debug reason', () => {
    const state = advanceToTurn(campaign('contradiction-seed'), 4);
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
    while (state.turn < 9) {
      if (state.currentScenario!.category !== 'operation') {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: state.currentScenario!.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
    expect(state.currentScenario!.category).toBe('rival');
    const castNames = state.currentScenario!.castIds.map(
      (id) => state.generatedDefinitions.characters.find((hero) => hero.id === id)!.name,
    );
    castNames.forEach((name) => expect(state.currentScenario!.premise).toContain(name));
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
    const initial = advanceToTurn(campaign('reputation-director-seed'), 4);
    const reputable = {
      ...initial,
      turn: 4,
      rank: 'Bronze',
      reputation: 9,
    };
    const selected = selectNextScenario(reputable, 4, reputable.rngStreams!);
    expect(selected.scenario.category).toBe('rival');
    expect(selected.scenario.premise).toContain('Bronze standing');
    expect(selected.debug.flatMap((candidate) => candidate.reasons)).toContain(
      'reputation-relevance:+9',
    );
  });

  it('includes semantic choice bindings, but not incidental turn numbers, in fingerprints', () => {
    let state = campaign('fingerprint-binding-seed');
    while (state.turn < 4) {
      if (state.pendingPlan.situationChoiceId === null) {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: state.currentScenario!.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
    const discoveryFact = [...state.worldFacts]
      .reverse()
      .find((fact) => fact.tags.includes('discovery'))!;
    const alternate = {
      ...state,
      worldFacts: state.worldFacts.map((fact) =>
        fact.id === discoveryFact.id
          ? {
              ...fact,
              value: 'Preserve the hidden route',
              tags: ['discovery', `preserve-hidden-route-t${fact.createdTurn}`],
            }
          : fact,
      ),
    };
    const originalScene = selectNextScenario(state, 4, state.rngStreams!).scenario;
    const alternateScene = selectNextScenario(alternate, 4, alternate.rngStreams!).scenario;
    expect(alternateScene.templateId).toBe(originalScene.templateId);
    expect(alternateScene.semanticFingerprint).not.toBe(originalScene.semanticFingerprint);
    expect(originalScene.semanticFingerprint).not.toMatch(/@\d+/);
  });

  it('offers choices authored for the exact personal scene dilemma', () => {
    let state = campaign('scene-choice-seed');
    const choicesByTemplate = new Map<string, string[]>();
    while (state.turn <= 22) {
      const scenario = state.currentScenario!;
      choicesByTemplate.set(
        scenario.templateId,
        scenario.choices.map((choice) => choice.label),
      );
      if (state.turn === 22) break;
      if (state.pendingPlan.situationChoiceId === null) {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: scenario.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
    expect(choicesByTemplate.get('personal-2')).toEqual([
      'Honour the old promise',
      'Refuse the old promise',
    ]);
    expect(choicesByTemplate.get('personal-4')).toEqual([
      'Study the response safely',
      'Push the Calling response',
    ]);
  });

  it('selects four distinct world-consistent operation encounters in the first 21 turns', () => {
    let state = campaign('operation-variety-seed');
    const encounters = new Set<string>();
    for (let turn = 1; turn <= 21; turn += 1) {
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
