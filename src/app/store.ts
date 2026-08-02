import { create } from 'zustand';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import type { CanonicalGameState } from '../engine/model/state';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';
import { LocalStorageSaveRepository } from '../persistence/LocalStorageSaveRepository';
import type { SaveLoadResult } from '../persistence/SaveRepository';

const saveRepository = new LocalStorageSaveRepository(globalThis.localStorage);

interface AppStore {
  game: CanonicalGameState;
  saveStatus: SaveLoadResult;
  settingsOpen: boolean;
  startCampaign: (seed: string) => void;
  continueCampaign: () => void;
  returnToTitle: () => void;
  clearInvalidSave: () => void;
  setSettingsOpen: (open: boolean) => void;
}

const initialSave = saveRepository.load();

export const useAppStore = create<AppStore>((set, get) => ({
  game: createEmptyGameState(CONTENT_MANIFEST_HASH),
  saveStatus: initialSave,
  settingsOpen: false,
  startCampaign: (seed) => {
    const nextState = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed,
      selectedDraftIndex: 0,
    });
    saveRepository.save(nextState);
    set({ game: nextState, saveStatus: { status: 'ok', state: nextState } });
  },
  continueCampaign: () => {
    const saveStatus = get().saveStatus;
    if (saveStatus.status === 'ok') set({ game: saveStatus.state });
  },
  returnToTitle: () => {
    set({ game: createEmptyGameState(CONTENT_MANIFEST_HASH) });
  },
  clearInvalidSave: () => {
    saveRepository.clear();
    set({ saveStatus: { status: 'empty' } });
  },
  setSettingsOpen: (settingsOpen) => set({ settingsOpen }),
}));
