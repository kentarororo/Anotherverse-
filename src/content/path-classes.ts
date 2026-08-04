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
    summary: 'Guards allies and holds the front.',
    signatureRuleId: 'rear-intercept',
    signature: 'Once per round, intercept the first attack against the rear hero.',
    signatureStory:
      'The oath answers danger before thought, carrying its bearer between the enemy and the person who would have been struck.',
    reactionRuleId: 'intercept-brace',
    reaction: 'After intercepting, gain 3 Ward for 1 round.',
    reactionStory:
      'The same promise that draws the blow hardens into a brief shield around its bearer.',
    limitationRuleId: 'measured-strikes',
    limitation: 'Attacks deal 1 less damage.',
    limitationStory:
      "Strength spent sheltering others cannot land with an executioner's full force.",
    coverageTags: ['defence', 'control'],
  },
  striker: {
    id: 'doomseeker',
    name: 'Doomseeker',
    role: 'striker',
    summary: 'Hunts wounded foes and finishes them quickly.',
    signatureRuleId: 'exploit-exposed',
    signature: 'Deal +3 damage to Exposed enemies.',
    signatureStory:
      "The Path recognises the instant a monster's legend falters and turns that opening into a killing line.",
    reactionRuleId: 'finisher-surge',
    reaction: 'After a finisher, gain Inspired for 2 rounds.',
    reactionStory:
      "A decisive strike wakes the hunter's legend, sharpening the next heartbeat into momentum.",
    limitationRuleId: 'open-guard',
    limitation: 'Aggressive stance gives −4 Guard.',
    limitationStory:
      'Power bought through pursuit leaves no room to hide behind a perfect defence.',
    coverageTags: ['damage', 'resource'],
  },
  support: {
    id: 'fateweaver',
    name: 'Fateweaver',
    role: 'support',
    summary: 'Heals allies and binds dangerous enemies.',
    signatureRuleId: 'mending-ward',
    signature: 'Healing techniques also grant 3 Ward.',
    signatureStory:
      'The Path does more than close a wound; it leaves a visible promise that the next blow will not reopen it.',
    reactionRuleId: 'recovery-loop',
    reaction: 'The first heal each battle restores 1 AP.',
    reactionStory:
      'When a life steadies beneath the Path, some of the power spent to save it returns.',
    limitationRuleId: 'low-direct-output',
    limitation: 'Attacks deal 2 less damage.',
    limitationStory: 'A gift shaped to preserve life resists being reduced to a weapon.',
    coverageTags: ['sustain', 'control', 'resource'],
  },
};

export const PATH_CLASS_IDS = Object.values(PATH_CLASSES).map((pathClass) => pathClass.id);
