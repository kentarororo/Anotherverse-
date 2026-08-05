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
    effect: 'Chargers attack here. +2 Guard.',
  },
  {
    id: 'centre',
    label: 'Centre',
    effect: '+1 initiative. Becomes exposed when either line falls.',
  },
  {
    id: 'rear',
    label: 'Rear',
    effect: 'Hexers attack here. +5% hit chance.',
  },
];

export const STANCE_RULES: readonly PlanningRule<StanceId>[] = [
  {
    id: 'aggressive',
    label: 'Aggressive',
    effect: '+3 damage, −4 Guard. Enables finishers.',
  },
  {
    id: 'guarded',
    label: 'Guarded',
    effect: '+5 Guard, −1 initiative.',
  },
  {
    id: 'tactical',
    label: 'Tactical',
    effect: '+12% hit chance, +1 initiative. Enables route techniques.',
  },
  {
    id: 'supportive',
    label: 'Supportive',
    effect: 'Heal below 90% HP. Healing gains +2; attacks deal −2.',
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
    label: 'Conserve Awakening Power',
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
          : 'Spirit Bolt');
    return {
      characterId: hero.id,
      characterName: hero.name,
      actionName,
      explanation:
        technique === undefined
          ? 'Basic attack · restores 1 AP'
          : `Cost ${technique.resourceCost} AP · ${technique.cooldownRounds}-round cooldown`,
    };
  });
}
