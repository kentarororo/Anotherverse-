import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import type { CombatantDefinition } from '../engine/model/combat';
import type { BattleReport, CombatEvent } from '../engine/reports/combat';
import {
  BattlePlaybackStage,
  BEAT_DURATION_MS,
  deriveSpriteState,
  formatEventCue,
  selectBattleBeats,
} from '../ui/components/BattlePlaybackStage';

function event(overrides: Partial<CombatEvent>): CombatEvent {
  return {
    index: 0,
    round: 1,
    actorId: 'hero',
    actionId: 'test-action',
    targetIds: ['enemy'],
    eventType: 'status',
    tags: [],
    ...overrides,
  };
}

const hero: CombatantDefinition = {
  id: 'hero',
  name: 'Injured Hero',
  side: 'heroes',
  role: 'vanguard',
  policyId: 'vanguard',
  stats: { vitality: 12, power: 7, guard: 12, speed: 6, focus: 8 },
  maxResource: 5,
  basicActionId: 'strike',
  techniqueIds: [],
  signature: 'Test signature',
  signatureRuleId: 'test-signature',
  limitation: 'Test limitation',
  limitationRuleId: 'test-limitation',
  threat: 1,
};

const enemy: CombatantDefinition = {
  ...hero,
  id: 'enemy',
  name: 'Test Enemy',
  side: 'enemies',
  role: 'charger',
  policyId: 'charger',
  stats: { vitality: 8, power: 8, guard: 6, speed: 8, focus: 6 },
};

afterEach(() => {
  delete document.documentElement.dataset.reduceMotion;
});

describe('battle playback presentation mapping', () => {
  it('selects key actions in order at normal autobattler speed', () => {
    const events = Array.from({ length: 24 }, (_, index) =>
      event({
        index,
        actionId: index % 5 === 0 ? 'end-round' : `action-${index}`,
        eventType: index % 5 === 0 ? 'status' : 'attack',
      }),
    );
    const beats = selectBattleBeats(events);
    expect(BEAT_DURATION_MS).toBe(650);
    expect(beats).toHaveLength(18);
    expect(beats.map((beat) => beat.index)).toEqual(
      [...beats].sort((left, right) => left.index - right.index).map((beat) => beat.index),
    );
    expect(beats[0]?.index).toBe(1);
    expect(beats.at(-1)?.index).toBe(23);
  });

  it('reserves hit for real damage and gives non-damage recipients distinct states', () => {
    expect(
      deriveSpriteState('enemy', event({ eventType: 'attack', finalAmount: 7, tags: ['hit'] }), 20),
    ).toBe('hit');
    expect(
      deriveSpriteState(
        'enemy',
        event({ eventType: 'attack', finalAmount: 0, tags: ['miss'] }),
        20,
      ),
    ).toBe('idle');
    expect(deriveSpriteState('enemy', event({ eventType: 'guard' }), 20)).toBe('guarded');
    expect(
      deriveSpriteState(
        'enemy',
        event({
          eventType: 'status',
          statusChanges: [
            {
              statusId: 'inspired',
              stacksBefore: 0,
              stacksAfter: 1,
              durationBefore: 0,
              durationAfter: 2,
            },
          ],
        }),
        20,
      ),
    ).toBe('buffed');
    expect(
      deriveSpriteState(
        'enemy',
        event({
          eventType: 'status',
          statusChanges: [
            {
              statusId: 'marked',
              stacksBefore: 0,
              stacksAfter: 1,
              durationBefore: 0,
              durationAfter: 2,
            },
          ],
        }),
        20,
      ),
    ).toBe('affected');
    expect(
      deriveSpriteState(
        'hero',
        event({
          actorId: 'hero',
          targetIds: ['hero'],
          eventType: 'resource',
          resourceBefore: 1,
          resourceAfter: 3,
        }),
        20,
      ),
    ).toBe('empowered');
  });

  it('composes damage and applied status in one readable cue', () => {
    expect(
      formatEventCue(
        event({
          eventType: 'attack',
          finalAmount: 7,
          tags: ['hit'],
          statusChanges: [
            {
              statusId: 'exposed',
              stacksBefore: 0,
              stacksAfter: 1,
              durationBefore: 0,
              durationAfter: 2,
            },
          ],
        }),
      ),
    ).toBe('-7 HP · Applies Exposed');
  });

  it('uses canonical maximum HP when a combatant enters injured', () => {
    document.documentElement.dataset.reduceMotion = 'true';
    const report: BattleReport = {
      id: 'injured-entry-report',
      turn: 2,
      outcome: 'victory',
      rounds: 1,
      events: [event({ eventType: 'attack', finalAmount: 1, hpBefore: 32, hpAfter: 31 })],
      rngStartPosition: 0,
      rngEndPosition: 1,
      combatantNames: { hero: hero.name, enemy: enemy.name },
      actionNames: { 'test-action': 'Test Action' },
      hpAtStart: { hero: 7, enemy: 32 },
      hpAtEnd: { hero: 7, enemy: 31 },
    };

    const { container } = render(
      <BattlePlaybackStage
        report={report}
        combatants={{ hero, enemy }}
        heroIds={['hero']}
        enemyIds={['enemy']}
        assetIds={{ hero: 'storm-bastion', enemy: 'rift-hound' }}
        arenaId="m1-glassline-breach"
      />,
    );

    expect(screen.getByText('7/40')).toBeInTheDocument();
    expect(screen.queryByText('7/7')).not.toBeInTheDocument();
    expect(screen.getByText('Test Action')).toBeInTheDocument();
    expect(container.querySelector('[data-playback-state="paused"]')).toBeInTheDocument();
    expect(
      container.querySelector('[data-art-slot="arena:m1-glassline-breach"]'),
    ).toBeInTheDocument();
    expect(container.querySelector('[data-art-slot="unit:storm-bastion"]')).toBeInTheDocument();
    expect(container.querySelector('[data-art-slot="unit:rift-hound"]')).toBeInTheDocument();
    expect(container.querySelector('[data-art-slot="vfx:event-attack"]')).toBeInTheDocument();
  });
});
