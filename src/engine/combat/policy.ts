import type { CanonicalGameState } from '../model/state';
import type { Position } from '../model/commands';
import type { CombatantDefinition, StanceId } from '../model/combat';

export type HeroActionKind = 'basic' | 'attack-technique' | 'guard' | 'heal';

export interface HeroActionCandidate {
  actionId: string;
  kind: HeroActionKind;
  score: number;
  legal: boolean;
  reasons: string[];
}

export interface HeroPolicyContext {
  policyId: CombatantDefinition['policyId'];
  basicActionId: string;
  firstTechniqueId?: string | undefined;
  secondTechniqueId?: string | undefined;
  resource: number;
  firstTechniqueCost: number;
  secondTechniqueCost: number;
  firstTechniqueReady: boolean;
  secondTechniqueReady: boolean;
  stance: StanceId;
  position: Position;
  teamPriorityId: string | null;
  woundedAllyRatio: number;
  targetHpRatio: number;
}

function candidate(
  actionId: string,
  kind: HeroActionKind,
  score: number,
  conditions: Array<[boolean, string]>,
): HeroActionCandidate {
  const failures = conditions.filter(([passes]) => !passes).map(([, reason]) => reason);
  return {
    actionId,
    kind,
    score,
    legal: failures.length === 0,
    reasons: failures.length === 0 ? ['All visible conditions pass.'] : failures,
  };
}

function reserveAllowsSpend(context: HeroPolicyContext, cost: number, emergency = false): boolean {
  if (context.teamPriorityId !== 'conserve-power' || emergency) return true;
  return context.resource - cost >= 1;
}

export function evaluateHeroActionPolicy(context: HeroPolicyContext): HeroActionCandidate[] {
  const choices: HeroActionCandidate[] = [candidate(context.basicActionId, 'basic', 10, [])];
  if (context.policyId === 'support' && context.firstTechniqueId !== undefined) {
    const threshold = context.stance === 'supportive' ? 0.9 : 0.7;
    choices.push(
      candidate(context.firstTechniqueId, 'heal', 100, [
        [context.resource >= context.firstTechniqueCost, 'Insufficient action resource.'],
        [context.firstTechniqueReady, 'Technique is cooling down.'],
        [
          reserveAllowsSpend(context, context.firstTechniqueCost, context.woundedAllyRatio < 0.35),
          'Conserve Power keeps one point in reserve until an ally is in danger.',
        ],
        [
          context.woundedAllyRatio < threshold,
          `No ally is below the ${threshold * 100}% threshold.`,
        ],
      ]),
    );
  }

  if (context.policyId === 'vanguard' && context.secondTechniqueId !== undefined) {
    choices.push(
      candidate(context.secondTechniqueId, 'guard', 90, [
        [context.teamPriorityId === 'protect-rear', 'Team priority is not Protect Rear.'],
        [context.resource >= context.secondTechniqueCost, 'Insufficient action resource.'],
        [context.secondTechniqueReady, 'Technique is cooling down.'],
        [
          reserveAllowsSpend(context, context.secondTechniqueCost),
          'Conserve Power keeps one point in reserve.',
        ],
      ]),
    );
  }

  if (context.policyId === 'vanguard' && context.firstTechniqueId !== undefined) {
    choices.push(
      candidate(context.firstTechniqueId, 'attack-technique', 80, [
        [context.resource >= context.firstTechniqueCost, 'Insufficient action resource.'],
        [context.firstTechniqueReady, 'Technique is cooling down.'],
        [
          reserveAllowsSpend(context, context.firstTechniqueCost),
          'Conserve Power keeps one point in reserve.',
        ],
      ]),
    );
  }

  if (context.policyId === 'striker' && context.firstTechniqueId !== undefined) {
    choices.push(
      candidate(context.firstTechniqueId, 'attack-technique', 80, [
        [context.resource >= context.firstTechniqueCost, 'Insufficient action resource.'],
        [context.firstTechniqueReady, 'Technique is cooling down.'],
        [
          reserveAllowsSpend(context, context.firstTechniqueCost, context.targetHpRatio <= 0.35),
          'Conserve Power keeps one point in reserve until the target can be finished.',
        ],
        [
          context.stance === 'aggressive' || context.targetHpRatio <= 0.65,
          'Requires Aggressive stance or a target at 65% HP or lower.',
        ],
      ]),
    );
  }

  if (context.policyId === 'striker' && context.secondTechniqueId !== undefined) {
    choices.push(
      candidate(context.secondTechniqueId, 'attack-technique', 70, [
        [context.resource >= context.secondTechniqueCost, 'Insufficient action resource.'],
        [context.secondTechniqueReady, 'Technique is cooling down.'],
        [
          reserveAllowsSpend(context, context.secondTechniqueCost),
          'Conserve Power keeps one point in reserve.',
        ],
        [
          context.stance === 'tactical' || context.position === 'rear',
          'Requires Tactical stance or rear position.',
        ],
      ]),
    );
  }

  if (context.policyId === 'support' && context.secondTechniqueId !== undefined) {
    choices.push(
      candidate(context.secondTechniqueId, 'attack-technique', 70, [
        [context.resource >= context.secondTechniqueCost, 'Insufficient action resource.'],
        [context.secondTechniqueReady, 'Technique is cooling down.'],
        [context.stance === 'tactical', 'Requires Tactical stance.'],
        [
          reserveAllowsSpend(context, context.secondTechniqueCost),
          'Conserve Power keeps one point in reserve.',
        ],
      ]),
    );
  }

  return choices.sort((a, b) => b.score - a.score || a.actionId.localeCompare(b.actionId));
}

export function selectHeroAction(context: HeroPolicyContext): HeroActionCandidate {
  return evaluateHeroActionPolicy(context).find((choice) => choice.legal)!;
}

export function explainCurrentHeroPolicies(state: CanonicalGameState) {
  const recruitedIds = new Set(state.recruitedCharacterIds);
  const heroes = state.generatedDefinitions.characters.filter((hero) => recruitedIds.has(hero.id));
  const woundedAllyRatio = heroes.reduce((lowest, hero) => {
    const member = state.partyState[hero.id];
    return member === undefined ? lowest : Math.min(lowest, member.hp / member.maxHp);
  }, 1);

  return heroes.map((hero) => {
    const member = state.partyState[hero.id]!;
    const definition = state.generatedDefinitions.combatants[hero.id]!;
    const [firstTechniqueId, secondTechniqueId] = definition.techniqueIds;
    const context: HeroPolicyContext = {
      policyId: definition.policyId,
      basicActionId: definition.basicActionId,
      firstTechniqueId,
      secondTechniqueId,
      resource: member.resource,
      firstTechniqueCost:
        firstTechniqueId === undefined ? 0 : (definition.techniqueCosts?.[firstTechniqueId] ?? 0),
      secondTechniqueCost:
        secondTechniqueId === undefined ? 0 : (definition.techniqueCosts?.[secondTechniqueId] ?? 0),
      firstTechniqueReady: true,
      secondTechniqueReady: true,
      stance: (state.pendingPlan.stanceIds[hero.id] as StanceId | undefined) ?? 'tactical',
      position: state.pendingPlan.positions[hero.id] ?? 'centre',
      teamPriorityId: state.pendingPlan.teamPriorityId,
      woundedAllyRatio,
      targetHpRatio: 1,
    };
    return {
      characterId: hero.id,
      characterName: hero.name,
      selectedAction: selectHeroAction(context).actionId,
      candidates: evaluateHeroActionPolicy(context),
    };
  });
}
