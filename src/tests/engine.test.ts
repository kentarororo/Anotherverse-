import { describe, expect, it } from 'vitest';
import { calculateForecast } from '../engine/combat/forecast';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { GameCommandSchema, type GameCommand } from '../engine/model/commands';
import { CanonicalGameStateSchema, createEmptyGameState } from '../engine/model/state';
import { applyGameCommand, MilestoneNotReadyError } from '../engine/simulation/apply-command';

function start(seed = 'fixed-seed-001') {
  return applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
    type: 'START_CAMPAIGN',
    seed,
    selectedDraftIndex: 0,
  });
}

function applyAll(commands: GameCommand[], seed = 'combat-seed') {
  return commands.reduce(applyGameCommand, start(seed));
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

  it('initialises every named stream without consuming a draw', () => {
    const state = start('stream-seed');
    expect(state.rngStreams).not.toBeNull();
    expect(Object.values(state.rngStreams ?? {}).every((stream) => stream.position === 0)).toBe(
      true,
    );
  });

  it('swaps occupied formation positions so all three remain unique', () => {
    const state = applyGameCommand(start(), {
      type: 'SET_POSITION',
      characterId: 'dax-ren',
      position: 'front',
    });
    expect(state.pendingPlan.positions).toEqual({
      'mira-vale': 'centre',
      'dax-ren': 'front',
      'sorrel-voss': 'rear',
    });
  });

  it('keeps later milestone commands explicitly unavailable', () => {
    expect(() =>
      applyGameCommand(start(), { type: 'EQUIP_ITEM', characterId: 'mira-vale', itemId: 'none' }),
    ).toThrow(MilestoneNotReadyError);
  });
});

describe('Milestone 1 battle', () => {
  it('is byte-equivalent for the same seed and command sequence', () => {
    const commands: GameCommand[] = [
      { type: 'SET_STANCE', characterId: 'mira-vale', stanceId: 'tactical' },
      { type: 'SET_TEAM_PRIORITY', priorityId: 'focus-weakest' },
      { type: 'COMMIT_TURN' },
    ];
    expect(JSON.stringify(applyAll(commands))).toBe(JSON.stringify(applyAll(commands)));
  });

  it('terminates by round 12 and traces every attack HP and resource change', () => {
    const state = applyGameCommand(start('trace-seed'), { type: 'COMMIT_TURN' });
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
    const baseline = applyGameCommand(start('plan-impact-seed'), { type: 'COMMIT_TURN' });
    const changed = applyAll(
      [
        { type: 'SET_POSITION', characterId: 'dax-ren', position: 'front' },
        { type: 'SET_STANCE', characterId: 'dax-ren', stanceId: 'guarded' },
        { type: 'SET_STANCE', characterId: 'sorrel-voss', stanceId: 'tactical' },
        { type: 'SET_TEAM_PRIORITY', priorityId: 'conserve-power' },
        { type: 'COMMIT_TURN' },
      ],
      'plan-impact-seed',
    );
    expect(changed.battleReports[0]!.events).not.toEqual(baseline.battleReports[0]!.events);
    expect(changed.battleReports[0]!.hpAtEnd).not.toEqual(baseline.battleReports[0]!.hpAtEnd);
  });

  it('uses signatures, limitations, and explicit status interactions', () => {
    const state = applyGameCommand(start('rules-seed'), { type: 'COMMIT_TURN' });
    const events = state.battleReports[0]!.events;
    const triggers = events.flatMap((event) => event.ruleTriggers ?? []);
    const statuses = events.flatMap(
      (event) => event.statusChanges?.map((change) => change.statusId) ?? [],
    );
    expect(triggers).toContain('rear-intercept');
    expect(triggers).toContain('exploit-exposed');
    expect(statuses).toContain('exposed');
    expect(statuses).toContain('strained');
    expect(statuses).toContain('marked');
    expect(statuses).toContain('warded');
  });

  it('calculates a plan-sensitive forecast without consuming combat RNG', () => {
    const baseline = start('forecast-seed');
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
});
