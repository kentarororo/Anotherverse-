import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { CanonicalGameStateSchema, createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';

function start(seed = 'progression-seed') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

describe('progression and management', () => {
  it('turns the dangerous ferryman refusal into a secret battle', () => {
    const seed = Array.from({ length: 40 }, (_, index) => `ferryman-${index}`).find((candidate) =>
      start(candidate).campaignBible!.city.id.includes('underworld-tide'),
    )!;
    const afterOpening = applyGameCommand(start(seed), { type: 'COMMIT_TURN' });
    const refusal = afterOpening.currentScenario!.choices.find(
      (choice) => choice.encounterId === 'secret-drowned-stair',
    )!;
    const planned = applyGameCommand(afterOpening, {
      type: 'CHOOSE_SITUATION',
      choiceId: refusal.id,
    });
    expect(planned.currentEncounter?.id).toBe('secret-drowned-stair');
    const resolved = applyGameCommand(planned, { type: 'COMMIT_TURN' });
    expect(resolved.battleReports).toHaveLength(2);
    expect(resolved.aftermathReports.at(-1)!.summary).toMatch(/drowned|ferryman|funeral bell/i);
  });

  it('grants battle resources and never reports a duplicate equipment drop', () => {
    let state = start('reward-cadence-seed');
    const granted: string[] = [];
    while (state.turn <= 20) {
      if (state.pendingPlan.situationChoiceId === null) {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: state.currentScenario!.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
      granted.push(...state.aftermathReports.at(-1)!.itemIdsGranted);
    }
    expect(new Set(granted).size).toBe(granted.length);
    expect(state.coins).toBeGreaterThan(30);
    expect(state.relicDust).toBeGreaterThan(0);
    expect(state.inventoryIds).toEqual(expect.arrayContaining(granted));
  });

  it('records relationships and Bestiary intelligence after resolution', () => {
    const initial = start();
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
    expect(personal.relationships).toEqual(resolved.relationships);

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

  it('equips recovered rewards and persists the slot in canonical state', () => {
    const resolved = applyGameCommand(start('rules-seed'), { type: 'COMMIT_TURN' });
    expect(resolved.inventoryIds.length).toBeGreaterThan(0);
    const hero = resolved.generatedDefinitions.characters[0]!;
    const itemId = resolved.inventoryIds[0]!;
    const equipped = applyGameCommand(resolved, {
      type: 'EQUIP_ITEM',
      characterId: hero.id,
      itemId,
    });
    const item = equipped.generatedDefinitions.items[itemId]!;
    expect(equipped.partyState[hero.id]!.equipment[item.slot]).toBe(itemId);
  });

  it('models Calling mastery as a development unlock rather than a combat technique', () => {
    const initial = start('learning-seed');
    const hero = initial.generatedDefinitions.characters[0]!;
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
        name: `${hero.callingName} Mastery`,
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
    const initial = start('management-impact-seed');
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
    const baselineReport = applyGameCommand(initial, { type: 'COMMIT_TURN' }).battleReports[0]!;
    const improvedReport = applyGameCommand(mastered, { type: 'COMMIT_TURN' }).battleReports[0]!;
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
    const initial = start('equipment-counter-seed');
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
      resolved.battleReports[0]!.events.some((event) =>
        event.ruleTriggers?.includes('equipment-counter:hexer'),
      ),
    ).toBe(true);
  });

  it('advances Calling and squad rank and spends supplies on between-operation recovery', () => {
    let state = start('rank-and-recovery-seed');
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
    while (state.turn < 6) {
      if (state.currentScenario!.category !== 'operation') {
        const nextChoice = state.currentScenario!.choices[0]!;
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: nextChoice.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
    expect(state.rank).toBe('Bronze');
    expect(Object.values(state.partyState).every((member) => member.callingRank >= 2)).toBe(true);
    expect(Object.values(state.partyState).every((member) => member.trainingPoints >= 1)).toBe(
      true,
    );
  });

  it('turns situation consequences into authoritative reputation changes', () => {
    const afterOperation = applyGameCommand(start('reputation-choice-seed'), {
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
    expect(privateResult.battleReports.length).toBeGreaterThanOrEqual(
      privateChoice!.encounterId === undefined ? 1 : 2,
    );
    expect(publicChoice!.effects).not.toEqual(privateChoice!.effects);
  });
});
