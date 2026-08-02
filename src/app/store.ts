import { create } from 'zustand';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import type { CanonicalGameState } from '../engine/model/state';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';
import { LocalStorageSaveRepository } from '../persistence/LocalStorageSaveRepository';
import type { SaveLoadResult } from '../persistence/SaveRepository';
import type { Position } from '../engine/model/commands';

const saveRepository = new LocalStorageSaveRepository(globalThis.localStorage);

interface AppStore {
  game: CanonicalGameState;
  saveStatus: SaveLoadResult;
  turnView: 'planning' | 'aftermath';
  startCampaign: (seed: string) => void;
  continueCampaign: () => void;
  returnToTitle: () => void;
  clearInvalidSave: () => void;
  setPosition: (characterId: string, position: Position) => void;
  setStance: (characterId: string, stanceId: string) => void;
  setTeamPriority: (priorityId: string) => void;
  commitTurn: () => void;
  continueToPlanning: () => void;
}

const initialSave = saveRepository.load();

export const useAppStore = create<AppStore>((set, get) => ({
  game: createEmptyGameState(CONTENT_MANIFEST_HASH),
  saveStatus: initialSave,
  turnView: 'planning',
  startCampaign: (seed) => {
    const nextState = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed,
      selectedDraftIndex: 0,
    });
    saveRepository.save(nextState);
    set({ game: nextState, saveStatus: { status: 'ok', state: nextState }, turnView: 'planning' });
  },
  continueCampaign: () => {
    const saveStatus = get().saveStatus;
    if (saveStatus.status === 'ok') set({ game: saveStatus.state, turnView: 'planning' });
  },
  returnToTitle: () => {
    set({ game: createEmptyGameState(CONTENT_MANIFEST_HASH), turnView: 'planning' });
  },
  clearInvalidSave: () => {
    saveRepository.clear();
    set({ saveStatus: { status: 'empty' } });
  },
  setPosition: (characterId, position) => {
    set({ game: applyGameCommand(get().game, { type: 'SET_POSITION', characterId, position }) });
  },
  setStance: (characterId, stanceId) => {
    set({ game: applyGameCommand(get().game, { type: 'SET_STANCE', characterId, stanceId }) });
  },
  setTeamPriority: (priorityId) => {
    set({ game: applyGameCommand(get().game, { type: 'SET_TEAM_PRIORITY', priorityId }) });
  },
  commitTurn: () => {
    const nextState = applyGameCommand(get().game, { type: 'COMMIT_TURN' });
    saveRepository.save(nextState);
    set({
      game: nextState,
      saveStatus: { status: 'ok', state: nextState },
      turnView: 'aftermath',
    });
  },
  continueToPlanning: () => set({ turnView: 'planning' }),
}));
