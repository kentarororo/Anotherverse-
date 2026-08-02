import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { GameCommandSchema } from '../engine/model/commands';
import { CanonicalGameStateSchema, createEmptyGameState } from '../engine/model/state';
import { applyGameCommand, MilestoneNotReadyError } from '../engine/simulation/apply-command';

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
  });

  it('initialises every named stream without consuming a draw', () => {
    const state = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed: 'stream-seed',
      selectedDraftIndex: 0,
    });

    expect(state.rngStreams).not.toBeNull();
    expect(Object.values(state.rngStreams ?? {}).every((stream) => stream.position === 0)).toBe(
      true,
    );
  });

  it('fails loudly for commands reserved for later milestones', () => {
    const emptyState = createEmptyGameState(CONTENT_MANIFEST_HASH);

    expect(() => applyGameCommand(emptyState, { type: 'COMMIT_TURN' })).toThrow(
      MilestoneNotReadyError,
    );
  });
});
