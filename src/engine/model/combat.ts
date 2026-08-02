import { z } from 'zod';
import { CoreStatsSchema } from './character';

export const StanceIdSchema = z.enum(['aggressive', 'guarded', 'tactical', 'supportive']);
export type StanceId = z.infer<typeof StanceIdSchema>;

export const TeamPriorityIdSchema = z.enum([
  'focus-weakest',
  'protect-rear',
  'break-threat',
  'conserve-power',
]);
export type TeamPriorityId = z.infer<typeof TeamPriorityIdSchema>;

export const StatusStateSchema = z.object({
  statusId: z.string().min(1),
  stacks: z.number().int().positive(),
  duration: z.number().int().positive(),
});
export type StatusState = z.infer<typeof StatusStateSchema>;

export const PartyMemberStateSchema = z.object({
  characterId: z.string().min(1),
  hp: z.number().int().nonnegative(),
  maxHp: z.number().int().positive(),
  resource: z.number().int().nonnegative(),
  maxResource: z.number().int().positive(),
  readiness: z.number().int().min(0).max(100),
  experience: z.number().int().nonnegative(),
  statuses: z.array(StatusStateSchema),
});
export type PartyMemberState = z.infer<typeof PartyMemberStateSchema>;

export const CombatantDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  side: z.enum(['heroes', 'enemies']),
  role: z.string().min(1),
  stats: CoreStatsSchema,
  maxResource: z.number().int().positive(),
  basicActionId: z.string().min(1),
  techniqueIds: z.array(z.string().min(1)),
  signature: z.string().min(1),
  limitation: z.string().min(1),
  threat: z.number().int().positive(),
});
export type CombatantDefinition = z.infer<typeof CombatantDefinitionSchema>;

export const EncounterStateSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  brief: z.string().min(1),
  enemyIds: z.array(z.string().min(1)).min(1),
  signature: z.string().min(1),
  rewardPreview: z.string().min(1),
});
export type EncounterState = z.infer<typeof EncounterStateSchema>;

export const ScenarioForecastSchema = z.object({
  victoryBand: z.enum(['precarious', 'contested', 'favoured']),
  incomingDamage: z.tuple([z.number().int().nonnegative(), z.number().int().nonnegative()]),
  confidence: z.enum(['low', 'moderate', 'high']),
  advantages: z.array(z.string().min(1)),
  vulnerabilities: z.array(z.string().min(1)),
  score: z.number().int(),
});
export type ScenarioForecast = z.infer<typeof ScenarioForecastSchema>;
