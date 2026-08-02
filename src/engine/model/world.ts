import { z } from 'zod';

export const GeneratedPlaceSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  tags: z.array(z.string()),
});

export const GeneratedInstitutionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  mandate: z.string().min(1),
  tags: z.array(z.string()),
});

export const GeneratedFactionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  motive: z.string().min(1),
  tags: z.array(z.string()),
});

export const RankSystemSchema = z.object({
  id: z.string().min(1),
  tiers: z.array(z.string().min(1)).min(1),
});

export const BreachLawSchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
});

export const PowerLawSchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
});

export const ThreatEcologySchema = z.object({
  id: z.string().min(1),
  summary: z.string().min(1),
  tags: z.array(z.string()),
});

export const TerminologySlotsSchema = z.object({
  heroCollective: z.string().min(1),
  incursion: z.string().min(1),
  powerSource: z.string().min(1),
  technique: z.string().min(1),
});

export const CampaignBibleSchema = z.object({
  seed: z.string().min(1),
  city: GeneratedPlaceSchema,
  civicOrder: GeneratedInstitutionSchema,
  guildModel: GeneratedInstitutionSchema,
  rankSystem: RankSystemSchema,
  breachLaw: BreachLawSchema,
  powerLaw: PowerLawSchema,
  threatEcology: ThreatEcologySchema,
  activeFactions: z.array(GeneratedFactionSchema),
  terminology: TerminologySlotsSchema,
  toneProfileId: z.string().min(1),
});

export type CampaignBible = z.infer<typeof CampaignBibleSchema>;

export const WorldFactSchema = z.object({
  id: z.string().min(1),
  kind: z.string().min(1),
  subjectId: z.string().min(1),
  relation: z.string().min(1),
  objectId: z.string().min(1).optional(),
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  createdTurn: z.number().int().nonnegative(),
  sourceEventId: z.string().min(1),
  tags: z.array(z.string()),
  active: z.boolean(),
});

export type WorldFact = z.infer<typeof WorldFactSchema>;

export const StoryThreadSchema = z.object({
  id: z.string().min(1),
  arcId: z.string().min(1),
  stage: z.number().int().nonnegative(),
  castIds: z.array(z.string().min(1)),
  factIds: z.array(z.string().min(1)),
  urgency: z.number().min(0).max(100),
  status: z.enum(['open', 'waiting', 'resolved', 'failed']),
  nextEligibleTurn: z.number().int().nonnegative(),
});

export type StoryThread = z.infer<typeof StoryThreadSchema>;
