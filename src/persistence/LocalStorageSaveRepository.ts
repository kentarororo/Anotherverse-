import { z } from 'zod';
import {
  CanonicalGameStateSchema,
  GAME_SCHEMA_VERSION,
  type CanonicalGameState,
} from '../engine/model/state';
import type { SaveLoadResult, SaveRepository } from './SaveRepository';

const SAVE_KEY = 'anotherverse.prototype.autosave';

const SaveEnvelopeSchema = z.object({
  schemaVersion: z.literal(GAME_SCHEMA_VERSION),
  savedAtCommandIndex: z.number().int().nonnegative(),
  state: CanonicalGameStateSchema,
});

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export class LocalStorageSaveRepository implements SaveRepository {
  public constructor(
    private readonly storage: StorageLike,
    private readonly expectedContentManifestHash: string,
  ) {}

  public load(): SaveLoadResult {
    const serialised = this.storage.getItem(SAVE_KEY);
    if (serialised === null) return { status: 'empty' };

    let candidate: unknown;
    try {
      candidate = JSON.parse(serialised);
    } catch {
      return { status: 'corrupt', reason: 'The autosave is not valid JSON.' };
    }

    const version = this.readVersion(candidate);
    if (version !== GAME_SCHEMA_VERSION) {
      return { status: 'incompatible', foundVersion: version };
    }

    const result = SaveEnvelopeSchema.safeParse(candidate);
    if (!result.success) {
      return { status: 'corrupt', reason: result.error.issues[0]?.message ?? 'Invalid save.' };
    }

    const foundContentManifestHash = result.data.state.contentManifestHash;
    if (foundContentManifestHash !== this.expectedContentManifestHash) {
      return {
        status: 'incompatible',
        foundVersion: version,
        foundContentManifestHash,
        reason:
          'This autosave was created with different story or gameplay content and cannot be safely continued in this build.',
      };
    }

    return { status: 'ok', state: result.data.state };
  }

  public save(state: CanonicalGameState): void {
    const validState = CanonicalGameStateSchema.parse(state);
    const envelope = SaveEnvelopeSchema.parse({
      schemaVersion: GAME_SCHEMA_VERSION,
      savedAtCommandIndex: validState.commandHistory.length,
      state: validState,
    });
    this.storage.setItem(SAVE_KEY, JSON.stringify(envelope));
  }

  public clear(): void {
    this.storage.removeItem(SAVE_KEY);
  }

  private readVersion(candidate: unknown): number | null {
    if (typeof candidate !== 'object' || candidate === null || !('schemaVersion' in candidate)) {
      return null;
    }
    const version = candidate.schemaVersion;
    return typeof version === 'number' ? version : null;
  }
}
