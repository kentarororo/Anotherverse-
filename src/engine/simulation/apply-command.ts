import type { GameCommand } from '../model/commands';
import { GameCommandSchema } from '../model/commands';
import {
  CanonicalGameStateSchema,
  type CanonicalGameState,
  createEmptyGameState,
} from '../model/state';
import type { CampaignBible } from '../model/world';
import { createRngStreams } from '../rng/streams';
import {
  createMilestoneOneDefinitions,
  createMilestoneOnePartyState,
  defaultPositions,
  defaultStances,
  temporaryEncounter,
} from '../../content/milestone-one';
import { StanceIdSchema, TeamPriorityIdSchema } from '../model/combat';
import { simulateBattle } from '../combat/simulate';

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
          generatedDefinitions: createMilestoneOneDefinitions(),
          partyState: createMilestoneOnePartyState(),
          currentEncounter: temporaryEncounter,
          pendingPlan: {
            positions: defaultPositions,
            stanceIds: defaultStances,
            teamPriorityId: 'break-threat',
            situationChoiceId: null,
          },
        },
        command,
      ),
    );
  }

  if (state.phase !== 'command') throw new Error(`${command.type} requires an active campaign.`);

  if (command.type === 'SET_POSITION') {
    if (state.partyState[command.characterId] === undefined) throw new Error('Unknown character.');
    const currentPosition = state.pendingPlan.positions[command.characterId];
    const occupant = Object.entries(state.pendingPlan.positions).find(
      ([id, position]) => id !== command.characterId && position === command.position,
    );
    const positions = { ...state.pendingPlan.positions, [command.characterId]: command.position };
    if (occupant !== undefined && currentPosition !== undefined)
      positions[occupant[0]] = currentPosition;
    return CanonicalGameStateSchema.parse(
      appendCommand({ ...state, pendingPlan: { ...state.pendingPlan, positions } }, command),
    );
  }

  if (command.type === 'SET_STANCE') {
    if (state.partyState[command.characterId] === undefined) throw new Error('Unknown character.');
    const stanceId = StanceIdSchema.parse(command.stanceId);
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...state,
          pendingPlan: {
            ...state.pendingPlan,
            stanceIds: { ...state.pendingPlan.stanceIds, [command.characterId]: stanceId },
          },
        },
        command,
      ),
    );
  }

  if (command.type === 'SET_TEAM_PRIORITY') {
    const priorityId = TeamPriorityIdSchema.parse(command.priorityId);
    return CanonicalGameStateSchema.parse(
      appendCommand(
        { ...state, pendingPlan: { ...state.pendingPlan, teamPriorityId: priorityId } },
        command,
      ),
    );
  }

  if (command.type === 'CHOOSE_SITUATION') {
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...state,
          pendingPlan: { ...state.pendingPlan, situationChoiceId: command.choiceId },
        },
        command,
      ),
    );
  }

  if (command.type === 'COMMIT_TURN') {
    const result = simulateBattle(state);
    const factId = result.aftermath.factIdsWritten[0]!;
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...state,
          turn: state.turn + 1,
          threat: Math.min(100, state.threat + (result.report.outcome === 'victory' ? 3 : 8)),
          supplies: state.supplies + result.aftermath.suppliesDelta,
          partyState: result.partyState,
          rngStreams: result.streams,
          battleReports: [...state.battleReports, result.report],
          aftermathReports: [...state.aftermathReports, result.aftermath],
          worldFacts: [
            ...state.worldFacts,
            {
              id: factId,
              kind: 'operation-result',
              subjectId: 'licensed-squad',
              relation: 'resolved-glassline-breach',
              value: result.report.outcome,
              createdTurn: state.turn,
              sourceEventId: result.report.id,
              tags: ['milestone-one', result.report.outcome],
              active: true,
            },
          ],
        },
        command,
      ),
    );
  }

  throw new MilestoneNotReadyError(command.type);
}
