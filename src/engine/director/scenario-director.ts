import type { CanonicalGameState } from '../model/state';
import type { ScenarioBlueprint, ScenarioCategory } from '../model/scenario';
import type { WorldFact } from '../model/world';
import { ScenarioBlueprintSchema } from '../model/scenario';
import type { RngStreamsState } from '../rng/streams';
import { drawInteger } from '../rng/streams';
import { encounterForOperationTemplate } from '../../content/milestone-one';

const categories: ScenarioCategory[] = ['operation', 'personal', 'discovery', 'rival', 'social'];

const titles: Record<ScenarioCategory, string[]> = {
  operation: [
    'Glassline Breach',
    'Pressure at East Junction',
    'The Split Concourse',
    'Closure Under Watch',
  ],
  personal: [
    'A Record Left Sealed',
    'Terms of the Old Promise',
    'The Missing Name',
    'Condition of Awakening',
  ],
  discovery: [
    'Signal Beneath the Platform',
    'An Unlicensed Relic',
    'The Second Pressure Trace',
    'Archive Without a Door',
  ],
  rival: [
    'A Squad Files Objection',
    'Proof Before Rank',
    'The Public Challenge',
    'Credit for the Closure',
  ],
  social: [
    'District Testimony',
    'The Licence Hearing',
    'A Favour Called In',
    'Who Owns the Report',
  ],
};

const premises: Record<ScenarioCategory, string[]> = {
  operation: [
    'The contract returns the squad to a transit breach where the enemy pattern now reflects an earlier closure record.',
    'A pressure surge threatens commuters while Directorate observers measure every formation decision.',
    'Two threat signatures overlap at a junction the city still lists as secure.',
    'A routine closure becomes politically visible when a faction survey team arrives before the squad.',
  ],
  personal: [
    'A sealed incident record names one squad member and contradicts the origin they gave the others.',
    'Someone tied to a formative failure asks the squad to honour a promise no licence office recorded.',
    'An omitted witness resurfaces with evidence about a hero’s unrecognised technique.',
    'A Calling reacts to the last operation and reveals a more dangerous interpretation of its awakening condition.',
  ],
  discovery: [
    'The squad detects a structured signal below the official breach line, linked to both the city pressure law and a hero’s origin.',
    'A living relic responds to the squad licence while rejecting the institution assigned to catalogue it.',
    'A second pressure trace proves the last closure did not remove every cause of the breach.',
    'An impossible archive marker appears inside modern infrastructure and recognises one hero’s Calling.',
  ],
  rival: [
    'A higher-ranked squad claims the trio’s last result relied on an illegal technique and demands a monitored demonstration.',
    'A rival presents edited combat records that challenge who created the opening used in the last victory.',
    'The public ranking board offers immediate attention if the trio accepts a deliberately unfavourable challenge.',
    'Another squad claims contractual credit for the district memory the trio just created.',
  ],
  social: [
    'District witnesses ask the trio to place public safety testimony ahead of the regulator’s preferred account.',
    'A licence hearing weighs the squad’s recorded consequences against the faction’s political pressure.',
    'An official invokes an earlier favour and asks the squad to withhold a mechanically relevant fact.',
    'The city, guild, and district each claim ownership of the squad’s complete operation report.',
  ],
};

const choices: Record<ScenarioCategory, [string, string, string][]> = {
  operation: [
    [
      'execute-contract',
      'Execute the prepared plan',
      'Combat resolves using the locked formation and policy.',
    ],
  ],
  personal: [
    [
      'share-record',
      'Share the record',
      'Trust may grow, but the secret becomes usable by rivals.',
    ],
    [
      'keep-confidence',
      'Keep it in confidence',
      'Protect the hero now and leave the contradiction unresolved.',
    ],
  ],
  discovery: [
    [
      'secure-evidence',
      'Secure the evidence',
      'Gain reliable intelligence and attract institutional scrutiny.',
    ],
    [
      'leave-marker',
      'Leave the site unchanged',
      'Preserve the signal for later at the cost of immediate knowledge.',
    ],
  ],
  rival: [
    [
      'accept-scrutiny',
      'Accept public scrutiny',
      'Reputation can rise, but failure will strengthen the rival claim.',
    ],
    [
      'challenge-record',
      'Challenge their evidence',
      'Use campaign memory instead of accepting their terms.',
    ],
  ],
  social: [
    [
      'support-district',
      'Support the district account',
      'District trust rises while institutional access tightens.',
    ],
    [
      'support-office',
      'Support the official account',
      'Licence access improves while witnesses remember the compromise.',
    ],
  ],
};

function categoryForTurn(turn: number): ScenarioCategory {
  return categories[(turn - 1) % categories.length]!;
}

function factSubjectName(state: CanonicalGameState, fact: WorldFact): string {
  if (fact.subjectId === 'licensed-squad') return 'the squad';
  const hero = state.generatedDefinitions.characters.find(
    (candidate) => candidate.id === fact.subjectId,
  );
  if (hero !== undefined) return hero.name;
  const faction = state.campaignBible?.activeFactions.find(
    (candidate) => candidate.id === fact.subjectId,
  );
  if (faction !== undefined) return faction.name;
  if (state.campaignBible?.city.id === fact.subjectId) return state.campaignBible.city.name;
  return fact.subjectId.replaceAll('-', ' ');
}

function cleanFactValue(fact: WorldFact): string {
  return String(fact.value ?? fact.objectId ?? fact.subjectId)
    .trim()
    .replace(/[.!?]+$/, '');
}

function causalFactSentence(state: CanonicalGameState, fact: WorldFact): string {
  const subject = factSubjectName(state, fact);
  const value = cleanFactValue(fact);
  const turn =
    fact.createdTurn === 0 ? 'The campaign record' : `The Turn ${fact.createdTurn} record`;
  if (fact.relation === 'comes-from') return `${turn} places ${subject}'s origin in “${value}”.`;
  if (fact.relation.startsWith('chose-')) return `${turn} shows that ${subject} chose “${value}”.`;
  if (fact.relation === 'is-squad-city') return `${turn} licenses the squad in ${value}.`;
  if (fact.relation === 'pursues-motive') return `${turn} says ${subject} seeks to ${value}.`;
  return `${turn} links ${subject} to ${fact.relation.replaceAll('-', ' ')}: “${value}”.`;
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
  const cast =
    heroes.find((hero) => urgentThread?.castIds.includes(hero.id)) ??
    heroes[(turn + draw.value) % heroes.length]!;
  const relevantRelationship = [...state.relationships]
    .filter((relationship) => relationship.characterIds.includes(cast.id))
    .sort(
      (a, b) =>
        b.factIds.length - a.factIds.length ||
        Math.abs(b.value) - Math.abs(a.value) ||
        a.pairId.localeCompare(b.pairId),
    )[0];
  const activeFacts = state.worldFacts.filter((fact) => fact.active);
  const castFact = activeFacts.find((fact) => fact.subjectId === cast.id);
  const relationshipFactId = relevantRelationship?.factIds.at(-1);
  const latestMemories = [...activeFacts].reverse().filter((fact) => fact.createdTurn > 0);
  const latestMemory = latestMemories[0];
  const priorMemory = latestMemories[1];
  const cityFact = activeFacts.find((fact) => fact.relation === 'is-squad-city');
  const factionFact = activeFacts.find((fact) => fact.relation === 'pursues-motive');
  const categoryFacts: Array<WorldFact | undefined> =
    category === 'operation'
      ? [latestMemory ?? factionFact, cityFact]
      : category === 'personal'
        ? [castFact, activeFacts.find((fact) => fact.id === relationshipFactId) ?? latestMemory]
        : category === 'discovery'
          ? [castFact, latestMemory ?? cityFact]
          : [
              activeFacts.find((fact) => fact.id === relationshipFactId) ?? latestMemory,
              priorMemory ?? factionFact,
            ];
  const premiseFactIds = [
    ...new Set(
      [...categoryFacts, ...activeFacts]
        .filter((fact): fact is WorldFact => fact !== undefined)
        .map((fact) => fact.id),
    ),
  ].slice(0, 2);
  if (premiseFactIds.length < 2) throw new Error('Scenario director requires two live facts.');
  const openThread = state.storyThreads.find(
    (thread) =>
      thread.status === 'open' &&
      thread.castIds.includes(cast.id) &&
      thread.nextEligibleTurn <= turn,
  );
  const candidates = titles[category].map((_, index) => {
    const templateId = `${category}-${index + 1}`;
    const used = state.scenarioFingerprints.some((fingerprint) =>
      fingerprint.startsWith(`${templateId}:`),
    );
    const continuity = category === 'personal' && openThread !== undefined ? 18 : 0;
    const relationshipMemory =
      (category === 'rival' || category === 'social') &&
      relevantRelationship !== undefined &&
      relevantRelationship.factIds.length > 0 &&
      index === relevantRelationship.factIds.length % titles[category].length
        ? Math.min(12, 3 + Math.abs(relevantRelationship.value))
        : 0;
    const reputationRelevance =
      (category === 'operation' || category === 'rival' || category === 'social') &&
      index === Math.abs(state.reputation) % titles[category].length
        ? Math.min(10, Math.abs(state.reputation))
        : 0;
    const contradiction =
      category === 'rival' &&
      index === 2 &&
      state.worldFacts.some((fact) => fact.active && fact.relation === 'forbids-public-challenge');
    const score =
      20 +
      (index === draw.value ? 6 : 0) +
      continuity +
      relationshipMemory +
      reputationRelevance -
      (used ? 80 : 0) -
      (contradiction ? 100 : 0);
    return {
      templateId,
      index,
      score,
      reasons: [
        `category:${category}`,
        used ? 'recent-repetition:-80' : 'novelty:+20',
        continuity > 0 ? 'story-continuity:+18' : 'story-continuity:+0',
        relationshipMemory > 0
          ? `relationship-memory:+${relationshipMemory}`
          : 'relationship-memory:+0',
        reputationRelevance > 0
          ? `reputation-relevance:+${reputationRelevance}`
          : 'reputation-relevance:+0',
        contradiction ? 'contradiction-risk:-100' : 'contradiction-risk:+0',
      ],
    };
  });
  const selected = [...candidates].sort((a, b) => b.score - a.score || a.index - b.index)[0]!;
  const templateChoices = choices[category].map(([id, label, consequence]) => ({
    id: `${id}-t${turn}`,
    label,
    description: consequence,
    consequence,
  }));
  const relationshipContext =
    (category === 'rival' || category === 'social') && relevantRelationship !== undefined
      ? `Their recorded bond is ${relevantRelationship.value >= 0 ? '+' : ''}${relevantRelationship.value} after ${relevantRelationship.factIds.length} shared decision${relevantRelationship.factIds.length === 1 ? '' : 's'}, changing how witnesses read the dispute.`
      : '';
  const licenceContext =
    category === 'operation' || category === 'rival' || category === 'social'
      ? `The squad's ${state.rank} licence and ${state.reputation >= 0 ? '+' : ''}${state.reputation} reputation now shape the terms on offer.`
      : '';
  const selectedPremise = premises[category][selected.index]!;
  const basePremise =
    state.rank === 'Gold' && category === 'rival' && selected.index === 0
      ? selectedPremise.replace('A higher-ranked squad', 'A decorated rival squad')
      : selectedPremise;
  const causalContext = premiseFactIds.map((factId) => {
    const fact = activeFacts.find((candidate) => candidate.id === factId);
    if (fact === undefined) throw new Error(`Scenario premise fact is not active: ${factId}`);
    return causalFactSentence(state, fact);
  });
  const scenario = ScenarioBlueprintSchema.parse({
    id: `scenario-turn-${turn}`,
    templateId: selected.templateId,
    category,
    title: titles[category][selected.index]!,
    premise: [basePremise, ...causalContext, relationshipContext, licenceContext]
      .filter((sentence) => sentence.length > 0)
      .join(' '),
    premiseFactIds,
    castIds:
      category === 'personal'
        ? [cast.id]
        : (category === 'rival' || category === 'social') && relevantRelationship !== undefined
          ? relevantRelationship.characterIds
          : heroes.slice(0, 2).map((hero) => hero.id),
    threatIds:
      category === 'operation' ? encounterForOperationTemplate(selected.templateId).enemyIds : [],
    choices: templateChoices,
    forecast: {
      likelyBenefit: templateChoices[0]!.consequence,
      likelyRisk: templateChoices.at(-1)!.consequence,
      confidence: category === 'discovery' ? 'moderate' : 'high',
    },
    advancesThreadId: category === 'personal' ? openThread?.id : undefined,
    semanticFingerprint: `${selected.templateId}:${cast.id}`,
  });
  return {
    scenario,
    streams: draw.streams,
    debug: candidates.map((candidate) => ({
      templateId: candidate.templateId,
      score: candidate.score,
      selected: candidate.templateId === selected.templateId,
      reasons: candidate.reasons,
    })),
  };
}
