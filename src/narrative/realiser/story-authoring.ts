import type { z } from 'zod';
import type { StorySlotSchema, ValidatedStoryAuthoring } from '../../engine/model/story-authoring';
import { assertNoUnresolvedSlots, completeSentence } from './grammar';

export type StorySlot = z.infer<typeof StorySlotSchema>;
export type StorySlotValues = Partial<Record<StorySlot, string>>;
export type ValidatedWorldStory = ValidatedStoryAuthoring['worlds'][number];
export type ValidatedCharacterStory = ValidatedStoryAuthoring['characterKits'][number];
export type ValidatedTechniqueStory = ValidatedCharacterStory['calling']['techniques'][number];
export type ValidatedBeat = ValidatedWorldStory['premise'];

const SLOT_PATTERN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

function cleanSlotValue(slot: StorySlot, value: string | undefined): string {
  const clean = value?.trim();
  if (clean === undefined || clean.length === 0) {
    throw new Error(`Story slot {${slot}} has no live value.`);
  }
  if (/\{[^}]+\}/.test(clean)) {
    throw new Error(`Story slot {${slot}} contains an unresolved nested slot.`);
  }
  return clean;
}

export function realiseStoryBeat(beat: ValidatedBeat, slots: StorySlotValues): string {
  for (const slot of beat.requiredSlots) cleanSlotValue(slot, slots[slot]);
  const paragraph = beat.sentences
    .map((sentence) =>
      sentence.replace(SLOT_PATTERN, (_token, slotName: StorySlot) =>
        cleanSlotValue(slotName, slots[slotName]),
      ),
    )
    .join(' ')
    .trim();
  assertNoUnresolvedSlots(paragraph);
  if (/\s{2,}/.test(paragraph)) throw new Error('Realised story contains double whitespace.');
  if (paragraph.split(/(?<=[.!?])\s+/).length !== 4) {
    throw new Error('A story beat must realise as exactly four sentences.');
  }
  return paragraph;
}

export function realiseCampaignPremise(world: ValidatedWorldStory): string {
  return realiseStoryBeat(world.premise, {
    city: world.city.name,
    civic: world.civicOrder.name,
    guild: world.guild.name,
    faction: world.faction.name,
    factionMotive: world.faction.secretMotive,
  });
}

export function realiseCharacterPortrait(
  kit: ValidatedCharacterStory,
  heroName: string,
  cityName: string,
): string {
  return realiseStoryBeat(kit.portrait, {
    city: cityName,
    lead: heroName,
    leadOrigin: kit.origin,
    calling: kit.calling.name,
    awakening: kit.awakeningCondition,
  });
}

export function realiseTechniqueStory(
  technique: ValidatedTechniqueStory,
  heroName: string,
  callingName: string,
): string {
  const personalisedAction = technique.visibleAction.replace(/^The bearer\b/, heroName);
  const visibleAction = personalisedAction.includes(heroName)
    ? personalisedAction
    : `At ${heroName}'s command, ${personalisedAction[0]!.toLowerCase()}${personalisedAction.slice(1)}`;
  const rewrittenPurpose = technique.tacticalPurpose
    .replace(/^Use it to\s+/i, `${callingName} is strongest when used to `)
    .replace(/^Use it when\s+/i, `${callingName} answers best when `)
    .replace(/^Use it from\s+/i, `${callingName} answers best from `)
    .replace(/^Use it below\s+/i, `${callingName} answers best below `)
    .replace(/^Use it under\s+/i, `${callingName} answers best under `)
    .replace(/^Use it aggressively\s+/i, `${callingName} becomes decisive when used aggressively `);
  const tacticalPurpose = rewrittenPurpose.includes(callingName)
    ? rewrittenPurpose
    : `With ${callingName}, ${rewrittenPurpose[0]!.toLowerCase()}${rewrittenPurpose.slice(1)}`;
  const description = `${completeSentence(visibleAction)} ${completeSentence(tacticalPurpose)}`;
  assertNoUnresolvedSlots(description);
  return description;
}
