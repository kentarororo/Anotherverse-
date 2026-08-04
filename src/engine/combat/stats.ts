import type { CoreStats } from '../model/character';
import type { StanceId, StatusState } from '../model/combat';

export function maximumHp(stats: CoreStats): number {
  return 16 + stats.vitality * 2;
}

export function scaledEnemyStats(stats: CoreStats, turn: number): CoreStats {
  const tier = Math.floor((turn - 1) / 5);
  return {
    vitality: stats.vitality + 5 + tier,
    power: stats.power + 4 + tier,
    guard: stats.guard + 1 + Math.floor(tier / 2),
    speed: stats.speed + tier,
    focus: stats.focus + tier,
  };
}

export function effectiveGuard(
  stats: CoreStats,
  stance: StanceId | null,
  statuses: StatusState[],
): number {
  const stanceModifier = stance === 'guarded' ? 5 : stance === 'aggressive' ? -4 : 0;
  const exposed = statuses.some((status) => status.statusId === 'exposed') ? 4 : 0;
  return Math.max(0, stats.guard + stanceModifier - exposed);
}

export function mitigateDamage(rawAmount: number, guard: number): number {
  const mitigated = Math.floor((rawAmount * guard) / (guard + 20));
  return Math.max(1, rawAmount - mitigated);
}

export function directDamageLimitationPenalty(limitationRuleId: string): number {
  if (limitationRuleId === 'low-direct-output') return 2;
  if (limitationRuleId === 'measured-strikes') return 1;
  return 0;
}

export function clampChance(value: number): number {
  return Math.max(0.15, Math.min(0.95, value));
}
