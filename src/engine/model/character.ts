import { z } from 'zod';

export const CoreStatsSchema = z.object({
  vitality: z.number().int().positive(),
  power: z.number().int().positive(),
  guard: z.number().int().positive(),
  speed: z.number().int().positive(),
  focus: z.number().int().positive(),
});

export type CoreStats = z.infer<typeof CoreStatsSchema>;

export const CharacterStorySchema = z.object({
  portrait: z.string().min(80),
  fear: z.string().min(12),
  interiorVoice: z.string().min(12),
  signature: z.string().min(24),
  reaction: z.string().min(24),
  limitation: z.string().min(24),
});

export const CharacterBlueprintSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  pronouns: z.object({
    subject: z.string().min(1),
    object: z.string().min(1),
    possessive: z.string().min(1),
  }),
  callingId: z.string().min(1),
  callingName: z.string().min(1),
  pathClassId: z.string().min(1),
  pathClassName: z.string().min(1),
  pathClassSummary: z.string().min(24),
  backgroundName: z.string().min(1),
  bond: z.string().min(12),
  role: z.enum(['vanguard', 'striker', 'controller', 'support']),
  ageBand: z.enum(['young-adult', 'adult', 'veteran']),
  origin: z.string().min(1),
  formativeEvent: z.string().min(1),
  drive: z.string().min(1),
  contradiction: z.string().min(1),
  temperament: z.string().min(1),
  story: CharacterStorySchema,
  stats: CoreStatsSchema,
  signatureRuleId: z.string().min(1),
  signature: z.string().min(1),
  reactionRuleId: z.string().min(1),
  reaction: z.string().min(1),
  limitationRuleId: z.string().min(1),
  limitation: z.string().min(1),
  techniqueIds: z.array(z.string().min(1)).min(2).max(4),
  techniques: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        storyDescription: z.string().min(40),
        mechanicLabel: z.string().min(5),
        resourceCost: z.number().int().nonnegative(),
        cooldownRounds: z.number().int().nonnegative(),
        condition: z.string().min(1),
      }),
    )
    .min(2)
    .max(4),
  personalHookIds: z.array(z.string().min(1)).min(2),
  personalHooks: z.array(z.string().min(1)).min(2),
  awakeningCondition: z.string().min(1),
  coverageTags: z.array(z.enum(['defence', 'control', 'damage', 'sustain', 'resource'])).min(1),
  semanticFingerprint: z.string().min(1),
});

export type CharacterBlueprint = z.infer<typeof CharacterBlueprintSchema>;
