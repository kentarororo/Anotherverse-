import { describe, expect, it } from 'vitest';
import { ENCOUNTER_SUITES, REWARD_STYLES } from '../content/procedural-corpus';
import { buildCorpusReviewEntries } from '../engine/reports/corpus-review';
import {
  compileCampaignPlan,
  getStructuralFingerprint,
  validateCampaignPlan,
} from '../engine/generation/campaign-compiler';
import type { CampaignFact, CampaignFactKey, CampaignPlan } from '../engine/model/campaign-plan';

const seeds = Array.from({ length: 1_000 }, (_, index) => `compiler-adversarial-${index}`);

const factMatches = (
  fact: CampaignFact | undefined,
  expected: { key: CampaignFactKey; state: string },
) => fact?.key === expected.key && fact.state === expected.state;

const normalizedPlayerText = (plan: CampaignPlan) =>
  [
    plan.world.title,
    plan.world.mortalOrder,
    plan.world.divineLaw,
    plan.world.awakeningLaw,
    plan.world.taboo,
    plan.antagonist.title,
    plan.antagonist.publicAim,
    plan.antagonist.hiddenAim,
    plan.antagonist.grievance,
    plan.antagonist.escalation,
    ...plan.arc.beats.flatMap((beat) => [beat.title, beat.prose]),
    ...plan.scenes.flatMap((scene) => [
      scene.title,
      scene.prose,
      scene.outcomeText,
      scene.encounter?.stakes ?? '',
      scene.reward.title,
      ...(scene.encounter?.enemies ?? []).map((enemy) => enemy.title),
    ]),
  ]
    .join(' ')
    .toLocaleLowerCase();

function makeCosmeticVariant(plan: CampaignPlan): CampaignPlan {
  const copy = JSON.parse(JSON.stringify(plan)) as CampaignPlan;
  Object.assign(copy, { seed: 'a-different-seed-that-must-not-count' });
  Object.assign(copy.world, {
    title: 'Renamed World',
    mortalOrder: 'Replacement mortal-order prose.',
    divineLaw: 'Replacement divine-law prose.',
    awakeningLaw: 'Replacement awakening-law prose.',
    taboo: 'Replacement taboo prose.',
    lexicon: ['term one', 'term two', 'term three', 'term four'],
  });
  Object.assign(copy.arc, { title: 'Renamed Arc' });
  copy.arc.beats.forEach((beat, index) =>
    Object.assign(beat, { title: `Beat ${index}`, prose: `Replacement beat prose ${index}.` }),
  );
  Object.assign(copy.antagonist, {
    title: 'Renamed Antagonist',
    publicAim: 'Replacement public aim.',
    hiddenAim: 'Replacement hidden aim.',
    grievance: 'Replacement grievance.',
    escalation: 'Replacement escalation.',
  });
  copy.scenes.forEach((scene, sceneIndex) => {
    Object.assign(scene, {
      title: `Scene ${sceneIndex}`,
      prose: `Replacement scene prose ${sceneIndex}.`,
    });
    Object.assign(scene.reward, {
      title: `Reward ${sceneIndex}`,
    });
    scene.encounter?.enemies.forEach((enemy, enemyIndex) =>
      Object.assign(enemy, {
        title: `Enemy ${enemyIndex}`,
        statJitter: enemy.statJitter + 0.77,
      }),
    );
  });
  return copy;
}

function expectCausalPlanToBeClosed(plan: CampaignPlan) {
  const facts = new Map<CampaignFactKey, CampaignFact>(
    plan.initialFacts.map((fact) => [fact.key, fact]),
  );
  const promises = new Map(plan.promises.map((promise) => [promise.id, promise]));
  const seenSetups = new Set<string>();
  const seenPayoffs = new Set<string>();
  const beatIds = new Set(plan.arc.beats.map((beat) => beat.id));

  expect(new Set(plan.scenes.map((scene) => scene.id)).size).toBe(plan.scenes.length);
  expect(new Set(plan.promises.map((promise) => promise.id)).size).toBe(plan.promises.length);

  plan.scenes.forEach((scene, index) => {
    expect(scene.turn).toBe(index + 1);
    expect(beatIds.has(scene.beatId)).toBe(true);

    for (const predicate of scene.transition.requires) {
      expect(
        factMatches(facts.get(predicate.key), predicate),
        `${plan.seed} Turn ${scene.turn} requires unavailable ${predicate.key}:${predicate.state}`,
      ).toBe(true);
    }
    for (const predicate of scene.transition.forbids) {
      expect(
        factMatches(facts.get(predicate.key), predicate),
        `${plan.seed} Turn ${scene.turn} contains forbidden ${predicate.key}:${predicate.state}`,
      ).toBe(false);
    }
    for (const predicate of scene.transition.retires) {
      if (factMatches(facts.get(predicate.key), predicate)) facts.delete(predicate.key);
    }
    for (const produced of scene.transition.produces) facts.set(produced.key, produced);

    for (const promiseId of scene.promiseSetups) {
      const promise = promises.get(promiseId);
      expect(promise, `${plan.seed} references missing promise ${promiseId}`).toBeDefined();
      expect(promise?.setupTurn).toBe(scene.turn);
      expect(seenSetups.has(promiseId)).toBe(false);
      seenSetups.add(promiseId);
    }
    for (const promiseId of scene.promisePayoffs) {
      const promise = promises.get(promiseId);
      expect(promise, `${plan.seed} pays off missing promise ${promiseId}`).toBeDefined();
      expect(seenSetups.has(promiseId), `${promiseId} pays off before setup`).toBe(true);
      expect(promise?.payoffTurn).toBe(scene.turn);
      expect(factMatches(facts.get(promise!.payoff.key), promise!.payoff)).toBe(true);
      expect(seenPayoffs.has(promiseId)).toBe(false);
      seenPayoffs.add(promiseId);
    }
  });

  expect(seenSetups).toEqual(new Set(promises.keys()));
  expect(seenPayoffs).toEqual(new Set(promises.keys()));
  for (const promise of plan.promises) {
    expect(factMatches(facts.get(promise.payoff.key), promise.payoff)).toBe(true);
  }
}

function expectCastChronology(plan: CampaignPlan) {
  const declaredCast = new Map(plan.cast.map((member) => [member.id, member]));
  expect(declaredCast.size).toBe(plan.cast.length);
  const introduced = new Set<string>();
  for (const scene of plan.scenes) {
    for (const id of scene.introducedCastIds) {
      const member = declaredCast.get(id);
      expect(member, `${id} is introduced but not declared`).toBeDefined();
      expect(member?.introductionTurn).toBe(scene.turn);
      expect(introduced.has(id), `${id} is introduced more than once`).toBe(false);
      introduced.add(id);
    }
    for (const id of scene.castIds) {
      expect(declaredCast.has(id), `${id} appears but is not declared`).toBe(true);
      expect(introduced.has(id), `${id} appears before introduction on Turn ${scene.turn}`).toBe(
        true,
      );
    }
  }
  expect(introduced).toEqual(new Set(declaredCast.keys()));
}

function expectVocabularyPolicy(plan: CampaignPlan) {
  const text = normalizedPlayerText(plan);
  const selectedTerms = [plan.world.title, ...plan.world.lexicon].map((term) =>
    term.toLocaleLowerCase(),
  );
  const selectedTermCount = selectedTerms.filter((term) => text.includes(term)).length;
  expect(
    selectedTermCount,
    `${plan.world.id} is not established in player-facing output`,
  ).toBeGreaterThanOrEqual(1);

  expect(plan.arc.compatibleDomains).toContain(plan.world.domain);
  expect(plan.antagonist.compatibleDomains).toContain(plan.world.domain);
  for (const scene of plan.scenes) {
    if (scene.encounter !== null) {
      const suiteId = scene.encounter.id.replace(/-turn-\d+$/, '');
      const suite = ENCOUNTER_SUITES.find((candidate) => candidate.id === suiteId);
      expect(suite, `${scene.encounter.id} does not resolve to an encounter suite`).toBeDefined();
      expect(suite?.compatibleDomains).toContain(plan.world.domain);
    }
    const style = REWARD_STYLES.find((candidate) => candidate.id === scene.reward.styleId);
    expect(style, `${scene.reward.styleId} does not resolve to a reward style`).toBeDefined();
    expect(style?.compatibleDomains).toContain(plan.world.domain);
  }

  const policy = plan.world as typeof plan.world & {
    readonly forbiddenLexicon?: readonly string[];
  };
  for (const term of policy.forbiddenLexicon ?? []) {
    expect(text).not.toContain(term.toLocaleLowerCase());
  }
  for (const term of ['telemetry', 'network protocol', 'licensed operator', 'bureau ticket']) {
    expect(text).not.toContain(term);
  }
}

function miracleCount(plan: CampaignPlan): number | null {
  const record = plan as unknown as Record<string, unknown>;
  const sceneRecords = plan.scenes as unknown as readonly Record<string, unknown>[];
  const supportsMiracles =
    Object.prototype.hasOwnProperty.call(record, 'miracle') ||
    Object.prototype.hasOwnProperty.call(record, 'miracles') ||
    sceneRecords.some((scene) => Object.prototype.hasOwnProperty.call(scene, 'miracle'));
  if (!supportsMiracles) return null;
  const rootCount = Array.isArray(record.miracles)
    ? record.miracles.length
    : record.miracle == null
      ? 0
      : 1;
  return (
    rootCount +
    sceneRecords.filter(
      (scene) => Object.prototype.hasOwnProperty.call(scene, 'miracle') && scene.miracle != null,
    ).length
  );
}

describe('campaign compiler adversarial release gates', () => {
  it('provides the integrated read-aloud review corpus', () => {
    const entries = buildCorpusReviewEntries();
    expect(entries).toHaveLength(60);
    const rejectedAssembly =
      /people understand the danger through|An earlier choice still matters|Choose what the party does next|live campaign facts|two recorded facts/i;
    expect(entries.every((entry) => !rejectedAssembly.test(entry.paragraph))).toBe(true);
    for (const seed of new Set(entries.map((entry) => entry.seed))) {
      const sentences = entries
        .filter((entry) => entry.seed === seed)
        .flatMap((entry) => entry.paragraph.split(/(?<=[.!?])\s+/))
        .filter((sentence) => sentence.length > 35);
      expect(new Set(sentences).size, `${seed} repeats full narrative sentences`).toBe(
        sentences.length,
      );
    }
  });

  it('is byte-deterministic and validates its own output', () => {
    for (const seed of seeds.slice(0, 100)) {
      const first = compileCampaignPlan(seed);
      const second = compileCampaignPlan(seed);
      expect(JSON.stringify(first)).toBe(JSON.stringify(second));
      expect(validateCampaignPlan(first).valid).toBe(true);
    }
  });

  it('produces at least 500 structural stories without counting cosmetic churn', () => {
    const plans = seeds.map(compileCampaignPlan);
    const fingerprints = plans.map(getStructuralFingerprint);
    expect(new Set(fingerprints).size).toBeGreaterThanOrEqual(500);

    for (const plan of plans.slice(0, 100)) {
      expect(plan.structuralFingerprint).toBe(getStructuralFingerprint(plan));
      expect(plan.structuralFingerprint).not.toContain(plan.seed);
      expect(getStructuralFingerprint(makeCosmeticVariant(plan))).toBe(plan.structuralFingerprint);
    }
  });

  it('has valid references, reachable fact prerequisites, and resolved payoffs', () => {
    for (const seed of seeds) {
      const plan = compileCampaignPlan(seed);
      expect(validateCampaignPlan(plan).valid, `${seed} failed compiler validation`).toBe(true);
      expectCausalPlanToBeClosed(plan);
    }
  });

  it('binds four to six fights and covers all eight executable enemy behaviours', () => {
    const behaviors = new Set<string>();
    for (const seed of seeds) {
      const plan = compileCampaignPlan(seed);
      const encounters = plan.scenes.flatMap((scene) =>
        scene.encounter === null ? [] : [scene.encounter],
      );
      expect(encounters.length).toBeGreaterThanOrEqual(4);
      expect(encounters.length).toBeLessThanOrEqual(6);
      encounters.forEach((encounter) =>
        encounter.enemies.forEach((enemy) => behaviors.add(enemy.behavior)),
      );
    }
    expect(behaviors).toEqual(
      new Set(['press', 'guard', 'drain', 'ambush', 'summon', 'counter', 'execute', 'disrupt']),
    );
  });

  it('keeps cast chronology and one world vocabulary coherent', () => {
    for (const seed of seeds.slice(0, 100)) {
      const plan = compileCampaignPlan(seed);
      expectCastChronology(plan);
      expectVocabularyPolicy(plan);
    }
  });

  it('keeps supported miracles rare and singular', () => {
    const counts = seeds.map((seed) => miracleCount(compileCampaignPlan(seed)));
    const supportedCounts = counts.filter((count): count is number => count !== null);
    if (supportedCounts.length === 0) return;
    expect(supportedCounts.every((count) => count <= 1)).toBe(true);
    const miracleRate =
      supportedCounts.filter((count) => count === 1).length / supportedCounts.length;
    expect(miracleRate).toBeGreaterThanOrEqual(0.03);
    expect(miracleRate).toBeLessThanOrEqual(0.08);
  });
});
