import { z } from 'zod';

export const ScenarioCategorySchema = z.enum([
  'operation',
  'personal',
  'rival',
  'discovery',
  'social',
]);
export type ScenarioCategory = z.infer<typeof ScenarioCategorySchema>;

export const ScenarioChoiceSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  description: z.string().min(1),
  consequence: z.string().min(1),
  effects: z.object({
    renownDelta: z.number().int(),
    provisionsDelta: z.number().int(),
    dangerDelta: z.number().int(),
    bondDelta: z.number().int(),
  }),
});

export const ScenarioBlueprintSchema = z.object({
  id: z.string().min(1),
  templateId: z.string().min(1),
  category: ScenarioCategorySchema,
  title: z.string().min(1),
  premise: z.string().min(1),
  sceneBeats: z.object({
    hook: z.string().min(1),
    cause: z.string().min(1),
    stakes: z.string().min(1),
    decision: z.string().min(1),
  }),
  premiseFactIds: z.array(z.string().min(1)).min(2),
  castIds: z.array(z.string().min(1)).min(1),
  threatIds: z.array(z.string().min(1)),
  choices: z.array(ScenarioChoiceSchema).min(1),
  forecast: z.object({
    likelyBenefit: z.string().min(1),
    likelyRisk: z.string().min(1),
    confidence: z.enum(['low', 'moderate', 'high']),
  }),
  advancesThreadId: z.string().min(1).optional(),
  semanticFingerprint: z.string().min(1),
});
export type ScenarioBlueprint = z.infer<typeof ScenarioBlueprintSchema>;

export const DirectorCandidateDebugSchema = z.object({
  templateId: z.string().min(1),
  score: z.number(),
  selected: z.boolean(),
  reasons: z.array(z.string().min(1)),
});
