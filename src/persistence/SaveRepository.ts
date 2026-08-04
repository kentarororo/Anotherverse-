import type { CanonicalGameState } from '../engine/model/state';

export type SaveLoadResult =
  | { status: 'empty' }
  | { status: 'ok'; state: CanonicalGameState }
  | { status: 'corrupt'; reason: string }
  | {
      status: 'incompatible';
      foundVersion: number | null;
      reason?: string;
      foundContentManifestHash?: string | null;
    };

export interface SaveRepository {
  load(): SaveLoadResult;
  save(state: CanonicalGameState): void;
  clear(): void;
}
