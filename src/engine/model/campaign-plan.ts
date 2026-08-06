export const CAMPAIGN_TURN_COUNT = 6 as const;

export type MythicDomain = 'storm' | 'underworld' | 'celestial' | 'beast';

export interface WorldThesis {
  readonly id: string;
  readonly domain: MythicDomain;
  readonly title: string;
  readonly mortalOrder: string;
  readonly divineLaw: string;
  readonly awakeningLaw: string;
  readonly taboo: string;
  readonly lexicon: readonly [string, string, string, string];
}

export interface ArcBeat {
  readonly id: string;
  readonly title: string;
  /** A complete authored passage. Runtime realization may replace proper nouns, but never splice fragments. */
  readonly prose: string;
}

export interface ArcSkeleton {
  readonly id: string;
  readonly title: string;
  readonly compatibleDomains: readonly MythicDomain[];
  readonly shape:
    'ascent' | 'hunt' | 'siege' | 'trial' | 'pilgrimage' | 'rebellion' | 'rescue' | 'reckoning';
  readonly beats: readonly [ArcBeat, ArcBeat, ArcBeat, ArcBeat, ArcBeat, ArcBeat];
}

export interface AntagonistAgenda {
  readonly id: string;
  readonly title: string;
  readonly compatibleDomains: readonly MythicDomain[];
  readonly publicAim: string;
  readonly hiddenAim: string;
  readonly grievance: string;
  readonly escalation: string;
}

export type CampaignFact =
  | {
      readonly key: 'world-law';
      readonly kind: 'world-law';
      readonly lawId: string;
      readonly state: 'known';
    }
  | {
      readonly key: 'main-threat';
      readonly kind: 'threat';
      readonly agendaId: string;
      readonly state: 'rumored' | 'identified' | 'cornered' | 'defeated';
    }
  | {
      readonly key: 'act-relic';
      readonly kind: 'relic';
      readonly state: 'missing' | 'found' | 'awakened';
    }
  | {
      readonly key: 'party-bond';
      readonly kind: 'bond';
      readonly state: 'alone' | 'allied' | 'sworn';
    }
  | {
      readonly key: 'final-route';
      readonly kind: 'route';
      readonly state: 'sealed' | 'opened' | 'crossed';
    }
  | {
      readonly key: 'enemy-weakness';
      readonly kind: 'weakness';
      readonly state: 'unknown' | 'learned' | 'exploited';
    }
  | {
      readonly key: 'hero-oath';
      readonly kind: 'oath';
      readonly state: 'unmade' | 'sworn' | 'paid';
    };

export type CampaignFactKey = CampaignFact['key'];
export type CampaignFactState = CampaignFact['state'];

export interface FactPredicate {
  readonly key: CampaignFactKey;
  readonly state: CampaignFactState;
}

export interface FactTransition {
  readonly requires: readonly FactPredicate[];
  readonly forbids: readonly FactPredicate[];
  readonly produces: readonly CampaignFact[];
  readonly retires: readonly FactPredicate[];
}

export type PromiseKind = 'threat' | 'relic' | 'oath';

export interface PlannedPromise {
  readonly id: string;
  readonly kind: PromiseKind;
  readonly description: string;
  readonly setupTurn: number;
  readonly payoffTurn: number;
  readonly payoff: FactPredicate;
}

export interface EnemyPackage {
  readonly id: string;
  readonly familyId: string;
  readonly title: string;
  readonly behavior:
    'press' | 'guard' | 'drain' | 'ambush' | 'summon' | 'counter' | 'execute' | 'disrupt';
  readonly tier: number;
  /** Deliberately excluded from structural fingerprints. */
  readonly statJitter: number;
}

export interface EncounterPackage {
  readonly id: string;
  readonly kind: 'combat';
  readonly stakes: string;
  readonly enemies: readonly [EnemyPackage, ...EnemyPackage[]];
}

export interface RewardPackage {
  readonly id: string;
  readonly styleId: string;
  readonly category: 'currency' | 'material' | 'relic' | 'skill';
  readonly title: string;
  readonly amount: number;
  readonly tags: readonly string[];
}

export interface CampaignScenePlan {
  readonly turn: number;
  readonly id: string;
  readonly beatId: string;
  readonly title: string;
  readonly prose: string;
  readonly outcomeText: string;
  readonly transition: FactTransition;
  readonly promiseSetups: readonly string[];
  readonly promisePayoffs: readonly string[];
  readonly encounter: EncounterPackage | null;
  readonly reward: RewardPackage;
  readonly castIds: readonly string[];
  readonly introducedCastIds: readonly string[];
}

export interface CampaignCastMember {
  readonly id: string;
  readonly role: 'hero' | 'ally' | 'antagonist';
  readonly name: string;
  readonly introductionTurn: number;
}

export interface CampaignMiracle {
  readonly turn: number;
  readonly kind: 'second-awakening' | 'divine-intercession' | 'relic-transfiguration';
  readonly boon: string;
  readonly cost: string;
}

export interface CampaignPlan {
  readonly version: 1;
  readonly seed: string;
  readonly world: WorldThesis;
  readonly arc: ArcSkeleton;
  readonly antagonist: AntagonistAgenda;
  readonly cast: readonly [
    CampaignCastMember,
    CampaignCastMember,
    CampaignCastMember,
    CampaignCastMember,
  ];
  readonly miracle: CampaignMiracle | null;
  readonly initialFacts: readonly CampaignFact[];
  readonly promises: readonly PlannedPromise[];
  readonly scenes: readonly [
    CampaignScenePlan,
    CampaignScenePlan,
    CampaignScenePlan,
    CampaignScenePlan,
    CampaignScenePlan,
    CampaignScenePlan,
  ];
  /** Omits seed, names, prose, and raw numeric jitter by contract. */
  readonly structuralFingerprint: string;
}

export interface CampaignPlanValidation {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly finalFacts: ReadonlyMap<CampaignFactKey, CampaignFact>;
}

const MythicDomainSchema = z.enum(['storm', 'underworld', 'celestial', 'beast']);
const WorldThesisSchema = z.object({
  id: z.string().min(1),
  domain: MythicDomainSchema,
  title: z.string().min(1),
  mortalOrder: z.string().min(1),
  divineLaw: z.string().min(1),
  awakeningLaw: z.string().min(1),
  taboo: z.string().min(1),
  lexicon: z.tuple([z.string().min(1), z.string().min(1), z.string().min(1), z.string().min(1)]),
});
const ArcBeatSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  prose: z.string().min(1),
});
const ArcSkeletonSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  compatibleDomains: z.array(MythicDomainSchema).min(1),
  shape: z.enum([
    'ascent',
    'hunt',
    'siege',
    'trial',
    'pilgrimage',
    'rebellion',
    'rescue',
    'reckoning',
  ]),
  beats: z.tuple([
    ArcBeatSchema,
    ArcBeatSchema,
    ArcBeatSchema,
    ArcBeatSchema,
    ArcBeatSchema,
    ArcBeatSchema,
  ]),
});
const AntagonistAgendaSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  compatibleDomains: z.array(MythicDomainSchema).min(1),
  publicAim: z.string().min(1),
  hiddenAim: z.string().min(1),
  grievance: z.string().min(1),
  escalation: z.string().min(1),
});
const CampaignFactSchema = z.discriminatedUnion('kind', [
  z.object({
    key: z.literal('world-law'),
    kind: z.literal('world-law'),
    lawId: z.string().min(1),
    state: z.literal('known'),
  }),
  z.object({
    key: z.literal('main-threat'),
    kind: z.literal('threat'),
    agendaId: z.string().min(1),
    state: z.enum(['rumored', 'identified', 'cornered', 'defeated']),
  }),
  z.object({
    key: z.literal('act-relic'),
    kind: z.literal('relic'),
    state: z.enum(['missing', 'found', 'awakened']),
  }),
  z.object({
    key: z.literal('party-bond'),
    kind: z.literal('bond'),
    state: z.enum(['alone', 'allied', 'sworn']),
  }),
  z.object({
    key: z.literal('final-route'),
    kind: z.literal('route'),
    state: z.enum(['sealed', 'opened', 'crossed']),
  }),
  z.object({
    key: z.literal('enemy-weakness'),
    kind: z.literal('weakness'),
    state: z.enum(['unknown', 'learned', 'exploited']),
  }),
  z.object({
    key: z.literal('hero-oath'),
    kind: z.literal('oath'),
    state: z.enum(['unmade', 'sworn', 'paid']),
  }),
]);
const FactPredicateSchema = z.object({
  key: z.enum([
    'world-law',
    'main-threat',
    'act-relic',
    'party-bond',
    'final-route',
    'enemy-weakness',
    'hero-oath',
  ]),
  state: z.enum([
    'known',
    'rumored',
    'identified',
    'cornered',
    'defeated',
    'missing',
    'found',
    'awakened',
    'alone',
    'allied',
    'sworn',
    'sealed',
    'opened',
    'crossed',
    'unknown',
    'learned',
    'exploited',
    'unmade',
    'paid',
  ]),
});
const FactTransitionSchema = z.object({
  requires: z.array(FactPredicateSchema),
  forbids: z.array(FactPredicateSchema),
  produces: z.array(CampaignFactSchema),
  retires: z.array(FactPredicateSchema),
});
const PlannedPromiseSchema = z.object({
  id: z.string().min(1),
  kind: z.enum(['threat', 'relic', 'oath']),
  description: z.string().min(1),
  setupTurn: z.number().int().min(1).max(6),
  payoffTurn: z.number().int().min(1).max(6),
  payoff: FactPredicateSchema,
});
const EnemyPackageSchema = z.object({
  id: z.string().min(1),
  familyId: z.string().min(1),
  title: z.string().min(1),
  behavior: z.enum([
    'press',
    'guard',
    'drain',
    'ambush',
    'summon',
    'counter',
    'execute',
    'disrupt',
  ]),
  tier: z.number().int().positive(),
  statJitter: z.number().finite(),
});
const EncounterPackageSchema = z.object({
  id: z.string().min(1),
  kind: z.literal('combat'),
  stakes: z.string().min(1),
  enemies: z.array(EnemyPackageSchema).min(1),
});
const RewardPackageSchema = z.object({
  id: z.string().min(1),
  styleId: z.string().min(1),
  category: z.enum(['currency', 'material', 'relic', 'skill']),
  title: z.string().min(1),
  amount: z.number().finite().positive(),
  tags: z.array(z.string().min(1)),
});
const CampaignScenePlanSchema = z.object({
  turn: z.number().int().min(1).max(6),
  id: z.string().min(1),
  beatId: z.string().min(1),
  title: z.string().min(1),
  prose: z.string().min(1),
  outcomeText: z.string().min(1),
  transition: FactTransitionSchema,
  promiseSetups: z.array(z.string().min(1)),
  promisePayoffs: z.array(z.string().min(1)),
  encounter: EncounterPackageSchema.nullable(),
  reward: RewardPackageSchema,
  castIds: z.array(z.string().min(1)),
  introducedCastIds: z.array(z.string().min(1)),
});
const CampaignCastMemberSchema = z.object({
  id: z.string().min(1),
  role: z.enum(['hero', 'ally', 'antagonist']),
  name: z.string().min(1),
  introductionTurn: z.number().int().min(1).max(6),
});
const CampaignMiracleSchema = z.object({
  turn: z.number().int().min(3).max(5),
  kind: z.enum(['second-awakening', 'divine-intercession', 'relic-transfiguration']),
  boon: z.string().min(1),
  cost: z.string().min(1),
});

/** Strong runtime boundary for embedding compiled plans in canonical saves. */
export const CampaignPlanSchema = z.object({
  version: z.literal(1),
  seed: z.string().min(1),
  world: WorldThesisSchema,
  arc: ArcSkeletonSchema,
  antagonist: AntagonistAgendaSchema,
  cast: z.tuple([
    CampaignCastMemberSchema,
    CampaignCastMemberSchema,
    CampaignCastMemberSchema,
    CampaignCastMemberSchema,
  ]),
  miracle: CampaignMiracleSchema.nullable(),
  initialFacts: z.array(CampaignFactSchema),
  promises: z.array(PlannedPromiseSchema),
  scenes: z.tuple([
    CampaignScenePlanSchema,
    CampaignScenePlanSchema,
    CampaignScenePlanSchema,
    CampaignScenePlanSchema,
    CampaignScenePlanSchema,
    CampaignScenePlanSchema,
  ]),
  structuralFingerprint: z.string().min(1),
}) as unknown as z.ZodType<CampaignPlan>;
import { z } from 'zod';
