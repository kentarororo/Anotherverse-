import type { CanonicalGameState } from '../model/state';
import type { ScenarioForecast, StanceId, TeamPriorityId } from '../model/combat';
import { scaledEnemyStats } from './stats';

const stanceScores: Record<StanceId, number> = {
  aggressive: 3,
  guarded: 2,
  tactical: 2,
  supportive: 1,
};

export function calculateForecast(state: CanonicalGameState): ScenarioForecast {
  const recruitedIds = new Set(state.recruitedCharacterIds);
  const heroes = state.generatedDefinitions.characters.filter((hero) => recruitedIds.has(hero.id));
  const enemyIds = state.currentEncounter?.enemyIds ?? [];
  const enemies = enemyIds.flatMap((id) => {
    const enemy = state.generatedDefinitions.enemies[id];
    return enemy === undefined ? [] : [enemy];
  });
  const stanceTotal = heroes.reduce((total, hero) => {
    const stance = state.pendingPlan.stanceIds[hero.id] as StanceId | undefined;
    return total + (stance === undefined ? 0 : stanceScores[stance]);
  }, 0);
  const formationScore = heroes.reduce((total, hero) => {
    const position = state.pendingPlan.positions[hero.id];
    if (hero.role === 'vanguard') return total + (position === 'front' ? 4 : -3);
    if (hero.role === 'striker') return total + (position === 'front' ? -3 : 2);
    return total + (position === 'rear' ? 2 : 0);
  }, 0);
  const priority = state.pendingPlan.teamPriorityId as TeamPriorityId | null;
  const priorityScore = priority === 'break-threat' || priority === 'focus-weakest' ? 3 : 2;
  const currentHpRatio = heroes.reduce((total, hero) => {
    const member = state.partyState[hero.id];
    return total + (member === undefined ? 0 : member.hp / member.maxHp);
  }, 0);
  const heroScore = heroes.reduce((total, hero) => {
    const member = state.partyState[hero.id];
    const equipment = Object.values(member?.equipment ?? {}).flatMap((itemId) => {
      const item = itemId === null ? undefined : state.generatedDefinitions.items[itemId];
      return item === undefined ? [] : [item];
    });
    return (
      total +
      hero.stats.power +
      hero.stats.guard +
      hero.stats.focus +
      equipment.reduce((sum, item) => sum + item.powerBonus + item.guardBonus, 0)
    );
  }, 0);
  const enemyScore = enemies.reduce((total, enemy) => {
    const stats = scaledEnemyStats(enemy.stats, state.turn);
    return total + stats.power + stats.guard + enemy.threat;
  }, 0);
  const score = Math.round(
    heroScore * 0.45 +
      stanceTotal +
      formationScore +
      priorityScore +
      currentHpRatio * 6 -
      enemyScore * 0.55,
  );
  const victoryBand = score >= 24 ? 'favoured' : score >= 15 ? 'contested' : 'precarious';
  const striker = heroes.find((hero) => hero.role === 'striker');
  const highestThreat = [...enemies].sort((a, b) => b.threat - a.threat)[0];
  const charger = enemies.find((enemy) => enemy.policyId === 'charger');
  const hexer = enemies.find((enemy) => enemy.policyId === 'hexer');
  const guardedCount = Object.values(state.pendingPlan.stanceIds).filter(
    (stance) => stance === 'guarded',
  ).length;
  const enemyPower = enemies.reduce(
    (total, enemy) => total + scaledEnemyStats(enemy.stats, state.turn).power,
    0,
  );
  const incomingBase = Math.max(
    16,
    enemyPower + 10 - guardedCount * 5 - (priority === 'protect-rear' ? 4 : 0),
  );
  const encounterKnowledge = enemyIds.map((id) => state.bestiary[id]?.knowledge ?? 0);
  const lowestKnowledge = encounterKnowledge.length > 0 ? Math.min(...encounterKnowledge) : 0;
  const confidence = lowestKnowledge >= 2 ? 'high' : lowestKnowledge === 1 ? 'moderate' : 'low';
  const equippedCounters = heroes.flatMap((hero) => {
    const member = state.partyState[hero.id];
    if (member === undefined) return [];
    return Object.values(member.equipment).flatMap((itemId) => {
      const item = itemId === null ? undefined : state.generatedDefinitions.items[itemId];
      if (item === undefined || !enemies.some((enemy) => enemy.policyId === item.counterTag)) {
        return [];
      }
      return [`${hero.name}'s ${item.name} counters ${item.counterTag} actions.`];
    });
  });

  return {
    victoryBand,
    incomingDamage: [incomingBase, incomingBase + 14],
    confidence,
    advantages: [
      priority === 'break-threat'
        ? `The squad will pressure ${highestThreat?.name ?? 'the largest threat'} first.`
        : priority === 'protect-rear'
          ? `Rear-line protection reduces ${hexer?.name ?? 'hexer'} pressure.`
          : 'The trio has reliable protection, damage, and recovery.',
      ...equippedCounters,
    ],
    vulnerabilities: [
      lowestKnowledge < 2
        ? 'Enemy counterplay is still partly unverified; another encounter will sharpen this forecast.'
        : striker !== undefined && state.pendingPlan.positions[striker.id] === 'front'
          ? `${striker.name} is exposed to ${charger?.name ?? 'the charger'} at the front.`
          : `${hexer?.signature ?? 'The enemy hexer can still mark the rear hero.'}`,
    ],
    score,
  };
}
