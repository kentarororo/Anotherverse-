import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { generateCampaignDraft } from '../engine/generation/campaign';
import { CanonicalGameStateSchema, createEmptyGameState } from '../engine/model/state';
import { previewMaterialFusion } from '../engine/progression/crafting';
import { applyGameCommand } from '../engine/simulation/apply-command';

function startWithLead(seed: string, role: 'vanguard' | 'striker' | 'support') {
  const draft = generateCampaignDraft(seed);
  const lead = draft.characters.find((character) => character.role === role)!;
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
    leadCharacterId: lead.id,
  });
}

function resolveCurrentTurn(state: ReturnType<typeof startWithLead>) {
  const planned =
    state.pendingPlan.situationChoiceId === null
      ? applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: state.currentScenario!.choices[0]!.id,
        })
      : state;
  return applyGameCommand(planned, { type: 'COMMIT_TURN' });
}

describe('lead ownership and opening recruitment', () => {
  it.each(['vanguard', 'striker', 'support'] as const)(
    'starts with the selected %s lead and earns both companions in generated order',
    (role) => {
      const initial = startWithLead(`lead-${role}`, role);
      const leadId = initial.leadCharacterId!;
      const companions = initial.generatedDefinitions.characters
        .filter((hero) => hero.id !== leadId)
        .map((hero) => hero.id);

      expect(initial.recruitedCharacterIds).toEqual([leadId]);
      expect(Object.keys(initial.pendingPlan.positions)).toEqual([leadId]);
      expect(Object.keys(initial.pendingPlan.stanceIds)).toEqual([leadId]);
      expect(initial.currentEncounter).toBeNull();

      const afterFirst = resolveCurrentTurn(initial);
      expect(afterFirst.recruitedCharacterIds).toEqual([leadId, companions[0]]);
      expect(afterFirst.aftermathReports.at(-1)!.characterIdsRecruited).toEqual([companions[0]]);
      expect(Object.keys(afterFirst.pendingPlan.positions)).toHaveLength(2);

      const afterSecond = resolveCurrentTurn(afterFirst);
      expect(afterSecond.recruitedCharacterIds).toEqual([leadId, ...companions]);
      expect(afterSecond.aftermathReports.at(-1)!.characterIdsRecruited).toEqual([companions[1]]);
      expect(Object.keys(afterSecond.pendingPlan.positions)).toHaveLength(3);
      expect(afterSecond.currentEncounter).not.toBeNull();
    },
  );

  it('rejects management commands for a hero who has not joined', () => {
    const state = startWithLead('locked-companion', 'support');
    const locked = state.generatedDefinitions.characters.find(
      (hero) => !state.recruitedCharacterIds.includes(hero.id),
    )!;
    expect(() =>
      applyGameCommand(state, {
        type: 'SET_STANCE',
        characterId: locked.id,
        stanceId: 'guarded',
      }),
    ).toThrow('Only a recruited character');
  });
});

describe('monster materials and deterministic Forge fusion', () => {
  it('previews visibly different weighted outcomes for different materials', () => {
    const state = startWithLead('forge-preview', 'vanguard');
    const definitions = state.generatedDefinitions.materials;
    const weapon = previewMaterialFusion(
      ['grave-hound-fang', 'grave-hound-fang', 'storm-jackal-claw'],
      definitions,
    );
    const support = previewMaterialFusion(
      ['augur-thread', 'augur-thread', 'bell-wraith-clapper'],
      definitions,
    );

    expect(weapon).toMatchObject({ slot: 'weapon', affinity: 'charger' });
    expect(support).toMatchObject({ slot: 'support', affinity: 'hexer' });
    expect(weapon.likelyBonuses.powerBonus).toBeGreaterThan(weapon.likelyBonuses.guardBonus);
    expect(support.likelyBonuses.guardBonus).toBeGreaterThan(support.likelyBonuses.powerBonus);
    expect(weapon.candidates.reduce((sum, candidate) => sum + candidate.chance, 0)).toBeCloseTo(1);
  });

  it('consumes exactly three materials and advances only rewards RNG once', () => {
    const initial = startWithLead('forge-replay', 'striker');
    const eligible = CanonicalGameStateSchema.parse({
      ...initial,
      materials: { 'grave-hound-fang': 2, 'augur-thread': 2 },
    });
    const command = {
      type: 'FUSE_MATERIALS' as const,
      materialIds: ['grave-hound-fang', 'grave-hound-fang', 'augur-thread'] as [
        string,
        string,
        string,
      ],
    };
    const first = applyGameCommand(eligible, command);
    const replay = applyGameCommand(eligible, command);

    expect(first).toEqual(replay);
    expect(first.materials).toMatchObject({ 'grave-hound-fang': 0, 'augur-thread': 1 });
    expect(first.rngStreams!.rewards.position).toBe(eligible.rngStreams!.rewards.position + 1);
    for (const streamName of [
      'world',
      'characters',
      'scenarios',
      'enemies',
      'combat',
      'narration',
    ] as const) {
      expect(first.rngStreams![streamName]).toEqual(eligible.rngStreams![streamName]);
    }
    const record = first.fusionHistory.at(-1)!;
    expect(record.rewardRngEndPosition).toBe(record.rewardRngStartPosition + 1);
    expect(first.inventoryIds).toContain(record.itemId);
    expect(first.generatedDefinitions.items[record.itemId]).toBeDefined();
  });

  it('rejects an unaffordable recipe before consuming rewards RNG', () => {
    const state = startWithLead('forge-insufficient', 'support');
    expect(() =>
      applyGameCommand(state, {
        type: 'FUSE_MATERIALS',
        materialIds: ['grave-hound-fang', 'grave-hound-fang', 'grave-hound-fang'],
      }),
    ).toThrow('Not enough Grave Hound Fang');
    expect(state.rngStreams!.rewards.position).toBe(0);
  });

  it('turns defeated encounter enemies into one named material each', () => {
    let state = startWithLead('material-victory', 'vanguard');
    state = resolveCurrentTurn(state);
    state = resolveCurrentTurn(state);
    const enemyIds = state.currentEncounter!.enemyIds;
    const weakenedCombatants = { ...state.generatedDefinitions.combatants };
    const weakenedEnemies = { ...state.generatedDefinitions.enemies };
    for (const enemyId of enemyIds) {
      const enemy = weakenedEnemies[enemyId]!;
      const weakened = {
        ...enemy,
        stats: { vitality: 1, power: 1, guard: 1, speed: 1, focus: 1 },
      };
      weakenedEnemies[enemyId] = weakened;
      weakenedCombatants[enemyId] = weakened;
    }
    state = CanonicalGameStateSchema.parse({
      ...state,
      generatedDefinitions: {
        ...state.generatedDefinitions,
        enemies: weakenedEnemies,
        combatants: weakenedCombatants,
      },
    });
    const resolved = resolveCurrentTurn(state);
    const aftermath = resolved.aftermathReports.at(-1)!;

    expect(resolved.battleReports.at(-1)!.outcome).toBe('victory');
    expect(aftermath.materialIdsGranted).toHaveLength(enemyIds.length);
    expect(aftermath.coinsDelta).toBeGreaterThan(0);
    expect(aftermath.relicDustDelta).toBe(1);
    for (const materialId of aftermath.materialIdsGranted) {
      expect(resolved.generatedDefinitions.materials[materialId]).toBeDefined();
      expect(resolved.materials[materialId]).toBeGreaterThan(0);
    }
  });
});
