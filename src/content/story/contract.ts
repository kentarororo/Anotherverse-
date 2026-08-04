export type StoryRole = 'vanguard' | 'striker' | 'support';

export type StoryCategory = 'operation' | 'personal' | 'discovery' | 'rival' | 'social';

export type StoryFactRole =
  | 'city'
  | 'faction'
  | 'origin'
  | 'prior-operation'
  | 'prior-personal'
  | 'prior-discovery'
  | 'prior-rival'
  | 'prior-social'
  | 'prior-decision';

export type StorySlot =
  | 'city'
  | 'civic'
  | 'guild'
  | 'faction'
  | 'factionMotive'
  | 'lead'
  | 'partner'
  | 'leadOrigin'
  | 'calling'
  | 'awakening'
  | 'priorReference'
  | 'priorArtifact'
  | 'enemyOne'
  | 'enemyTwo'
  | 'rank'
  | 'relationshipLine'
  | 'crisisSite'
  | 'hiddenRoute'
  | 'publicVenue'
  | 'publicSignal'
  | 'recordMedium'
  | 'privateRefuge';

export interface StoryVoiceGuide {
  promise: string;
  viewpoint: string;
  sentenceRhythm: string;
  sceneRule: string;
  progressionRule: string;
  mysteryRule: string;
  prohibitedShortcuts: readonly string[];
}

export interface StoryWorldPack {
  id: string;
  city: {
    name: string;
    sensoryIdentity: string;
    ordinaryLife: string;
    oldWound: string;
  };
  civicOrder: {
    name: string;
    publicPromise: string;
    blindSpot: string;
  };
  guild: {
    name: string;
    publicPromise: string;
    pressure: string;
  };
  rankTiers: readonly [string, string, string, string];
  breachLaw: string;
  powerLaw: string;
  threatEcology: string;
  faction: {
    name: string;
    publicFace: string;
    secretMotive: string;
  };
  sceneVocabulary: {
    crisisSite: string;
    hiddenRoute: string;
    publicVenue: string;
    publicSignal: string;
    recordMedium: string;
    privateRefuge: string;
  };
  premise: StoryBeatTemplate;
  campaignQuestion: string;
}

export interface StoryRuleText {
  story: string;
  mechanic: string;
}

export interface StoryTechnique {
  id: string;
  name: string;
  visibleAction: string;
  tacticalPurpose: string;
  mechanicRule: string;
  resourceCost: number;
  cooldownRounds: number;
  condition: string;
}

export interface StoryCalling {
  id: string;
  name: string;
  manifestation: string;
  stats: {
    vitality: number;
    power: number;
    guard: number;
    speed: number;
    focus: number;
  };
  signatureRuleId: string;
  signature: StoryRuleText;
  reactionRuleId: string;
  reaction: StoryRuleText;
  limitationRuleId: string;
  limitation: StoryRuleText;
  techniques: readonly [StoryTechnique, StoryTechnique];
  coverageTags: readonly ('defence' | 'control' | 'damage' | 'sustain' | 'resource')[];
}

export interface StoryCharacterKit {
  id: string;
  role: StoryRole;
  ageBand: 'young-adult' | 'adult' | 'veteran';
  origin: string;
  formativeEvent: string;
  drive: string;
  fear: string;
  contradiction: string;
  temperament: string;
  interiorVoice: string;
  personalHooks: readonly [string, string];
  awakeningCondition: string;
  portrait: StoryBeatTemplate;
  calling: StoryCalling;
}

export interface StoryBeatTemplate {
  requiredSlots: readonly StorySlot[];
  sentences: readonly [string, string, string, string];
}

export interface StorySceneModule {
  id: string;
  category: StoryCategory;
  title: string;
  sceneKind: string;
  choiceSetId: string;
  leadRoles: readonly StoryRole[];
  initialFactRoles?: readonly [StoryFactRole, StoryFactRole];
  continuationFactRoles: readonly [StoryFactRole, StoryFactRole];
  initial?: StoryBeatTemplate;
  continuation: StoryBeatTemplate;
}

export interface StoryAuthoringSource {
  schemaVersion: number;
  voice: StoryVoiceGuide;
  worlds: readonly StoryWorldPack[];
  characterKits: readonly StoryCharacterKit[];
  sceneModules: readonly StorySceneModule[];
}
