import { z } from 'zod';
import { EXECUTABLE_TECHNIQUES } from './executable-technique.ts';

export const StoryRoleSchema = z.enum(['vanguard', 'striker', 'support']);
export const StoryCategorySchema = z.enum([
  'operation',
  'personal',
  'discovery',
  'rival',
  'social',
]);
export const StoryFactRoleSchema = z.enum([
  'city',
  'faction',
  'origin',
  'prior-operation',
  'prior-personal',
  'prior-discovery',
  'prior-rival',
  'prior-social',
  'prior-decision',
]);
export const StorySlotSchema = z.enum([
  'city',
  'civic',
  'guild',
  'faction',
  'factionMotive',
  'lead',
  'partner',
  'leadOrigin',
  'calling',
  'awakening',
  'priorReference',
  'priorArtifact',
  'enemyOne',
  'enemyTwo',
  'rank',
  'relationshipLine',
  'crisisSite',
  'hiddenRoute',
  'publicVenue',
  'publicSignal',
  'recordMedium',
  'privateRefuge',
]);

const COMPLETE_SENTENCE = /[.!?][\"'’”)]?$/;
const TEMPLATE_SLOT = /\{([A-Za-z][A-Za-z0-9]*)\}/g;
const FORBIDDEN_GENERIC_PROSE = [
  /\bthe prior event\b/i,
  /\btwo recorded facts\b/i,
  /\bsomething happened\b/i,
  /\bthe situation unfolds\b/i,
  /\ba mysterious (?:thing|event)\b/i,
  /\bunknown (?:person|place|faction)\b/i,
  /\bTBD\b/,
  /\bTODO\b/,
  /lorem ipsum/i,
] as const;
const EXACT_MECHANIC_LANGUAGE =
  /(?:[+-]\d+|\b\d+\s*(?:resource|hit points?|damage|stacks?|rounds?|vitality|ward)\b)/i;
const HARD_CODED_WORLD_LANGUAGE =
  /\b(?:train|tram|station|platform|concourse|track|East Junction|Platform Nine|Glassline)\b/i;

const StorySentenceSchema = z
  .string()
  .trim()
  .min(24)
  .max(420)
  .refine((value) => COMPLETE_SENTENCE.test(value), 'Must be a complete authored sentence.');

const StoryProseSchema = z.string().trim().min(24).max(600);
const MechanicTextSchema = z.string().trim().min(8).max(220);
const FourSentencesSchema = z.tuple([
  StorySentenceSchema,
  StorySentenceSchema,
  StorySentenceSchema,
  StorySentenceSchema,
]);

const StoryBeatTemplateSchema = z.object({
  requiredSlots: z.array(StorySlotSchema).min(1),
  sentences: FourSentencesSchema,
});

export const StoryWorldPackSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  city: z.object({
    name: z.string().trim().min(2),
    sensoryIdentity: StoryProseSchema,
    ordinaryLife: StoryProseSchema,
    oldWound: StoryProseSchema,
  }),
  civicOrder: z.object({
    name: z.string().trim().min(2),
    publicPromise: StoryProseSchema,
    blindSpot: StoryProseSchema,
  }),
  guild: z.object({
    name: z.string().trim().min(2),
    publicPromise: StoryProseSchema,
    pressure: StoryProseSchema,
  }),
  rankTiers: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
  breachLaw: StoryProseSchema,
  powerLaw: StoryProseSchema,
  threatEcology: StoryProseSchema,
  faction: z.object({
    name: z.string().trim().min(2),
    publicFace: StoryProseSchema,
    secretMotive: StoryProseSchema,
  }),
  sceneVocabulary: z.object({
    crisisSite: z.string().trim().min(3).max(120),
    hiddenRoute: z.string().trim().min(3).max(120),
    publicVenue: z.string().trim().min(3).max(120),
    publicSignal: z.string().trim().min(3).max(120),
    recordMedium: z.string().trim().min(3).max(120),
    privateRefuge: z.string().trim().min(3).max(120),
  }),
  premise: StoryBeatTemplateSchema,
  campaignQuestion: StoryProseSchema,
});

const StoryRuleTextSchema = z.object({
  story: StoryProseSchema,
  mechanic: MechanicTextSchema,
});

export const StoryTechniqueSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().trim().min(2),
  visibleAction: StoryProseSchema,
  tacticalPurpose: StoryProseSchema,
  mechanicRule: MechanicTextSchema,
  resourceCost: z.number().int().nonnegative().max(9),
  cooldownRounds: z.number().int().nonnegative().max(9),
  condition: MechanicTextSchema,
});

const CoreStatsSchema = z.object({
  vitality: z.number().int().positive().max(30),
  power: z.number().int().positive().max(30),
  guard: z.number().int().positive().max(30),
  speed: z.number().int().positive().max(30),
  focus: z.number().int().positive().max(30),
});

export const StoryCharacterKitSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  role: StoryRoleSchema,
  ageBand: z.enum(['young-adult', 'adult', 'veteran']),
  origin: StoryProseSchema,
  formativeEvent: StoryProseSchema,
  drive: StoryProseSchema,
  fear: StoryProseSchema,
  contradiction: StoryProseSchema,
  temperament: StoryProseSchema,
  interiorVoice: StoryProseSchema,
  personalHooks: z.tuple([StoryProseSchema, StoryProseSchema]),
  awakeningCondition: StoryProseSchema,
  portrait: StoryBeatTemplateSchema,
  calling: z.object({
    id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    name: z.string().trim().min(2),
    manifestation: StoryProseSchema,
    stats: CoreStatsSchema,
    signatureRuleId: z.string().min(1),
    signature: StoryRuleTextSchema,
    reactionRuleId: z.string().min(1),
    reaction: StoryRuleTextSchema,
    limitationRuleId: z.string().min(1),
    limitation: StoryRuleTextSchema,
    techniques: z.tuple([StoryTechniqueSchema, StoryTechniqueSchema]),
    coverageTags: z.array(z.enum(['defence', 'control', 'damage', 'sustain', 'resource'])).min(1),
  }),
});

export const StorySceneModuleSchema = z.object({
  id: z.string().regex(/^(?:operation|personal|discovery|rival|social)-[1-4]$/),
  category: StoryCategorySchema,
  title: z.string().trim().min(3),
  sceneKind: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  choiceSetId: z.string().regex(/^(?:operation|personal|discovery|rival|social)-[1-4]$/),
  leadRoles: z.array(StoryRoleSchema).min(1),
  initialFactRoles: z.tuple([StoryFactRoleSchema, StoryFactRoleSchema]).optional(),
  continuationFactRoles: z.tuple([StoryFactRoleSchema, StoryFactRoleSchema]),
  initial: StoryBeatTemplateSchema.optional(),
  continuation: StoryBeatTemplateSchema,
});

const StoryVoiceGuideSchema = z.object({
  promise: StoryProseSchema,
  viewpoint: StoryProseSchema,
  sentenceRhythm: StoryProseSchema,
  sceneRule: StoryProseSchema,
  progressionRule: StoryProseSchema,
  mysteryRule: StoryProseSchema,
  prohibitedShortcuts: z.array(z.string().trim().min(3)).min(1),
});

// Legacy modern-corpus schema. Production mythology campaigns use the quest-arc and opening
// schemas; this validator remains solely to keep the archived review fixture parseable.
const EXPECTED_WORLD_IDS = ['cinder-bay', 'halcyon-ward', 'lumen-port', 'vanta-cross'] as const;
const EXPECTED_CALLINGS_BY_ROLE = {
  vanguard: ['anchor-saint', 'iron-echo', 'storm-bastion'],
  striker: ['comet-thread', 'red-interval', 'vector-edge'],
  support: ['mercy-engine', 'quiet-lattice', 'spirit-switchboard'],
} as const;
const EXPECTED_TECHNIQUES_BY_ROLE = {
  vanguard: ['aegis-break', 'hold-the-line'],
  striker: ['arc-finish', 'cross-step'],
  support: ['restorative-sigil', 'binding-shot'],
} as const;
const EXPECTED_RULES_BY_ROLE = {
  vanguard: ['rear-intercept', 'intercept-brace', 'measured-strikes'],
  striker: ['exploit-exposed', 'finisher-surge', 'open-guard'],
  support: ['mending-ward', 'recovery-loop', 'low-direct-output'],
} as const;
const WORLD_IDENTITY_SLOTS = new Set([
  'crisisSite',
  'hiddenRoute',
  'publicVenue',
  'publicSignal',
  'recordMedium',
  'privateRefuge',
]);

function sorted(values: Iterable<string>) {
  return [...values].sort((left, right) => left.localeCompare(right));
}

function sameStrings(actual: Iterable<string>, expected: readonly string[]) {
  return JSON.stringify(sorted(actual)) === JSON.stringify(sorted(expected));
}

function templateSlots(sentences: readonly string[]) {
  const slots = new Set<string>();
  for (const sentence of sentences) {
    for (const match of sentence.matchAll(TEMPLATE_SLOT)) slots.add(match[1]!);
  }
  return slots;
}

function factRoleIsRepresented(role: z.infer<typeof StoryFactRoleSchema>, slots: Set<string>) {
  if (role === 'city') return slots.has('city');
  if (role === 'faction') return slots.has('faction') || slots.has('factionMotive');
  if (role === 'origin') return slots.has('leadOrigin');
  return slots.has('priorReference') || slots.has('priorArtifact');
}

function addIssue(context: z.RefinementCtx, path: PropertyKey[], message: string) {
  context.addIssue({ code: 'custom', path, message });
}

export const StoryAuthoringSchema = z
  .object({
    schemaVersion: z.literal(1),
    voice: StoryVoiceGuideSchema,
    worlds: z.array(StoryWorldPackSchema).length(4),
    characterKits: z.array(StoryCharacterKitSchema).length(9),
    sceneModules: z.array(StorySceneModuleSchema).length(20),
  })
  .superRefine((source, context) => {
    if (
      !sameStrings(
        source.worlds.map((world) => world.id),
        EXPECTED_WORLD_IDS,
      )
    ) {
      addIssue(context, ['worlds'], 'World IDs must match the four production world packs.');
    }
    const worldNames = source.worlds.map((world) => world.city.name);
    if (new Set(worldNames).size !== worldNames.length) {
      addIssue(context, ['worlds'], 'Every world must have a distinct city name.');
    }
    for (const [worldIndex, world] of source.worlds.entries()) {
      const actualSlots = templateSlots(world.premise.sentences);
      if (!sameStrings(actualSlots, world.premise.requiredSlots)) {
        addIssue(
          context,
          ['worlds', worldIndex, 'premise', 'requiredSlots'],
          'Declared campaign-premise slots must exactly match its sentence templates.',
        );
      }
      if (!actualSlots.has('city') || !actualSlots.has('faction')) {
        addIssue(
          context,
          ['worlds', worldIndex, 'premise'],
          'Campaign premises must name the live city and active faction.',
        );
      }
    }

    for (const role of StoryRoleSchema.options) {
      const kits = source.characterKits.filter((kit) => kit.role === role);
      if (
        !sameStrings(
          kits.map((kit) => kit.calling.id),
          EXPECTED_CALLINGS_BY_ROLE[role],
        )
      ) {
        addIssue(context, ['characterKits'], `Calling IDs are not compatible with ${role}.`);
      }
      for (const kit of kits) {
        if (kit.id !== kit.calling.id) {
          addIssue(
            context,
            ['characterKits', source.characterKits.indexOf(kit), 'id'],
            'Character kit ID must equal its stable Calling ID.',
          );
        }
        if (
          !sameStrings(
            kit.calling.techniques.map((technique) => technique.id),
            EXPECTED_TECHNIQUES_BY_ROLE[role],
          )
        ) {
          addIssue(
            context,
            ['characterKits', source.characterKits.indexOf(kit), 'calling', 'techniques'],
            `Technique IDs are not executable by the ${role} policy.`,
          );
        }
        for (const contract of EXECUTABLE_TECHNIQUES[role]) {
          const technique = kit.calling.techniques.find(
            (candidate) => candidate.id === contract.id,
          );
          if (technique === undefined) continue;
          for (const field of [
            'mechanicRule',
            'resourceCost',
            'cooldownRounds',
            'condition',
          ] as const) {
            if (technique[field] !== contract[field]) {
              addIssue(
                context,
                ['characterKits', source.characterKits.indexOf(kit), 'calling', 'techniques'],
                `${contract.id} ${field} does not match the executable combat contract.`,
              );
            }
          }
        }
        const rules = EXPECTED_RULES_BY_ROLE[role];
        const actualRules = [
          kit.calling.signatureRuleId,
          kit.calling.reactionRuleId,
          kit.calling.limitationRuleId,
        ];
        if (JSON.stringify(actualRules) !== JSON.stringify(rules)) {
          addIssue(
            context,
            ['characterKits', source.characterKits.indexOf(kit), 'calling'],
            `Rule IDs are not executable by the ${role} simulation.`,
          );
        }
        const kitIndex = source.characterKits.indexOf(kit);
        const portraitSlots = templateSlots(kit.portrait.sentences);
        if (!sameStrings(portraitSlots, kit.portrait.requiredSlots)) {
          addIssue(
            context,
            ['characterKits', kitIndex, 'portrait', 'requiredSlots'],
            'Declared portrait slots must exactly match its sentence templates.',
          );
        }
        if (!portraitSlots.has('lead') || !portraitSlots.has('calling')) {
          addIssue(
            context,
            ['characterKits', kitIndex, 'portrait'],
            'Character portraits must name the live hero and Calling.',
          );
        }
      }
    }

    for (const [index, scene] of source.sceneModules.entries()) {
      if (!scene.id.startsWith(`${scene.category}-`) || scene.choiceSetId !== scene.id) {
        addIssue(
          context,
          ['sceneModules', index],
          'Scene ID, category, and choice-set ID must describe the same production scene.',
        );
      }
      if ((scene.initialFactRoles === undefined) !== (scene.initial === undefined)) {
        addIssue(
          context,
          ['sceneModules', index, 'initial'],
          'Initial fact roles and initial prose must be authored together.',
        );
      }
      const beats = [
        ...(scene.initial === undefined || scene.initialFactRoles === undefined
          ? []
          : [{ key: 'initial', beat: scene.initial, roles: scene.initialFactRoles }]),
        { key: 'continuation', beat: scene.continuation, roles: scene.continuationFactRoles },
      ] as const;
      for (const { key, beat, roles } of beats) {
        const actualSlots = templateSlots(beat.sentences);
        if (!sameStrings(actualSlots, beat.requiredSlots)) {
          addIssue(
            context,
            ['sceneModules', index, key, 'requiredSlots'],
            'Declared slots must exactly match the slots used by the four sentences.',
          );
        }
        if (![...actualSlots].some((slot) => WORLD_IDENTITY_SLOTS.has(slot))) {
          addIssue(
            context,
            ['sceneModules', index, key],
            'Every scene beat must use at least one selected-world identity slot.',
          );
        }
        if (beat.sentences.some((sentence) => HARD_CODED_WORLD_LANGUAGE.test(sentence))) {
          addIssue(
            context,
            ['sceneModules', index, key],
            'Scene templates must use selected-world slots instead of hardcoded world vocabulary.',
          );
        }
        roles.forEach((role) => {
          if (!factRoleIsRepresented(role, actualSlots)) {
            addIssue(
              context,
              ['sceneModules', index, key],
              `The ${role} fact role has no semantic slot in this scene.`,
            );
          }
        });
        if (roles.filter((role) => role.startsWith('prior-')).length === 2) {
          if (!actualSlots.has('priorReference') || !actualSlots.has('priorArtifact')) {
            addIssue(
              context,
              ['sceneModules', index, key],
              'Scenes bound to two prior facts must name both priorReference and priorArtifact.',
            );
          }
        }
      }
    }

    for (const category of StoryCategorySchema.options) {
      const scenes = source.sceneModules.filter((scene) => scene.category === category);
      if (scenes.length !== 4) {
        addIssue(context, ['sceneModules'], `Category ${category} must contain four scenes.`);
      }
    }
    if (new Set(source.sceneModules.map((scene) => scene.id)).size !== source.sceneModules.length) {
      addIssue(context, ['sceneModules'], 'Scene IDs must be unique.');
    }

    const authoredStoryProse = [
      ...source.worlds.flatMap((world) => [
        ...world.premise.sentences,
        world.campaignQuestion,
        world.city.sensoryIdentity,
        world.city.ordinaryLife,
        world.city.oldWound,
      ]),
      ...source.characterKits.flatMap((kit) => [
        ...kit.portrait.sentences,
        kit.origin,
        kit.formativeEvent,
        kit.drive,
        kit.fear,
        kit.contradiction,
        kit.temperament,
        kit.interiorVoice,
        kit.calling.manifestation,
        kit.calling.signature.story,
        kit.calling.reaction.story,
        kit.calling.limitation.story,
        ...kit.calling.techniques.flatMap((technique) => [
          technique.visibleAction,
          technique.tacticalPurpose,
        ]),
      ]),
      ...source.sceneModules.flatMap((scene) => [
        ...(scene.initial?.sentences ?? []),
        ...scene.continuation.sentences,
      ]),
    ];
    for (const [index, prose] of authoredStoryProse.entries()) {
      if (FORBIDDEN_GENERIC_PROSE.some((pattern) => pattern.test(prose))) {
        addIssue(
          context,
          ['storyProse', index],
          'Authored prose contains generic placeholder text.',
        );
      }
    }

    for (const [kitIndex, kit] of source.characterKits.entries()) {
      const storyOnly = [
        ...kit.portrait.sentences,
        kit.calling.signature.story,
        kit.calling.reaction.story,
        kit.calling.limitation.story,
        ...kit.calling.techniques.flatMap((technique) => [
          technique.visibleAction,
          technique.tacticalPurpose,
        ]),
      ];
      if (storyOnly.some((prose) => EXACT_MECHANIC_LANGUAGE.test(prose))) {
        addIssue(
          context,
          ['characterKits', kitIndex],
          'Story prose must not contain exact mechanic labels or numeric rule text.',
        );
      }
    }
  });

export type ValidatedStoryAuthoring = z.infer<typeof StoryAuthoringSchema>;

export function validateStoryAuthoring(source: unknown): ValidatedStoryAuthoring {
  return StoryAuthoringSchema.parse(source);
}

export function extractStoryTemplateSlots(sentences: readonly string[]): string[] {
  return sorted(templateSlots(sentences));
}
