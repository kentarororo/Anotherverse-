import { z } from 'zod';
import {
  createMilestoneOneDefinitions,
  createMilestoneOnePartyState,
  temporaryEncounter,
} from '../../content/milestone-one';
import {
  generateMythicCompanion,
  generateMythicReviewDraft,
  type MythicHero,
  type MythicRole,
} from '../../content/mythic-review';
import { PATH_CLASSES } from '../../content/path-classes';
import type { CharacterBlueprint } from '../model/character';
import { CharacterBlueprintSchema } from '../model/character';
import { CampaignPlanSchema, type CampaignPlan } from '../model/campaign-plan';
import type { CampaignBible } from '../model/world';
import { CampaignBibleSchema } from '../model/world';
import type { RngStreamsState } from '../rng/streams';
import { createRngStreams, drawInteger } from '../rng/streams';
import { compileCampaignPlan } from './campaign-compiler';

interface CharacterOrigin {
  name: string;
  background: string;
  detail: string;
}

const ORIGINS: Record<'fallen-heavens' | 'underworld-tide', readonly CharacterOrigin[]> = {
  'fallen-heavens': [
    {
      name: 'the rooftop gardens of Aster Vale',
      background: 'Keeper of the Sky Gardens',
      detail: 'where families grow silver pears beneath the ribs of a dead star-god',
    },
    {
      name: 'the walking shrine of Saint Orra',
      background: 'Pilgrim of the Walking Shrine',
      detail: 'a temple carried from village to village on the backs of six stone elephants',
    },
    {
      name: 'Moth-Wood Monastery',
      background: 'Runaway of Moth-Wood',
      detail: 'where novices learn sword forms by following lantern moths through the pines',
    },
    {
      name: 'the Red Quarry villages',
      background: 'Child of the Red Quarry',
      detail: 'whose miners carve warm godbone from the cliffs and sing before every blast',
    },
    {
      name: 'the cloud-market of Veyra',
      background: 'Courier of the Cloud Market',
      detail: 'a rope-and-sail bazaar that crosses the high valleys with the monsoon winds',
    },
    {
      name: 'the lion farms of Hearthstep',
      background: 'Beast-Keeper of Hearthstep',
      detail: 'where bronze-maned lions guard the wheat fields from hungry spirits',
    },
  ],
  'underworld-tide': [
    {
      name: 'the stilt-houses of Bellwater',
      background: 'Bellwater Boat Child',
      detail: 'where every doorway keeps a bell for the drowned and a lamp for the living',
    },
    {
      name: 'the pearl-diver isle of Soryu',
      background: 'Diver of Soryu',
      detail: 'whose children learn the names of sea spirits before they learn to swim',
    },
    {
      name: 'the moonless monastery at Kest',
      background: 'Novice of the Moonless Abbey',
      detail: 'where monks fence with candle flames and bury no one with an unpaid promise',
    },
    {
      name: 'the salt orchards of Namar',
      background: 'Harvester of the Salt Orchards',
      detail: 'where white fruit grows on black trees after the tide retreats',
    },
    {
      name: 'the wandering funeral fleet',
      background: 'Singer of the Funeral Fleet',
      detail: 'a family of painted boats that carries the nameless dead home',
    },
    {
      name: 'the cliff city of Nine Ropes',
      background: 'Runner of Nine Ropes',
      detail: 'whose streets hang above the sea and vanish whenever the storm bells ring',
    },
  ],
};

const TECHNIQUE_CONDITIONS: Readonly<Record<string, string>> = {
  'aegis-break': 'Any enemy.',
  'hold-the-line': 'Front hero only.',
  'arc-finish': 'Aggressive stance or target below 65% HP.',
  'cross-step': 'Rear position or Tactical stance.',
  'restorative-sigil': 'A wounded ally.',
  'binding-shot': 'Tactical stance.',
};

function createCharacter(hero: MythicHero, origin: CharacterOrigin) {
  const rules = PATH_CLASSES[hero.role];
  const techniques = hero.techniques.map((technique) => ({
    id: technique.id,
    name: technique.name,
    storyDescription: technique.visibleAction,
    mechanicLabel: technique.mechanicRule,
    resourceCost: technique.cost,
    cooldownRounds: technique.cooldown,
    condition: TECHNIQUE_CONDITIONS[technique.id] ?? 'No special condition.',
  }));

  return CharacterBlueprintSchema.parse({
    id: hero.id,
    name: hero.name,
    pronouns: hero.pronouns,
    callingId: hero.pathName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    callingName: hero.pathName,
    pathClassId: rules.id,
    pathClassName: rules.name,
    pathClassSummary: rules.summary,
    backgroundName: origin.background,
    bond: hero.bond,
    role: hero.role,
    ageBand: 'young-adult',
    origin: origin.name,
    formativeEvent: hero.definingChoice,
    drive: hero.desire,
    contradiction: hero.flaw,
    temperament: hero.voiceLine,
    story: {
      portrait: `${hero.name} comes from ${origin.name}, ${origin.detail}. ${hero.introduction}`,
      fear: hero.flaw,
      interiorVoice: hero.voiceLine,
      signature: rules.signatureStory,
      reaction: rules.reactionStory,
      limitation: rules.limitationStory,
    },
    stats: hero.stats,
    signatureRuleId: rules.signatureRuleId,
    signature: rules.signature,
    reactionRuleId: rules.reactionRuleId,
    reaction: rules.reaction,
    limitationRuleId: rules.limitationRuleId,
    limitation: rules.limitation,
    techniqueIds: techniques.map((technique) => technique.id),
    techniques,
    personalHookIds: [`hook-${hero.id}-desire`, `hook-${hero.id}-flaw`],
    personalHooks: [hero.desire, hero.flaw],
    awakeningCondition: hero.awakeningTrial,
    coverageTags: rules.coverageTags,
    semanticFingerprint: `mythic:${hero.role}:${hero.id}`,
  });
}

export interface CampaignDraft {
  seed: string;
  bible: CampaignBible;
  premise: string;
  campaignQuestion: string;
  questTitle: string;
  questObjective: string;
  questActs: string[];
  plan: CampaignPlan;
  characters: CharacterBlueprint[];
  semanticFingerprint: string;
  rngStreams: RngStreamsState;
}

function mythicDraftForPlan(seed: string, plan: CampaignPlan) {
  const worldId = plan.world.domain === 'underworld' ? 'underworld-tide' : 'fallen-heavens';
  for (let attempt = 0; attempt < 32; attempt += 1) {
    const draft = generateMythicReviewDraft(`${seed}:world:${attempt}`);
    if (draft.world.id === worldId) return draft;
  }
  throw new Error(`Unable to bind campaign ${seed} to the selected ${worldId} world.`);
}

export function generateCampaignDraft(seed: string): CampaignDraft {
  const plan = compileCampaignPlan(seed);
  const mythic = mythicDraftForPlan(seed, plan);
  let rngStreams = createRngStreams(seed);
  const regionDraw = drawInteger(rngStreams, 'world', 0, 7);
  rngStreams = regionDraw.streams;
  const [openingLaw, openingDisruption] = mythic.world.opening;
  const regionNames =
    mythic.world.id === 'fallen-heavens'
      ? [
          'the Ember March',
          'the Lion Road',
          'the Moonfall Vale',
          'the Ashen Crownlands',
          'the Saint’s Descent',
          'the Hollow Highlands',
          'the Godbone Frontier',
          'the Last Star Province',
        ]
      : [
          'the Black Shore',
          'the Bellwater Coast',
          'the Pearl March',
          'the Drowned Crownlands',
          'the Ferryman’s Reach',
          'the Moonless Strand',
          'the Salt-Grave Frontier',
          'the Last Tide Province',
        ];
  const campaignRealmName = `${plan.world.title}, ${regionNames[regionDraw.value]}`;
  const lexicon = plan.world.lexicon;
  const faction = {
    name: plan.antagonist.title,
    motive: plan.antagonist.hiddenAim,
  };
  const bible = CampaignBibleSchema.parse({
    seed,
    city: {
      id: `realm-${mythic.world.id}`,
      name: campaignRealmName,
      tags: ['mythic-realm', 'living-dungeons'],
    },
    civicOrder: {
      id: `oathkeepers-${mythic.world.id}`,
      name: `${lexicon[0].replace(/\b\w/g, (letter) => letter.toUpperCase())} Wardens`,
      mandate: plan.world.mortalOrder,
      tags: [plan.world.domain, 'public-trust'],
    },
    guildModel: {
      id: `hunter-guilds-${mythic.world.id}`,
      name: 'The Ascendant Companies',
      mandate: 'Train heroes, record their deeds, and keep the roads through mythic realms open.',
      tags: ['heroes', 'ascension'],
    },
    rankSystem: { id: `path-ranks-${mythic.world.id}`, tiers: [...mythic.world.rankNames] },
    breachLaw: { id: `myth-law-${mythic.world.id}`, summary: plan.world.divineLaw },
    powerLaw: {
      id: `progression-law-${mythic.world.id}`,
      summary: plan.world.awakeningLaw,
    },
    threatEcology: {
      id: `dungeon-ecology-${mythic.world.id}`,
      summary: `Monsters take shape when the law of ${lexicon[0]} is broken. ${plan.world.taboo}`,
      tags: ['monsters', plan.world.domain, 'counterplay'],
    },
    activeFactions: [
      {
        id: `veiled-court-${mythic.world.id}`,
        name: faction.name,
        motive: faction.motive,
        tags: ['rival', 'secret-patron'],
      },
    ],
    terminology: {
      heroCollective: 'hunter trio',
      incursion: 'descent',
      powerSource: 'Mythic Awakening',
      technique: 'technique',
    },
    sceneVocabulary: {
      crisisSite: 'dungeon threshold',
      hiddenRoute: lexicon[2],
      publicVenue: `${lexicon[0]} hall`,
      publicSignal: lexicon[3],
      recordMedium: 'Book of Deeds',
      privateRefuge: `${lexicon[1]} shrine`,
    },
    toneProfileId: 'mythic-progression-fantasy',
  });
  const originPool = ORIGINS[mythic.world.id as keyof typeof ORIGINS] ?? ORIGINS['fallen-heavens'];
  const originStart = drawInteger(rngStreams, 'characters', 0, originPool.length - 1);
  rngStreams = originStart.streams;
  const originStride = drawInteger(rngStreams, 'characters', 1, originPool.length - 1);
  rngStreams = originStride.streams;
  const usedOrigins = new Set<number>();
  const characters = mythic.trio.map((hero, index) => {
    let originIndex = (originStart.value + originStride.value * index) % originPool.length;
    while (usedOrigins.has(originIndex)) originIndex = (originIndex + 1) % originPool.length;
    usedOrigins.add(originIndex);
    return createCharacter(hero, originPool[originIndex]!);
  });
  return {
    seed,
    bible,
    premise: `${campaignRealmName}: ${openingLaw}\n\n${openingDisruption}`,
    campaignQuestion: `What awakened this hunter, and what price will the realm demand as their legend grows?`,
    questTitle: plan.arc.title,
    questObjective: plan.scenes[0].title,
    questActs: plan.scenes.map((scene) => scene.title),
    plan,
    characters,
    // Describe the generated content rather than the input seed. A seed suffix made duplicate
    // drafts appear semantically unique even when every player-facing choice was identical.
    semanticFingerprint: [
      plan.structuralFingerprint,
      mythic.fingerprint,
      `realm:${campaignRealmName}`,
      `origins:${characters.map((hero) => hero.origin).join('|')}`,
      `relics:${mythic.relics.map((relic) => `${relic.id}:${relic.name}`).join('|')}`,
    ].join('|'),
    rngStreams,
  };
}

export function generateCampaignCompanion(
  initialStreams: RngStreamsState,
  worldId: 'fallen-heavens' | 'underworld-tide',
  role: MythicRole,
  excludedHeroIds: readonly string[],
  usedOriginNames: readonly string[],
): { character: CharacterBlueprint; streams: RngStreamsState } {
  const generated = generateMythicCompanion(initialStreams, worldId, role, excludedHeroIds);
  const availableOrigins = ORIGINS[worldId].filter(
    (origin) => !usedOriginNames.includes(origin.name),
  );
  if (availableOrigins.length === 0) {
    throw new Error(`No unused ${worldId} origin remains for a new companion.`);
  }
  const originDraw = drawInteger(generated.streams, 'characters', 0, availableOrigins.length - 1);
  return {
    character: createCharacter(generated.hero, availableOrigins[originDraw.value]!),
    streams: originDraw.streams,
  };
}

export function createGeneratedCampaignState(seed: string) {
  const draft = generateCampaignDraft(seed);
  return {
    draft,
    generatedDefinitions: createMilestoneOneDefinitions(draft.characters),
    partyState: createMilestoneOnePartyState(draft.characters),
    currentEncounter: temporaryEncounter,
  };
}

export const CampaignDraftSchema = z.object({
  seed: z.string().min(1),
  bible: CampaignBibleSchema,
  premise: z.string().min(1),
  campaignQuestion: z.string().min(1),
  questTitle: z.string().min(1),
  questObjective: z.string().min(1),
  questActs: z.array(z.string().min(1)).length(6),
  plan: CampaignPlanSchema,
  characters: z.array(CharacterBlueprintSchema).length(3),
  semanticFingerprint: z.string().min(1),
});
