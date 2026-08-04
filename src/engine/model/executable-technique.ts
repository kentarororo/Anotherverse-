export type ExecutableHeroRole = 'vanguard' | 'striker' | 'support';

export interface ExecutableTechniqueContract {
  id: string;
  effect: Readonly<Record<string, string | number>>;
  mechanicRule: string;
  resourceCost: number;
  cooldownRounds: number;
  condition: string;
}

/**
 * The simulation implements these six actions by role and stable ID. Authored names and visual
 * language may vary by Calling, but their executable rules may not drift from this contract.
 */
export const EXECUTABLE_TECHNIQUES: Readonly<
  Record<ExecutableHeroRole, readonly [ExecutableTechniqueContract, ExecutableTechniqueContract]>
> = {
  vanguard: [
    {
      id: 'aegis-break',
      effect: { kind: 'attack', bonusPower: 3, status: 'exposed', statusRounds: 2 },
      mechanicRule:
        'Spend 2 Resource to make an attack with 3 bonus power and apply Exposed for 2 rounds.',
      resourceCost: 2,
      cooldownRounds: 2,
      condition: 'Requires an active target and at least 2 Resource.',
    },
    {
      id: 'hold-the-line',
      effect: { kind: 'guard', ward: 3, wardRounds: 2 },
      mechanicRule: 'Spend 1 Resource to grant the front hero a 3-point Ward for 2 rounds.',
      resourceCost: 1,
      cooldownRounds: 2,
      condition: 'Requires Protect Rear priority and at least 1 Resource.',
    },
  ],
  striker: [
    {
      id: 'arc-finish',
      effect: { kind: 'attack', bonusPower: 8, masteryBonusPower: 10 },
      mechanicRule: 'Spend 2 Resource to make a high-damage attack with 8 bonus power.',
      resourceCost: 2,
      cooldownRounds: 2,
      condition:
        'Requires Aggressive stance or a target at 65% HP or lower, plus at least 2 Resource.',
    },
    {
      id: 'cross-step',
      effect: { kind: 'attack', bonusPower: 4, route: 'rear-or-tactical' },
      mechanicRule: 'Spend 1 Resource to make an attack with 4 bonus power.',
      resourceCost: 1,
      cooldownRounds: 1,
      condition: 'Requires rear position or Tactical stance, plus at least 1 Resource.',
    },
  ],
  support: [
    {
      id: 'restorative-sigil',
      effect: {
        kind: 'heal',
        focusBonusHp: 5,
        inspiredRounds: 2,
        wardRounds: 2,
        masteryWardRounds: 3,
      },
      mechanicRule:
        "Spend 2 Resource to heal the ally for an amount equal to the bearer's Focus plus 5 HP, grant Inspired for 2 rounds, and grant a Ward for 2 rounds.",
      resourceCost: 2,
      cooldownRounds: 2,
      condition:
        'Requires an ally below 90% HP in Supportive stance or below 70% HP otherwise, plus at least 2 Resource.',
    },
    {
      id: 'binding-shot',
      effect: { kind: 'attack', bonusPower: 2, status: 'staggered', statusRounds: 2 },
      mechanicRule:
        'Spend 2 Resource to make an attack with 2 bonus power and apply Staggered for 2 rounds.',
      resourceCost: 2,
      cooldownRounds: 2,
      condition: 'Requires Tactical stance and at least 2 Resource.',
    },
  ],
};
