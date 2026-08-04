import type { CharacterBlueprint } from '../../engine/model/character';
import type { CanonicalGameState } from '../../engine/model/state';
import type { WorldFact } from '../../engine/model/world';
import type { ScenarioModule, SceneFactRole } from '../corpus/scenario-modules';
import { realiseStoryBeat, type StorySlotValues } from './story-authoring';

export interface BoundSceneFact {
  role: SceneFactRole;
  fact: WorldFact;
}

export interface ScenarioScenePlan {
  module: ScenarioModule;
  turn: number;
  lead: CharacterBlueprint;
  partner: CharacterBlueprint;
  facts: readonly [BoundSceneFact, BoundSceneFact];
  threatNames: readonly string[];
  relationshipBand: 'strained' | 'professional' | 'trusted';
  rank: string;
  reputation: number;
}

function stripTerminalPunctuation(value: string): string {
  return value.trim().replace(/[.!?]+$/, '');
}

function lowerFirst(value: string): string {
  const clean = stripTerminalPunctuation(value);
  return clean.length === 0 ? clean : `${clean[0]!.toLowerCase()}${clean.slice(1)}`;
}

function factValue(fact: WorldFact): string {
  return stripTerminalPunctuation(String(fact.value ?? fact.objectId ?? fact.subjectId));
}

export function decisionReference(fact: WorldFact): string {
  if (fact.createdTurn === 0) {
    if (fact.relation === 'comes-from')
      return `the origin evidence from ${lowerFirst(factValue(fact))}`;
    if (fact.relation === 'is-squad-city') return `the trio’s first oath in ${factValue(fact)}`;
    if (fact.relation === 'pursues-motive')
      return `the faction's attempt to ${lowerFirst(factValue(fact))}`;
    return `the founding evidence concerning ${lowerFirst(factValue(fact))}`;
  }
  const category = fact.tags[0] ?? 'campaign';
  return `the Turn ${fact.createdTurn} ${category} decision to ${lowerFirst(factValue(fact))}`;
}

export function decisionArtifact(fact: WorldFact): string {
  if (fact.createdTurn === 0) {
    if (fact.relation === 'comes-from')
      return `the surviving record from ${lowerFirst(factValue(fact))}`;
    if (fact.relation === 'is-squad-city')
      return `the first Soul Ledger page from ${factValue(fact)}`;
    if (fact.relation === 'pursues-motive')
      return `the evidence of the plan to ${lowerFirst(factValue(fact))}`;
  }
  return `the Soul Ledger entry left when the trio chose to ${lowerFirst(factValue(fact))}`;
}

function relationshipLine(plan: ScenarioScenePlan): string {
  if (plan.relationshipBand === 'trusted') {
    return `${plan.lead.name} and ${plan.partner.name} trust each other enough to share one account, even when it costs them.`;
  }
  if (plan.relationshipBand === 'strained') {
    return `${plan.lead.name} and ${plan.partner.name} are already divided, making any public disagreement dangerous.`;
  }
  return `${plan.lead.name} and ${plan.partner.name} must decide which of them can speak for the trio.`;
}

function worldSlots(state: CanonicalGameState): StorySlotValues {
  const bible = state.campaignBible;
  if (bible === null) throw new Error('A narrative scene requires a campaign bible.');
  const faction = bible.activeFactions[0];
  if (faction === undefined) throw new Error('A narrative scene requires an active faction.');
  return {
    city: bible.city.name,
    civic: bible.civicOrder.name,
    guild: bible.guildModel.name,
    faction: faction.name,
    factionMotive: lowerFirst(faction.motive),
    ...bible.sceneVocabulary,
  };
}

function originValue(plan: ScenarioScenePlan): string {
  const originFact = plan.facts.find((binding) => binding.role === 'origin')?.fact;
  return originFact === undefined ? plan.lead.origin : factValue(originFact);
}

function priorFacts(plan: ScenarioScenePlan): [WorldFact, WorldFact] {
  const prior = plan.facts.filter((binding) => binding.role.startsWith('prior-'));
  const first = prior[0]?.fact ?? plan.facts[0].fact;
  const second = prior.find((binding) => binding.fact.id !== first.id)?.fact ?? plan.facts[1].fact;
  return [first, second];
}

export function renderScenarioScene(plan: ScenarioScenePlan, state: CanonicalGameState): string {
  const useInitial = plan.turn === 1 && plan.module.initial !== undefined;
  const beat = useInitial ? plan.module.initial : plan.module.continuation;
  if (beat === undefined) throw new Error(`Scene ${plan.module.id} has no authored prose.`);
  const [firstFact, secondFact] = priorFacts(plan);
  const slots: StorySlotValues = {
    ...worldSlots(state),
    lead: plan.lead.name,
    partner: plan.partner.name,
    leadOrigin: originValue(plan),
    calling: plan.lead.callingName,
    awakening: lowerFirst(plan.lead.awakeningCondition),
    priorReference: decisionReference(firstFact),
    priorArtifact: decisionArtifact(secondFact),
    enemyOne: plan.threatNames[0] ?? 'a dungeon predator',
    enemyTwo: plan.threatNames[1] ?? 'a second dungeon threat',
    rank: plan.rank,
    relationshipLine: relationshipLine(plan),
  };
  return realiseStoryBeat(beat, slots);
}
