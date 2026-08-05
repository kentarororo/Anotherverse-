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
import { QUEST_ARCS, questWorldId } from '../../content/quest-arcs';
import type { CharacterBlueprint } from '../model/character';
import { CharacterBlueprintSchema } from '../model/character';
import type { CampaignBible } from '../model/world';
import { CampaignBibleSchema } from '../model/world';
import type { RngStreamsState } from '../rng/streams';
import { createRngStreams, drawInteger } from '../rng/streams';

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
  characters: CharacterBlueprint[];
  semanticFingerprint: string;
  rngStreams: RngStreamsState;
}

export function generateCampaignDraft(seed: string): CampaignDraft {
  const mythic = generateMythicReviewDraft(seed);
  let rngStreams = createRngStreams(seed);
  const factionDraw = drawInteger(rngStreams, 'world', 0, 3);
  rngStreams = factionDraw.streams;
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
  const campaignRealmName = `${mythic.world.name}, ${regionNames[regionDraw.value]}`;
  const faction = [
    {
      name: 'The Veiled Court',
      motive: 'Claim the newly awakened heroes before they learn which fallen power chose them.',
    },
    {
      name: 'The Ashen Synod',
      motive: 'Burn every relic that remembers how mortals once defeated the gods.',
    },
    {
      name: 'The Ivory Throne',
      motive:
        'Bind every Mythic Awakening to the crown before an unranked hunter can challenge its rule.',
    },
    {
      name: 'The Drowned Choir',
      motive:
        'Gather three awakened legends whose joined oath can open the sealed road below death.',
    },
  ][factionDraw.value]!;
  const bible = CampaignBibleSchema.parse({
    seed,
    city: {
      id: `realm-${mythic.world.id}`,
      name: campaignRealmName,
      tags: ['mythic-realm', 'living-dungeons'],
    },
    civicOrder: {
      id: `oathkeepers-${mythic.world.id}`,
      name: 'The Oathkeepers',
      mandate: 'Protect ordinary people when gods, kings, and guilds make survival a privilege.',
      tags: ['oaths', 'public-trust'],
    },
    guildModel: {
      id: `hunter-guilds-${mythic.world.id}`,
      name: 'The Ranked Hunter Guilds',
      mandate: 'Train delvers, record victories, and keep the roads to living dungeons open.',
      tags: ['hunters', 'ranked-trials'],
    },
    rankSystem: { id: `path-ranks-${mythic.world.id}`, tiers: [...mythic.world.rankNames] },
    breachLaw: { id: `myth-law-${mythic.world.id}`, summary: mythic.world.mythLaw },
    powerLaw: {
      id: `progression-law-${mythic.world.id}`,
      summary: mythic.world.progressionLaw,
    },
    threatEcology: {
      id: `dungeon-ecology-${mythic.world.id}`,
      summary:
        'Monsters inherit fragments of the dead or forgotten powers whose realms they inhabit. Their visible habits reveal the counter needed to defeat them.',
      tags: ['monsters', 'legends', 'counterplay'],
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
      hiddenRoute: 'forgotten stair',
      publicVenue: 'guild hall',
      publicSignal: 'omen bell',
      recordMedium: 'Book of Deeds',
      privateRefuge: 'wayside shrine',
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
  const quest = QUEST_ARCS[questWorldId(bible.city.id)];

  return {
    seed,
    bible,
    premise: `${campaignRealmName}: ${openingLaw}\n\n${openingDisruption}`,
    campaignQuestion: `What awakened this hunter, and what price will the realm demand as their legend grows?`,
    questTitle: quest.title,
    questObjective: quest.acts[0].objective.replace('{faction}', faction.name),
    questActs: quest.acts.map((act) => act.title),
    characters,
    semanticFingerprint: `${mythic.fingerprint}|seed:${seed}`,
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
  questActs: z.array(z.string().min(1)).length(4),
  characters: z.array(CharacterBlueprintSchema).length(3),
  semanticFingerprint: z.string().min(1),
});
