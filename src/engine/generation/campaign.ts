import { z } from 'zod';
import {
  createMilestoneOneDefinitions,
  createMilestoneOnePartyState,
  temporaryEncounter,
} from '../../content/milestone-one';
import { generateMythicReviewDraft, type MythicHero } from '../../content/mythic-review';
import { PATH_CLASSES } from '../../content/path-classes';
import type { CharacterBlueprint } from '../model/character';
import { CharacterBlueprintSchema } from '../model/character';
import type { CampaignBible } from '../model/world';
import { CampaignBibleSchema } from '../model/world';
import type { RngStreamsState } from '../rng/streams';
import { createRngStreams, drawInteger } from '../rng/streams';

function firstSentence(value: string) {
  return value.match(/^[^.!?]+[.!?]/)?.[0] ?? value;
}

function asClause(value: string) {
  return value
    .trim()
    .replace(/[.!?]+/g, ',')
    .replace(/,+$/g, '');
}

function createCharacter(hero: MythicHero, worldName: string, progressionLaw: string) {
  const rules = PATH_CLASSES[hero.role];
  const techniques = hero.techniques.map((technique) => ({
    id: technique.id,
    name: technique.name,
    storyDescription: `${hero.name} calls on ${hero.pathName}. ${technique.visibleAction} ${technique.tacticalPurpose}`,
    mechanicLabel: technique.mechanicRule,
    resourceCost: technique.cost,
    cooldownRounds: technique.cooldown,
    condition: technique.tacticalPurpose,
  }));

  return CharacterBlueprintSchema.parse({
    id: hero.id,
    name: hero.name,
    pronouns:
      hero.role === 'vanguard'
        ? { subject: 'she', object: 'her', possessive: 'her' }
        : hero.role === 'striker'
          ? { subject: 'he', object: 'him', possessive: 'his' }
          : { subject: 'they', object: 'them', possessive: 'their' },
    callingId: hero.pathName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    callingName: hero.pathName,
    pathClassId: rules.id,
    pathClassName: rules.name,
    pathClassSummary: rules.summary,
    backgroundName:
      hero.role === 'vanguard'
        ? 'Survivor of the Broken Shrine'
        : hero.role === 'striker'
          ? 'Heir to a Vanished Hunter'
          : 'Keeper of the Unanswered Prayer',
    bond: hero.desire,
    role: hero.role,
    ageBand: 'young-adult',
    origin: worldName,
    formativeEvent: firstSentence(hero.introduction),
    drive: hero.desire,
    contradiction: hero.flaw,
    temperament: hero.voiceLine,
    story: {
      portrait: `${hero.name} lives in ${worldName}. ${hero.introduction}`,
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
    awakeningCondition: `${asClause(progressionLaw)}; ${hero.name} must confront this flaw: ${asClause(hero.flaw)}`,
    coverageTags: rules.coverageTags,
    semanticFingerprint: `mythic:${hero.role}:${hero.id}`,
  });
}

export interface CampaignDraft {
  seed: string;
  bible: CampaignBible;
  premise: string;
  campaignQuestion: string;
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
  for (let index = 0; index < 6; index += 1) {
    rngStreams = drawInteger(rngStreams, 'characters', 0, 1).streams;
  }
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
      motive:
        'Claim the newly awakened Mythic Paths before their bearers learn which fallen power chose them.',
    },
    {
      name: 'The Ashen Synod',
      motive: 'Burn every relic that remembers how mortals once defeated the gods.',
    },
    {
      name: 'The Ivory Throne',
      motive:
        'Bind all Mythic Paths to the crown before an unranked hunter can challenge its rule.',
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
      powerSource: 'Mythic Path',
      technique: 'technique',
    },
    sceneVocabulary: {
      crisisSite: 'dungeon threshold',
      hiddenRoute: 'forgotten stair',
      publicVenue: 'guild hall',
      publicSignal: 'omen bell',
      recordMedium: 'Soul Ledger',
      privateRefuge: 'wayside shrine',
    },
    toneProfileId: 'mythic-progression-fantasy',
  });
  const characters = mythic.trio.map((hero) =>
    createCharacter(hero, campaignRealmName, mythic.world.progressionLaw),
  );

  return {
    seed,
    bible,
    premise: `${campaignRealmName}: ${openingLaw}\n\n${openingDisruption}`,
    campaignQuestion: `What awakened these three Mythic Paths, and what price will the realm demand when their legend outgrows its gods?`,
    characters,
    semanticFingerprint: `${mythic.fingerprint}|seed:${seed}`,
    rngStreams,
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
  characters: z.array(CharacterBlueprintSchema).length(3),
  semanticFingerprint: z.string().min(1),
});
