import { z } from 'zod';

export const CoreStatsSchema = z.object({
  vitality: z.number().int().positive(),
  power: z.number().int().positive(),
  guard: z.number().int().positive(),
  speed: z.number().int().positive(),
  focus: z.number().int().positive(),
});

export type CoreStats = z.infer<typeof CoreStatsSchema>;

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
  role: z.enum(['vanguard', 'striker', 'controller', 'support']),
  stats: CoreStatsSchema,
  signatureRuleId: z.string().min(1),
  limitationRuleId: z.string().min(1),
  techniqueIds: z.array(z.string().min(1)).min(2).max(4),
  personalHookIds: z.array(z.string().min(1)).min(2),
  semanticFingerprint: z.string().min(1),
});

export type CharacterBlueprint = z.infer<typeof CharacterBlueprintSchema>;
