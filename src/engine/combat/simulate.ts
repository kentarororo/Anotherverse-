import type { CombatEvent, BattleReport, AftermathReport, StatusDelta } from '../reports/combat';
import type { CanonicalGameState } from '../model/state';
import type { CombatantDefinition, PartyMemberState, StanceId, StatusState } from '../model/combat';
import type { Position } from '../model/commands';
import type { RngStreamsState } from '../rng/streams';
import { drawFromStream, drawInteger } from '../rng/streams';
import {
  clampChance,
  directDamageLimitationPenalty,
  effectiveGuard,
  maximumHp,
  mitigateDamage,
  scaledEnemyStats,
} from './stats';
import { selectHeroAction } from './policy';
import {
  EXECUTABLE_TECHNIQUES,
  type ExecutableTechniqueContract,
} from '../model/executable-technique';

interface RuntimeCombatant {
  definition: CombatantDefinition;
  hp: number;
  maxHp: number;
  resource: number;
  statuses: StatusState[];
  mastered: boolean;
  equipmentCounterTags: string[];
  cooldowns: Record<string, number>;
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

function techniqueCost(actor: RuntimeCombatant, actionId: string, fallback: number): number {
  return actor.definition.techniqueCosts?.[actionId] ?? fallback;
}

function executableTechnique(
  actor: RuntimeCombatant,
  actionId: string,
): ExecutableTechniqueContract | undefined {
  const role = actor.definition.policyId;
  if (role !== 'vanguard' && role !== 'striker' && role !== 'support') return undefined;
  return EXECUTABLE_TECHNIQUES[role].find((technique) => technique.id === actionId);
}

function effectNumber(contract: ExecutableTechniqueContract, key: string): number {
  const value = contract.effect[key];
  if (typeof value !== 'number') throw new Error(`Technique ${contract.id} lacks numeric ${key}.`);
  return value;
}

function effectString(contract: ExecutableTechniqueContract, key: string): string {
  const value = contract.effect[key];
  if (typeof value !== 'string') throw new Error(`Technique ${contract.id} lacks text ${key}.`);
  return value;
}

function techniqueReady(actor: RuntimeCombatant, actionId: string): boolean {
  return (actor.cooldowns[actionId] ?? 0) === 0;
}

function startTechniqueCooldown(actor: RuntimeCombatant, actionId: string): number {
  const rounds =
    actor.definition.techniqueCooldowns?.[actionId] ??
    executableTechnique(actor, actionId)?.cooldownRounds ??
    0;
  if (rounds > 0) actor.cooldowns[actionId] = rounds;
  return rounds;
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
  policyId: CombatantDefinition['policyId'],
  heroes: RuntimeCombatant[],
  positions: Record<string, Position>,
): RuntimeCombatant {
  const direction = policyId === 'hexer' ? -1 : 1;
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
  actorPosition: Position | null,
  targetPosition: Position | null,
  rawBonus: number,
  statusToApply?: { id: string; duration: number },
  ruleTriggers: string[] = [],
  resourceCost = 0,
): RngStreamsState {
  const strainedPenalty = getStatus(actor, 'strained') === undefined ? 0 : 0.1;
  const tacticalBonus = stance === 'tactical' ? 0.12 : 0;
  const rearBonus = actorPosition === 'rear' ? 0.05 : 0;
  const hitChance = clampChance(
    0.72 +
      (actor.definition.stats.focus - target.definition.stats.focus) * 0.02 +
      tacticalBonus +
      rearBonus -
      strainedPenalty,
  );
  const draw = drawFromStream(streams, 'combat');
  const hit = draw.value < hitChance;
  const aggressiveBonus = stance === 'aggressive' ? 3 : 0;
  const supportivePenalty = stance === 'supportive' ? 2 : 0;
  const inspiredBonus = getStatus(actor, 'inspired') === undefined ? 0 : 2;
  const markedBonus = getStatus(target, 'marked') === undefined ? 0 : 2;
  const limitationPenalty = directDamageLimitationPenalty(actor.definition.limitationRuleId);
  const exposedExploit =
    actor.definition.signatureRuleId === 'exploit-exposed' &&
    getStatus(target, 'exposed') !== undefined
      ? 3
      : 0;
  const rawAmount = hit
    ? Math.max(
        1,
        actor.definition.stats.power +
          rawBonus +
          aggressiveBonus +
          inspiredBonus +
          markedBonus +
          exposedExploit -
          supportivePenalty -
          limitationPenalty,
      )
    : 0;
  const guard =
    effectiveGuard(target.definition.stats, targetStance, target.statuses) +
    (targetPosition === 'front' ? 2 : 0);
  const beforeWard = hit ? mitigateDamage(rawAmount, guard) : 0;
  const wardReduction = getStatus(target, 'warded') === undefined ? 0 : Math.min(3, beforeWard - 1);
  const priorityReduction = ruleTriggers.includes('protect-rear') ? Math.min(2, beforeWard - 1) : 0;
  const equipmentReduction = target.equipmentCounterTags.includes(actor.definition.policyId)
    ? Math.min(2, beforeWard - 1)
    : 0;
  const resolvedAmount = Math.max(
    0,
    beforeWard -
      Math.max(0, wardReduction) -
      Math.max(0, priorityReduction) -
      Math.max(0, equipmentReduction),
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
  if (actor.definition.limitationRuleId === 'low-direct-output') {
    triggers.push('limitation:low-direct-output');
  }
  if (actor.definition.limitationRuleId === 'measured-strikes') {
    triggers.push('limitation:measured-strikes');
  }
  if (target.definition.limitationRuleId === 'open-guard' && targetStance === 'aggressive') {
    triggers.push('limitation:open-guard');
  }
  if (equipmentReduction > 0) triggers.push(`equipment-counter:${actor.definition.policyId}`);

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
  actionId: string,
  stance: StanceId,
) {
  const contract = executableTechnique(actor, actionId);
  if (contract === undefined) throw new Error(`Unknown executable heal technique: ${actionId}.`);
  const cost = techniqueCost(actor, actionId, contract.resourceCost);
  const resourceBefore = actor.resource;
  actor.resource -= cost;
  const recoveryLoop = actor.definition.reactionRuleId === 'recovery-loop';
  if (recoveryLoop) actor.resource = Math.min(actor.definition.maxResource, actor.resource + 1);
  const hpBefore = target.hp;
  const amount =
    actor.definition.stats.focus +
    effectNumber(contract, 'focusBonusHp') +
    (stance === 'supportive' ? 2 : 0);
  target.hp = Math.min(target.maxHp, target.hp + amount);
  const statusChanges = [
    applyStatus(
      target,
      'warded',
      actor.mastered
        ? effectNumber(contract, 'masteryWardRounds')
        : effectNumber(contract, 'wardRounds'),
    ),
    applyStatus(target, 'inspired', effectNumber(contract, 'inspiredRounds')),
  ];
  appendEvent(events, {
    round,
    actorId: actor.definition.id,
    actionId,
    targetIds: [target.definition.id],
    eventType: 'heal',
    rawAmount: amount,
    finalAmount: target.hp - hpBefore,
    hpBefore,
    hpAfter: target.hp,
    resourceBefore,
    resourceAfter: actor.resource,
    statusChanges,
    ruleTriggers: [
      'mending-ward',
      ...(recoveryLoop ? ['reaction:recovery-loop'] : []),
      `cooldown-set:${startTechniqueCooldown(actor, actionId)}`,
    ],
    tags: ['heroes', 'recovery'],
  });
}

function resolveGuard(
  events: CombatEvent[],
  actor: RuntimeCombatant,
  target: RuntimeCombatant,
  round: number,
  actionId: string,
) {
  const contract = executableTechnique(actor, actionId);
  if (contract === undefined) throw new Error(`Unknown executable guard technique: ${actionId}.`);
  const cost = techniqueCost(actor, actionId, contract.resourceCost);
  const resourceBefore = actor.resource;
  actor.resource = Math.max(0, actor.resource - cost);
  const statusChange = applyStatus(target, 'warded', effectNumber(contract, 'wardRounds'));
  appendEvent(events, {
    round,
    actorId: actor.definition.id,
    actionId,
    targetIds: [target.definition.id],
    eventType: 'guard',
    finalAmount: effectNumber(contract, 'ward'),
    resourceBefore,
    resourceAfter: actor.resource,
    statusChanges: [statusChange],
    ruleTriggers: ['protect-rear', `cooldown-set:${startTechniqueCooldown(actor, actionId)}`],
    tags: ['heroes', 'protection'],
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
  for (const actor of actors) {
    for (const [actionId, remaining] of Object.entries(actor.cooldowns)) {
      actor.cooldowns[actionId] = Math.max(0, remaining - 1);
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
    const baseDefinition = definitions[hero.id];
    if (member === undefined || baseDefinition === undefined)
      throw new Error(`Missing hero combat state: ${hero.id}`);
    const equipped = Object.values(member.equipment).flatMap((id) => {
      const item = id === null ? undefined : state.generatedDefinitions.items[id];
      return item === undefined ? [] : [item];
    });
    const definition = {
      ...baseDefinition,
      stats: {
        ...baseDefinition.stats,
        power:
          baseDefinition.stats.power + equipped.reduce((sum, item) => sum + item.powerBonus, 0),
        guard:
          baseDefinition.stats.guard + equipped.reduce((sum, item) => sum + item.guardBonus, 0),
      },
    };
    return {
      definition,
      hp: member.hp,
      maxHp: member.maxHp,
      resource: member.resource,
      statuses: member.statuses.map((status) => ({ ...status })),
      mastered: member.learnedTechniqueIds.some((id) => id.endsWith('-awakening')),
      equipmentCounterTags: equipped.map((item) => item.counterTag),
      cooldowns: {},
    };
  });
  const enemyActors = state.currentEncounter.enemyIds.map((id) => {
    const baseDefinition = definitions[id];
    if (baseDefinition === undefined) throw new Error(`Missing enemy definition: ${id}`);
    const definition = {
      ...baseDefinition,
      stats: scaledEnemyStats(baseDefinition.stats, state.turn),
    };
    return {
      definition,
      hp: maximumHp(definition.stats),
      maxHp: maximumHp(definition.stats),
      resource: 0,
      statuses: [] as StatusState[],
      mastered: false,
      equipmentCounterTags: [],
      cooldowns: {},
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
      const stance = stances[actor.definition.id] as StanceId | undefined;
      const heroInitiative =
        actor.definition.side === 'heroes'
          ? (positions[actor.definition.id] === 'centre' ? 1 : 0) +
            (stance === 'tactical' ? 1 : stance === 'guarded' ? -1 : 0)
          : 0;
      initiative.push({
        actor,
        score: actor.definition.stats.speed - staggerPenalty + heroInitiative + draw.value,
      });
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
        const wounded = living(actors, 'heroes').sort(
          (a, b) => a.hp / a.maxHp - b.hp / b.maxHp,
        )[0]!;
        const firstTechnique = actor.definition.techniqueIds[0];
        const secondTechnique = actor.definition.techniqueIds[1];
        const selectedAction = selectHeroAction({
          policyId: actor.definition.policyId,
          basicActionId: actor.definition.basicActionId,
          firstTechniqueId: firstTechnique,
          secondTechniqueId: secondTechnique,
          resource: actor.resource,
          firstTechniqueCost:
            firstTechnique === undefined ? 0 : techniqueCost(actor, firstTechnique, 2),
          secondTechniqueCost:
            secondTechnique === undefined ? 0 : techniqueCost(actor, secondTechnique, 1),
          firstTechniqueReady:
            firstTechnique === undefined ? false : techniqueReady(actor, firstTechnique),
          secondTechniqueReady:
            secondTechnique === undefined ? false : techniqueReady(actor, secondTechnique),
          stance,
          position: positions[actor.definition.id] ?? 'centre',
          teamPriorityId: state.pendingPlan.teamPriorityId,
          woundedAllyRatio: wounded.hp / wounded.maxHp,
          targetHpRatio: target.hp / target.maxHp,
        });

        if (selectedAction.kind === 'heal') {
          resolveHeal(events, actor, wounded, round, selectedAction.actionId, stance);
          continue;
        }
        if (selectedAction.kind === 'guard') {
          const frontHero = living(actors, 'heroes').sort(
            (a, b) =>
              positionRank(positions[a.definition.id]) - positionRank(positions[b.definition.id]),
          )[0]!;
          resolveGuard(events, actor, frontHero, round, selectedAction.actionId);
          continue;
        }

        const actionId = selectedAction.actionId;
        let bonus = 0;
        let statusToApply: { id: string; duration: number } | undefined;
        let resourceCost = 0;
        const triggers: string[] = [];
        const techniqueContract = executableTechnique(actor, actionId);
        if (actor.definition.policyId === 'vanguard' && actionId === firstTechnique) {
          if (techniqueContract === undefined) throw new Error(`Unknown technique: ${actionId}.`);
          bonus = effectNumber(techniqueContract, 'bonusPower');
          resourceCost = techniqueCost(actor, actionId, techniqueContract.resourceCost);
          statusToApply = {
            id: effectString(techniqueContract, 'status'),
            duration: effectNumber(techniqueContract, 'statusRounds'),
          };
        } else if (actor.definition.policyId === 'striker' && actionId === firstTechnique) {
          if (techniqueContract === undefined) throw new Error(`Unknown technique: ${actionId}.`);
          bonus = actor.mastered
            ? effectNumber(techniqueContract, 'masteryBonusPower')
            : effectNumber(techniqueContract, 'bonusPower');
          resourceCost = techniqueCost(actor, actionId, techniqueContract.resourceCost);
          triggers.push('conditional-finisher');
        } else if (actor.definition.policyId === 'striker' && actionId === secondTechnique) {
          if (techniqueContract === undefined) throw new Error(`Unknown technique: ${actionId}.`);
          bonus = effectNumber(techniqueContract, 'bonusPower');
          resourceCost = techniqueCost(actor, actionId, techniqueContract.resourceCost);
          triggers.push('cross-step-route');
        } else if (actor.definition.policyId === 'support' && actionId === secondTechnique) {
          if (techniqueContract === undefined) throw new Error(`Unknown technique: ${actionId}.`);
          bonus = effectNumber(techniqueContract, 'bonusPower');
          resourceCost = techniqueCost(actor, actionId, techniqueContract.resourceCost);
          statusToApply = {
            id: effectString(techniqueContract, 'status'),
            duration: effectNumber(techniqueContract, 'statusRounds'),
          };
        }
        if (
          actor.definition.reactionRuleId === 'finisher-surge' &&
          triggers.includes('conditional-finisher')
        ) {
          const statusChange = applyStatus(actor, 'inspired', 2);
          appendEvent(events, {
            round,
            actorId: actor.definition.id,
            actionId: 'finisher-surge',
            targetIds: [actor.definition.id],
            eventType: 'status',
            statusChanges: [statusChange],
            ruleTriggers: ['reaction:finisher-surge'],
            tags: ['heroes', 'reaction'],
          });
        }
        if (resourceCost > 0) {
          triggers.push(`cooldown-set:${startTechniqueCooldown(actor, actionId)}`);
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
          positions[actor.definition.id] ?? 'centre',
          null,
          bonus,
          statusToApply,
          triggers,
          resourceCost,
        );
      } else {
        const heroes = living(actors, 'heroes');
        let target = chooseEnemyTarget(actor.definition.policyId, heroes, positions);
        const triggers: string[] = [];
        const rearTargeted = positions[target.definition.id] === 'rear';
        const interceptor = heroes.find(
          (hero) => hero.definition.signatureRuleId === 'rear-intercept',
        );
        if (
          rearTargeted &&
          interceptor !== undefined &&
          positions[interceptor.definition.id] === 'front' &&
          target.definition.id !== interceptor.definition.id &&
          !intercepted.has(interceptor.definition.id)
        ) {
          target = interceptor;
          if (!interceptor.mastered) intercepted.add(interceptor.definition.id);
          triggers.push('rear-intercept');
          if (interceptor.definition.reactionRuleId === 'intercept-brace') {
            const statusChange = applyStatus(interceptor, 'warded', 1);
            appendEvent(events, {
              round,
              actorId: interceptor.definition.id,
              actionId: 'intercept-brace',
              targetIds: [interceptor.definition.id],
              eventType: 'guard',
              finalAmount: 3,
              statusChanges: [statusChange],
              ruleTriggers: ['reaction:intercept-brace'],
              tags: ['heroes', 'reaction'],
            });
          }
        }
        if (rearTargeted && state.pendingPlan.teamPriorityId === 'protect-rear')
          triggers.push('protect-rear');
        const special = round % 3 === 1;
        const actionId = special
          ? actor.definition.policyId === 'charger'
            ? 'breach-charge'
            : 'rending-hex'
          : actor.definition.basicActionId;
        const statusToApply = special
          ? {
              id: actor.definition.policyId === 'charger' ? 'strained' : 'marked',
              duration: 2,
            }
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
          null,
          positions[target.definition.id] ?? 'centre',
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
    actionNames: Object.fromEntries(
      state.generatedDefinitions.characters.flatMap((character) =>
        character.techniques.map((technique) => [technique.id, technique.name]),
      ),
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
      const nextExperience = previous.experience + experience;
      const nextLevel = 1 + Math.floor(nextExperience / 50);
      return [
        actor.definition.id,
        {
          ...previous,
          hp: endingHp,
          resource: actor.resource,
          readiness: Math.max(0, previous.readiness - Math.ceil((damageTaken / actor.maxHp) * 25)),
          experience: nextExperience,
          level: nextLevel,
          callingRank: 1 + Math.floor(nextLevel / 2),
          trainingPoints: previous.trainingPoints + Math.max(0, nextLevel - previous.level),
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
    factIdsWritten: [`fact-trial-result-${state.turn}`],
    threadIdsChanged: [],
    hpByCharacter: Object.fromEntries(
      heroActors.map((actor) => [actor.definition.id, partyState[actor.definition.id]!.hp]),
    ),
    readinessByCharacter: Object.fromEntries(
      heroActors.map((actor) => [actor.definition.id, partyState[actor.definition.id]!.readiness]),
    ),
    suppliesDelta: outcome === 'victory' ? 2 : 0,
    reputationDelta: outcome === 'victory' ? 3 : outcome === 'defeat' ? -2 : 0,
    dangerDelta: outcome === 'victory' ? 3 : outcome === 'defeat' ? 8 : 5,
    bondDelta: 0,
    summary:
      outcome === 'victory'
        ? `The trio won the battle in ${completedRounds} rounds.`
        : outcome === 'defeat'
          ? 'The enemy broke the formation and forced the trio to retreat.'
          : 'Neither side won before the trio withdrew at the twelve-round limit.',
  };
  return { report, aftermath, partyState, streams };
}
