import { describe, expect, it } from 'vitest';
import { calculateForecast } from '../engine/combat/forecast';
import { directDamageLimitationPenalty } from '../engine/combat/stats';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { GameCommandSchema, type GameCommand } from '../engine/model/commands';
import { CanonicalGameStateSchema, createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';

function start(seed = 'fixed-seed-001') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

function battleStart(seed = 'fixed-seed-001') {
  let state = start(seed);
  while (state.turn < 3) {
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

function applyAll(commands: GameCommand[], seed = 'combat-seed') {
  return commands.reduce(applyGameCommand, battleStart(seed));
}

describe('canonical command reducer', () => {
  it('creates byte-equivalent state from the same seed and command', () => {
    const command = GameCommandSchema.parse({
      type: 'START_CAMPAIGN',
      seed: 'fixed-seed-001',
      selectedDraftIndex: 0,
    });

    const first = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), command);
    const second = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), command);

    expect(JSON.stringify(first)).toBe(JSON.stringify(second));
    expect(CanonicalGameStateSchema.parse(first)).toEqual(first);
    expect(first.commandHistory).toEqual([{ index: 0, command }]);
    expect(first.generatedDefinitions.characters).toHaveLength(3);
  });

  it('consumes only world and character streams during campaign generation', () => {
    const state = start('stream-seed');
    expect(state.rngStreams).not.toBeNull();
    expect(state.rngStreams?.world.position).toBeGreaterThan(0);
    expect(state.rngStreams?.characters.position).toBeGreaterThan(0);
    expect(state.rngStreams?.combat.position).toBe(0);
    expect(state.rngStreams?.narration.position).toBe(0);
  });

  it('swaps occupied formation positions so all three remain unique', () => {
    const initial = battleStart();
    const striker = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'striker',
    )!;
    const vanguard = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'vanguard',
    )!;
    const state = applyGameCommand(initial, {
      type: 'SET_POSITION',
      characterId: striker.id,
      position: 'front',
    });
    expect(state.pendingPlan.positions[striker.id]).toBe('front');
    expect(state.pendingPlan.positions[vanguard.id]).toBe('centre');
    expect(new Set(Object.values(state.pendingPlan.positions)).size).toBe(3);
  });

  it('rejects equipment that is not in inventory', () => {
    const state = start();
    expect(() =>
      applyGameCommand(state, {
        type: 'EQUIP_ITEM',
        characterId: state.generatedDefinitions.characters[0]!.id,
        itemId: 'none',
      }),
    ).toThrow('Item cannot be equipped');
  });
});

describe('Milestone 1 battle', () => {
  it('is byte-equivalent for the same seed and command sequence', () => {
    const initial = battleStart('combat-seed');
    const vanguard = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'vanguard',
    )!;
    const commands: GameCommand[] = [
      { type: 'SET_STANCE', characterId: vanguard.id, stanceId: 'tactical' },
      { type: 'SET_TEAM_PRIORITY', priorityId: 'focus-weakest' },
      { type: 'COMMIT_TURN' },
    ];
    expect(JSON.stringify(applyAll(commands))).toBe(JSON.stringify(applyAll(commands)));
  });

  it('terminates by round 12 and traces every attack HP and resource change', () => {
    const state = applyGameCommand(battleStart('trace-seed'), { type: 'COMMIT_TURN' });
    const report = state.battleReports[0]!;
    expect(report.rounds).toBeGreaterThanOrEqual(1);
    expect(report.rounds).toBeLessThanOrEqual(12);
    expect(['victory', 'defeat', 'round-cap']).toContain(report.outcome);
    expect(report.rngEndPosition).toBeGreaterThan(report.rngStartPosition);

    for (const event of report.events.filter((candidate) => candidate.eventType === 'attack')) {
      expect(event.hpBefore! - event.hpAfter!).toBe(event.finalAmount);
      expect(event.rawAmount! - event.mitigatedAmount!).toBe(event.finalAmount);
      expect(event.resourceBefore).toBeDefined();
      expect(event.resourceAfter).toBeDefined();
    }
    const finalHpFromEvents = Object.fromEntries(
      Object.keys(report.hpAtEnd).map((id) => {
        const lastChange = [...report.events]
          .reverse()
          .find((event) => event.targetIds.includes(id) && event.hpAfter !== undefined);
        return [id, lastChange?.hpAfter ?? report.hpAtStart[id]];
      }),
    );
    expect(finalHpFromEvents).toEqual(report.hpAtEnd);
  });

  it('makes formation, stance, and priority change the deterministic result', () => {
    const baseline = applyGameCommand(battleStart('plan-impact-seed'), { type: 'COMMIT_TURN' });
    const initial = battleStart('plan-impact-seed');
    const striker = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'striker',
    )!;
    const support = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'support',
    )!;
    const changed = applyAll(
      [
        { type: 'SET_POSITION', characterId: striker.id, position: 'front' },
        { type: 'SET_STANCE', characterId: striker.id, stanceId: 'guarded' },
        { type: 'SET_STANCE', characterId: support.id, stanceId: 'tactical' },
        { type: 'SET_TEAM_PRIORITY', priorityId: 'conserve-power' },
        { type: 'COMMIT_TURN' },
      ],
      'plan-impact-seed',
    );
    expect(changed.battleReports[0]!.events).not.toEqual(baseline.battleReports[0]!.events);
    expect(changed.battleReports[0]!.hpAtEnd).not.toEqual(baseline.battleReports[0]!.hpAtEnd);
  });

  it('uses signatures, limitations, and explicit status interactions', () => {
    const state = applyGameCommand(battleStart('rules-seed'), { type: 'COMMIT_TURN' });
    const events = state.battleReports[0]!.events;
    const triggers = events.flatMap((event) => event.ruleTriggers ?? []);
    const statuses = events.flatMap(
      (event) => event.statusChanges?.map((change) => change.statusId) ?? [],
    );
    expect(triggers).toContain('rear-intercept');
    expect(triggers).toContain('exploit-exposed');
    expect(triggers).toContain('reaction:intercept-brace');
    expect(triggers).toContain('reaction:finisher-surge');
    expect(triggers).toContain('reaction:recovery-loop');
    expect(triggers).toContain('limitation:measured-strikes');
    expect(triggers).toContain('limitation:low-direct-output');
    expect(statuses).toContain('exposed');
    expect(statuses).toContain('strained');
    expect(statuses).toContain('marked');
    expect(statuses).toContain('warded');
    expect(statuses).toContain('inspired');
  });

  it('requires the Oathward to hold Front before intercepting the rear', () => {
    const initial = battleStart('front-intercept-gate');
    const vanguard = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'vanguard',
    )!;
    const moved = applyGameCommand(initial, {
      type: 'SET_POSITION',
      characterId: vanguard.id,
      position: 'centre',
    });
    const resolved = applyGameCommand(moved, { type: 'COMMIT_TURN' });
    expect(
      resolved.battleReports[0]!.events.some((event) =>
        event.ruleTriggers?.includes('rear-intercept'),
      ),
    ).toBe(false);
  });

  it('enforces the striker open-guard limitation when Aggressive at the front', () => {
    const initial = battleStart('open-guard-seed');
    const striker = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'striker',
    )!;
    const exposedPlan = applyGameCommand(initial, {
      type: 'SET_POSITION',
      characterId: striker.id,
      position: 'front',
    });
    const resolved = applyGameCommand(exposedPlan, { type: 'COMMIT_TURN' });
    expect(
      resolved.battleReports[0]!.events.some((event) =>
        event.ruleTriggers?.includes('limitation:open-guard'),
      ),
    ).toBe(true);
  });

  it('applies distinct direct-damage penalties for vanguard and support limitations', () => {
    expect(directDamageLimitationPenalty('measured-strikes')).toBe(1);
    expect(directDamageLimitationPenalty('low-direct-output')).toBe(2);
    expect(directDamageLimitationPenalty('open-guard')).toBe(0);
  });

  it('executes every second starting technique under its visible plan condition', () => {
    const initial = battleStart('second-techniques-seed');
    const striker = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'striker',
    )!;
    const support = initial.generatedDefinitions.characters.find(
      (hero) => hero.role === 'support',
    )!;
    const encounterIds = new Set(initial.currentEncounter!.enemyIds);
    const durableEnemies = Object.fromEntries(
      Object.entries(initial.generatedDefinitions.enemies).map(([id, enemy]) => [
        id,
        encounterIds.has(id)
          ? {
              ...enemy,
              stats: { vitality: 40, power: 1, guard: 8, speed: 1, focus: 1 },
            }
          : enemy,
      ]),
    );
    const durableStart = CanonicalGameStateSchema.parse({
      ...initial,
      generatedDefinitions: {
        ...initial.generatedDefinitions,
        enemies: durableEnemies,
        combatants: {
          ...initial.generatedDefinitions.combatants,
          ...Object.fromEntries([...encounterIds].map((id) => [id, durableEnemies[id]])),
        },
      },
    });
    const commands: GameCommand[] = [
      {
        type: 'SET_TEAM_PRIORITY',
        priorityId: 'protect-rear',
      },
      {
        type: 'SET_POSITION',
        characterId: striker.id,
        position: 'rear',
      },
      {
        type: 'SET_STANCE',
        characterId: striker.id,
        stanceId: 'tactical',
      },
      {
        type: 'SET_STANCE',
        characterId: support.id,
        stanceId: 'tactical',
      },
      { type: 'COMMIT_TURN' },
    ];
    const planned = commands.reduce(applyGameCommand, durableStart);
    const actions = new Set(planned.battleReports[0]!.events.map((event) => event.actionId));
    const statuses = planned.battleReports[0]!.events.flatMap(
      (event) => event.statusChanges?.map((change) => change.statusId) ?? [],
    );
    for (const hero of initial.generatedDefinitions.characters) {
      expect(actions).toContain(hero.techniqueIds[1]);
    }
    expect(statuses).toContain('staggered');
  });

  it('sets authored technique cooldowns and prevents consecutive-round reuse', () => {
    const resolved = applyGameCommand(battleStart('cooldown-seed'), { type: 'COMMIT_TURN' });
    const report = resolved.battleReports[0]!;
    expect(
      report.events.some((event) =>
        event.ruleTriggers?.some((trigger) => trigger.startsWith('cooldown-set:')),
      ),
    ).toBe(true);
    for (const hero of resolved.generatedDefinitions.characters) {
      for (const technique of hero.techniques) {
        const rounds = report.events
          .filter((event) => event.actorId === hero.id && event.actionId === technique.id)
          .map((event) => event.round);
        for (let index = 1; index < rounds.length; index += 1) {
          expect(rounds[index]! - rounds[index - 1]!).toBeGreaterThan(1);
        }
      }
    }
  });

  it('calculates a plan-sensitive forecast without consuming combat RNG', () => {
    const baseline = battleStart('forecast-seed');
    const before = baseline.rngStreams?.combat.position;
    const first = calculateForecast(baseline);
    const changedPlan = applyGameCommand(baseline, {
      type: 'SET_TEAM_PRIORITY',
      priorityId: 'protect-rear',
    });
    const second = calculateForecast(changedPlan);
    expect(first).not.toEqual(second);
    expect(baseline.rngStreams?.combat.position).toBe(before);
    expect(changedPlan.rngStreams?.combat.position).toBe(before);
  });

  it('raises forecast confidence when Bestiary knowledge improves', () => {
    const initial = battleStart('bestiary-forecast-seed');
    expect(calculateForecast(initial).confidence).toBe('moderate');
    const resolved = applyGameCommand(initial, { type: 'COMMIT_TURN' });
    const nextOperation = CanonicalGameStateSchema.parse({
      ...resolved,
      currentEncounter: initial.currentEncounter,
    });
    expect(calculateForecast(nextOperation).confidence).toBe('high');
  });
});
