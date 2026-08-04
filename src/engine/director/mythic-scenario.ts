import { generateMythicReviewDraft } from '../../content/mythic-review';
import type { CanonicalGameState } from '../model/state';
import { ScenarioBlueprintSchema, type ScenarioBlueprint } from '../model/scenario';
import { createSceneBeats } from '../narrative/scene-beats';

function lowerFirst(value: string) {
  return `${value[0]?.toLowerCase() ?? ''}${value.slice(1)}`;
}

function consequenceFor(
  category: ScenarioBlueprint['category'],
  label: string,
  choiceIndex: number,
) {
  const memory = `The decision to ${lowerFirst(label)} becomes a fact that later chapters can recall.`;
  if (category === 'operation') {
    return 'Formation, stances, and team priority resolve the battle. Victory grants 25 XP, 2 Provisions, and 3 Renown.';
  }
  if (category === 'personal') {
    return choiceIndex === 0
      ? `${memory} The hero’s Path thread advances and the trio gains 1 Renown.`
      : `${memory} The hero’s Path thread advances without a Renown gain.`;
  }
  return choiceIndex === 0
    ? `${memory} The trio gains 1 Renown.`
    : `${memory} The clue is preserved without a Renown gain.`;
}

function effectsFor(category: ScenarioBlueprint['category'], choiceIndex: number) {
  if (category === 'operation')
    return { renownDelta: 0, provisionsDelta: 0, dangerDelta: 0, bondDelta: 0 };
  if (category === 'personal') {
    return choiceIndex === 0
      ? { renownDelta: 1, provisionsDelta: 0, dangerDelta: 1, bondDelta: 2 }
      : { renownDelta: 0, provisionsDelta: 0, dangerDelta: 0, bondDelta: 1 };
  }
  return choiceIndex === 0
    ? { renownDelta: 1, provisionsDelta: 0, dangerDelta: 2, bondDelta: 0 }
    : { renownDelta: 0, provisionsDelta: 1, dangerDelta: -1, bondDelta: 0 };
}

/**
 * The first three turns are a hand-authored mythic vertical slice. It is regenerated from the
 * campaign seed, then parsed into the same canonical ScenarioBlueprint used by the director.
 */
export function createMythicOpeningScenario(
  state: CanonicalGameState,
  turn: number,
): ScenarioBlueprint | null {
  if (turn < 1 || turn > 3 || state.campaignSeed === null) return null;
  const draft = generateMythicReviewDraft(state.campaignSeed);
  const chapter = draft.chapters[turn - 1];
  if (chapter === undefined) return null;
  const lead = draft.trio.find((hero) => chapter.paragraph.includes(hero.name)) ?? draft.trio[0]!;
  const foundationFactIds = state.worldFacts
    .filter((fact) => fact.active && (fact.tags.includes('city') || fact.tags.includes('faction')))
    .slice(0, 2)
    .map((fact) => fact.id);
  const priorDecision = [...state.worldFacts]
    .reverse()
    .find(
      (fact) =>
        fact.active &&
        fact.createdTurn > 0 &&
        ['operation', 'discovery', 'personal'].some((tag) => fact.tags.includes(tag)),
    );
  const premiseFactIds =
    turn === 1 || priorDecision === undefined
      ? foundationFactIds
      : [foundationFactIds[turn % foundationFactIds.length]!, priorDecision.id];
  if (premiseFactIds.length < 2) return null;
  const choices =
    chapter.category === 'operation'
      ? [
          {
            id: `enter-mythic-trial-t${turn}`,
            label: 'Enter the trial',
            description: consequenceFor('operation', 'enter the trial', 0),
            consequence: consequenceFor('operation', 'enter the trial', 0),
            effects: effectsFor('operation', 0),
          },
        ]
      : chapter.choices.map((label, choiceIndex) => ({
          id: `${chapter.id}-choice-${choiceIndex + 1}-t${turn}`,
          label,
          description: consequenceFor(chapter.category, label, choiceIndex),
          consequence: consequenceFor(chapter.category, label, choiceIndex),
          effects: effectsFor(chapter.category, choiceIndex),
        }));

  const setting = `the ${state.campaignBible?.sceneVocabulary.crisisSite ?? 'dungeon threshold'} of ${state.campaignBible?.city.name ?? draft.world.name}, where ${state.campaignBible?.activeFactions[0]?.name ?? 'a hidden faction'} watches the newly awakened Paths`;
  const memoryLine =
    priorDecision === undefined
      ? `This first trial begins in ${setting}.`
      : `In ${setting}, the Soul Ledger remembers that the trio chose to ${String(priorDecision.value)}.`;
  const chapterBeats = createSceneBeats(chapter.paragraph);
  const sceneBeats = {
    hook: chapterBeats.hook,
    cause: memoryLine,
    stakes: `${chapterBeats.cause} ${chapterBeats.stakes}`,
    decision: chapterBeats.decision,
  };
  const premise = [sceneBeats.hook, sceneBeats.cause, sceneBeats.stakes, sceneBeats.decision].join(
    ' ',
  );

  return ScenarioBlueprintSchema.parse({
    id: `scenario-turn-${turn}`,
    templateId: chapter.category === 'operation' ? 'operation-1' : `mythic-${chapter.id}`,
    category: chapter.category,
    title: chapter.title,
    premise,
    sceneBeats,
    premiseFactIds,
    castIds: chapter.category === 'operation' ? draft.trio.map((hero) => hero.id) : [lead.id],
    threatIds: chapter.category === 'operation' ? ['rift-hound', 'glass-weaver'] : [],
    choices,
    forecast: {
      likelyBenefit: choices[0]!.consequence,
      likelyRisk: choices.at(-1)!.consequence,
      confidence: chapter.category === 'discovery' ? 'moderate' : 'high',
    },
    advancesThreadId: chapter.category === 'personal' ? `thread-personal-${lead.id}` : undefined,
    semanticFingerprint: `mythic:${draft.world.id}:${chapter.id}:${turn}`,
  });
}
