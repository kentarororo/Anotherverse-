import type { CampaignScenePlan, EnemyPackage } from '../model/campaign-plan';
import type { CanonicalGameState } from '../model/state';
import { ScenarioBlueprintSchema, type ScenarioBlueprint } from '../model/scenario';
import type { WorldFact } from '../model/world';
import type { RngStreamsState } from '../rng/streams';

const BEHAVIOUR_ENEMIES: Readonly<Record<EnemyPackage['behavior'], readonly string[]>> = {
  press: ['rift-hound', 'drowned-lancer'],
  guard: ['ironback-mauler'],
  drain: ['glass-weaver', 'bell-wraith'],
  ambush: ['storm-jackal'],
  summon: ['signal-leech'],
  counter: ['survey-beast'],
  execute: ['veil-scribe'],
  disrupt: ['mirror-oracle'],
};

function previousResult(state: CanonicalGameState, turn: number): WorldFact | undefined {
  return state.worldFacts.find(
    (candidate) =>
      candidate.active &&
      candidate.id === `fact-scenario-result-${turn - 1}` &&
      candidate.createdTurn === turn - 1,
  );
}

function earlierCallback(state: CanonicalGameState, turn: number): WorldFact | undefined {
  if (turn < 5) return undefined;
  return state.worldFacts.find(
    (candidate) => candidate.active && candidate.id === `fact-scenario-result-${turn - 3}`,
  );
}

function firstSentence(value: unknown): string {
  const text = String(value ?? '').trim();
  return text.match(/^.*?[.!?](?:\s|$)/)?.[0]?.trim() ?? text;
}

function priorChoiceBridge(fact: WorldFact | undefined): string {
  const relation = fact?.relation ?? '';
  const turn = Math.max(1, Math.min(5, fact?.createdTurn ?? 1));
  if (relation.includes('hold-the-line')) {
    return [
      "The first road remains open after the party's stand.",
      'The new alliance survives because the party held its ground.',
      'The relic trail remains clear behind the shield wall.',
      'The route to the enemy survives the last attack.',
      'The way into the final battle is still open.',
    ][turn - 1]!;
  }
  if (relation.includes('hunt-the-weakness')) {
    return [
      'The first enemy line is still reeling from the attack.',
      'The new allies follow the weakness they uncovered together.',
      'The wounded enemy leaves a clear trail toward the relic.',
      'The enemy has not recovered from the fight for the relic.',
      'The broken guard line leaves the final road exposed.',
    ][turn - 1]!;
  }
  if (relation.includes('keep-the-promise')) {
    return [
      'The first witnesses point the party toward safety.',
      'The person protected by the new alliance reveals the next road.',
      'The rescued keeper shows the party where the relic was taken.',
      "The party's kept promise earns passage to the final road.",
      "Those protected along the way now guard the party's retreat.",
    ][turn - 1]!;
  }
  if (relation.includes('seize-the-opening')) {
    return [
      'The party follows the opening made during the first clash.',
      'The new allies press the advantage before it can close.',
      'The ground won beside the relic shortens the chase.',
      'The relic opens a dangerous but direct route forward.',
      'The party reaches the final approach before the enemy is ready.',
    ][turn - 1]!;
  }
  return firstSentence(fact?.value ?? 'The party follows the road opened by the last chapter.');
}

function earlierChoiceCallback(fact: WorldFact | undefined): string {
  const relation = fact?.relation ?? '';
  if (relation.includes('hold-the-line')) {
    return fact?.createdTurn === 2
      ? 'The road defended when the first ally joined remains open.'
      : 'The ground held when the full party formed is still secure.';
  }
  if (relation.includes('hunt-the-weakness')) {
    return fact?.createdTurn === 2
      ? 'The weakness found by the first two allies gives them another opening.'
      : 'The weakness exposed when the full party formed has not healed.';
  }
  if (relation.includes('keep-the-promise')) {
    return fact?.createdTurn === 2
      ? "The first ally's protected witness returns the favor."
      : 'Someone saved when the full party formed now opens a safe path.';
  }
  if (relation.includes('seize-the-opening')) {
    return fact?.createdTurn === 2
      ? "The first alliance's bold advance shortens the final approach, but its debt follows them."
      : 'The ground won when the full party formed brings them closer, with enemies at their backs.';
  }
  return '';
}

function nonCombatStakes(state: CanonicalGameState, turn: number): string {
  const antagonist = state.campaignPlan!.antagonist.title;
  if (turn <= 3) {
    return `The next clue is exposed. If the party waits, ${antagonist} will reach it first.`;
  }
  if (turn === 4) {
    return `The relic is changing. ${antagonist} is already moving to claim it.`;
  }
  return `The final road is opening. If the party loses time, ${antagonist} will close it again.`;
}

function actualCast(state: CanonicalGameState, turn: number): string[] {
  const [lead, firstCompanion, secondCompanion] = state.generatedDefinitions.characters;
  if (lead === undefined) throw new Error('A compiled campaign requires its chosen hero.');
  if (turn === 1) return [lead.id];
  if (turn === 2) return [lead.id, ...(firstCompanion ? [firstCompanion.id] : [])];
  return [
    lead.id,
    ...(firstCompanion ? [firstCompanion.id] : []),
    ...(secondCompanion ? [secondCompanion.id] : []),
  ];
}

function enemyIds(scene: CampaignScenePlan, callback?: WorldFact): string[] {
  if (scene.encounter === null) return [];
  const used = new Set<string>();
  const selected =
    scene.encounter?.enemies.map((enemy, index) => {
      const pool = BEHAVIOUR_ENEMIES[enemy.behavior];
      const selected = pool[(enemy.tier + index) % pool.length]!;
      if (!used.has(selected)) {
        used.add(selected);
        return selected;
      }
      const fallback = Object.values(BEHAVIOUR_ENEMIES)
        .flat()
        .find((id) => !used.has(id));
      const resolved = fallback ?? selected;
      used.add(resolved);
      return resolved;
    }) ?? [];
  const desiredCount = scene.turn === 6 ? 3 : scene.turn >= 3 ? 2 : 1;
  const fallbacks = Object.values(BEHAVIOUR_ENEMIES).flat();
  while (selected.length < desiredCount) {
    const fallback = fallbacks.find((id) => !used.has(id));
    if (fallback === undefined) break;
    selected.push(fallback);
    used.add(fallback);
  }
  const boldEarlierChoice =
    callback?.relation.includes('hunt-the-weakness') ||
    callback?.relation.includes('seize-the-opening');
  if (boldEarlierChoice) {
    const reinforcement = fallbacks.find((id) => !used.has(id));
    if (reinforcement !== undefined) selected.push(reinforcement);
  }
  return selected;
}

function choiceEffects(turn: number, bold: boolean) {
  return {
    renownDelta: bold ? 2 : 1,
    provisionsDelta: bold && turn === 4 ? -1 : 0,
    dangerDelta: bold ? 1 : -1,
    bondDelta: turn >= 2 && turn <= 4 ? (bold ? 2 : 1) : 0,
  };
}

function choicesFor(scene: CampaignScenePlan, turn: number) {
  if (scene.encounter !== null) {
    return [
      {
        id: `hold-the-line-t${turn}`,
        label: 'Hold the line',
        description: `Protect the party against ${scene.encounter.enemies.map((enemy) => enemy.title).join(' and ')}.`,
        consequence: `${scene.outcomeText} The party holds together and protects the road behind them.`,
        outcomeConsequences: {
          victory: `${scene.outcomeText} The party holds together and protects the road behind them.`,
          defeat: `The party is forced back. ${scene.reward.title} remains in enemy hands, and the threat advances.`,
          roundCap: `Neither side can hold the field. The party escapes, but ${scene.reward.title} remains unclaimed.`,
        },
        encounterId: scene.encounter.id,
        effects: choiceEffects(turn, false),
      },
      {
        id: `hunt-the-weakness-t${turn}`,
        label: 'Hunt the weakness',
        description: 'Take the dangerous route and strike the enemy before it can settle.',
        consequence: `${scene.outcomeText} The quick attack exposes the enemy, but it leaves the party owing a debt.`,
        outcomeConsequences: {
          victory: `${scene.outcomeText} The quick attack exposes the enemy, but it leaves the party owing a debt.`,
          defeat: `The attack fails, and the party retreats before the enemy can surround them.`,
          roundCap:
            'The enemy escapes the trap. Both sides leave wounded, and the debt remains unpaid.',
        },
        encounterId: scene.encounter.id,
        effects: choiceEffects(turn, true),
      },
    ];
  }
  return [
    {
      id: `keep-the-promise-t${turn}`,
      label: 'Keep the promise',
      description: 'Protect the people involved, even if the enemy gains time.',
      consequence: `${scene.outcomeText} The party keeps its word, and witnesses remember it.`,
      effects: choiceEffects(turn, false),
    },
    {
      id: `seize-the-opening-t${turn}`,
      label: 'Seize the opening',
      description: 'Move quickly and accept the risk of leaving someone angry behind.',
      consequence: `${scene.outcomeText} The party gains ground, but the choice leaves a debt behind.`,
      effects: choiceEffects(turn, true),
    },
  ];
}

/**
 * Realises one immutable CampaignPlan scene. The compiler owns causality and content
 * compatibility; the director only binds the current roster and recorded results.
 */
export function selectNextScenario(
  state: CanonicalGameState,
  turn: number,
  streams: RngStreamsState,
): {
  scenario: ScenarioBlueprint;
  streams: RngStreamsState;
  debug: CanonicalGameState['directorDebug'];
} {
  const plan = state.campaignPlan;
  if (plan === null) throw new Error('A compiled campaign plan is required.');
  const planned = plan.scenes[turn - 1];
  if (planned === undefined) throw new Error(`Campaign ${plan.arc.id} ends after Turn 6.`);
  const prior = previousResult(state, turn);
  const callback = earlierCallback(state, turn);
  const callbackText = earlierChoiceCallback(callback);
  const cause =
    turn === 1
      ? plan.world.mortalOrder
      : [priorChoiceBridge(prior), callbackText].filter(Boolean).join(' ');
  const castIds = actualCast(state, turn);
  const castNames = castIds.map(
    (id) => state.generatedDefinitions.characters.find((hero) => hero.id === id)?.name ?? id,
  );
  const firstCompanion = state.generatedDefinitions.characters[1];
  const secondCompanion = state.generatedDefinitions.characters[2];
  const hook =
    turn === 1
      ? `${castNames[0]} reaches the first sign of danger. ${planned.prose}`
      : turn === 2
        ? `${castNames[0]} meets ${castNames[1]} on the road ahead. ${castNames[1]}'s Mythic Awakening, ${firstCompanion?.callingName ?? 'an unnamed power'}, answers the danger. ${planned.prose}`
        : turn === 3
          ? `${castNames[2]} makes a stand as the others arrive. ${castNames[2]}'s Mythic Awakening, ${secondCompanion?.callingName ?? 'an unnamed power'}, changes the battle. ${planned.prose}`
          : planned.prose;
  const threats = enemyIds(planned, callback);
  const choices = choicesFor(planned, turn);
  const category = planned.encounter !== null ? 'operation' : turn === 2 ? 'personal' : 'discovery';
  const act = Math.min(3, Math.ceil(turn / 2));
  const actTitle = act === 1 ? 'The Omen' : act === 2 ? 'The Awakening' : 'The Reckoning';
  const premiseFactIds =
    turn === 1
      ? state.worldFacts.slice(0, 2).map((fact) => fact.id)
      : [prior?.id ?? state.worldFacts[0]!.id, state.worldFacts[0]!.id];

  const scenario = ScenarioBlueprintSchema.parse({
    id: `scenario-turn-${turn}`,
    templateId: planned.id,
    category,
    title: planned.title,
    premise: [hook, cause, planned.encounter?.stakes ?? nonCombatStakes(state, turn)]
      .filter(Boolean)
      .join(' '),
    sceneBeats: {
      hook,
      cause,
      stakes: planned.encounter?.stakes ?? nonCombatStakes(state, turn),
      decision:
        planned.encounter === null
          ? 'Choose how the party answers.'
          : 'Set formation, stances, and target priority before the battle.',
    },
    quest: {
      id: `campaign-${plan.arc.id}`,
      title: plan.arc.title,
      act,
      actTitle,
      objective: planned.title,
      chapter: turn,
      totalChapters: 6,
    },
    premiseFactIds,
    castIds,
    threatIds: threats,
    choices,
    forecast: {
      likelyBenefit: `Earn ${planned.reward.title}.`,
      likelyRisk: planned.encounter?.stakes ?? plan.antagonist.escalation,
      confidence: turn >= 5 ? 'moderate' : 'high',
    },
    advancesThreadId: turn === 2 ? `thread-personal-${castIds[1] ?? castIds[0]}` : undefined,
    semanticFingerprint: `${plan.structuralFingerprint}:turn-${turn}`,
  });

  return {
    scenario,
    streams,
    debug: [
      {
        templateId: planned.id,
        score: 100,
        selected: true,
        reasons: [
          `world:${plan.world.id}`,
          `arc:${plan.arc.id}`,
          `agenda:${plan.antagonist.id}`,
          `requires:${planned.transition.requires.map((fact) => `${fact.key}.${fact.state}`).join(',')}`,
          `produces:${planned.transition.produces.map((fact) => `${fact.key}.${fact.state}`).join(',')}`,
        ],
      },
    ],
  };
}

export function plannedEnemyIds(scene: CampaignScenePlan): string[] {
  return enemyIds(scene);
}
