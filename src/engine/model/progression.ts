import { z } from 'zod';

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
