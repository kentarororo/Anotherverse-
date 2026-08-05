import { describe, expect, it } from 'vitest';
import { evaluateHeroActionPolicy, selectHeroAction } from '../engine/combat/policy';

const strikerContext = {
  policyId: 'striker' as const,
  basicActionId: 'basic',
  firstTechniqueId: 'finisher',
  secondTechniqueId: 'cross-step',
  resource: 3,
  firstTechniqueCost: 2,
  secondTechniqueCost: 1,
  firstTechniqueReady: true,
  secondTechniqueReady: true,
  stance: 'aggressive' as const,
  position: 'rear' as const,
  teamPriorityId: 'focus-weakest',
  woundedAllyRatio: 1,
  targetHpRatio: 1,
};

describe('visible combat action policy', () => {
  it('selects the highest-scored legal action and exposes rejected conditions', () => {
    expect(selectHeroAction(strikerContext)).toMatchObject({
      actionId: 'finisher',
      score: 80,
      legal: true,
    });

    const conserved = evaluateHeroActionPolicy({
      ...strikerContext,
      teamPriorityId: 'conserve-power',
    });
    expect(conserved.find((choice) => choice.actionId === 'finisher')).toMatchObject({
      legal: true,
    });
    expect(selectHeroAction({ ...strikerContext, teamPriorityId: 'conserve-power' }).actionId).toBe(
      'finisher',
    );
    const lowReserve = evaluateHeroActionPolicy({
      ...strikerContext,
      resource: 2,
      teamPriorityId: 'conserve-power',
    });
    expect(lowReserve.find((choice) => choice.actionId === 'finisher')).toMatchObject({
      legal: false,
      reasons: ['Conserve Power keeps one point in reserve until the target can be finished.'],
    });
  });

  it('makes supportive recovery thresholds and weights explicit', () => {
    const support = {
      ...strikerContext,
      policyId: 'support' as const,
      firstTechniqueId: 'recovery',
      secondTechniqueId: 'binding-shot',
      firstTechniqueCost: 2,
      secondTechniqueCost: 2,
      stance: 'supportive' as const,
      position: 'centre' as const,
      woundedAllyRatio: 0.8,
    };
    expect(selectHeroAction(support)).toMatchObject({
      actionId: 'recovery',
      kind: 'heal',
      score: 100,
    });

    const healthy = evaluateHeroActionPolicy({ ...support, woundedAllyRatio: 0.95 });
    expect(healthy.find((choice) => choice.actionId === 'recovery')?.reasons).toContain(
      'No ally is below the 90% threshold.',
    );
  });
});
