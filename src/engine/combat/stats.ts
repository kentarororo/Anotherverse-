import type { CoreStats } from '../model/character';
import type { PartyMemberState, StanceId, StatusState } from '../model/combat';
import type { EquipmentDefinition } from '../model/progression';

export function maximumHp(stats: CoreStats): number {
  return 16 + stats.vitality * 2;
}

export function scaledEnemyStats(stats: CoreStats, turn: number, openingDuel = false): CoreStats {
  if (openingDuel) {
    return {
      vitality: Math.max(1, stats.vitality - 4),
      power: Math.max(1, stats.power - 3),
      guard: Math.max(0, stats.guard - 2),
      speed: stats.speed,
      focus: Math.max(1, stats.focus - 1),
    };
  }
  const tier = Math.floor((turn - 1) / 5);
  const actPressure = turn >= 4 ? 2 : 0;
  return {
    vitality: stats.vitality + 3 + tier * 2 + Math.floor(actPressure / 2),
    power: stats.power + 4 + tier * 2 + actPressure,
    guard: stats.guard + 2 + Math.floor(tier / 2),
    speed: stats.speed + tier,
    focus: stats.focus + tier,
  };
}

/**
 * The single authoritative translation from persistent progression into battle stats.
 * Level is broad growth, Calling rank is specialised mastery, equipment is additive,
 * and low readiness creates a visible (but recoverable) performance penalty.
 */
export function effectiveHeroStats(
  base: CoreStats,
  member: PartyMemberState,
  equipment: EquipmentDefinition[],
): CoreStats {
  const levelGrowth = Math.max(0, member.level - 1);
  const callingGrowth = Math.max(0, member.callingRank - 1);
  const readinessModifier = member.readiness < 40 ? -2 : member.readiness < 65 ? -1 : 0;
  const equipmentPower = equipment.reduce((sum, item) => sum + item.powerBonus, 0);
  const equipmentGuard = equipment.reduce((sum, item) => sum + item.guardBonus, 0);
  return {
    vitality: Math.max(1, base.vitality + Math.floor(levelGrowth / 2) + callingGrowth),
    power: Math.max(
      1,
      base.power + levelGrowth + callingGrowth + equipmentPower + readinessModifier,
    ),
    guard: Math.max(
      0,
      base.guard + levelGrowth + callingGrowth + equipmentGuard + readinessModifier,
    ),
    speed: Math.max(1, base.speed + Math.floor(levelGrowth / 2) + readinessModifier),
    focus: Math.max(1, base.focus + Math.floor(callingGrowth / 2) + readinessModifier),
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
