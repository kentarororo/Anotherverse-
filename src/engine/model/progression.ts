import { z } from 'zod';

export const DevelopmentUnlockSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  storyDescription: z.string().min(40),
  unlockCondition: z.string().min(1),
});

export type DevelopmentUnlock = z.infer<typeof DevelopmentUnlockSchema>;

export const EquipmentDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  slot: z.enum(['weapon', 'support']),
  description: z.string().min(1),
  powerBonus: z.number().int().nonnegative(),
  guardBonus: z.number().int().nonnegative(),
  counterTag: z.string().min(1),
});
export type EquipmentDefinition = z.infer<typeof EquipmentDefinitionSchema>;

export const MaterialAffinitySchema = z.enum(['charger', 'hexer']);
export type MaterialAffinity = z.infer<typeof MaterialAffinitySchema>;

export const MaterialDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  sourceEnemyId: z.string().min(1),
  forgeName: z.string().min(1),
  weights: z.object({
    power: z.number().int().positive(),
    guard: z.number().int().positive(),
    weapon: z.number().int().positive(),
    support: z.number().int().positive(),
    charger: z.number().int().positive(),
    hexer: z.number().int().positive(),
  }),
});
export type MaterialDefinition = z.infer<typeof MaterialDefinitionSchema>;

export const FusionCandidateSchema = z.object({
  slot: z.enum(['weapon', 'support']),
  affinity: MaterialAffinitySchema,
  weight: z.number().int().positive(),
  chance: z.number().positive().max(1),
});
export type FusionCandidate = z.infer<typeof FusionCandidateSchema>;

export const FusionRecordSchema = z.object({
  index: z.number().int().nonnegative(),
  materialIds: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  itemId: z.string().min(1),
  duplicate: z.boolean(),
  relicDustGranted: z.number().int().nonnegative(),
  rewardRngStartPosition: z.number().int().nonnegative(),
  rewardRngEndPosition: z.number().int().nonnegative(),
  roll: z.number().min(0).max(1),
});
export type FusionRecord = z.infer<typeof FusionRecordSchema>;

export const RelationshipStateSchema = z.object({
  pairId: z.string().min(1),
  characterIds: z.tuple([z.string().min(1), z.string().min(1)]),
  value: z.number().int().min(-100).max(100),
  factIds: z.array(z.string().min(1)),
});

export const BestiaryEntrySchema = z.object({
  enemyId: z.string().min(1),
  knowledge: z.number().int().min(0).max(3),
  revealedTags: z.array(z.string().min(1)),
});
