import { encounterForOperationTemplate } from '../../content/milestone-one';
import {
  SCENARIO_CHOICE_MODULES,
  SCENARIO_MODULES,
  type SceneFactRole,
  type ScenarioModule,
} from '../../narrative/corpus/scenario-modules';
import {
  renderScenarioScene,
  type BoundSceneFact,
  type ScenarioScenePlan,
} from '../../narrative/realiser/scenario';
import type { CanonicalGameState } from '../model/state';
import {
  ScenarioBlueprintSchema,
  type ScenarioBlueprint,
  type ScenarioCategory,
} from '../model/scenario';
import type { WorldFact } from '../model/world';
import type { RngStreamsState } from '../rng/streams';
import { drawInteger } from '../rng/streams';

const categories: ScenarioCategory[] = ['operation', 'personal', 'discovery', 'rival', 'social'];

function categoryForTurn(turn: number): ScenarioCategory {
  return categories[(turn - 1) % categories.length]!;
}

function memoryCategory(fact: WorldFact): ScenarioCategory | undefined {
  return categories.find((category) => fact.tags.includes(category));
}

function newestFacts(facts: readonly WorldFact[]): WorldFact[] {
  return [...facts].sort(
    (left, right) => right.createdTurn - left.createdTurn || right.id.localeCompare(left.id),
  );
}

export function worldFactMatchesSceneRole(
  role: SceneFactRole,
  fact: WorldFact,
  leadId: string,
): boolean {
  if (!fact.active) return false;
  if (role === 'city') return fact.relation === 'is-squad-city';
  if (role === 'faction') return fact.relation === 'pursues-motive';
  if (role === 'origin') return fact.subjectId === leadId && fact.relation === 'comes-from';
  if (role === 'prior-decision') return fact.createdTurn > 0 && memoryCategory(fact) !== undefined;
  const category = role.replace('prior-', '') as ScenarioCategory;
  return fact.createdTurn > 0 && memoryCategory(fact) === category;
}

function tryBindFacts(
  roles: readonly [SceneFactRole, SceneFactRole],
  leadId: string,
  activeFacts: readonly WorldFact[],
): readonly [BoundSceneFact, BoundSceneFact] | null {
  const orderedFacts = newestFacts(activeFacts);
  const firstFact = orderedFacts.find((fact) => worldFactMatchesSceneRole(roles[0], fact, leadId));
  if (firstFact === undefined) return null;
  const secondFact = orderedFacts.find(
    (fact) => fact.id !== firstFact.id && worldFactMatchesSceneRole(roles[1], fact, leadId),
  );
  if (secondFact === undefined) return null;
  return [
    { role: roles[0], fact: firstFact },
    { role: roles[1], fact: secondFact },
  ];
}

function eligiblePersonalThread(state: CanonicalGameState, turn: number) {
  return [...state.storyThreads]
    .filter(
      (thread) =>
        thread.status === 'open' &&
        thread.nextEligibleTurn <= turn &&
        thread.castIds.some((id) =>
          state.generatedDefinitions.characters.some((hero) => hero.id === id),
        ),
    )
    .sort(
      (left, right) =>
        Number(right.stage > 0) - Number(left.stage > 0) ||
        right.urgency - left.urgency ||
        right.stage - left.stage ||
        left.id.localeCompare(right.id),
    )[0];
}

function relationshipBand(value: number): ScenarioScenePlan['relationshipBand'] {
  if (value >= 12) return 'trusted';
  if (value <= -4) return 'strained';
  return 'professional';
}

function semanticFactKey(fact: WorldFact): string {
  const decisionTag = fact.tags
    .slice(1)
    .find((tag) => /-t\d+$/.test(tag))
    ?.replace(/-t\d+$/, '');
  if (decisionTag !== undefined) return `${memoryCategory(fact) ?? fact.kind}:${decisionTag}`;
  const value = String(fact.value ?? fact.objectId ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  return `${fact.relation}:${value}`;
}

function personalStageTemplateIndex(stage: number): number {
  return [0, 2, 3][Math.min(stage, 2)]!;
}

export function selectNextScenario(
  state: CanonicalGameState,
  turn: number,
  initialStreams: RngStreamsState,
): {
  scenario: ScenarioBlueprint;
  streams: RngStreamsState;
  debug: CanonicalGameState['directorDebug'];
} {
  const urgentThread = state.storyThreads.find(
    (thread) => thread.status === 'open' && thread.urgency >= 75 && thread.nextEligibleTurn <= turn,
  );
  const category = urgentThread === undefined ? categoryForTurn(turn) : 'personal';
  const draw = drawInteger(initialStreams, 'scenarios', 0, 3);
  const heroes = state.generatedDefinitions.characters;
  if (heroes.length < 2) throw new Error('Scenario director requires at least two heroes.');

  const continuingThread =
    category === 'personal' ? eligiblePersonalThread(state, turn) : undefined;
  const lead =
    heroes.find((hero) => (urgentThread ?? continuingThread)?.castIds.includes(hero.id)) ??
    heroes[(turn + draw.value) % heroes.length]!;
  const relevantRelationship = [...state.relationships]
    .filter((relationship) => relationship.characterIds.includes(lead.id))
    .sort(
      (left, right) =>
        right.factIds.length - left.factIds.length ||
        Math.abs(right.value) - Math.abs(left.value) ||
        left.pairId.localeCompare(right.pairId),
    )[0];
  const partner =
    heroes.find(
      (hero) => hero.id !== lead.id && relevantRelationship?.characterIds.includes(hero.id),
    ) ?? heroes.find((hero) => hero.id !== lead.id)!;
  const openThread = continuingThread;

  const modules = SCENARIO_MODULES[category];
  const activeFacts = state.worldFacts.filter((fact) => fact.active);
  const candidates = modules.map((module, index) => {
    const factRoles =
      turn === 1 && module.initialFactRoles !== undefined
        ? module.initialFactRoles
        : module.continuationFactRoles;
    const boundFacts = tryBindFacts(factRoles, lead.id, activeFacts);
    const missingRoles = factRoles.filter(
      (role) => !activeFacts.some((fact) => worldFactMatchesSceneRole(role, fact, lead.id)),
    );
    const used = state.scenarioFingerprints.some((fingerprint) =>
      fingerprint.startsWith(`${module.id}:`),
    );
    const stageContinuation =
      category === 'personal' &&
      openThread !== undefined &&
      index === personalStageTemplateIndex(openThread.stage)
        ? 30
        : 0;
    const relationshipMemory =
      (category === 'rival' || category === 'social') &&
      relevantRelationship !== undefined &&
      relevantRelationship.factIds.length > 0 &&
      index === relevantRelationship.factIds.length % modules.length
        ? Math.min(12, 3 + Math.abs(relevantRelationship.value))
        : 0;
    const reputationRelevance =
      (category === 'operation' || category === 'rival' || category === 'social') &&
      index === Math.abs(state.reputation) % modules.length
        ? Math.min(10, Math.abs(state.reputation))
        : 0;
    const contradiction =
      category === 'rival' &&
      module.id === 'rival-3' &&
      state.worldFacts.some((fact) => fact.active && fact.relation === 'forbids-public-challenge');
    const score =
      20 +
      (index === draw.value ? 6 : 0) +
      stageContinuation +
      relationshipMemory +
      reputationRelevance -
      (used ? 80 : 0) -
      (contradiction ? 100 : 0) -
      (boundFacts === null ? 1000 : 0);
    return {
      module,
      index,
      score,
      factRoles,
      boundFacts,
      reasons: [
        `category:${category}`,
        used ? 'recent-repetition:-80' : 'novelty:+20',
        stageContinuation > 0 ? `story-continuity:+${stageContinuation}` : 'story-continuity:+0',
        relationshipMemory > 0
          ? `relationship-memory:+${relationshipMemory}`
          : 'relationship-memory:+0',
        reputationRelevance > 0
          ? `reputation-relevance:+${reputationRelevance}`
          : 'reputation-relevance:+0',
        contradiction ? 'contradiction-risk:-100' : 'contradiction-risk:+0',
        ...(boundFacts === null
          ? missingRoles.length > 0
            ? missingRoles.map((role) => `missing-fact-role:${role}`)
            : ['missing-fact-role:distinct-binding']
          : ['semantic-facts:eligible']),
      ],
    };
  });
  const selected = [...candidates].sort(
    (left, right) => right.score - left.score || left.index - right.index,
  )[0]!;
  if (selected.boundFacts === null)
    throw new Error(`No ${category} scenario has the required live semantic facts.`);

  const encounter =
    category === 'operation'
      ? { ...encounterForOperationTemplate(selected.module.id), title: selected.module.title }
      : null;
  const facts = selected.boundFacts;
  const premiseFactIds = facts.map((binding) => binding.fact.id);
  const scenePlan: ScenarioScenePlan = {
    module: selected.module,
    turn,
    lead,
    partner,
    facts,
    threatNames:
      encounter?.enemyIds.map(
        (enemyId) => state.generatedDefinitions.enemies[enemyId]?.name ?? enemyId,
      ) ?? [],
    relationshipBand: relationshipBand(relevantRelationship?.value ?? 0),
    rank: state.rank,
    reputation: state.reputation,
  };
  const choiceModules = SCENARIO_CHOICE_MODULES[selected.module.choiceSetId];
  if (choiceModules === undefined)
    throw new Error(`Missing choice module for ${selected.module.choiceSetId}.`);
  const templateChoices = choiceModules.map(({ id, label, consequence }) => ({
    id: `${id}-t${turn}`,
    label,
    description: consequence,
    consequence,
  }));
  const castIds =
    category === 'personal' || category === 'discovery'
      ? [lead.id]
      : category === 'rival' || category === 'social'
        ? [lead.id, partner.id]
        : heroes.map((hero) => hero.id);
  const factFingerprint = facts
    .map((binding) => `${binding.role}=${semanticFactKey(binding.fact)}`)
    .join('|');
  const scenario = ScenarioBlueprintSchema.parse({
    id: `scenario-turn-${turn}`,
    templateId: selected.module.id,
    category,
    title: selected.module.title,
    premise: renderScenarioScene(scenePlan, state),
    premiseFactIds,
    castIds,
    threatIds: encounter?.enemyIds ?? [],
    choices: templateChoices,
    forecast: {
      likelyBenefit: templateChoices[0]!.consequence,
      likelyRisk: templateChoices.at(-1)!.consequence,
      confidence: category === 'discovery' ? 'moderate' : 'high',
    },
    advancesThreadId: category === 'personal' ? openThread?.id : undefined,
    semanticFingerprint: `${selected.module.id}:${lead.id}:${factFingerprint}`,
  });
  return {
    scenario,
    streams: draw.streams,
    debug: candidates.map((candidate) => ({
      templateId: candidate.module.id,
      score: candidate.score,
      selected: candidate.module.id === selected.module.id,
      reasons: candidate.reasons,
    })),
  };
}
