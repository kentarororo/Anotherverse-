import type { MythicRole } from './mythic-review';

export interface PathClassDefinition {
  id: string;
  name: string;
  role: MythicRole;
  summary: string;
  signatureRuleId: string;
  signature: string;
  signatureStory: string;
  reactionRuleId: string;
  reaction: string;
  reactionStory: string;
  limitationRuleId: string;
  limitation: string;
  limitationStory: string;
  coverageTags: readonly ('defence' | 'control' | 'damage' | 'sustain' | 'resource')[];
}

/** The base class owns the combat job; the hero's Mythic Path owns their personal legend. */
export const PATH_CLASSES: Readonly<Record<MythicRole, PathClassDefinition>> = {
  vanguard: {
    id: 'oathward',
    name: 'Oathward',
    role: 'vanguard',
    summary:
      'A front-line guardian who turns a promise into armour and intercepts danger meant for an ally.',
    signatureRuleId: 'rear-intercept',
    signature: 'Once each round, intercept the first attack aimed at an ally in the rear.',
    signatureStory:
      'The oath answers danger before thought, carrying its bearer between the enemy and the person who would have been struck.',
    reactionRuleId: 'intercept-brace',
    reaction: 'After intercepting, gain 3 Ward for the rest of the round.',
    reactionStory:
      'The same promise that draws the blow hardens into a brief shield around its bearer.',
    limitationRuleId: 'measured-strikes',
    limitation: 'Direct attacks deal 1 less raw damage.',
    limitationStory:
      "Strength spent sheltering others cannot land with an executioner's full force.",
    coverageTags: ['defence', 'control'],
  },
  striker: {
    id: 'doomseeker',
    name: 'Doomseeker',
    role: 'striker',
    summary:
      "A relentless finisher who reads the fracture in a monster's legend and turns it into a killing line.",
    signatureRuleId: 'exploit-exposed',
    signature: 'Deal +3 raw damage when attacking an Exposed enemy.',
    signatureStory:
      "The Path recognises the instant a monster's legend falters and turns that opening into a killing line.",
    reactionRuleId: 'finisher-surge',
    reaction: 'After committing a finisher, gain Inspired for 2 rounds.',
    reactionStory:
      "A decisive strike wakes the hunter's legend, sharpening the next heartbeat into momentum.",
    limitationRuleId: 'open-guard',
    limitation: 'Aggressive stance reduces effective Guard by 2.',
    limitationStory:
      'Power bought through pursuit leaves no room to hide behind a perfect defence.',
    coverageTags: ['damage', 'resource'],
  },
  support: {
    id: 'fateweaver',
    name: 'Fateweaver',
    role: 'support',
    summary:
      'A keeper of living threads who mends wounds, binds threats, and returns strength to the party.',
    signatureRuleId: 'mending-ward',
    signature: 'Recovery techniques also grant a 3-point Ward.',
    signatureStory:
      'The Path does more than close a wound; it leaves a visible promise that the next blow will not reopen it.',
    reactionRuleId: 'recovery-loop',
    reaction: 'The first recovery each battle refunds 1 AP.',
    reactionStory:
      'When a life steadies beneath the Path, some of the power spent to save it returns.',
    limitationRuleId: 'low-direct-output',
    limitation: 'Direct attacks deal 2 less raw damage.',
    limitationStory: 'A gift shaped to preserve life resists being reduced to a weapon.',
    coverageTags: ['sustain', 'control', 'resource'],
  },
};

export const PATH_CLASS_IDS = Object.values(PATH_CLASSES).map((pathClass) => pathClass.id);
