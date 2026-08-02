import type { CanonicalGameState } from '../model/state';
import type { ScenarioForecast, StanceId, TeamPriorityId } from '../model/combat';

const stanceScores: Record<StanceId, number> = {
  aggressive: 3,
  guarded: 2,
  tactical: 2,
  supportive: 1,
};

export function calculateForecast(state: CanonicalGameState): ScenarioForecast {
  const heroes = state.generatedDefinitions.characters;
  const enemyIds = state.currentEncounter?.enemyIds ?? [];
  const enemies = enemyIds.flatMap((id) => {
    const enemy = state.generatedDefinitions.enemies[id];
    return enemy === undefined ? [] : [enemy];
  });
  const stanceTotal = heroes.reduce((total, hero) => {
    const stance = state.pendingPlan.stanceIds[hero.id] as StanceId | undefined;
    return total + (stance === undefined ? 0 : stanceScores[stance]);
  }, 0);
  const priority = state.pendingPlan.teamPriorityId as TeamPriorityId | null;
  const priorityScore = priority === 'break-threat' || priority === 'focus-weakest' ? 3 : 2;
  const currentHpRatio = heroes.reduce((total, hero) => {
    const member = state.partyState[hero.id];
    return total + (member === undefined ? 0 : member.hp / member.maxHp);
  }, 0);
  const heroScore = heroes.reduce(
    (total, hero) => total + hero.stats.power + hero.stats.guard + hero.stats.focus,
    0,
  );
  const enemyScore = enemies.reduce(
    (total, enemy) => total + enemy.stats.power + enemy.stats.guard + enemy.threat,
    0,
  );
  const score = Math.round(
    heroScore * 0.45 + stanceTotal + priorityScore + currentHpRatio * 6 - enemyScore * 0.55,
  );
  const victoryBand = score >= 24 ? 'favoured' : score >= 15 ? 'contested' : 'precarious';
  const guardedCount = Object.values(state.pendingPlan.stanceIds).filter(
    (stance) => stance === 'guarded',
  ).length;
  const incomingBase = Math.max(16, 34 - guardedCount * 4 - (priority === 'protect-rear' ? 4 : 0));

  return {
    victoryBand,
    incomingDamage: [incomingBase, incomingBase + 14],
    confidence: 'high',
    advantages: [
      priority === 'break-threat'
        ? 'The squad will pressure the Glass Weaver first.'
        : priority === 'protect-rear'
          ? 'Rear-line protection reduces Weaver pressure.'
          : 'The trio has reliable protection, damage, and recovery.',
    ],
    vulnerabilities: [
      state.pendingPlan.positions['dax-ren'] === 'front'
        ? 'Dax is exposed to the Hound at the front.'
        : 'Rending Hex can still mark the rear hero.',
    ],
    score,
  };
}
