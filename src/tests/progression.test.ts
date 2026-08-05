import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { CanonicalGameStateSchema, createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';
import { effectiveHeroStats } from '../engine/combat/stats';

function start(seed = 'progression-seed') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

function advanceToTurn(seed: string, targetTurn: number) {
  let state = start(seed);
  while (state.turn < targetTurn) {
    if (state.pendingPlan.situationChoiceId === null) {
      state = applyGameCommand(state, {
        type: 'CHOOSE_SITUATION',
        choiceId: state.currentScenario!.choices[0]!.id,
      });
    }
    state = applyGameCommand(state, { type: 'COMMIT_TURN' });
  }
  return state;
}

function battleStart(seed = 'progression-seed') {
  return advanceToTurn(seed, 3);
}

describe('progression and management', () => {
  it('turns the dangerous ledger theft into a secret battle', () => {
    const seed = Array.from({ length: 80 }, (_, index) => `ferryman-${index}`).find((candidate) => {
      const scene = advanceToTurn(candidate, 8);
      return (
        scene.campaignBible!.city.id.includes('underworld-tide') &&
        scene.currentScenario!.choices.some((choice) => choice.encounterId !== undefined)
      );
    })!;
    expect(seed).toBeDefined();
    const ledgerScene = advanceToTurn(seed, 8);
    const battleCountBefore = ledgerScene.battleReports.length;
    const refusal = ledgerScene.currentScenario!.choices.find(
      (choice) => choice.encounterId !== undefined,
    )!;
    const planned = applyGameCommand(ledgerScene, {
      type: 'CHOOSE_SITUATION',
      choiceId: refusal.id,
    });
    expect(planned.currentEncounter?.id).toBe(refusal.encounterId);
    const resolved = applyGameCommand(planned, { type: 'COMMIT_TURN' });
    expect(resolved.battleReports).toHaveLength(battleCountBefore + 1);
    expect(resolved.aftermathReports.at(-1)!.summary).toMatch(/drowned|guards|page|boat/i);
  });

  it('grants battle resources and named monster materials', () => {
    let state = start('reward-cadence-seed');
    const grantedMaterials: string[] = [];
    while (state.turn <= 20) {
      if (state.pendingPlan.situationChoiceId === null) {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: state.currentScenario!.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
      grantedMaterials.push(...state.aftermathReports.at(-1)!.materialIdsGranted);
    }
    expect(state.coins).toBeGreaterThan(30);
    expect(Object.values(state.materials).reduce((sum, count) => sum + count, 0)).toBe(
      grantedMaterials.length,
    );
    expect(state.inventoryIds).toHaveLength(0);
  });

  it('records relationships and Bestiary intelligence after resolution', () => {
    const initial = battleStart();
    const resolved = applyGameCommand(initial, { type: 'COMMIT_TURN' });
    const encountered = new Set(initial.currentEncounter!.enemyIds);
    expect(
      Object.values(resolved.bestiary)
        .filter((entry) => encountered.has(entry.enemyId))
        .every((entry) => entry.knowledge >= 2),
    ).toBe(true);
    expect(
      Object.values(resolved.bestiary)
        .filter((entry) => !encountered.has(entry.enemyId))
        .every((entry) => entry.knowledge === 1),
    ).toBe(true);
    expect(resolved.worldFacts.length).toBe(initial.worldFacts.length + 1);

    let personal = resolved;
    const choice = personal.currentScenario!.choices[0]!;
    personal = applyGameCommand(personal, { type: 'CHOOSE_SITUATION', choiceId: choice.id });
    personal = applyGameCommand(personal, { type: 'COMMIT_TURN' });
    const changedRelationships = personal.relationships.filter(
      (relationship, index) =>
        relationship.factIds.length !== resolved.relationships[index]!.factIds.length,
    );
    expect(changedRelationships.length).toBeGreaterThan(0);

    let pairedScene = personal;
    while (
      pairedScene.currentScenario?.category !== 'rival' &&
      pairedScene.currentScenario?.category !== 'social' &&
      pairedScene.turn <= 20
    ) {
      if (pairedScene.pendingPlan.situationChoiceId === null) {
        pairedScene = applyGameCommand(pairedScene, {
          type: 'CHOOSE_SITUATION',
          choiceId: pairedScene.currentScenario!.choices[0]!.id,
        });
      }
      pairedScene = applyGameCommand(pairedScene, { type: 'COMMIT_TURN' });
    }
    expect(['rival', 'social']).toContain(pairedScene.currentScenario?.category);
    const castIds = pairedScene.currentScenario!.castIds;
    const relationshipBefore = pairedScene.relationships.find((relationship) =>
      castIds.every((id) => relationship.characterIds.includes(id)),
    )!;
    const pairedChoice = pairedScene.currentScenario!.choices[0]!;
    const pairedResult = applyGameCommand(
      applyGameCommand(pairedScene, { type: 'CHOOSE_SITUATION', choiceId: pairedChoice.id }),
      { type: 'COMMIT_TURN' },
    );
    const relationshipAfter = pairedResult.relationships.find(
      (relationship) => relationship.pairId === relationshipBefore.pairId,
    )!;
    expect(relationshipAfter.value).toBe(relationshipBefore.value + pairedChoice.effects.bondDelta);
    expect(relationshipAfter.factIds).toContain(`fact-scenario-result-${pairedScene.turn}`);
  });

  it('equips a forged reward and persists the slot in canonical state', () => {
    const initial = battleStart('rules-seed');
    const eligible = CanonicalGameStateSchema.parse({
      ...initial,
      materials: { 'grave-hound-fang': 2, 'augur-thread': 1 },
    });
    const forged = applyGameCommand(eligible, {
      type: 'FUSE_MATERIALS',
      materialIds: ['grave-hound-fang', 'grave-hound-fang', 'augur-thread'],
    });
    const hero = forged.generatedDefinitions.characters.find(
      (candidate) => candidate.id === forged.leadCharacterId,
    )!;
    const itemId = forged.inventoryIds[0]!;
    const equipped = applyGameCommand(forged, {
      type: 'EQUIP_ITEM',
      characterId: hero.id,
      itemId,
    });
    const item = equipped.generatedDefinitions.items[itemId]!;
    expect(equipped.partyState[hero.id]!.equipment[item.slot]).toBe(itemId);
    expect(forged.coins - equipped.coins).toBe(0);
  });

  it('keeps each item on one hero and transfers ownership when re-equipped', () => {
    const initial = battleStart('unique-equipment-owner');
    const [first, second] = initial.recruitedCharacterIds;
    const eligible = CanonicalGameStateSchema.parse({
      ...initial,
      inventoryIds: ['houndglass-edge'],
    });
    const firstEquip = applyGameCommand(eligible, {
      type: 'EQUIP_ITEM',
      characterId: first!,
      itemId: 'houndglass-edge',
    });
    const transferred = applyGameCommand(firstEquip, {
      type: 'EQUIP_ITEM',
      characterId: second!,
      itemId: 'houndglass-edge',
    });
    expect(transferred.partyState[first!]!.equipment.weapon).toBeNull();
    expect(transferred.partyState[second!]!.equipment.weapon).toBe('houndglass-edge');
  });

  it('turns Rations, Coin, and Dust into deterministic recovery and upgrade sinks', () => {
    const initial = battleStart('resource-sinks');
    const leadId = initial.leadCharacterId!;
    const worn = CanonicalGameStateSchema.parse({
      ...initial,
      supplies: 2,
      relicDust: 3,
      inventoryIds: ['houndglass-edge'],
      partyState: {
        ...initial.partyState,
        [leadId]: { ...initial.partyState[leadId]!, hp: 5, readiness: 35 },
      },
    });
    const rested = applyGameCommand(worn, { type: 'REST_PARTY' });
    expect(rested.supplies).toBe(1);
    expect(rested.partyState[leadId]!.hp).toBeGreaterThan(5);
    expect(rested.partyState[leadId]!.readiness).toBe(60);

    const improved = applyGameCommand(rested, {
      type: 'IMPROVE_ITEM',
      itemId: 'houndglass-edge',
    });
    expect(improved.relicDust).toBe(0);
    expect(improved.generatedDefinitions.items['houndglass-edge']!.powerBonus).toBe(
      initial.generatedDefinitions.items['houndglass-edge']!.powerBonus + 1,
    );
  });

  it('charges a visible Coin fee for forging and rejects unaffordable fusion', () => {
    const initial = battleStart('forge-fee');
    const materials = { 'grave-hound-fang': 2, 'augur-thread': 1 };
    const eligible = CanonicalGameStateSchema.parse({ ...initial, materials, coins: 10 });
    const forged = applyGameCommand(eligible, {
      type: 'FUSE_MATERIALS',
      materialIds: ['grave-hound-fang', 'grave-hound-fang', 'augur-thread'],
    });
    expect(forged.coins).toBe(0);
    const poor = CanonicalGameStateSchema.parse({ ...initial, materials, coins: 9 });
    expect(() =>
      applyGameCommand(poor, {
        type: 'FUSE_MATERIALS',
        materialIds: ['grave-hound-fang', 'grave-hound-fang', 'augur-thread'],
      }),
    ).toThrow('requires 10 Coin');
  });

  it('makes level, Calling rank, equipment, and readiness affect authoritative stats', () => {
    const initial = battleStart('effective-stat-stack');
    const lead = initial.generatedDefinitions.characters.find(
      (hero) => hero.id === initial.leadCharacterId,
    )!;
    const member = initial.partyState[lead.id]!;
    const item = initial.generatedDefinitions.items['houndglass-edge']!;
    const baseline = effectiveHeroStats(lead.stats, member, []);
    const advanced = effectiveHeroStats(
      lead.stats,
      { ...member, level: 4, callingRank: 3, readiness: 100 },
      [item],
    );
    const exhausted = effectiveHeroStats(
      lead.stats,
      { ...member, level: 4, callingRank: 3, readiness: 20 },
      [item],
    );
    expect(advanced.power).toBeGreaterThan(baseline.power);
    expect(advanced.guard).toBeGreaterThan(baseline.guard);
    expect(exhausted.power).toBe(advanced.power - 2);
  });

  it('models Calling mastery as a development unlock rather than a combat technique', () => {
    const initial = battleStart('learning-seed');
    const hero = initial.generatedDefinitions.characters.find(
      (candidate) => candidate.id === initial.leadCharacterId,
    )!;
    const member = initial.partyState[hero.id]!;
    const eligible = CanonicalGameStateSchema.parse({
      ...initial,
      partyState: { ...initial.partyState, [hero.id]: { ...member, trainingPoints: 1 } },
    });
    const techniqueId = `${hero.callingId}-awakening`;
    const unlock = initial.generatedDefinitions.techniques[techniqueId];
    expect(unlock).toEqual(
      expect.objectContaining({
        id: techniqueId,
        name: `${hero.callingName} Awakening`,
        unlockCondition: expect.stringContaining(hero.awakeningCondition),
      }),
    );
    expect(unlock).not.toHaveProperty('resourceCost');
    expect(unlock).not.toHaveProperty('cooldownRounds');
    expect(unlock).not.toHaveProperty('condition');
    const learned = applyGameCommand(eligible, {
      type: 'LEARN_TECHNIQUE',
      characterId: hero.id,
      techniqueId,
    });
    expect(learned.partyState[hero.id]!.trainingPoints).toBe(0);
    expect(learned.partyState[hero.id]!.learnedTechniqueIds).toContain(techniqueId);
  });

  it('makes equipment and Calling mastery change authoritative combat events', () => {
    const initial = battleStart('management-impact-seed');
    const striker = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'striker',
    )!;
    const member = initial.partyState[striker.id]!;
    const itemId = 'houndglass-edge';
    const eligible = CanonicalGameStateSchema.parse({
      ...initial,
      inventoryIds: [itemId],
      partyState: { ...initial.partyState, [striker.id]: { ...member, trainingPoints: 1 } },
    });
    const equipped = applyGameCommand(eligible, {
      type: 'EQUIP_ITEM',
      characterId: striker.id,
      itemId,
    });
    const mastered = applyGameCommand(equipped, {
      type: 'LEARN_TECHNIQUE',
      characterId: striker.id,
      techniqueId: `${striker.callingId}-awakening`,
    });
    const baselineReport = applyGameCommand(initial, { type: 'COMMIT_TURN' }).battleReports.at(-1)!;
    const improvedReport = applyGameCommand(mastered, { type: 'COMMIT_TURN' }).battleReports.at(
      -1,
    )!;
    expect(improvedReport.events).not.toEqual(baselineReport.events);
    const peakRaw = (events: typeof baselineReport.events) =>
      Math.max(
        ...events
          .filter((event) => event.actorId === striker.id && event.eventType === 'attack')
          .map((event) => event.rawAmount ?? 0),
      );
    expect(peakRaw(improvedReport.events)).toBeGreaterThan(peakRaw(baselineReport.events));
  });

  it('uses an equipment counter tag in authoritative damage resolution', () => {
    const initial = battleStart('equipment-counter-seed');
    const vanguard = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'vanguard',
    )!;
    const eligible = CanonicalGameStateSchema.parse({
      ...initial,
      inventoryIds: ['weaver-ward'],
    });
    const equipped = applyGameCommand(eligible, {
      type: 'EQUIP_ITEM',
      characterId: vanguard.id,
      itemId: 'weaver-ward',
    });
    const resolved = applyGameCommand(equipped, { type: 'COMMIT_TURN' });
    expect(
      resolved.battleReports
        .at(-1)!
        .events.some((event) => event.ruleTriggers?.includes('equipment-counter:hexer')),
    ).toBe(true);
  });

  it('advances Calling and squad rank and recovers between operations', () => {
    let state = battleStart('rank-and-recovery-seed');
    state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    const afterOperation = state;
    const choice = state.currentScenario!.choices[0]!;
    state = applyGameCommand(state, { type: 'CHOOSE_SITUATION', choiceId: choice.id });
    state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    for (const hero of state.generatedDefinitions.characters) {
      expect(state.partyState[hero.id]!.hp).toBeGreaterThanOrEqual(
        Math.min(state.partyState[hero.id]!.maxHp, afterOperation.partyState[hero.id]!.hp + 4),
      );
    }
    while (state.turn < 7) {
      if (state.currentScenario!.category !== 'operation') {
        const nextChoice = state.currentScenario!.choices[0]!;
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: nextChoice.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
    expect(['Silver', 'Gold']).toContain(state.rank);
    expect(state.reputation).toBeGreaterThanOrEqual(6);
    const recruits = state.recruitedCharacterIds.map((id) => state.partyState[id]!);
    expect(recruits.every((member) => member.callingRank >= 2)).toBe(true);
    expect(recruits.every((member) => member.trainingPoints >= 1)).toBe(true);
  });

  it('turns situation consequences into authoritative reputation changes', () => {
    const afterOperation = applyGameCommand(battleStart('reputation-choice-seed'), {
      type: 'COMMIT_TURN',
    });
    const [publicChoice, privateChoice] = afterOperation.currentScenario!.choices;
    const resolveWith = (choiceId: string) =>
      applyGameCommand(applyGameCommand(afterOperation, { type: 'CHOOSE_SITUATION', choiceId }), {
        type: 'COMMIT_TURN',
      });
    const publicResult = resolveWith(publicChoice!.id);
    const privateResult = resolveWith(privateChoice!.id);
    expect(publicResult.reputation).toBe(
      afterOperation.reputation + publicChoice!.effects.renownDelta,
    );
    expect(privateResult.reputation).toBe(
      afterOperation.reputation + privateResult.aftermathReports.at(-1)!.reputationDelta,
    );
    expect(publicResult.aftermathReports.at(-1)!.reputationDelta).toBe(
      publicChoice!.effects.renownDelta,
    );
    expect(privateResult.battleReports.length).toBe(
      afterOperation.battleReports.length + (privateChoice!.encounterId === undefined ? 0 : 1),
    );
    expect(publicChoice!.effects).not.toEqual(privateChoice!.effects);
  });
});
