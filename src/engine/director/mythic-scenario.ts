import { encounterForOperationTemplate } from '../../content/milestone-one';
import { OPENING_JOURNEYS } from '../../content/opening-recruitment';
import { QUEST_ARCS, questWorldId } from '../../content/quest-arcs';
import type { CanonicalGameState } from '../model/state';
import { ScenarioBlueprintSchema, type ScenarioBlueprint } from '../model/scenario';
import type { WorldFact } from '../model/world';

const SLOT_PATTERN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

function bind(text: string, values: Record<string, string>): string {
  const result = text.replace(SLOT_PATTERN, (token, key: string) => values[key] ?? token).trim();
  if (/\{[^}]+\}/.test(result)) throw new Error(`Unresolved opening slot in: ${result}`);
  return result;
}

function latestOpeningDecision(state: CanonicalGameState, turn: number): WorldFact {
  const fact = state.worldFacts.find(
    (candidate) =>
      candidate.active &&
      candidate.createdTurn === turn - 1 &&
      candidate.id === `fact-scenario-result-${turn - 1}`,
  );
  if (fact === undefined) throw new Error(`Opening Turn ${turn} requires the previous choice.`);
  return fact;
}

function openingFoundationFacts(state: CanonicalGameState): [WorldFact, WorldFact] {
  const facts = state.worldFacts.filter(
    (fact) =>
      fact.active &&
      fact.createdTurn === 0 &&
      fact.tags.some((tag) => tag === 'city' || tag === 'faction'),
  );
  const first = facts[0];
  const second = facts[1];
  if (first === undefined || second === undefined) {
    throw new Error('The authored opening requires one live world fact and one live faction fact.');
  }
  return [first, second];
}

/**
 * Turns 1–2 recruit the two companions selected by canonical roster order. Turn 3 is the first
 * operation. Each world owns a complete three-scene journey; this binder changes only hero,
 * Awakening, and enemy names and carries the prior authored consequence forward unchanged.
 */
export function createMythicOpeningScenario(
  state: CanonicalGameState,
  turn: number,
): ScenarioBlueprint | null {
  if (turn < 1 || turn > 3 || state.campaignSeed === null) return null;
  if (state.campaignBible === null)
    throw new Error('The authored opening requires a campaign bible.');

  const lead =
    state.generatedDefinitions.characters.find((hero) => hero.id === state.leadCharacterId) ??
    state.generatedDefinitions.characters[0];
  if (lead === undefined) throw new Error('The authored opening requires a chosen lead.');
  const companions = state.generatedDefinitions.characters.filter((hero) => hero.id !== lead.id);
  const firstCompanion = companions[0];
  const secondCompanion = companions[1];
  if (firstCompanion === undefined || secondCompanion === undefined) {
    throw new Error('The authored opening requires two recruitable companions.');
  }

  const worldId = questWorldId(state.campaignBible.city.id);
  const journey = OPENING_JOURNEYS[worldId];
  const chapter = journey.chapters[turn - 1];
  if (chapter === undefined) return null;
  const encounter =
    chapter.category === 'operation' ? encounterForOperationTemplate(chapter.templateId) : null;
  const enemies =
    encounter?.enemyIds.map((id) => state.generatedDefinitions.enemies[id]?.name ?? id) ?? [];
  const slots = {
    lead: lead.name,
    leadAwakening: lead.callingName,
    firstCompanion: firstCompanion.name,
    firstAwakening: firstCompanion.callingName,
    secondCompanion: secondCompanion.name,
    secondAwakening: secondCompanion.callingName,
    enemyOne: enemies[0] ?? 'the charging guardian',
    enemyTwo: enemies[1] ?? 'the watching seer',
  };
  const foundationFacts = openingFoundationFacts(state);
  const priorDecision = turn === 1 ? undefined : latestOpeningDecision(state, turn);
  const sceneBeats = {
    hook: bind(chapter.hook, slots),
    cause:
      priorDecision === undefined
        ? bind(chapter.cause, slots)
        : bind(String(priorDecision.value ?? chapter.cause), slots),
    stakes: bind(chapter.stakes, slots),
    decision: bind(chapter.decision, slots),
  };
  const choices = chapter.choices.map((candidate) => ({
    id: `${candidate.id}-t${turn}`,
    label: bind(candidate.label, slots),
    description: bind(candidate.description, slots),
    consequence: bind(candidate.consequence, slots),
    outcomeConsequences:
      candidate.outcomeConsequences === undefined
        ? undefined
        : {
            victory: bind(candidate.outcomeConsequences.victory, slots),
            defeat: bind(candidate.outcomeConsequences.defeat, slots),
            roundCap: bind(candidate.outcomeConsequences.roundCap, slots),
          },
    effects: candidate.effects,
  }));
  const arc = QUEST_ARCS[worldId];
  const premiseFactIds =
    priorDecision === undefined
      ? foundationFacts.map((fact) => fact.id)
      : [foundationFacts[(turn - 1) % foundationFacts.length]!.id, priorDecision.id];
  const castIds =
    turn === 1
      ? [lead.id, firstCompanion.id]
      : turn === 2
        ? [lead.id, firstCompanion.id, secondCompanion.id]
        : state.generatedDefinitions.characters.map((hero) => hero.id);

  return ScenarioBlueprintSchema.parse({
    id: `scenario-turn-${turn}`,
    templateId: chapter.templateId,
    category: chapter.category,
    title: chapter.title,
    premise: [sceneBeats.hook, sceneBeats.cause, sceneBeats.stakes, sceneBeats.decision].join(' '),
    sceneBeats,
    quest: {
      id: arc.id,
      title: arc.title,
      act: 1,
      actTitle: chapter.actTitle,
      objective: chapter.objective,
      chapter: turn,
      totalChapters: 20,
    },
    premiseFactIds,
    castIds,
    threatIds: encounter?.enemyIds ?? [],
    choices,
    forecast: {
      likelyBenefit: choices[0]!.description,
      likelyRisk: choices.at(-1)!.description,
      confidence: chapter.category === 'operation' ? 'moderate' : 'high',
    },
    advancesThreadId:
      turn === 1
        ? `thread-personal-${firstCompanion.id}`
        : turn === 2
          ? `thread-personal-${secondCompanion.id}`
          : undefined,
    semanticFingerprint: `${journey.id}:${chapter.turn}:${lead.id}`,
  });
}
