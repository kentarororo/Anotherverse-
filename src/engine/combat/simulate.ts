import type { CombatEvent, BattleReport, AftermathReport, StatusDelta } from '../reports/combat';
import type { CanonicalGameState } from '../model/state';
import type { CombatantDefinition, PartyMemberState, StanceId, StatusState } from '../model/combat';
import type { Position } from '../model/commands';
import type { RngStreamsState } from '../rng/streams';
import { drawFromStream, drawInteger } from '../rng/streams';
import { clampChance, effectiveGuard, maximumHp, mitigateDamage } from './stats';

interface RuntimeCombatant {
  definition: CombatantDefinition;
  hp: number;
  maxHp: number;
  resource: number;
  statuses: StatusState[];
}

interface SimulationResult {
  report: BattleReport;
  aftermath: AftermathReport;
  partyState: Record<string, PartyMemberState>;
  streams: RngStreamsState;
}

function getStatus(actor: RuntimeCombatant, statusId: string): StatusState | undefined {
  return actor.statuses.find((status) => status.statusId === statusId);
}

function applyStatus(
  actor: RuntimeCombatant,
  statusId: string,
  duration: number,
  stacks = 1,
): StatusDelta {
  const existing = getStatus(actor, statusId);
  const delta = {
    statusId,
    stacksBefore: existing?.stacks ?? 0,
    stacksAfter: Math.max(existing?.stacks ?? 0, stacks),
    durationBefore: existing?.duration ?? 0,
    durationAfter: Math.max(existing?.duration ?? 0, duration),
  };
  if (existing === undefined) {
    actor.statuses.push({ statusId, stacks: delta.stacksAfter, duration: delta.durationAfter });
  } else {
    existing.stacks = delta.stacksAfter;
    existing.duration = delta.durationAfter;
  }
  return delta;
}

function living(actors: RuntimeCombatant[], side: 'heroes' | 'enemies') {
  return actors.filter((actor) => actor.definition.side === side && actor.hp > 0);
}

function positionRank(position: Position | undefined): number {
  return position === 'front' ? 0 : position === 'centre' ? 1 : 2;
}

function selectHeroTarget(
  enemies: RuntimeCombatant[],
  priorityId: string | null,
): RuntimeCombatant {
  if (priorityId === 'break-threat') {
    return [...enemies].sort((a, b) => b.definition.threat - a.definition.threat)[0]!;
  }
  if (priorityId === 'focus-weakest') {
    return [...enemies].sort((a, b) => a.hp / a.maxHp - b.hp / b.maxHp)[0]!;
  }
  return enemies[0]!;
}

function chooseEnemyTarget(
  enemyId: string,
  heroes: RuntimeCombatant[],
  positions: Record<string, Position>,
): RuntimeCombatant {
  const direction = enemyId === 'glass-weaver' ? -1 : 1;
  return [...heroes].sort(
    (a, b) =>
      direction *
      (positionRank(positions[a.definition.id]) - positionRank(positions[b.definition.id])),
  )[0]!;
}

function appendEvent(events: CombatEvent[], event: Omit<CombatEvent, 'index'>) {
  events.push({ ...event, index: events.length });
}

function resolveAttack(
  events: CombatEvent[],
  actor: RuntimeCombatant,
  target: RuntimeCombatant,
  actionId: string,
  round: number,
  streams: RngStreamsState,
  stance: StanceId | null,
  targetStance: StanceId | null,
  rawBonus: number,
  statusToApply?: { id: string; duration: number },
  ruleTriggers: string[] = [],
  resourceCost = 0,
): RngStreamsState {
  const strainedPenalty = getStatus(actor, 'strained') === undefined ? 0 : 0.1;
  const tacticalBonus = stance === 'tactical' ? 0.1 : 0;
  const hitChance = clampChance(
    0.72 +
      (actor.definition.stats.focus - target.definition.stats.focus) * 0.02 +
      tacticalBonus -
      strainedPenalty,
  );
  const draw = drawFromStream(streams, 'combat');
  const hit = draw.value < hitChance;
  const aggressiveBonus = stance === 'aggressive' ? 2 : 0;
  const markedBonus = getStatus(target, 'marked') === undefined ? 0 : 2;
  const exposedExploit =
    actor.definition.id === 'dax-ren' && getStatus(target, 'exposed') !== undefined ? 3 : 0;
  const rawAmount = hit
    ? Math.max(
        1,
        actor.definition.stats.power + rawBonus + aggressiveBonus + markedBonus + exposedExploit,
      )
    : 0;
  const guard = effectiveGuard(target.definition.stats, targetStance, target.statuses);
  const beforeWard = hit ? mitigateDamage(rawAmount, guard) : 0;
  const wardReduction = getStatus(target, 'warded') === undefined ? 0 : Math.min(3, beforeWard - 1);
  const priorityReduction = ruleTriggers.includes('protect-rear') ? Math.min(2, beforeWard - 1) : 0;
  const resolvedAmount = Math.max(
    0,
    beforeWard - Math.max(0, wardReduction) - Math.max(0, priorityReduction),
  );
  const hpBefore = target.hp;
  const finalAmount = Math.min(hpBefore, resolvedAmount);
  target.hp = Math.max(0, target.hp - finalAmount);
  const resourceBefore = actor.resource;
  actor.resource =
    resourceCost > 0
      ? Math.max(0, actor.resource - resourceCost)
      : Math.min(actor.definition.maxResource, actor.resource + 1);
  const statusChanges =
    hit && statusToApply !== undefined
      ? [applyStatus(target, statusToApply.id, statusToApply.duration)]
      : [];
  const triggers = [...ruleTriggers];
  if (wardReduction > 0) triggers.push('warded-reduction');
  if (exposedExploit > 0) triggers.push('exploit-exposed');
  if (markedBonus > 0) triggers.push('marked-amplification');

  appendEvent(events, {
    round,
    actorId: actor.definition.id,
    actionId,
    targetIds: [target.definition.id],
    eventType: 'attack',
    hitChance,
    roll: draw.value,
    rawAmount,
    mitigatedAmount: rawAmount - finalAmount,
    finalAmount,
    hpBefore,
    hpAfter: target.hp,
    resourceBefore,
    resourceAfter: actor.resource,
    statusChanges: statusChanges.length > 0 ? statusChanges : undefined,
    ruleTriggers: triggers.length > 0 ? triggers : undefined,
    tags: [actor.definition.side, hit ? 'hit' : 'miss'],
  });
  if (target.hp === 0 && hpBefore > 0) {
    appendEvent(events, {
      round,
      actorId: actor.definition.id,
      actionId: 'defeat',
      targetIds: [target.definition.id],
      eventType: 'defeat',
      hpBefore,
      hpAfter: 0,
      tags: [target.definition.side],
    });
  }
  return draw.streams;
}

function resolveHeal(
  events: CombatEvent[],
  actor: RuntimeCombatant,
  target: RuntimeCombatant,
  round: number,
) {
  const resourceBefore = actor.resource;
  actor.resource -= 2;
  const hpBefore = target.hp;
  const amount = actor.definition.stats.focus + 5;
  target.hp = Math.min(target.maxHp, target.hp + amount);
  const statusChange = applyStatus(target, 'warded', 2);
  appendEvent(events, {
    round,
    actorId: actor.definition.id,
    actionId: 'restorative-sigil',
    targetIds: [target.definition.id],
    eventType: 'heal',
    rawAmount: amount,
    finalAmount: target.hp - hpBefore,
    hpBefore,
    hpAfter: target.hp,
    resourceBefore,
    resourceAfter: actor.resource,
    statusChanges: [statusChange],
    ruleTriggers: ['mending-ward'],
    tags: ['heroes', 'recovery'],
  });
}

function expireStatuses(events: CombatEvent[], actors: RuntimeCombatant[], round: number) {
  for (const actor of actors) {
    for (const status of [...actor.statuses]) {
      const durationBefore = status.duration;
      status.duration -= 1;
      appendEvent(events, {
        round,
        actorId: actor.definition.id,
        actionId: 'end-round',
        targetIds: [actor.definition.id],
        eventType: 'status',
        statusChanges: [
          {
            statusId: status.statusId,
            stacksBefore: status.stacks,
            stacksAfter: status.duration === 0 ? 0 : status.stacks,
            durationBefore,
            durationAfter: status.duration,
          },
        ],
        tags: ['duration'],
      });
      if (status.duration === 0) actor.statuses.splice(actor.statuses.indexOf(status), 1);
    }
  }
}

export function simulateBattle(state: CanonicalGameState): SimulationResult {
  if (state.rngStreams === null || state.currentEncounter === null) {
    throw new Error('A campaign and encounter are required before combat.');
  }
  let streams = state.rngStreams;
  const rngStartPosition = streams.combat.position;
  const events: CombatEvent[] = [];
  const definitions = state.generatedDefinitions.combatants;
  const heroActors = state.generatedDefinitions.characters.map((hero) => {
    const member = state.partyState[hero.id];
    const definition = definitions[hero.id];
    if (member === undefined || definition === undefined)
      throw new Error(`Missing hero combat state: ${hero.id}`);
    return {
      definition,
      hp: member.hp,
      maxHp: member.maxHp,
      resource: member.resource,
      statuses: member.statuses.map((status) => ({ ...status })),
    };
  });
  const enemyActors = state.currentEncounter.enemyIds.map((id) => {
    const definition = definitions[id];
    if (definition === undefined) throw new Error(`Missing enemy definition: ${id}`);
    return {
      definition,
      hp: maximumHp(definition.stats),
      maxHp: maximumHp(definition.stats),
      resource: 0,
      statuses: [] as StatusState[],
    };
  });
  const actors = [...heroActors, ...enemyActors];
  const hpAtStart = Object.fromEntries(actors.map((actor) => [actor.definition.id, actor.hp]));
  const positions = state.pendingPlan.positions;
  const stances = state.pendingPlan.stanceIds;
  let completedRounds = 0;

  for (let round = 1; round <= 12; round += 1) {
    completedRounds = round;
    const initiative: { actor: RuntimeCombatant; score: number }[] = [];
    for (const actor of actors.filter((candidate) => candidate.hp > 0)) {
      const draw = drawInteger(streams, 'combat', 0, 5);
      streams = draw.streams;
      const staggerPenalty = getStatus(actor, 'staggered') === undefined ? 0 : 3;
      initiative.push({ actor, score: actor.definition.stats.speed - staggerPenalty + draw.value });
    }
    initiative.sort(
      (a, b) => b.score - a.score || a.actor.definition.id.localeCompare(b.actor.definition.id),
    );
    const intercepted = new Set<string>();

    for (const entry of initiative) {
      const actor = entry.actor;
      if (
        actor.hp === 0 ||
        living(actors, actor.definition.side === 'heroes' ? 'enemies' : 'heroes').length === 0
      )
        continue;
      if (actor.definition.side === 'heroes') {
        const enemies = living(actors, 'enemies');
        const target = selectHeroTarget(enemies, state.pendingPlan.teamPriorityId);
        const stance = (stances[actor.definition.id] as StanceId | undefined) ?? 'tactical';
        const conserve = state.pendingPlan.teamPriorityId === 'conserve-power';
        if (actor.definition.id === 'sorrel-voss') {
          const wounded = living(actors, 'heroes').sort(
            (a, b) => a.hp / a.maxHp - b.hp / b.maxHp,
          )[0]!;
          const threshold = stance === 'supportive' ? 0.9 : 0.7;
          if (actor.resource >= 2 && wounded.hp / wounded.maxHp < threshold) {
            resolveHeal(events, actor, wounded, round);
            continue;
          }
        }
        let actionId = actor.definition.basicActionId;
        let bonus = actor.definition.id === 'mira-vale' ? -1 : 0;
        let statusToApply: { id: string; duration: number } | undefined;
        let resourceCost = 0;
        const triggers: string[] = [];
        if (actor.definition.id === 'mira-vale' && actor.resource >= 2 && !conserve) {
          actionId = 'aegis-break';
          bonus = 3;
          resourceCost = 2;
          statusToApply = { id: 'exposed', duration: 2 };
        } else if (
          actor.definition.id === 'dax-ren' &&
          actor.resource >= 2 &&
          !conserve &&
          (stance === 'aggressive' || target.hp / target.maxHp <= 0.65)
        ) {
          actionId = 'arc-finish';
          bonus = 8;
          resourceCost = 2;
          triggers.push('conditional-finisher');
        } else if (
          actor.definition.id === 'sorrel-voss' &&
          actor.resource >= 2 &&
          stance === 'tactical' &&
          !conserve
        ) {
          actionId = 'binding-shot';
          bonus = 2;
          resourceCost = 2;
          statusToApply = { id: 'staggered', duration: 2 };
        }
        streams = resolveAttack(
          events,
          actor,
          target,
          actionId,
          round,
          streams,
          stance,
          null,
          bonus,
          statusToApply,
          triggers,
          resourceCost,
        );
      } else {
        const heroes = living(actors, 'heroes');
        let target = chooseEnemyTarget(actor.definition.id, heroes, positions);
        const triggers: string[] = [];
        const rearTargeted = positions[target.definition.id] === 'rear';
        const mira = heroes.find((hero) => hero.definition.id === 'mira-vale');
        if (
          rearTargeted &&
          mira !== undefined &&
          target.definition.id !== mira.definition.id &&
          !intercepted.has('mira-vale')
        ) {
          target = mira;
          intercepted.add('mira-vale');
          triggers.push('rear-intercept');
        }
        if (rearTargeted && state.pendingPlan.teamPriorityId === 'protect-rear')
          triggers.push('protect-rear');
        const special = round % 3 === 1;
        const actionId = special
          ? actor.definition.id === 'rift-hound'
            ? 'breach-charge'
            : 'rending-hex'
          : actor.definition.basicActionId;
        const statusToApply = special
          ? { id: actor.definition.id === 'rift-hound' ? 'strained' : 'marked', duration: 2 }
          : undefined;
        streams = resolveAttack(
          events,
          actor,
          target,
          actionId,
          round,
          streams,
          null,
          (stances[target.definition.id] as StanceId | undefined) ?? null,
          special ? 4 : 0,
          statusToApply,
          triggers,
        );
      }
    }
    expireStatuses(events, actors, round);
    if (living(actors, 'heroes').length === 0 || living(actors, 'enemies').length === 0) break;
  }

  const heroesAlive = living(actors, 'heroes').length > 0;
  const enemiesAlive = living(actors, 'enemies').length > 0;
  const outcome = !enemiesAlive ? 'victory' : !heroesAlive ? 'defeat' : 'round-cap';
  const hpAtEnd = Object.fromEntries(actors.map((actor) => [actor.definition.id, actor.hp]));
  const report: BattleReport = {
    id: `battle-turn-${state.turn}`,
    turn: state.turn,
    outcome,
    rounds: completedRounds,
    events,
    rngStartPosition,
    rngEndPosition: streams.combat.position,
    combatantNames: Object.fromEntries(
      actors.map((actor) => [actor.definition.id, actor.definition.name]),
    ),
    hpAtStart,
    hpAtEnd,
  };
  const experience = outcome === 'victory' ? 25 : 8;
  const partyState = Object.fromEntries(
    heroActors.map((actor) => {
      const previous = state.partyState[actor.definition.id]!;
      const endingHp = Math.max(outcome === 'defeat' ? Math.ceil(actor.maxHp * 0.35) : 1, actor.hp);
      const damageTaken = Math.max(0, previous.hp - actor.hp);
      return [
        actor.definition.id,
        {
          ...previous,
          hp: endingHp,
          resource: actor.resource,
          readiness: Math.max(0, previous.readiness - Math.ceil((damageTaken / actor.maxHp) * 25)),
          experience: previous.experience + experience,
          statuses: [],
        },
      ];
    }),
  );
  const aftermath: AftermathReport = {
    id: `aftermath-turn-${state.turn}`,
    turn: state.turn,
    battleReportId: report.id,
    experienceByCharacter: Object.fromEntries(
      heroActors.map((actor) => [actor.definition.id, experience]),
    ),
    itemIdsGranted: [],
    factIdsWritten: [`fact-breach-result-${state.turn}`],
    threadIdsChanged: [],
    hpByCharacter: Object.fromEntries(
      heroActors.map((actor) => [actor.definition.id, partyState[actor.definition.id]!.hp]),
    ),
    readinessByCharacter: Object.fromEntries(
      heroActors.map((actor) => [actor.definition.id, partyState[actor.definition.id]!.readiness]),
    ),
    suppliesDelta: outcome === 'victory' ? 2 : 0,
    summary:
      outcome === 'victory'
        ? `The squad closed the Glassline Breach in ${completedRounds} rounds.`
        : outcome === 'defeat'
          ? 'The squad was recovered after losing control of the concourse.'
          : 'The squad withdrew when the twelve-round safety limit was reached.',
  };
  return { report, aftermath, partyState, streams };
}
