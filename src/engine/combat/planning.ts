import type { Position } from '../model/commands';
import type { StanceId, TeamPriorityId } from '../model/combat';
import type { CanonicalGameState } from '../model/state';
import { explainCurrentHeroPolicies } from './policy';

export interface PlanningRule<T extends string> {
  id: T;
  label: string;
  effect: string;
}

export const POSITION_RULES: readonly PlanningRule<Position>[] = [
  {
    id: 'front',
    label: 'Front',
    effect: 'Chargers attack this position first. Put Guard and Ward here.',
  },
  {
    id: 'centre',
    label: 'Centre',
    effect: 'Safer from opening target rules, but exposed after either line falls.',
  },
  {
    id: 'rear',
    label: 'Rear',
    effect: 'Hexers attack this position first. Some techniques become legal here.',
  },
];

export const STANCE_RULES: readonly PlanningRule<StanceId>[] = [
  {
    id: 'aggressive',
    label: 'Aggressive',
    effect: '+2 raw attack damage, but −3 Guard. Enables striker finishers immediately.',
  },
  {
    id: 'guarded',
    label: 'Guarded',
    effect: '+4 Guard against every incoming hit.',
  },
  {
    id: 'tactical',
    label: 'Tactical',
    effect: '+10 percentage points to hit chance and enables route techniques.',
  },
  {
    id: 'supportive',
    label: 'Supportive',
    effect: 'The support hero heals when any ally falls below 90% HP instead of 70%.',
  },
];

export const PRIORITY_RULES: readonly PlanningRule<TeamPriorityId>[] = [
  {
    id: 'break-threat',
    label: 'Break Greatest Threat',
    effect: 'All heroes target the living enemy with the highest Threat.',
  },
  {
    id: 'focus-weakest',
    label: 'Finish the Weakest',
    effect: 'All heroes target the enemy with the lowest remaining HP percentage.',
  },
  {
    id: 'protect-rear',
    label: 'Protect the Rear',
    effect: 'Rear-line hits lose up to 2 damage; the vanguard may spend AP to grant Ward.',
  },
  {
    id: 'conserve-power',
    label: 'Conserve Path Power',
    effect: 'Heroes reserve AP and use basic attacks, which restore 1 AP when resolved.',
  },
];

export function planningRule<T extends string>(
  rules: readonly PlanningRule<T>[],
  id: string | undefined,
) {
  return rules.find((rule) => rule.id === id) ?? rules[0]!;
}

export function buildHeroActionPreview(state: CanonicalGameState) {
  return explainCurrentHeroPolicies(state).map((policy) => {
    const hero = state.generatedDefinitions.characters.find(
      (candidate) => candidate.id === policy.characterId,
    )!;
    const selected = policy.candidates.find(
      (candidate) => candidate.actionId === policy.selectedAction,
    )!;
    const technique = hero.techniques.find((candidate) => candidate.id === selected.actionId);
    const actionName =
      technique?.name ??
      (hero.role === 'vanguard'
        ? 'Shield Strike'
        : hero.role === 'striker'
          ? 'Hunter’s Cut'
          : 'Path Bolt');
    return {
      characterId: hero.id,
      characterName: hero.name,
      actionName,
      explanation:
        technique === undefined
          ? 'No higher-priority technique is legal at the start, so this attack builds 1 AP.'
          : `${technique.condition} Cost ${technique.resourceCost} AP; cooldown ${technique.cooldownRounds} rounds.`,
    };
  });
}
