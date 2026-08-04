import { planningRule, PRIORITY_RULES } from '../combat/planning';
import type { CanonicalGameState } from '../model/state';
import type { BattleReport, CombatEvent } from './combat';

export interface BattleCausalBeat {
  label: 'Enemy pressure' | 'Your plan' | 'Turning point';
  title: string;
  detail: string;
}

function damageByActor(events: readonly CombatEvent[], actorIds: ReadonlySet<string>) {
  const totals = new Map<string, number>();
  for (const event of events) {
    if (event.eventType !== 'attack' || !actorIds.has(event.actorId)) continue;
    totals.set(event.actorId, (totals.get(event.actorId) ?? 0) + (event.finalAmount ?? 0));
  }
  return [...totals.entries()].sort(
    ([leftId, left], [rightId, right]) => right - left || leftId.localeCompare(rightId),
  );
}

export function buildBattleCausality(
  state: CanonicalGameState,
  report: BattleReport,
): readonly BattleCausalBeat[] {
  const heroIds = new Set(state.generatedDefinitions.characters.map((hero) => hero.id));
  const enemyIds = new Set(Object.keys(report.hpAtStart).filter((id) => !heroIds.has(id)));
  const [mainEnemy = ['unknown-enemy', 0]] = damageByActor(report.events, enemyIds);
  const enemyName = report.combatantNames[mainEnemy[0]] ?? 'The enemy line';
  const enemyTargets = report.events
    .filter(
      (event) =>
        event.actorId === mainEnemy[0] &&
        event.eventType === 'attack' &&
        (event.finalAmount ?? 0) > 0,
    )
    .flatMap((event) => event.targetIds.slice(0, 1));
  const pressuredHeroId = [...new Set(enemyTargets)][0];
  const pressuredHero =
    pressuredHeroId === undefined
      ? 'the trio'
      : (report.combatantNames[pressuredHeroId] ?? pressuredHeroId);

  const priority = planningRule(PRIORITY_RULES, state.pendingPlan.teamPriorityId ?? 'break-threat');
  const techniqueIds = new Set(
    state.generatedDefinitions.characters.flatMap((hero) => hero.techniqueIds),
  );
  const techniqueCount = report.events.filter(
    (event) => heroIds.has(event.actorId) && techniqueIds.has(event.actionId),
  ).length;
  const reactionCount = report.events.filter(
    (event) =>
      heroIds.has(event.actorId) &&
      (event.ruleTriggers ?? []).some((trigger) => trigger.startsWith('reaction:')),
  ).length;

  const decisive = report.events
    .filter(
      (event) =>
        heroIds.has(event.actorId) && event.eventType === 'attack' && (event.finalAmount ?? 0) > 0,
    )
    .sort(
      (left, right) =>
        (right.finalAmount ?? 0) - (left.finalAmount ?? 0) || left.index - right.index,
    )[0];
  const decisiveActor =
    decisive === undefined
      ? 'The trio'
      : (report.combatantNames[decisive.actorId] ?? decisive.actorId);
  const decisiveAction =
    decisive === undefined
      ? 'held the line'
      : (report.actionNames[decisive.actionId] ?? decisive.actionId.replaceAll('-', ' '));

  return [
    {
      label: 'Enemy pressure',
      title: `${enemyName} dealt ${mainEnemy[1]} total damage`,
      detail: `${pressuredHero} took the focus of its successful attacks.`,
    },
    {
      label: 'Your plan',
      title: priority.label,
      detail: `${priority.effect} The trio used ${techniqueCount} techniques and triggered ${reactionCount} reactions.`,
    },
    {
      label: 'Turning point',
      title: `${decisiveActor}: ${decisiveAction}`,
      detail:
        decisive === undefined
          ? `The battle ended as a ${report.outcome} after ${report.rounds} rounds.`
          : `${decisive.finalAmount ?? 0} damage was the battle’s hardest single hit; the result was ${report.outcome} in ${report.rounds} rounds.`,
    },
  ];
}
