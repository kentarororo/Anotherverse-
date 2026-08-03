import { describe, expect, it } from 'vitest';
import type { BattleReport, CombatEvent } from '../engine/reports/combat';
import { COMBAT_FRAMES_PER_EVENT_TYPE, renderCombatEvent } from '../narrative/realiser/combat';

const report: BattleReport = {
  id: 'frame-report',
  turn: 1,
  outcome: 'victory',
  rounds: 1,
  events: [],
  rngStartPosition: 0,
  rngEndPosition: 0,
  combatantNames: { actor: 'Mira', target: 'Rift Hound' },
  actionNames: { test: 'Test Action' },
  hpAtStart: { actor: 40, target: 20 },
  hpAtEnd: { actor: 40, target: 15 },
};

function event(eventType: CombatEvent['eventType'], index: number): CombatEvent {
  return {
    index,
    round: 4,
    actorId: 'actor',
    actionId: 'test',
    targetIds: ['target'],
    eventType,
    rawAmount: 8,
    mitigatedAmount: 3,
    finalAmount: 5,
    hpBefore: 20,
    hpAfter: 15,
    resourceBefore: 2,
    resourceAfter: 1,
    statusChanges: [
      {
        statusId: 'marked',
        stacksBefore: 1,
        stacksAfter: 1,
        durationBefore: 2,
        durationAfter: 1,
      },
    ],
    tags: ['fixture'],
  };
}

describe('combat narrative frames', () => {
  it('provides four complete deterministic frames for every event type', () => {
    const eventTypes: CombatEvent['eventType'][] = [
      'attack',
      'heal',
      'guard',
      'status',
      'interrupt',
      'defeat',
      'resource',
    ];
    expect(COMBAT_FRAMES_PER_EVENT_TYPE).toBe(4);

    for (const eventType of eventTypes) {
      const variants = Array.from({ length: COMBAT_FRAMES_PER_EVENT_TYPE }, (_, index) =>
        renderCombatEvent(report, event(eventType, index)),
      );
      expect(new Set(variants).size, eventType).toBe(COMBAT_FRAMES_PER_EVENT_TYPE);
      expect(
        variants.every((variant) => variant.endsWith('.')),
        eventType,
      ).toBe(true);
      expect(
        variants.every((variant) => !variant.includes('{')),
        eventType,
      ).toBe(true);
    }
  });

  it('renders exact decided values without mutating mechanics', () => {
    const decidedEvent = event('attack', 0);
    const snapshot = JSON.stringify({ report, decidedEvent });
    const text = renderCombatEvent(report, decidedEvent);
    expect(text).toContain('8');
    expect(text).toContain('5');
    expect(text).toContain('15 HP');
    expect(JSON.stringify({ report, decidedEvent })).toBe(snapshot);
  });
});
