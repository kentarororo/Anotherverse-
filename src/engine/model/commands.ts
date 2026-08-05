import { z } from 'zod';

export const PositionSchema = z.enum(['front', 'centre', 'rear']);
export type Position = z.infer<typeof PositionSchema>;

export const GameCommandSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('START_CAMPAIGN'),
    seed: z.string().trim().min(1),
    selectedDraftIndex: z.number().int().nonnegative(),
    leadCharacterId: z.string().min(1).optional(),
  }),
  z.object({
    type: z.literal('SET_POSITION'),
    characterId: z.string().min(1),
    position: PositionSchema,
  }),
  z.object({
    type: z.literal('SET_STANCE'),
    characterId: z.string().min(1),
    stanceId: z.string().min(1),
  }),
  z.object({
    type: z.literal('SET_TEAM_PRIORITY'),
    priorityId: z.string().min(1),
  }),
  z.object({
    type: z.literal('CHOOSE_SITUATION'),
    choiceId: z.string().min(1),
  }),
  z.object({
    type: z.literal('EQUIP_ITEM'),
    characterId: z.string().min(1),
    itemId: z.string().min(1),
  }),
  z.object({
    type: z.literal('LEARN_TECHNIQUE'),
    characterId: z.string().min(1),
    techniqueId: z.string().min(1),
  }),
  z.object({
    type: z.literal('FUSE_MATERIALS'),
    materialIds: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1)]),
  }),
  z.object({ type: z.literal('REST_PARTY') }),
  z.object({
    type: z.literal('IMPROVE_ITEM'),
    itemId: z.string().min(1),
  }),
  z.object({ type: z.literal('COMMIT_TURN') }),
]);

export type GameCommand = z.infer<typeof GameCommandSchema>;
