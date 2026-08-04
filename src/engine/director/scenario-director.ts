import { encounterForOperationTemplate } from '../../content/milestone-one';
import {
  QUEST_ARCS,
  QUEST_CHAPTER_VARIANTS,
  questActForTurn,
  questWorldId,
  type QuestChapterDefinition,
} from '../../content/quest-arcs';
import type { CharacterBlueprint } from '../model/character';
import type { CanonicalGameState } from '../model/state';
import { ScenarioBlueprintSchema, type ScenarioBlueprint } from '../model/scenario';
import type { WorldFact } from '../model/world';
import { drawInteger, type RngStreamsState } from '../rng/streams';
import { createMythicOpeningScenario } from './mythic-scenario';

const SLOT_PATTERN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

function latestDecision(state: CanonicalGameState): WorldFact {
  const fact = [...state.worldFacts]
    .filter((candidate) => candidate.active && candidate.createdTurn > 0)
    .sort((left, right) => right.createdTurn - left.createdTurn)[0];
  if (fact === undefined) throw new Error('A quest chapter requires the previous authored result.');
  return fact;
}

function bind(text: string, values: Record<string, string>): string {
  const result = text.replace(SLOT_PATTERN, (token, key: string) => values[key] ?? token).trim();
  if (/\{[^}]+\}/.test(result)) throw new Error(`Unresolved quest slot in: ${result}`);
  return result;
}

function relationshipPartner(
  state: CanonicalGameState,
  lead: CharacterBlueprint,
): CharacterBlueprint {
  const relationship = [...state.relationships]
    .filter((candidate) => candidate.characterIds.includes(lead.id))
    .sort(
      (left, right) =>
        right.factIds.length - left.factIds.length ||
        Math.abs(right.value) - Math.abs(left.value) ||
        left.pairId.localeCompare(right.pairId),
    )[0];
  return (
    state.generatedDefinitions.characters.find(
      (hero) => hero.id !== lead.id && relationship?.characterIds.includes(hero.id),
    ) ?? state.generatedDefinitions.characters.find((hero) => hero.id !== lead.id)!
  );
}

function foundationFact(
  state: CanonicalGameState,
  chapter: QuestChapterDefinition,
  leadId: string,
) {
  const fact = state.worldFacts.find((candidate) => {
    if (!candidate.active || candidate.createdTurn !== 0) return false;
    if (chapter.category === 'personal') {
      return candidate.subjectId === leadId && candidate.relation === 'comes-from';
    }
    if (chapter.category === 'discovery' || chapter.category === 'social') {
      return candidate.relation === 'is-squad-city';
    }
    return candidate.relation === 'pursues-motive';
  });
  if (fact === undefined)
    throw new Error(`Quest chapter ${chapter.turn} lacks its foundation fact.`);
  return fact;
}

/**
 * After the three-scene opening, the normal campaign follows one world-specific authored quest.
 * Variation binds whole heroes, enemies, factions, prior authored outcomes, and world vocabulary;
 * no renderer is allowed to reinterpret a button label as a new plot object.
 */
export function selectNextScenario(
  state: CanonicalGameState,
  turn: number,
  initialStreams: RngStreamsState,
): {
  scenario: ScenarioBlueprint;
  streams: RngStreamsState;
  debug: CanonicalGameState['directorDebug'];
} {
  const mythicOpening = createMythicOpeningScenario(state, turn);
  if (mythicOpening !== null) {
    return {
      scenario: mythicOpening,
      streams: initialStreams,
      debug: [
        {
          templateId: mythicOpening.templateId,
          score: 100,
          selected: true,
          reasons: ['authored-quest-opening:+100'],
        },
      ],
    };
  }

  if (state.campaignBible === null) throw new Error('A quest chapter requires a campaign bible.');
  const worldId = questWorldId(state.campaignBible.city.id);
  const arc = QUEST_ARCS[worldId];
  const chapterNumber = Math.min(20, turn);
  const canonicalChapter = arc.chapters.find((candidate) => candidate.turn === chapterNumber);
  if (canonicalChapter === undefined)
    throw new Error(`Quest ${arc.id} has no chapter for Turn ${turn}.`);
  const previous = latestDecision(state);
  const variants = QUEST_CHAPTER_VARIANTS[worldId][chapterNumber] ?? [];
  const variantDraw = drawInteger(initialStreams, 'scenarios', 0, variants.length);
  const previousWasSecondChoice = /(?:choice-2|-b)-t\d+$/.test(previous.relation);
  const variantIndex =
    variants.length === 0
      ? 0
      : chapterNumber === 20
        ? previousWasSecondChoice
          ? 1
          : 0
        : (variantDraw.value + (previousWasSecondChoice ? 1 : 0)) % (variants.length + 1);
  const selectedVariant = variantIndex === 0 ? undefined : variants[variantIndex - 1];
  const chapter: QuestChapterDefinition =
    selectedVariant === undefined ? canonicalChapter : { ...canonicalChapter, ...selectedVariant };

  const lead =
    state.generatedDefinitions.characters.find((hero) => hero.role === chapter.leadRole) ??
    state.generatedDefinitions.characters[0];
  if (lead === undefined) throw new Error('A quest chapter requires a lead hero.');
  const partner = relationshipPartner(state, lead);
  const faction = state.campaignBible.activeFactions[0];
  if (faction === undefined) throw new Error('A quest chapter requires an active faction.');
  const encounter =
    chapter.category === 'operation' ? encounterForOperationTemplate(chapter.templateId) : null;
  const enemies =
    encounter?.enemyIds.map((id) => state.generatedDefinitions.enemies[id]?.name ?? id) ?? [];
  const act = arc.acts[chapter.act - 1]!;
  const slots = {
    city: state.campaignBible.city.name,
    faction: faction.name,
    lead: lead.name,
    partner: partner.name,
    leadMemory: lead.formativeEvent,
    calling: lead.callingName,
    enemyOne: enemies[0] ?? 'the first guardian',
    enemyTwo: enemies[1] ?? 'the second guardian',
    crisisSite: state.campaignBible.sceneVocabulary.crisisSite,
    hiddenRoute: state.campaignBible.sceneVocabulary.hiddenRoute,
  };
  const sceneBeats = {
    hook: bind(chapter.hook, slots),
    cause: bind(
      String(previous.value ?? 'The previous chapter ended without a clear result.'),
      slots,
    ),
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
    encounterId: candidate.encounterId,
    effects: candidate.effects,
  }));
  const quest = {
    id: arc.id,
    title: arc.title,
    act: chapter.act,
    actTitle: act.title,
    objective: bind(act.objective, slots),
    chapter: chapterNumber,
    totalChapters: 20 as const,
  };
  const premise = [sceneBeats.hook, sceneBeats.cause, sceneBeats.stakes, sceneBeats.decision].join(
    ' ',
  );
  const baseThread = state.storyThreads.find((thread) => thread.castIds.includes(lead.id));
  const firstFact = foundationFact(state, chapter, lead.id);
  const scenario = ScenarioBlueprintSchema.parse({
    id: `scenario-turn-${turn}`,
    templateId: chapter.templateId,
    category: chapter.category,
    title: chapter.title,
    premise,
    sceneBeats,
    quest,
    premiseFactIds: [firstFact.id, previous.id],
    castIds:
      chapter.category === 'operation'
        ? state.generatedDefinitions.characters.map((hero) => hero.id)
        : chapter.category === 'rival' || chapter.category === 'social'
          ? [lead.id, partner.id]
          : [lead.id],
    threatIds: encounter?.enemyIds ?? [],
    choices,
    forecast: {
      likelyBenefit: choices[0]!.description,
      likelyRisk: choices.at(-1)!.description,
      confidence: chapter.category === 'discovery' ? 'moderate' : 'high',
    },
    advancesThreadId: chapter.category === 'personal' ? baseThread?.id : undefined,
    semanticFingerprint: `${arc.id}:${chapter.turn}:variant-${variantIndex}:${lead.id}:${previous.relation}`,
  });
  return {
    scenario,
    streams: variantDraw.streams,
    debug: [
      {
        templateId: chapter.templateId,
        score: 100,
        selected: true,
        reasons: [
          `quest:${arc.id}`,
          `act:${chapter.act}`,
          `chapter:${chapter.turn}`,
          `scene-variant:${variantIndex}`,
        ],
      },
    ],
  };
}
