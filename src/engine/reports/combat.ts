import { z } from 'zod';

export const StatusDeltaSchema = z.object({
  statusId: z.string().min(1),
  stacksBefore: z.number().int().nonnegative(),
  stacksAfter: z.number().int().nonnegative(),
  durationBefore: z.number().int().nonnegative(),
  durationAfter: z.number().int().nonnegative(),
});
export type StatusDelta = z.infer<typeof StatusDeltaSchema>;

export const CombatEventSchema = z.object({
  index: z.number().int().nonnegative(),
  round: z.number().int().positive(),
  actorId: z.string().min(1),
  actionId: z.string().min(1),
  targetIds: z.array(z.string().min(1)),
  eventType: z.enum(['attack', 'heal', 'guard', 'status', 'interrupt', 'defeat', 'resource']),
  hitChance: z.number().min(0).max(1).optional(),
  roll: z.number().min(0).max(1).optional(),
  rawAmount: z.number().optional(),
  mitigatedAmount: z.number().optional(),
  finalAmount: z.number().optional(),
  hpBefore: z.number().nonnegative().optional(),
  hpAfter: z.number().nonnegative().optional(),
  resourceBefore: z.number().nonnegative().optional(),
  resourceAfter: z.number().nonnegative().optional(),
  statusChanges: z.array(StatusDeltaSchema).optional(),
  ruleTriggers: z.array(z.string()).optional(),
  tags: z.array(z.string()),
});

export type CombatEvent = z.infer<typeof CombatEventSchema>;

export const BattleReportSchema = z.object({
  id: z.string().min(1),
  turn: z.number().int().positive(),
  outcome: z.enum(['victory', 'defeat', 'withdrawal', 'round-cap']),
  rounds: z.number().int().min(1).max(12),
  events: z.array(CombatEventSchema),
  rngStartPosition: z.number().int().nonnegative(),
  rngEndPosition: z.number().int().nonnegative(),
  combatantNames: z.record(z.string(), z.string().min(1)),
  actionNames: z.record(z.string(), z.string().min(1)),
  hpAtStart: z.record(z.string(), z.number().int().nonnegative()),
  hpAtEnd: z.record(z.string(), z.number().int().nonnegative()),
});

export type BattleReport = z.infer<typeof BattleReportSchema>;

export const AftermathReportSchema = z.object({
  id: z.string().min(1),
  turn: z.number().int().positive(),
  battleReportId: z.string().min(1).optional(),
  experienceByCharacter: z.record(z.string(), z.number().int().nonnegative()),
  itemIdsGranted: z.array(z.string().min(1)),
  materialIdsGranted: z.array(z.string().min(1)),
  characterIdsRecruited: z.array(z.string().min(1)),
  factIdsWritten: z.array(z.string().min(1)),
  threadIdsChanged: z.array(z.string().min(1)),
  hpByCharacter: z.record(z.string(), z.number().int().nonnegative()),
  readinessByCharacter: z.record(z.string(), z.number().int().min(0).max(100)),
  suppliesDelta: z.number().int(),
  coinsDelta: z.number().int(),
  relicDustDelta: z.number().int(),
  reputationDelta: z.number().int(),
  dangerDelta: z.number().int(),
  bondDelta: z.number().int(),
  summary: z.string().min(1),
});

export type AftermathReport = z.infer<typeof AftermathReportSchema>;
