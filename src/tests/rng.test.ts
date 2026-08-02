import { describe, expect, it } from 'vitest';
import { createRngStreams, drawFromStream, drawInteger } from '../engine/rng/streams';

describe('named RNG streams', () => {
  it('returns identical draws for the same seed and stream', () => {
    const first = drawFromStream(createRngStreams('repeatable-seed'), 'combat');
    const second = drawFromStream(createRngStreams('repeatable-seed'), 'combat');

    expect(first).toEqual(second);
  });

  it('keeps narration draws isolated from combat', () => {
    const baseline = createRngStreams('isolated-seed');
    const narrationDraw = drawFromStream(baseline, 'narration');
    const combatAfterNarration = drawFromStream(narrationDraw.streams, 'combat');
    const directCombat = drawFromStream(baseline, 'combat');

    expect(combatAfterNarration.uint32).toBe(directCombat.uint32);
    expect(combatAfterNarration.streams.combat.position).toBe(1);
    expect(combatAfterNarration.streams.narration.position).toBe(1);
  });

  it('draws within inclusive integer bounds', () => {
    let streams = createRngStreams('bounds-seed');
    const values: number[] = [];

    for (let index = 0; index < 100; index += 1) {
      const draw = drawInteger(streams, 'world', 2, 5);
      values.push(draw.value);
      streams = draw.streams;
    }

    expect(values.every((value) => value >= 2 && value <= 5)).toBe(true);
    expect(streams.world.position).toBe(100);
  });
});
