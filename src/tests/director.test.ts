import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { generateCampaignDraft } from '../engine/generation/campaign';
import { createEmptyGameState, type CanonicalGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';

function campaign(seed = 'director-seed', leadCharacterId?: string) {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
    leadCharacterId,
  });
}

function choose(state: CanonicalGameState, choiceIndex = 0) {
  const choice = state.currentScenario!.choices[choiceIndex]!;
  const planned =
    state.pendingPlan.situationChoiceId === choice.id
      ? state
      : applyGameCommand(state, { type: 'CHOOSE_SITUATION', choiceId: choice.id });
  return applyGameCommand(planned, { type: 'COMMIT_TURN' });
}

function sequence(seed: string, choiceIndex = 0) {
  let state = campaign(seed);
  const scenarios = [];
  for (let turn = 1; turn <= 6; turn += 1) {
    scenarios.push(state.currentScenario!);
    state = choose(state, choiceIndex);
  }
  return { state, scenarios };
}

describe('compiled campaign director', () => {
  it('starts with the chosen lead and introduces two balanced companions in chapters two and three', () => {
    const seed = 'chosen-lead-opening';
    const chosenLead = generateCampaignDraft(seed).characters[2]!;
    let state = campaign(seed, chosenLead.id);

    expect(state.recruitedCharacterIds).toEqual([chosenLead.id]);
    expect(state.generatedDefinitions.characters).toEqual([chosenLead]);
    expect(state.currentScenario!.castIds).toEqual([chosenLead.id]);
    expect(state.currentScenario!.sceneBeats.hook).toContain(chosenLead.name);

    state = choose(state);
    const firstCompanion = state.generatedDefinitions.characters[1]!;
    expect(state.recruitedCharacterIds).toEqual([chosenLead.id, firstCompanion.id]);
    expect(state.currentScenario!.quest.chapter).toBe(2);
    expect(state.currentScenario!.castIds).toEqual([chosenLead.id, firstCompanion.id]);
    expect(state.currentScenario!.sceneBeats.hook).toContain(firstCompanion.name);

    state = choose(state);
    const secondCompanion = state.generatedDefinitions.characters[2]!;
    expect(state.recruitedCharacterIds).toEqual([
      chosenLead.id,
      firstCompanion.id,
      secondCompanion.id,
    ]);
    expect(state.currentScenario!.quest.chapter).toBe(3);
    expect(state.currentScenario!.castIds).toHaveLength(3);
    expect(state.currentScenario!.sceneBeats.hook).toContain(secondCompanion.name);
    expect(new Set(state.generatedDefinitions.characters.map((hero) => hero.role)).size).toBe(3);
    expect(state.selectionCandidateIds).not.toContain(firstCompanion.id);
    expect(state.selectionCandidateIds).not.toContain(secondCompanion.id);
  });

  it('realises one coherent three-act quest across six unique chapters', () => {
    let state = campaign('six-chapter-quest-seed');
    const titles = new Set<string>();
    const questId = state.currentScenario!.quest.id;

    for (let turn = 1; turn <= 6; turn += 1) {
      const scenario = state.currentScenario!;
      titles.add(scenario.title);
      expect(scenario.quest).toMatchObject({ id: questId, chapter: turn, totalChapters: 6 });
      expect(scenario.quest.act).toBe(Math.ceil(turn / 2));
      expect(scenario.choices).toHaveLength(2);
      expect(scenario.premiseFactIds).toHaveLength(2);
      expect(scenario.premise).not.toMatch(/\{[^}]+\}|live campaign facts|Soul Ledger/i);
      expect(Object.values(scenario.sceneBeats).every((beat) => beat.length > 20)).toBe(true);

      const selected = scenario.choices[0]!;
      const next = choose(state);
      const written = next.worldFacts.find((fact) => fact.id === `fact-scenario-result-${turn}`)!;
      expect(written.relation).toBe(`chose-${selected.id}`);
      if (turn < 6) {
        const rawResult =
          String(written.value)
            .match(/^.*?[.!?](?:\s|$)/)?.[0]
            ?.trim() ?? String(written.value);
        expect(next.currentScenario!.sceneBeats.cause).not.toContain(rawResult);
        expect(next.currentScenario!.sceneBeats.cause).toMatch(/[.!?]$/);
      }
      state = next;
    }

    expect(titles.size).toBe(6);
    expect(state.currentScenario).toBeNull();
    expect(state.scenarioFingerprints).toHaveLength(6);
  });

  it('turns a bold choice into an extra reinforcement three chapters later', () => {
    const seed = Array.from({ length: 100 }, (_, index) => `delayed-callback-${index}`).find(
      (candidate) => generateCampaignDraft(candidate).plan.scenes[4].encounter !== null,
    )!;
    let cautious = campaign(seed);
    let bold = campaign(seed);
    cautious = choose(cautious, 0);
    bold = choose(bold, 0);
    cautious = choose(cautious, 0);
    bold = choose(bold, 1);
    cautious = choose(cautious, 0);
    bold = choose(bold, 0);
    cautious = choose(cautious, 0);
    bold = choose(bold, 0);

    expect(cautious.turn).toBe(5);
    expect(bold.turn).toBe(5);
    expect(bold.currentScenario!.sceneBeats.cause).toMatch(/first two allies|first alliance/i);
    expect(bold.currentScenario!.threatIds.length).toBe(
      cautious.currentScenario!.threatIds.length + 1,
    );
  });

  it('varies worlds, arcs, prose, and structures across fresh seeds', () => {
    const runs = ['semantic-run-a', 'semantic-run-b', 'semantic-run-c', 'semantic-run-d'].map(
      (seed) => ({ draft: generateCampaignDraft(seed), scenarios: sequence(seed).scenarios }),
    );
    expect(new Set(runs.map((run) => run.draft.plan.world.id)).size).toBeGreaterThan(1);
    expect(new Set(runs.map((run) => run.draft.plan.structuralFingerprint)).size).toBeGreaterThan(
      1,
    );
    expect(
      Array.from({ length: 6 }, (_, index) => index).filter(
        (index) => new Set(runs.map((run) => run.scenarios[index]!.premise)).size > 1,
      ).length,
    ).toBeGreaterThanOrEqual(4);
  });

  it('always schedules four to six battles including the opening, midpoint, and finale', () => {
    for (const seed of Array.from({ length: 30 }, (_, index) => `battle-spine-${index}`)) {
      const scenes = sequence(seed).scenarios;
      const battleTurns = scenes
        .filter((scenario) => scenario.category === 'operation')
        .map((scenario) => scenario.quest.chapter);
      expect(battleTurns.length).toBeGreaterThanOrEqual(4);
      expect(battleTurns.length).toBeLessThanOrEqual(6);
      expect(battleTurns).toEqual(expect.arrayContaining([1, 3, 6]));
    }
  });

  it('replays the same campaign byte-for-byte from the same seed and commands', () => {
    const first = sequence('quest-replay-seed');
    const second = sequence('quest-replay-seed');
    expect(first).toEqual(second);
  });
});
