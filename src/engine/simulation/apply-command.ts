import type { GameCommand } from '../model/commands';
import { GameCommandSchema } from '../model/commands';
import {
  CanonicalGameStateSchema,
  type CanonicalGameState,
  createEmptyGameState,
} from '../model/state';
import type { CampaignBible } from '../model/world';
import { createRngStreams } from '../rng/streams';

export class MilestoneNotReadyError extends Error {
  public readonly commandType: GameCommand['type'];

  public constructor(commandType: GameCommand['type']) {
    super(`${commandType} is contracted but not implemented in Milestone 0.`);
    this.name = 'MilestoneNotReadyError';
    this.commandType = commandType;
  }
}

function createFoundationCampaignBible(seed: string): CampaignBible {
  return {
    seed,
    city: { id: 'city-foundation', name: 'Foundation City', tags: ['temporary', 'urban'] },
    civicOrder: {
      id: 'civic-order-foundation',
      name: 'Civic Breach Office',
      mandate: 'License squads and contain active breaches.',
      tags: ['temporary', 'regulator'],
    },
    guildModel: {
      id: 'guild-model-foundation',
      name: 'Licensed Squads',
      mandate: 'Contract small teams for district operations.',
      tags: ['temporary', 'contract'],
    },
    rankSystem: {
      id: 'rank-system-foundation',
      tiers: ['Unranked', 'Bronze', 'Silver', 'Gold'],
    },
    breachLaw: {
      id: 'breach-law-foundation',
      summary: 'Every breach leaves measurable pressure and must be formally closed.',
    },
    powerLaw: {
      id: 'power-law-foundation',
      summary: 'A Calling grows when its bearer fulfils an explicit personal condition.',
    },
    threatEcology: {
      id: 'ecology-foundation',
      summary: 'Threats adapt to the districts in which breaches remain open.',
      tags: ['temporary'],
    },
    activeFactions: [],
    terminology: {
      heroCollective: 'licensed squad',
      incursion: 'breach',
      powerSource: 'Calling',
      technique: 'technique',
    },
    toneProfileId: 'modern-progression-foundation',
  };
}

function appendCommand(state: CanonicalGameState, command: GameCommand): CanonicalGameState {
  return {
    ...state,
    commandHistory: [...state.commandHistory, { index: state.commandHistory.length, command }],
  };
}

export function applyGameCommand(
  currentState: CanonicalGameState,
  rawCommand: GameCommand,
): CanonicalGameState {
  const state = CanonicalGameStateSchema.parse(currentState);
  const command = GameCommandSchema.parse(rawCommand);

  if (command.type === 'START_CAMPAIGN') {
    const nextState = createEmptyGameState(state.contentManifestHash);
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...nextState,
          phase: 'command',
          campaignSeed: command.seed,
          selectedDraftIndex: command.selectedDraftIndex,
          campaignBible: createFoundationCampaignBible(command.seed),
          rngStreams: createRngStreams(command.seed),
        },
        command,
      ),
    );
  }

  throw new MilestoneNotReadyError(command.type);
}
