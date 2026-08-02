import { z } from 'zod';
import { CharacterBlueprintSchema } from './character';
import { GameCommandSchema, PositionSchema } from './commands';
import { RngStreamsStateSchema } from '../rng/streams';
import { AftermathReportSchema, BattleReportSchema } from '../reports/combat';
import { CampaignBibleSchema, StoryThreadSchema, WorldFactSchema } from './world';

export const GAME_SCHEMA_VERSION = 1 as const;

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
  enemies: z.record(z.string(), z.unknown()),
  items: z.record(z.string(), z.unknown()),
  techniques: z.record(z.string(), z.unknown()),
});

export const CanonicalGameStateSchema = z.object({
  schemaVersion: z.literal(GAME_SCHEMA_VERSION),
  phase: z.enum(['title', 'command']),
  campaignSeed: z.string().min(1).nullable(),
  selectedDraftIndex: z.number().int().nonnegative().nullable(),
  turn: z.number().int().positive(),
  rank: z.string().min(1),
  threat: z.number().int().min(0).max(100),
  supplies: z.number().int().nonnegative(),
  campaignBible: CampaignBibleSchema.nullable(),
  generatedDefinitions: GeneratedDefinitionsSchema,
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
    threat: 0,
    supplies: 0,
    campaignBible: null,
    generatedDefinitions: {
      characters: [],
      enemies: {},
      items: {},
      techniques: {},
    },
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
