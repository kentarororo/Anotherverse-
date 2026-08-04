import { z } from 'zod';
import { CharacterBlueprintSchema } from './character';
import { GameCommandSchema, PositionSchema } from './commands';
import { RngStreamsStateSchema } from '../rng/streams';
import { AftermathReportSchema, BattleReportSchema } from '../reports/combat';
import { CampaignBibleSchema, StoryThreadSchema, WorldFactSchema } from './world';
import { CombatantDefinitionSchema, EncounterStateSchema, PartyMemberStateSchema } from './combat';
import { DirectorCandidateDebugSchema, ScenarioBlueprintSchema } from './scenario';
import {
  BestiaryEntrySchema,
  DevelopmentUnlockSchema,
  EquipmentDefinitionSchema,
  RelationshipStateSchema,
} from './progression';

// Schema 9 rejects saves created before authored character stories, selected-world scene
// vocabulary, and typed Calling-development unlocks entered canonical state. Older snapshots
// cannot be reconstructed faithfully, so they are intentionally incompatible.
export const GAME_SCHEMA_VERSION = 9 as const;

export const CommandRecordSchema = z.object({
  index: z.number().int().nonnegative(),
  command: GameCommandSchema,
});

export const PendingPlanSchema = z.object({
  positions: z.record(z.string(), PositionSchema),
  stanceIds: z.record(z.string(), z.string().min(1)),
  teamPriorityId: z.string().min(1).nullable(),
  situationChoiceId: z.string().min(1).nullable(),
});

export const GeneratedDefinitionsSchema = z.object({
  characters: z.array(CharacterBlueprintSchema),
  combatants: z.record(z.string(), CombatantDefinitionSchema),
  enemies: z.record(z.string(), CombatantDefinitionSchema),
  items: z.record(z.string(), EquipmentDefinitionSchema),
  techniques: z.record(z.string(), DevelopmentUnlockSchema),
});

export const CanonicalGameStateSchema = z.object({
  schemaVersion: z.literal(GAME_SCHEMA_VERSION),
  phase: z.enum(['title', 'command']),
  campaignSeed: z.string().min(1).nullable(),
  selectedDraftIndex: z.number().int().nonnegative().nullable(),
  turn: z.number().int().positive(),
  rank: z.string().min(1),
  reputation: z.number().int().min(-100).max(100),
  threat: z.number().int().min(0).max(100),
  supplies: z.number().int().nonnegative(),
  campaignBible: CampaignBibleSchema.nullable(),
  generatedDefinitions: GeneratedDefinitionsSchema,
  partyState: z.record(z.string(), PartyMemberStateSchema),
  currentEncounter: EncounterStateSchema.nullable(),
  currentScenario: ScenarioBlueprintSchema.nullable(),
  scenarioFingerprints: z.array(z.string().min(1)),
  directorDebug: z.array(DirectorCandidateDebugSchema),
  inventoryIds: z.array(z.string().min(1)),
  relationships: z.array(RelationshipStateSchema),
  bestiary: z.record(z.string(), BestiaryEntrySchema),
  worldFacts: z.array(WorldFactSchema),
  storyThreads: z.array(StoryThreadSchema),
  rngStreams: RngStreamsStateSchema.nullable(),
  pendingPlan: PendingPlanSchema,
  battleReports: z.array(BattleReportSchema),
  aftermathReports: z.array(AftermathReportSchema),
  commandHistory: z.array(CommandRecordSchema),
  contentManifestHash: z.string().min(1),
});

export type CanonicalGameState = z.infer<typeof CanonicalGameStateSchema>;

export function createEmptyGameState(contentManifestHash: string): CanonicalGameState {
  return CanonicalGameStateSchema.parse({
    schemaVersion: GAME_SCHEMA_VERSION,
    phase: 'title',
    campaignSeed: null,
    selectedDraftIndex: null,
    turn: 1,
    rank: 'Unranked',
    reputation: 0,
    threat: 0,
    supplies: 0,
    campaignBible: null,
    generatedDefinitions: {
      characters: [],
      combatants: {},
      enemies: {},
      items: {},
      techniques: {},
    },
    partyState: {},
    currentEncounter: null,
    currentScenario: null,
    scenarioFingerprints: [],
    directorDebug: [],
    inventoryIds: [],
    relationships: [],
    bestiary: {},
    worldFacts: [],
    storyThreads: [],
    rngStreams: null,
    pendingPlan: {
      positions: {},
      stanceIds: {},
      teamPriorityId: null,
      situationChoiceId: null,
    },
    battleReports: [],
    aftermathReports: [],
    commandHistory: [],
    contentManifestHash,
  });
}
