import { create } from 'zustand';
import { CONTENT_MANIFEST_HASH } from '../content/manifest';
import type { CanonicalGameState } from '../engine/model/state';
import { createEmptyGameState } from '../engine/model/state';
import { applyGameCommand } from '../engine/simulation/apply-command';
import { LocalStorageSaveRepository } from '../persistence/LocalStorageSaveRepository';
import type { SaveLoadResult } from '../persistence/SaveRepository';
import type { Position } from '../engine/model/commands';
import { generateCampaignDraft, type CampaignDraft } from '../engine/generation/campaign';
import { createCampaignSeed } from './seed';

const saveRepository = new LocalStorageSaveRepository(
  globalThis.localStorage,
  CONTENT_MANIFEST_HASH,
);

interface AppStore {
  game: CanonicalGameState;
  appScreen: 'title' | 'creation' | 'command';
  campaignDraft: CampaignDraft | null;
  drawer: {
    type: 'character' | 'equipment' | 'bestiary' | 'world' | 'logs' | 'debug';
    id?: string;
  } | null;
  saveStatus: SaveLoadResult;
  turnView: 'planning' | 'aftermath';
  startCampaign: (seed: string) => void;
  confirmCampaign: () => void;
  regenerateCampaign: () => void;
  cancelCampaignDraft: () => void;
  continueCampaign: () => void;
  returnToTitle: () => void;
  clearInvalidSave: () => void;
  setPosition: (characterId: string, position: Position) => void;
  setStance: (characterId: string, stanceId: string) => void;
  setTeamPriority: (priorityId: string) => void;
  chooseSituation: (choiceId: string) => void;
  commitTurn: () => void;
  continueToPlanning: () => void;
  openDrawer: (drawer: NonNullable<AppStore['drawer']>) => void;
  closeDrawer: () => void;
  equipItem: (characterId: string, itemId: string) => void;
  learnTechnique: (characterId: string, techniqueId: string) => void;
}

const initialSave = saveRepository.load();
let drawerReturnFocus: HTMLElement | null = null;

export const useAppStore = create<AppStore>((set, get) => ({
  game: createEmptyGameState(CONTENT_MANIFEST_HASH),
  appScreen: 'title',
  campaignDraft: null,
  drawer: null,
  saveStatus: initialSave,
  turnView: 'planning',
  startCampaign: (seed) => {
    set({ campaignDraft: generateCampaignDraft(seed), appScreen: 'creation' });
  },
  confirmCampaign: () => {
    const draft = get().campaignDraft;
    if (draft === null) return;
    const nextState = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed: draft.seed,
      selectedDraftIndex: 0,
    });
    saveRepository.save(nextState);
    set({
      game: nextState,
      saveStatus: { status: 'ok', state: nextState },
      turnView: 'planning',
      appScreen: 'command',
      campaignDraft: null,
    });
  },
  regenerateCampaign: () => {
    set({ campaignDraft: generateCampaignDraft(createCampaignSeed()) });
  },
  cancelCampaignDraft: () => set({ campaignDraft: null, appScreen: 'title' }),
  continueCampaign: () => {
    const saveStatus = get().saveStatus;
    if (saveStatus.status === 'ok') {
      set({ game: saveStatus.state, turnView: 'planning', appScreen: 'command' });
    }
  },
  returnToTitle: () => {
    set({
      game: createEmptyGameState(CONTENT_MANIFEST_HASH),
      turnView: 'planning',
      appScreen: 'title',
    });
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
  chooseSituation: (choiceId) => {
    set({ game: applyGameCommand(get().game, { type: 'CHOOSE_SITUATION', choiceId }) });
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
  openDrawer: (drawer) => {
    drawerReturnFocus =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    set({ drawer });
  },
  closeDrawer: () => {
    set({ drawer: null });
    queueMicrotask(() => drawerReturnFocus?.focus());
  },
  equipItem: (characterId, itemId) => {
    const nextState = applyGameCommand(get().game, { type: 'EQUIP_ITEM', characterId, itemId });
    saveRepository.save(nextState);
    set({ game: nextState, saveStatus: { status: 'ok', state: nextState } });
  },
  learnTechnique: (characterId, techniqueId) => {
    const nextState = applyGameCommand(get().game, {
      type: 'LEARN_TECHNIQUE',
      characterId,
      techniqueId,
    });
    saveRepository.save(nextState);
    set({ game: nextState, saveStatus: { status: 'ok', state: nextState } });
  },
}));
