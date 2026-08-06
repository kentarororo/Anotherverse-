import { describe, expect, it } from 'vitest';
import {
  compileCampaignPlan,
  getStructuralFingerprint,
  validateCampaignPlan,
} from '../engine/generation/campaign-compiler';
import { CampaignPlanSchema } from '../engine/model/campaign-plan';

const CAMPAIGN_SEEDS = Array.from({ length: 1_000 }, (_, index) => `compiled-act-${index}`);

describe('deterministic campaign compiler', () => {
  it('compiles the same complete plan for the same seed', () => {
    const first = compileCampaignPlan('repeatable-myth');
    const second = compileCampaignPlan('repeatable-myth');

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(CampaignPlanSchema.parse(first)).toEqual(first);
    expect(first.scenes).toHaveLength(6);
    expect(validateCampaignPlan(first)).toMatchObject({ valid: true, errors: [] });
  });

  it('validates 1,000 coherent acts and clears the structural diversity gate', () => {
    const plans = CAMPAIGN_SEEDS.map(compileCampaignPlan);
    const fingerprints = new Set(plans.map((plan) => plan.structuralFingerprint));
    let miracles = 0;

    for (const plan of plans) {
      const validation = validateCampaignPlan(plan);
      expect(validation.errors, plan.seed).toEqual([]);
      expect(validation.valid).toBe(true);
      expect(plan.scenes.filter((scene) => scene.encounter !== null).length).toBeGreaterThanOrEqual(
        4,
      );
      expect(plan.scenes.filter((scene) => scene.encounter !== null).length).toBeLessThanOrEqual(6);
      expect(plan.scenes.slice(1).every((scene) => scene.transition.requires.length > 0)).toBe(
        true,
      );
      expect(plan.scenes.slice(1).every((scene) => scene.transition.produces.length > 0)).toBe(
        true,
      );
      expect(
        plan.promises.every(
          (promise) =>
            validation.finalFacts.get(promise.payoff.key)?.state === promise.payoff.state,
        ),
      ).toBe(true);
      if (plan.miracle) miracles += 1;
    }

    expect(fingerprints.size).toBeGreaterThanOrEqual(500);
    expect(miracles).toBeGreaterThanOrEqual(30);
    expect(miracles).toBeLessThanOrEqual(80);
  });

  it('does not fingerprint seeds, names, prose, reward amounts, or enemy stat jitter', () => {
    const plan = compileCampaignPlan('fingerprint-boundary');
    const changed = {
      ...plan,
      seed: 'a-different-seed-label',
      cast: plan.cast.map((member, index) => ({
        ...member,
        name: `Changed ${index}`,
      })) as unknown as typeof plan.cast,
      scenes: plan.scenes.map((scene) => ({
        ...scene,
        prose: 'Entirely different rendered prose.',
        outcomeText: 'Entirely different outcome prose.',
        reward: { ...scene.reward, amount: scene.reward.amount + 9_999 },
        encounter: scene.encounter
          ? {
              ...scene.encounter,
              enemies: scene.encounter.enemies.map((enemy) => ({
                ...enemy,
                statJitter: enemy.statJitter + 9_999,
              })) as unknown as typeof scene.encounter.enemies,
            }
          : null,
      })) as unknown as typeof plan.scenes,
    };

    expect(getStructuralFingerprint(changed)).toBe(plan.structuralFingerprint);
  });
});
