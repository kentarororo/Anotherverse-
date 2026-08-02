import type { CanonicalGameState } from '../engine/model/state';

export type SaveLoadResult =
  | { status: 'empty' }
  | { status: 'ok'; state: CanonicalGameState }
  | { status: 'corrupt'; reason: string }
  | { status: 'incompatible'; foundVersion: number | null };

export interface SaveRepository {
  load(): SaveLoadResult;
  save(state: CanonicalGameState): void;
  clear(): void;
}
