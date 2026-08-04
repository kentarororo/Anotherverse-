import { generateMythicReviewDraft } from '../../content/mythic-review';
import type { CanonicalGameState } from '../model/state';
import { ScenarioBlueprintSchema, type ScenarioBlueprint } from '../model/scenario';
import { createSceneBeats } from '../narrative/scene-beats';
import { QUEST_ARCS, questWorldId } from '../../content/quest-arcs';

function lowerFirst(value: string) {
  return `${value[0]?.toLowerCase() ?? ''}${value.slice(1)}`;
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
            description: 'Set formation, stances, and team priority before the battle begins.',
            consequence: chapter.choiceResults[0],
            outcomeConsequences:
              draft.world.id === 'fallen-heavens'
                ? {
                    victory: chapter.choiceResults[0],
                    defeat:
                      'The squad escaped the crater after the guardians overwhelmed them. Behind an empty altar, they found a fresh name cut into a god’s rib.',
                    roundCap:
                      'The trial ended before either side won. Behind an empty altar, the squad found a fresh name cut into a god’s rib.',
                  }
                : {
                    victory: chapter.choiceResults[0],
                    defeat:
                      'The squad escaped the shore in an empty black boat after the drowned broke their line. Below the first landing, they found a ferryman chained beneath the bell.',
                    roundCap:
                      'Dawn ended the fight before either side won. Below the first landing, the squad found a ferryman chained beneath the bell.',
                  },
            effects: effectsFor('operation', 0),
          },
        ]
      : chapter.choices.map((label, choiceIndex) => ({
          id: `${chapter.id}-choice-${choiceIndex + 1}-t${turn}`,
          label,
          description: chapter.choiceDescriptions[choiceIndex],
          consequence: chapter.choiceResults[choiceIndex],
          effects:
            chapter.choiceEffects?.[choiceIndex] ?? effectsFor(chapter.category, choiceIndex),
        }));

  const setting = `the ${state.campaignBible?.sceneVocabulary.crisisSite ?? 'dungeon threshold'}`;
  const memoryLine =
    priorDecision === undefined
      ? `The trio came to ${setting} for its first ranked trial.`
      : String(priorDecision.value);
  const chapterBeats = createSceneBeats(chapter.paragraph);
  const sceneBeats = {
    hook: chapterBeats.hook,
    cause: memoryLine,
    stakes: `${chapterBeats.cause} ${chapterBeats.stakes}`,
    decision:
      chapter.category === 'operation'
        ? 'Set the formation and choose which threat the squad will stop first.'
        : `Will the trio ${lowerFirst(chapter.choices[0])} or ${lowerFirst(chapter.choices[1])}?`,
  };
  const premise = [sceneBeats.hook, sceneBeats.cause, sceneBeats.stakes, sceneBeats.decision].join(
    ' ',
  );
  const arc = QUEST_ARCS[questWorldId(state.campaignBible!.city.id)];
  const act = arc.acts[0];

  return ScenarioBlueprintSchema.parse({
    id: `scenario-turn-${turn}`,
    templateId: chapter.category === 'operation' ? 'operation-1' : `mythic-${chapter.id}`,
    category: chapter.category,
    title: chapter.title,
    premise,
    sceneBeats,
    quest: {
      id: arc.id,
      title: arc.title,
      act: 1,
      actTitle: act.title,
      objective: act.objective.replace('{faction}', state.campaignBible!.activeFactions[0]!.name),
      chapter: turn,
      totalChapters: 20,
    },
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
