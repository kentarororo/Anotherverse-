import type { GameCommand } from '../model/commands';
import { GameCommandSchema } from '../model/commands';
import {
  CanonicalGameStateSchema,
  type CanonicalGameState,
  createEmptyGameState,
} from '../model/state';
import {
  createDefaultPositions,
  createDefaultStances,
  encounterForId,
  encounterForOperationTemplate,
  materialIdByEnemyId,
} from '../../content/milestone-one';
import { StanceIdSchema, TeamPriorityIdSchema } from '../model/combat';
import { simulateBattle } from '../combat/simulate';
import { createGeneratedCampaignState } from '../generation/campaign';
import { selectNextScenario } from '../director/scenario-director';
import { resolveMaterialFusion } from '../progression/crafting';

export class MilestoneNotReadyError extends Error {
  public readonly commandType: GameCommand['type'];

  public constructor(commandType: GameCommand['type']) {
    super(`${commandType} is contracted but not implemented in Milestone 0.`);
    this.name = 'MilestoneNotReadyError';
    this.commandType = commandType;
  }
}

function appendCommand(state: CanonicalGameState, command: GameCommand): CanonicalGameState {
  return {
    ...state,
    commandHistory: [...state.commandHistory, { index: state.commandHistory.length, command }],
  };
}

function squadRankForReputation(reputation: number, tiers: readonly string[] = []): string {
  const [first = 'Ash', second = 'Bronze', third = 'Silver', fourth = 'Gold'] = tiers;
  if (reputation >= 18) return fourth;
  if (reputation >= 12) return third;
  if (reputation >= 6) return second;
  return first;
}

function encounterForSelection(
  scenario: NonNullable<CanonicalGameState['currentScenario']>,
  choice: NonNullable<CanonicalGameState['currentScenario']>['choices'][number],
) {
  if (choice.encounterId !== undefined) {
    return { ...encounterForId(choice.encounterId), title: scenario.title };
  }
  return scenario.category === 'operation'
    ? { ...encounterForOperationTemplate(scenario.templateId), title: scenario.title }
    : null;
}

function openingCompanionIds(state: CanonicalGameState): string[] {
  return state.generatedDefinitions.characters
    .filter((hero) => hero.id !== state.leadCharacterId)
    .map((hero) => hero.id);
}

function characterRecruitedOnTurn(state: CanonicalGameState): string | null {
  if (state.turn < 1 || state.turn > 2) return null;
  const characterId = openingCompanionIds(state)[state.turn - 1];
  return characterId === undefined || state.recruitedCharacterIds.includes(characterId)
    ? null
    : characterId;
}

function materialRewardsForVictory(state: CanonicalGameState, victory: boolean): string[] {
  if (!victory || state.currentEncounter === null) return [];
  return state.currentEncounter.enemyIds.flatMap((enemyId) => {
    const materialId = materialIdByEnemyId[enemyId];
    return materialId === undefined ? [] : [materialId];
  });
}

function addMaterials(
  inventory: Record<string, number>,
  materialIds: readonly string[],
): Record<string, number> {
  const next = { ...inventory };
  for (const materialId of materialIds) next[materialId] = (next[materialId] ?? 0) + 1;
  return next;
}

function requiredMaterialCounts(materialIds: readonly string[]) {
  const counts: Record<string, number> = {};
  for (const materialId of materialIds) counts[materialId] = (counts[materialId] ?? 0) + 1;
  return counts;
}

export function applyGameCommand(
  currentState: CanonicalGameState,
  rawCommand: GameCommand,
): CanonicalGameState {
  const state = CanonicalGameStateSchema.parse(currentState);
  const command = GameCommandSchema.parse(rawCommand);

  if (command.type === 'START_CAMPAIGN') {
    const nextState = createEmptyGameState(state.contentManifestHash);
    const generated = createGeneratedCampaignState(command.seed);
    const characters = generated.draft.characters;
    const [firstCharacter, secondCharacter, thirdCharacter] = characters;
    if (
      firstCharacter === undefined ||
      secondCharacter === undefined ||
      thirdCharacter === undefined
    ) {
      throw new Error('Campaign generation did not produce a complete trio.');
    }
    const faction = generated.draft.bible.activeFactions[0]!;
    const lead =
      characters.find((character) => character.id === command.leadCharacterId) ??
      (command.leadCharacterId === undefined ? firstCharacter : undefined);
    if (lead === undefined) throw new Error('The selected lead is not part of this campaign.');
    const foundation = CanonicalGameStateSchema.parse({
      ...nextState,
      phase: 'command',
      rank: squadRankForReputation(0, generated.draft.bible.rankSystem.tiers),
      supplies: 5,
      coins: 30,
      relicDust: 0,
      campaignSeed: command.seed,
      selectedDraftIndex: command.selectedDraftIndex,
      leadCharacterId: lead.id,
      recruitedCharacterIds: [lead.id],
      campaignBible: generated.draft.bible,
      rngStreams: generated.draft.rngStreams,
      generatedDefinitions: generated.generatedDefinitions,
      partyState: generated.partyState,
      currentEncounter: generated.currentEncounter,
      worldFacts: [
        {
          id: 'fact-campaign-city',
          kind: 'campaign',
          subjectId: generated.draft.bible.city.id,
          relation: 'is-squad-city',
          value: generated.draft.bible.city.name,
          createdTurn: 0,
          sourceEventId: 'campaign-generation',
          tags: ['city'],
          active: true,
        },
        {
          id: 'fact-active-faction',
          kind: 'faction',
          subjectId: faction.id,
          relation: 'pursues-motive',
          value: faction.motive,
          createdTurn: 0,
          sourceEventId: 'campaign-generation',
          tags: ['faction'],
          active: true,
        },
        ...characters.map((character) => ({
          id: `fact-origin-${character.id}`,
          kind: 'character-origin',
          subjectId: character.id,
          relation: 'comes-from',
          value: character.origin,
          createdTurn: 0,
          sourceEventId: 'campaign-generation',
          tags: ['character', character.role],
          active: true,
        })),
      ],
      storyThreads: characters.map((character) => ({
        id: `thread-personal-${character.id}`,
        arcId: 'mythic-path-arc',
        stage: 0,
        castIds: [character.id],
        factIds: [`fact-origin-${character.id}`],
        urgency: 35,
        status: 'open',
        nextEligibleTurn: 2,
      })),
      relationships: [
        { first: firstCharacter, second: secondCharacter },
        { first: firstCharacter, second: thirdCharacter },
        { first: secondCharacter, second: thirdCharacter },
      ].map((pair) => ({
        pairId: [pair.first.id, pair.second.id].sort().join(':'),
        characterIds: [pair.first.id, pair.second.id],
        value: 0,
        factIds: [],
      })),
      bestiary: Object.fromEntries(
        Object.values(generated.generatedDefinitions.enemies).map((enemy) => [
          enemy.id,
          { enemyId: enemy.id, knowledge: 1, revealedTags: [enemy.policyId] },
        ]),
      ),
      pendingPlan: {
        positions: createDefaultPositions([lead]),
        stanceIds: createDefaultStances([lead]),
        teamPriorityId: 'break-threat',
        situationChoiceId: null,
      },
    });
    const selected = selectNextScenario(foundation, 1, foundation.rngStreams!);
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...foundation,
          rngStreams: selected.streams,
          currentScenario: selected.scenario,
          currentEncounter: encounterForSelection(selected.scenario, selected.scenario.choices[0]!),
          directorDebug: selected.debug,
          pendingPlan: {
            ...foundation.pendingPlan,
            situationChoiceId: selected.scenario.choices[0]?.id ?? null,
          },
        },
        command,
      ),
    );
  }

  if (state.phase !== 'command') throw new Error(`${command.type} requires an active campaign.`);

  if (command.type === 'SET_POSITION') {
    if (
      state.partyState[command.characterId] === undefined ||
      !state.recruitedCharacterIds.includes(command.characterId)
    ) {
      throw new Error('Only a recruited character can change position.');
    }
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
    if (
      state.partyState[command.characterId] === undefined ||
      !state.recruitedCharacterIds.includes(command.characterId)
    ) {
      throw new Error('Only a recruited character can change stance.');
    }
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
    const scenario = state.currentScenario;
    const choice = scenario?.choices.find((candidate) => candidate.id === command.choiceId);
    if (scenario === null || scenario === undefined || choice === undefined) {
      throw new Error('Choice is not valid for the current situation.');
    }
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...state,
          currentEncounter: encounterForSelection(scenario, choice),
          pendingPlan: { ...state.pendingPlan, situationChoiceId: command.choiceId },
        },
        command,
      ),
    );
  }

  if (command.type === 'EQUIP_ITEM') {
    const member = state.partyState[command.characterId];
    const item = state.generatedDefinitions.items[command.itemId];
    if (
      member === undefined ||
      item === undefined ||
      !state.recruitedCharacterIds.includes(command.characterId) ||
      !state.inventoryIds.includes(command.itemId)
    ) {
      throw new Error('Item cannot be equipped by this character.');
    }
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...state,
          partyState: {
            ...state.partyState,
            [command.characterId]: {
              ...member,
              equipment: { ...member.equipment, [item.slot]: item.id },
            },
          },
        },
        command,
      ),
    );
  }

  if (command.type === 'LEARN_TECHNIQUE') {
    const member = state.partyState[command.characterId];
    if (
      member === undefined ||
      !state.recruitedCharacterIds.includes(command.characterId) ||
      state.generatedDefinitions.techniques[command.techniqueId] === undefined ||
      member.trainingPoints < 1 ||
      member.learnedTechniqueIds.includes(command.techniqueId)
    ) {
      throw new Error('Technique cannot be learned.');
    }
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...state,
          partyState: {
            ...state.partyState,
            [command.characterId]: {
              ...member,
              trainingPoints: member.trainingPoints - 1,
              learnedTechniqueIds: [...member.learnedTechniqueIds, command.techniqueId].slice(0, 4),
            },
          },
        },
        command,
      ),
    );
  }

  if (command.type === 'FUSE_MATERIALS') {
    if (state.rngStreams === null) throw new Error('The Forge requires an active campaign seed.');
    const required = requiredMaterialCounts(command.materialIds);
    for (const [materialId, count] of Object.entries(required)) {
      if (state.generatedDefinitions.materials[materialId] === undefined) {
        throw new Error(`Unknown forge material: ${materialId}.`);
      }
      if ((state.materials[materialId] ?? 0) < count) {
        throw new Error(`Not enough ${state.generatedDefinitions.materials[materialId]!.name}.`);
      }
    }
    const rewardRngStartPosition = state.rngStreams.rewards.position;
    const resolution = resolveMaterialFusion(
      command.materialIds,
      state.generatedDefinitions.materials,
      state.rngStreams,
    );
    const duplicate = state.inventoryIds.includes(resolution.item.id);
    const relicDustGranted = duplicate ? 2 : 0;
    const materials = { ...state.materials };
    for (const [materialId, count] of Object.entries(required)) {
      materials[materialId] = materials[materialId]! - count;
    }
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...state,
          materials,
          relicDust: state.relicDust + relicDustGranted,
          generatedDefinitions: {
            ...state.generatedDefinitions,
            items: {
              ...state.generatedDefinitions.items,
              [resolution.item.id]: resolution.item,
            },
          },
          inventoryIds: duplicate
            ? state.inventoryIds
            : [...state.inventoryIds, resolution.item.id],
          fusionHistory: [
            ...state.fusionHistory,
            {
              index: state.fusionHistory.length,
              materialIds: command.materialIds,
              itemId: resolution.item.id,
              duplicate,
              relicDustGranted,
              rewardRngStartPosition,
              rewardRngEndPosition: resolution.streams.rewards.position,
              roll: resolution.roll,
            },
          ],
          rngStreams: resolution.streams,
        },
        command,
      ),
    );
  }

  if (command.type === 'COMMIT_TURN') {
    const scenario = state.currentScenario;
    if (scenario === null) throw new Error('No current situation to resolve.');
    const choiceId = state.pendingPlan.situationChoiceId;
    const choice = scenario.choices.find((candidate) => candidate.id === choiceId);
    if (choice === undefined) throw new Error('Choose a situation response before committing.');
    const combatResult = state.currentEncounter === null ? null : simulateBattle(state);
    const storyConsequence =
      combatResult === null || choice.outcomeConsequences === undefined
        ? choice.consequence
        : combatResult.report.outcome === 'round-cap'
          ? choice.outcomeConsequences.roundCap
          : combatResult.report.outcome === 'victory'
            ? choice.outcomeConsequences.victory
            : choice.outcomeConsequences.defeat;
    const reputationDelta =
      combatResult !== null
        ? (combatResult?.aftermath.reputationDelta ?? 0)
        : choice.effects.renownDelta;
    if (state.supplies + choice.effects.provisionsDelta < 0) {
      throw new Error('This response requires more Rations than the squad has.');
    }
    const factId = `fact-scenario-result-${state.turn}`;
    const recruitedCharacterId = characterRecruitedOnTurn(state);
    const recruitmentFactId =
      recruitedCharacterId === null ? null : `fact-recruited-${recruitedCharacterId}`;
    const activeCharacterIds = new Set(state.recruitedCharacterIds);
    const experience = combatResult === null ? 8 : 25;
    const victory = combatResult?.report.outcome === 'victory';
    const materialIdsGranted = materialRewardsForVictory(state, victory);
    const coinsDelta = victory ? 10 + state.turn * 2 : Math.max(0, reputationDelta);
    const relicDustDelta = victory ? 1 : 0;
    const baseAftermath = combatResult?.aftermath ?? {
      id: `aftermath-turn-${state.turn}`,
      turn: state.turn,
      experienceByCharacter: Object.fromEntries(
        state.generatedDefinitions.characters
          .filter((hero) => activeCharacterIds.has(hero.id))
          .map((hero) => [hero.id, experience]),
      ),
      itemIdsGranted: [],
      materialIdsGranted: [],
      characterIdsRecruited: [],
      factIdsWritten: recruitmentFactId === null ? [factId] : [recruitmentFactId, factId],
      threadIdsChanged: scenario.advancesThreadId === undefined ? [] : [scenario.advancesThreadId],
      hpByCharacter: Object.fromEntries(
        Object.values(state.partyState).map((member) => [member.characterId, member.hp]),
      ),
      readinessByCharacter: Object.fromEntries(
        Object.values(state.partyState).map((member) => [member.characterId, member.readiness]),
      ),
      suppliesDelta: choice.effects.provisionsDelta,
      coinsDelta: 0,
      relicDustDelta: 0,
      reputationDelta,
      dangerDelta: choice.effects.dangerDelta,
      bondDelta: choice.effects.bondDelta,
      summary: storyConsequence,
    };
    const progressedPartyState =
      combatResult?.partyState ??
      Object.fromEntries(
        Object.values(state.partyState).map((member) => [
          member.characterId,
          activeCharacterIds.has(member.characterId)
            ? {
                ...member,
                experience: member.experience + experience,
                level: 1 + Math.floor((member.experience + experience) / 50),
                callingRank:
                  1 + Math.floor((1 + Math.floor((member.experience + experience) / 50)) / 2),
                trainingPoints:
                  member.trainingPoints +
                  Math.max(0, 1 + Math.floor((member.experience + experience) / 50) - member.level),
              }
            : member,
        ]),
      );
    const partyState = progressedPartyState;
    const aftermath = {
      ...baseAftermath,
      itemIdsGranted: [],
      materialIdsGranted,
      characterIdsRecruited: recruitedCharacterId === null ? [] : [recruitedCharacterId],
      factIdsWritten: recruitmentFactId === null ? [factId] : [recruitmentFactId, factId],
      hpByCharacter: Object.fromEntries(
        Object.values(partyState).map((member) => [member.characterId, member.hp]),
      ),
      readinessByCharacter: Object.fromEntries(
        Object.values(partyState).map((member) => [member.characterId, member.readiness]),
      ),
      suppliesDelta: baseAftermath.suppliesDelta,
      coinsDelta,
      relicDustDelta,
      reputationDelta,
      summary:
        combatResult === null
          ? baseAftermath.summary
          : `${baseAftermath.summary} ${storyConsequence}`,
    };
    const updatedThreads = state.storyThreads.map((thread) => {
      if (thread.id !== scenario.advancesThreadId) return thread;
      const stage = thread.stage + 1;
      return {
        ...thread,
        stage,
        urgency: Math.max(0, thread.urgency - 10),
        status: stage >= 3 ? ('resolved' as const) : ('open' as const),
        nextEligibleTurn: state.turn + 5,
        factIds: [...thread.factIds, factId],
      };
    });
    const resolutionFact = {
      id: factId,
      kind: `${scenario.category}-result`,
      subjectId: scenario.castIds[0] ?? 'hunter-trio',
      relation: `chose-${choice.id}`,
      value: storyConsequence,
      createdTurn: state.turn,
      sourceEventId: combatResult?.report.id ?? `resolution-turn-${state.turn}`,
      tags: [scenario.category, choice.id],
      active: true,
    };
    const recruitedCharacter =
      recruitedCharacterId === null
        ? undefined
        : state.generatedDefinitions.characters.find(
            (character) => character.id === recruitedCharacterId,
          );
    const recruitmentFact =
      recruitedCharacter === undefined || recruitmentFactId === null
        ? null
        : {
            id: recruitmentFactId,
            kind: 'party-recruitment',
            subjectId: recruitedCharacter.id,
            relation: 'joined-party',
            value: storyConsequence,
            createdTurn: state.turn,
            sourceEventId: combatResult?.report.id ?? `resolution-turn-${state.turn}`,
            tags: ['character', 'recruitment', recruitedCharacter.role],
            active: true,
          };
    const recruitedCharacterIds =
      recruitedCharacterId === null
        ? state.recruitedCharacterIds
        : [...state.recruitedCharacterIds, recruitedCharacterId];
    const recruitedPosition =
      recruitedCharacter === undefined ? {} : createDefaultPositions([recruitedCharacter]);
    const recruitedStance =
      recruitedCharacter === undefined ? {} : createDefaultStances([recruitedCharacter]);
    const nextReputation = Math.max(-100, Math.min(100, state.reputation + reputationDelta));
    const resolvedBase = CanonicalGameStateSchema.parse({
      ...state,
      turn: state.turn + 1,
      rank: squadRankForReputation(nextReputation, state.campaignBible?.rankSystem.tiers ?? []),
      reputation: nextReputation,
      recruitedCharacterIds,
      threat: Math.max(0, Math.min(100, state.threat + aftermath.dangerDelta)),
      supplies: state.supplies + aftermath.suppliesDelta,
      coins: state.coins + coinsDelta,
      relicDust: state.relicDust + relicDustDelta,
      materials: addMaterials(state.materials, materialIdsGranted),
      partyState,
      rngStreams: combatResult?.streams ?? state.rngStreams,
      battleReports:
        combatResult === null ? state.battleReports : [...state.battleReports, combatResult.report],
      aftermathReports: [...state.aftermathReports, aftermath],
      worldFacts:
        recruitmentFact === null
          ? [...state.worldFacts, resolutionFact]
          : [...state.worldFacts, recruitmentFact, resolutionFact],
      storyThreads: updatedThreads,
      relationships: state.relationships.map((relationship) =>
        aftermath.bondDelta !== 0 &&
        scenario.castIds.length > 0 &&
        relationship.characterIds.every((id) => scenario.castIds.includes(id))
          ? {
              ...relationship,
              value: Math.max(-100, Math.min(100, relationship.value + aftermath.bondDelta)),
              factIds: [...relationship.factIds, factId],
            }
          : relationship,
      ),
      bestiary:
        combatResult === null
          ? state.bestiary
          : Object.fromEntries(
              Object.entries(state.bestiary).map(([id, entry]) => [
                id,
                state.currentEncounter?.enemyIds.includes(id)
                  ? {
                      ...entry,
                      knowledge: Math.min(3, entry.knowledge + 1),
                      revealedTags: [
                        ...new Set([
                          ...entry.revealedTags,
                          state.generatedDefinitions.enemies[id]?.signatureRuleId ?? 'observed',
                        ]),
                      ],
                    }
                  : entry,
              ]),
            ),
      scenarioFingerprints: [...state.scenarioFingerprints, scenario.semanticFingerprint],
      currentScenario: null,
      currentEncounter: null,
      pendingPlan: {
        ...state.pendingPlan,
        positions: { ...state.pendingPlan.positions, ...recruitedPosition },
        stanceIds: { ...state.pendingPlan.stanceIds, ...recruitedStance },
        situationChoiceId: null,
      },
    });
    const next = selectNextScenario(resolvedBase, resolvedBase.turn, resolvedBase.rngStreams!);
    return CanonicalGameStateSchema.parse(
      appendCommand(
        {
          ...resolvedBase,
          rngStreams: next.streams,
          currentScenario: next.scenario,
          currentEncounter:
            next.scenario.category === 'operation'
              ? encounterForSelection(next.scenario, next.scenario.choices[0]!)
              : null,
          directorDebug: next.debug,
          pendingPlan: {
            ...resolvedBase.pendingPlan,
            situationChoiceId:
              next.scenario.category === 'operation'
                ? (next.scenario.choices[0]?.id ?? null)
                : null,
          },
        },
        command,
      ),
    );
  }

  throw new Error('Unsupported game command.');
}
