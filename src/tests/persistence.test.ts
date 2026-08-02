import { beforeEach, describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';
import {
  LocalStorageSaveRepository,
  type StorageLike,
} from '../persistence/LocalStorageSaveRepository';

class MemoryStorage implements StorageLike {
  private readonly values = new Map<string, string>();

  public getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  public setItem(key: string, value: string): void {
    this.values.set(key, value);
  }

  public removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('save repository boundary', () => {
  let storage: MemoryStorage;
  let repository: LocalStorageSaveRepository;

  beforeEach(() => {
    storage = new MemoryStorage();
    repository = new LocalStorageSaveRepository(storage);
  });

  it('round-trips canonical state without changing it', () => {
    const state = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed: 'save-seed',
      selectedDraftIndex: 0,
    });

    repository.save(state);
    const loaded = repository.load();

    expect(loaded.status).toBe('ok');
    if (loaded.status === 'ok') expect(JSON.stringify(loaded.state)).toBe(JSON.stringify(state));
  });

  it('resumes to the same future battle outcome', () => {
    let planned = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed: 'resume-seed',
      selectedDraftIndex: 0,
    });
    planned = applyGameCommand(planned, {
      type: 'SET_TEAM_PRIORITY',
      priorityId: 'focus-weakest',
    });
    repository.save(planned);
    const loaded = repository.load();
    expect(loaded.status).toBe('ok');
    if (loaded.status !== 'ok') return;

    const uninterrupted = applyGameCommand(planned, { type: 'COMMIT_TURN' });
    const resumed = applyGameCommand(loaded.state, { type: 'COMMIT_TURN' });
    expect(JSON.stringify(resumed)).toBe(JSON.stringify(uninterrupted));
  });

  it('distinguishes corrupted and incompatible saves', () => {
    storage.setItem('anotherverse.prototype.autosave', '{broken');
    expect(repository.load().status).toBe('corrupt');

    storage.setItem(
      'anotherverse.prototype.autosave',
      JSON.stringify({ schemaVersion: 999, state: {} }),
    );
    expect(repository.load()).toEqual({ status: 'incompatible', foundVersion: 999 });
  });

  it('can explicitly clear the slot', () => {
    storage.setItem('anotherverse.prototype.autosave', '{}');
    repository.clear();
    expect(repository.load()).toEqual({ status: 'empty' });
  });
});
