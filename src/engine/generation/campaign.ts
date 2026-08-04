import { z } from 'zod';
import {
  createMilestoneOneDefinitions,
  createMilestoneOnePartyState,
  temporaryEncounter,
} from '../../content/milestone-one';
import { VALIDATED_STORY_AUTHORING } from '../../narrative/authoring/validated-story';
import {
  realiseCampaignPremise,
  realiseCharacterPortrait,
  realiseTechniqueStory,
} from '../../narrative/realiser/story-authoring';
import type { CharacterBlueprint } from '../model/character';
import { CharacterBlueprintSchema } from '../model/character';
import type { CampaignBible } from '../model/world';
import { CampaignBibleSchema } from '../model/world';
import type { RngStreamName, RngStreamsState } from '../rng/streams';
import { createRngStreams, drawInteger } from '../rng/streams';

const names = [
  'Mira Vale',
  'Dax Ren',
  'Sorrel Voss',
  'Ilya Sorn',
  'Tarin Quill',
  'Nessa Rook',
  'Ari Kest',
  'Juno Mire',
  'Cato Wynn',
  'Rhea Sol',
  'Orin Vey',
  'Lina Crest',
  'Bram Nox',
  'Edda Rain',
  'Kiran Ash',
  'Vera Thorn',
  'Noa Flint',
  'Sable Hart',
] as const;

const roles = ['vanguard', 'striker', 'support'] as const;

function pick<T>(
  streams: RngStreamsState,
  stream: RngStreamName,
  values: readonly T[],
): { value: T; streams: RngStreamsState; index: number } {
  const draw = drawInteger(streams, stream, 0, values.length - 1);
  return { value: values[draw.value]!, streams: draw.streams, index: draw.value };
}

function shuffle<T>(streams: RngStreamsState, stream: RngStreamName, values: readonly T[]) {
  const result = [...values];
  let nextStreams = streams;
  for (let index = result.length - 1; index > 0; index -= 1) {
    const draw = drawInteger(nextStreams, stream, 0, index);
    nextStreams = draw.streams;
    [result[index], result[draw.value]] = [result[draw.value]!, result[index]!];
  }
  return { values: result, streams: nextStreams };
}

function slug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
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
  let streams = createRngStreams(seed);
  const worldPick = pick(streams, 'world', VALIDATED_STORY_AUTHORING.worlds);
  streams = worldPick.streams;
  const world = worldPick.value;
  const bible = CampaignBibleSchema.parse({
    seed,
    city: { id: `city-${world.id}`, name: world.city.name, tags: ['modern', 'breach-city'] },
    civicOrder: {
      id: `civic-${world.id}`,
      name: world.civicOrder.name,
      mandate: world.civicOrder.publicPromise,
      tags: ['regulator'],
    },
    guildModel: {
      id: `guild-${world.id}`,
      name: world.guild.name,
      mandate: world.guild.publicPromise,
      tags: ['contracts', 'rankings'],
    },
    rankSystem: { id: `public-licence-ranks-${world.id}`, tiers: [...world.rankTiers] },
    breachLaw: { id: `breach-law-${world.id}`, summary: world.breachLaw },
    powerLaw: { id: `power-law-${world.id}`, summary: world.powerLaw },
    threatEcology: {
      id: `threat-ecology-${world.id}`,
      summary: world.threatEcology,
      tags: ['adaptive', 'urban'],
    },
    activeFactions: [
      {
        id: `faction-${world.id}`,
        name: world.faction.name,
        motive: world.faction.secretMotive,
        tags: ['active'],
      },
    ],
    terminology: {
      heroCollective: 'licensed squad',
      incursion: 'breach',
      powerSource: 'Calling',
      technique: 'technique',
    },
    sceneVocabulary: world.sceneVocabulary,
    toneProfileId: 'modern-progression',
  });

  const shuffledNames = shuffle(streams, 'characters', names);
  streams = shuffledNames.streams;
  const characters: CharacterBlueprint[] = [];

  for (const [slot, role] of roles.entries()) {
    const compatibleKits = VALIDATED_STORY_AUTHORING.characterKits.filter(
      (candidate) => candidate.role === role,
    );
    const kitPick = pick(streams, 'characters', compatibleKits);
    streams = kitPick.streams;
    const kit = kitPick.value;
    const name = shuffledNames.values[slot]!;
    const id = `${slug(name)}-${slot + 1}`;
    const techniques = kit.calling.techniques.map((technique) => ({
      id: technique.id,
      name: technique.name,
      storyDescription: realiseTechniqueStory(technique, name, kit.calling.name),
      mechanicLabel: technique.mechanicRule,
      resourceCost: technique.resourceCost,
      cooldownRounds: technique.cooldownRounds,
      condition: technique.condition,
    }));

    characters.push(
      CharacterBlueprintSchema.parse({
        id,
        name,
        pronouns:
          slot === 0
            ? { subject: 'she', object: 'her', possessive: 'her' }
            : slot === 1
              ? { subject: 'he', object: 'him', possessive: 'his' }
              : { subject: 'they', object: 'them', possessive: 'their' },
        callingId: kit.calling.id,
        callingName: kit.calling.name,
        role: kit.role,
        ageBand: kit.ageBand,
        origin: kit.origin,
        formativeEvent: kit.formativeEvent,
        drive: kit.drive,
        contradiction: kit.contradiction,
        temperament: kit.temperament,
        story: {
          portrait: realiseCharacterPortrait(kit, name, world.city.name),
          fear: kit.fear,
          interiorVoice: kit.interiorVoice,
          signature: kit.calling.signature.story,
          reaction: kit.calling.reaction.story,
          limitation: kit.calling.limitation.story,
        },
        stats: kit.calling.stats,
        signatureRuleId: kit.calling.signatureRuleId,
        signature: kit.calling.signature.mechanic,
        reactionRuleId: kit.calling.reactionRuleId,
        reaction: kit.calling.reaction.mechanic,
        limitationRuleId: kit.calling.limitationRuleId,
        limitation: kit.calling.limitation.mechanic,
        techniqueIds: techniques.map((technique) => technique.id),
        techniques,
        personalHookIds: [`hook-${id}-one`, `hook-${id}-two`],
        personalHooks: [...kit.personalHooks],
        awakeningCondition: kit.awakeningCondition,
        coverageTags: [...kit.calling.coverageTags],
        semanticFingerprint: `${role}:${kit.id}:${kitPick.index}`,
      }),
    );
  }

  return {
    seed,
    bible,
    premise: realiseCampaignPremise(world),
    campaignQuestion: world.campaignQuestion,
    characters,
    semanticFingerprint: `${world.id}|${characters
      .map((character) => `${character.semanticFingerprint}:${character.id}`)
      .join('|')}`,
    rngStreams: streams,
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
