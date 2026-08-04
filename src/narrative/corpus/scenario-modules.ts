import type { ScenarioCategory } from '../../engine/model/scenario';
import type { StorySlot, ValidatedBeat } from '../realiser/story-authoring';

export type SceneFactRole =
  | 'city'
  | 'faction'
  | 'origin'
  | 'prior-operation'
  | 'prior-personal'
  | 'prior-discovery'
  | 'prior-rival'
  | 'prior-social'
  | 'prior-decision';

export interface ScenarioModule {
  id: string;
  category: ScenarioCategory;
  title: string;
  initialFactRoles?: readonly [SceneFactRole, SceneFactRole];
  continuationFactRoles: readonly [SceneFactRole, SceneFactRole];
  choiceSetId: string;
  sceneKind: string;
  initial?: ValidatedBeat;
  continuation: ValidatedBeat;
}

export interface ScenarioChoiceEffects {
  renownDelta: number;
  provisionsDelta: number;
  dangerDelta: number;
  bondDelta: number;
}

export interface ScenarioChoiceModule {
  id: string;
  label: string;
  consequence: string;
  effects: ScenarioChoiceEffects;
}

const beat = (
  requiredSlots: StorySlot[],
  sentences: [string, string, string, string],
): ValidatedBeat => ({ requiredSlots, sentences });
const operationRoles = ['faction', 'prior-decision'] as const;
const personalRoles = ['origin', 'prior-decision'] as const;
const discoveryRoles = ['city', 'prior-decision'] as const;
const rivalRoles = ['faction', 'prior-decision'] as const;
const socialRoles = ['city', 'prior-decision'] as const;

export const SCENARIO_MODULES: Readonly<Record<ScenarioCategory, readonly ScenarioModule[]>> = {
  operation: [
    {
      id: 'operation-1',
      category: 'operation',
      title: 'The Godgrave Wakes',
      choiceSetId: 'operation-1',
      sceneKind: 'dungeon assault',
      continuationFactRoles: operationRoles,
      continuation: beat(
        ['crisisSite', 'enemyOne', 'enemyTwo', 'lead', 'calling', 'priorReference'],
        [
          'A bronze heartbeat rolls out of the {crisisSite}, and {enemyOne} tears free of the buried ribs.',
          'Behind it, {enemyTwo} completes the omen begun by {priorReference}.',
          '{lead} feels {calling} pull toward the creature threatening the rear line, even as the larger beast gathers itself to charge.',
          'Choose the formation that will decide which danger the trio survives first.',
        ],
      ),
    },
    {
      id: 'operation-2',
      category: 'operation',
      title: 'Beneath the Funeral Bell',
      choiceSetId: 'operation-2',
      sceneKind: 'underworld descent',
      continuationFactRoles: operationRoles,
      continuation: beat(
        ['hiddenRoute', 'enemyOne', 'enemyTwo', 'priorArtifact', 'lead'],
        [
          'The {hiddenRoute} opens beneath a tolling bell, and {enemyOne} climbs toward the living.',
          '{enemyTwo} carries {priorArtifact} between its teeth as proof that the dead remember the trio.',
          'If {lead} holds the stair, the second monster can finish its rite; if the squad pursues the relic, the first reaches the pilgrims above.',
          'Set the party order before the bell tolls again.',
        ],
      ),
    },
    {
      id: 'operation-3',
      category: 'operation',
      title: "The Moon-Eater's Hunt",
      choiceSetId: 'operation-3',
      sceneKind: 'monster hunt',
      continuationFactRoles: operationRoles,
      continuation: beat(
        ['city', 'enemyOne', 'enemyTwo', 'priorReference', 'lead', 'crisisSite'],
        [
          'Moonlight vanishes over the {crisisSite} of {city} as {enemyOne} begins hunting by the sound of frightened hearts.',
          '{enemyTwo} follows in its shadow because {priorReference} broke the seal that kept both creatures sleeping.',
          "{lead} can anchor the square, but only a coordinated strike will stop the hunter before it learns the squad's rhythm.",
          'Decide who holds, who marks the opening, and who delivers the end.',
        ],
      ),
    },
    {
      id: 'operation-4',
      category: 'operation',
      title: 'Trial of the Broken Crown',
      choiceSetId: 'operation-4',
      sceneKind: 'rank trial',
      continuationFactRoles: operationRoles,
      continuation: beat(
        ['publicVenue', 'enemyOne', 'enemyTwo', 'rank', 'priorArtifact'],
        [
          'The floor of the {publicVenue} splits during the {rank} trial, releasing {enemyOne} before the watching guilds.',
          '{enemyTwo} rises beside it wearing {priorArtifact} like a crown.',
          "Victory will raise the trio's standing, but a careless formation will turn the gathered witnesses into targets.",
          "Lock the squad's order and let the trial judge more than raw strength.",
        ],
      ),
    },
  ],
  personal: [
    {
      id: 'personal-1',
      category: 'personal',
      title: 'The Promise at the Shrine',
      choiceSetId: 'personal-1',
      sceneKind: 'bond trial',
      continuationFactRoles: personalRoles,
      continuation: beat(
        ['lead', 'leadOrigin', 'calling', 'priorReference', 'privateRefuge'],
        [
          '{lead} finds a survivor from {leadOrigin} waiting at the {privateRefuge} with an oath the hero once failed to keep.',
          '{calling} awakens because {priorReference} has placed that same failure in the present again.',
          'Keeping the promise will cost the trio precious supplies, while turning away will protect the expedition and deepen the old wound.',
          '{lead} must decide which loss their Path is truly meant to answer.',
        ],
      ),
    },
    {
      id: 'personal-2',
      category: 'personal',
      title: 'A Voice Inside the Path',
      choiceSetId: 'personal-2',
      sceneKind: 'awakening temptation',
      continuationFactRoles: personalRoles,
      continuation: beat(
        ['lead', 'calling', 'awakening', 'priorArtifact', 'privateRefuge'],
        [
          'While the others sleep at the {privateRefuge}, {calling} speaks to {lead} through a face reflected in {priorArtifact}.',
          'It offers immediate strength if the hero will accept that {awakening}.',
          'The bargain may reveal a higher form of the Path, but it asks {lead} to hide its price from the companions who would share the consequence.',
          'Choose whether to confess the voice or answer it alone.',
        ],
      ),
    },
    {
      id: 'personal-3',
      category: 'personal',
      title: 'The One Left Behind',
      choiceSetId: 'personal-3',
      sceneKind: 'past returns',
      continuationFactRoles: personalRoles,
      continuation: beat(
        ['lead', 'leadOrigin', 'priorReference', 'partner', 'publicVenue'],
        [
          'At the {publicVenue}, a hunter believed dead in {leadOrigin} returns carrying proof that {lead} survived by leaving someone behind.',
          "The accusation gains weight from {priorReference}, which has already made the trio's choices part of public memory.",
          '{partner} offers to stand beside the hero, yet doing so will make the whole squad answer for a past none of them witnessed.',
          'Decide whether {lead} faces the accusation openly or asks the survivor for silence.',
        ],
      ),
    },
    {
      id: 'personal-4',
      category: 'personal',
      title: 'The Shape of Ascension',
      choiceSetId: 'personal-4',
      sceneKind: 'path evolution',
      continuationFactRoles: personalRoles,
      continuation: beat(
        ['lead', 'calling', 'awakening', 'priorArtifact', 'privateRefuge'],
        [
          "At the {privateRefuge}, a new symbol appears on {lead}'s skin when {calling} touches {priorArtifact}.",
          'The Soul Ledger names the next requirement: {awakening}.',
          'Attempting the change now may strengthen the coming descent, but failure will leave the hero exposed and the squad short of provisions.',
          'Choose whether the legend advances today or waits for a safer truth.',
        ],
      ),
    },
  ],
  discovery: [
    {
      id: 'discovery-1',
      category: 'discovery',
      title: 'The Name Carved in Bone',
      choiceSetId: 'discovery-1',
      sceneKind: 'relic mystery',
      continuationFactRoles: discoveryRoles,
      continuation: beat(
        ['hiddenRoute', 'lead', 'calling', 'priorArtifact'],
        [
          "At the end of the {hiddenRoute}, {lead} finds a fresh human name carved inside a dead god's rib.",
          '{calling} reacts when the letters touch {priorArtifact}, proving the inscription was meant for this squad.',
          'Taking the bone may reveal who prepared the dungeon, while leaving it preserves the ward that keeps the chamber asleep.',
          'Choose whether knowledge is worth waking whatever lies below.',
        ],
      ),
    },
    {
      id: 'discovery-2',
      category: 'discovery',
      title: "The Ferryman's Unpaid Fare",
      choiceSetId: 'discovery-2',
      sceneKind: 'mythic bargain',
      continuationFactRoles: discoveryRoles,
      continuation: beat(
        ['city', 'lead', 'priorReference', 'partner', 'hiddenRoute'],
        [
          'A black boat reaches the {hiddenRoute} beneath {city}, carrying a ferryman who remembers {priorReference}.',
          'He offers {lead} a map to the next relic in exchange for one cherished memory shared with {partner}.',
          "Paying opens a safer road but weakens a living bond; refusing keeps the memory and allows the dungeon's danger to grow.",
          'Decide what the party can afford to lose before the boat departs.',
        ],
      ),
    },
    {
      id: 'discovery-3',
      category: 'discovery',
      title: 'The Saint Beneath the Well',
      choiceSetId: 'discovery-3',
      sceneKind: 'buried divinity',
      continuationFactRoles: discoveryRoles,
      continuation: beat(
        ['city', 'lead', 'priorArtifact', 'faction'],
        [
          'The oldest well in {city} begins answering prayers in the voice of a forgotten saint.',
          '{lead} lowers {priorArtifact} into the water and sees {faction} kneeling before the same buried face.',
          "Drawing the relic upward could gain the saint's blessing, but it would also reveal the shrine to every power hunting dead gods.",
          'Choose whether to raise the saint or seal the well with its secret intact.',
        ],
      ),
    },
    {
      id: 'discovery-4',
      category: 'discovery',
      title: 'Tomorrow in the Soul Ledger',
      choiceSetId: 'discovery-4',
      sceneKind: 'prophetic record',
      continuationFactRoles: discoveryRoles,
      continuation: beat(
        ['recordMedium', 'lead', 'priorReference', 'calling'],
        [
          "A blank page in the {recordMedium} fills with the story of {lead}'s death three days from now.",
          'The first line blames {priorReference}, but the final line claims {calling} survives in another bearer.',
          'Tearing out the page may break the omen and erase its clue, while studying it will make the prophecy easier for enemies to follow.',
          'Decide whether the future is a warning, a trap, or a challenge.',
        ],
      ),
    },
  ],
  rival: [
    {
      id: 'rival-1',
      category: 'rival',
      title: 'Challenge of the Golden Spear',
      choiceSetId: 'rival-1',
      sceneKind: 'rank rivalry',
      continuationFactRoles: rivalRoles,
      continuation: beat(
        ['publicVenue', 'lead', 'partner', 'rank', 'priorReference'],
        [
          'A celebrated hunter interrupts the feast at the {publicVenue} and challenges {lead} before every {rank} squad.',
          'The rival claims {priorReference} proves the trio won through luck rather than judgment.',
          "{partner} can expose the challenger's hidden wager, but doing so turns a personal duel into a feud between parties.",
          'Choose whether to answer with steel or reveal the game behind the challenge.',
        ],
      ),
    },
    {
      id: 'rival-2',
      category: 'rival',
      title: 'The Stolen Monster Mark',
      choiceSetId: 'rival-2',
      sceneKind: 'hunting dispute',
      continuationFactRoles: rivalRoles,
      continuation: beat(
        ['lead', 'partner', 'priorArtifact', 'guild', 'rank', 'publicVenue'],
        [
          "At the {publicVenue}, another party presents {priorArtifact} to the {guild} and claims the kill behind the trio's {rank} standing.",
          '{lead} recognises the rival captain, while {partner} notices blood on the trophy from a creature still alive.',
          'A public accusation may restore Renown but close the road to cooperation; a private bargain could save hunters from the surviving beast.',
          'Decide whether the truth needs witnesses or allies first.',
        ],
      ),
    },
    {
      id: 'rival-3',
      category: 'rival',
      title: 'The Disciple of the Same God',
      choiceSetId: 'rival-3',
      sceneKind: 'path mirror',
      continuationFactRoles: rivalRoles,
      continuation: beat(
        ['lead', 'calling', 'priorReference', 'partner', 'privateRefuge'],
        [
          'At the {privateRefuge}, a masked hunter bears a second fragment of the dead god that awakened {calling}.',
          'They insist {priorReference} has made {lead} unworthy of carrying the legend.',
          "Sharing what each Path knows could unlock a stronger form for both, but only if {partner} accepts a stranger inside the squad's secret.",
          'Choose whether the matching legend becomes a teacher or an enemy.',
        ],
      ),
    },
    {
      id: 'rival-4',
      category: 'rival',
      title: 'Race to the Last Altar',
      choiceSetId: 'rival-4',
      sceneKind: 'relic race',
      continuationFactRoles: rivalRoles,
      continuation: beat(
        ['hiddenRoute', 'lead', 'partner', 'priorArtifact'],
        [
          'A rival squad reaches the {hiddenRoute} carrying the missing half of {priorArtifact}.',
          'Their captain offers {lead} a truce until both parties reach the last altar.',
          "Accepting makes the descent safer but divides the relic, while refusing may strengthen {partner}'s trust and leave both squads wounded.",
          'Decide whether the race ends in alliance, betrayal, or a head start.',
        ],
      ),
    },
  ],
  social: [
    {
      id: 'social-1',
      category: 'social',
      title: 'The Feast of Empty Thrones',
      choiceSetId: 'social-1',
      sceneKind: 'court bargain',
      continuationFactRoles: socialRoles,
      continuation: beat(
        ['publicVenue', 'lead', 'partner', 'priorReference', 'faction'],
        [
          'At the {publicVenue}, three empty thrones are laid for gods who no longer answer.',
          '{faction} asks {lead} to bless the feast because {priorReference} has made the trio a symbol.',
          "{partner} sees the bargain clearly: public favour will bring provisions, but it will bind the party to a faction's next demand.",
          'Choose whether the legend belongs at the high table or among the people outside.',
        ],
      ),
    },
    {
      id: 'social-2',
      category: 'social',
      title: 'Judgment of the Shrinekeepers',
      choiceSetId: 'social-2',
      sceneKind: 'moral hearing',
      continuationFactRoles: socialRoles,
      continuation: beat(
        ['city', 'lead', 'partner', 'priorArtifact'],
        [
          'The shrinekeepers of {city} summon {lead} to answer for the power sleeping in {priorArtifact}.',
          "They will recognise the relic if {partner} swears the squad never sought a god's throne.",
          'The oath earns trust but may become false after the next awakening; refusing preserves freedom and lets public fear grow.',
          'Decide which promise the party can still keep when the campaign ends.',
        ],
      ),
    },
    {
      id: 'social-3',
      category: 'social',
      title: 'The Pilgrims at the Gate',
      choiceSetId: 'social-3',
      sceneKind: 'public responsibility',
      continuationFactRoles: socialRoles,
      continuation: beat(
        ['crisisSite', 'lead', 'partner', 'priorReference'],
        [
          'Hundreds of pilgrims gather at the {crisisSite} because they believe {lead} can repeat the miracle behind {priorReference}.',
          'The dungeon will open before dusk, and {partner} knows the squad lacks enough provisions to protect everyone.',
          'Turning the crowd away increases fear but preserves the expedition; leading them to shelter risks the party for people who cannot fight.',
          'Choose what a rising legend owes to those who believe it.',
        ],
      ),
    },
    {
      id: 'social-4',
      category: 'social',
      title: 'A Crown Offered in Secret',
      choiceSetId: 'social-4',
      sceneKind: 'political temptation',
      continuationFactRoles: socialRoles,
      continuation: beat(
        ['privateRefuge', 'lead', 'partner', 'rank', 'priorArtifact'],
        [
          "A royal envoy enters the {privateRefuge} and offers {lead} a title above the squad's {rank} standing.",
          'The seal on the offer matches the hand that once tried to seize {priorArtifact}.',
          '{partner} warns that accepting will buy resources at the price of allegiance, while refusal may turn the crown into an open enemy.',
          'Decide whether power borrowed from a throne can ever belong to the Path.',
        ],
      ),
    },
  ],
};

const zero = { renownDelta: 0, provisionsDelta: 0, dangerDelta: 0, bondDelta: 0 };
const choices = (
  id: string,
  first: [string, string, ScenarioChoiceEffects],
  second?: [string, string, ScenarioChoiceEffects],
): ScenarioChoiceModule[] => [
  { id: `${id}-a`, label: first[0], consequence: first[1], effects: first[2] },
  ...(second
    ? [{ id: `${id}-b`, label: second[0], consequence: second[1], effects: second[2] }]
    : []),
];

export const SCENARIO_CHOICE_MODULES: Readonly<Record<string, readonly ScenarioChoiceModule[]>> = {
  'operation-1': choices('operation-1', [
    'Enter the waking grave',
    'The locked formation faces both guardians; battle results determine every reward and wound.',
    zero,
  ]),
  'operation-2': choices('operation-2', [
    'Descend before the next bell',
    'The squad contests the stair in its chosen order; battle results determine every reward and wound.',
    zero,
  ]),
  'operation-3': choices('operation-3', [
    'Hunt the moon-eater',
    'The party commits its formation to the hunt; battle results determine every reward and wound.',
    zero,
  ]),
  'operation-4': choices('operation-4', [
    'Begin the broken trial',
    'The trio fights before the gathered ranks; battle results determine every reward and wound.',
    zero,
  ]),
  'personal-1': choices(
    'personal-1',
    [
      'Keep the old promise',
      'Spend 1 Provision to honour the survivor; the hero gains trust but danger advances.',
      { renownDelta: 0, provisionsDelta: -1, dangerDelta: 1, bondDelta: 3 },
    ],
    [
      'Protect the expedition',
      'Preserve supplies and accept that the old wound remains open.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 0, bondDelta: -1 },
    ],
  ),
  'personal-2': choices(
    'personal-2',
    [
      'Confess the voice',
      "Sharing the Path's demand strengthens the party bond and draws public concern.",
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 1, bondDelta: 3 },
    ],
    [
      'Answer it alone',
      'The secret keeps danger low today but places distance between companions.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 0, bondDelta: -2 },
    ],
  ),
  'personal-3': choices(
    'personal-3',
    [
      'Face the accusation',
      'The honest account earns 1 Renown and makes the companions stand together.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 1, bondDelta: 2 },
    ],
    [
      'Ask for silence',
      'The past remains private, preserving safety while weakening trust.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 0, bondDelta: -1 },
    ],
  ),
  'personal-4': choices(
    'personal-4',
    [
      'Attempt the ascension',
      'The risky rite costs 1 Provision and pushes danger forward in search of growth.',
      { renownDelta: 1, provisionsDelta: -1, dangerDelta: 2, bondDelta: 0 },
    ],
    [
      'Wait for the right truth',
      'The squad preserves its resources and keeps the Path stable.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 0, bondDelta: 1 },
    ],
  ),
  'discovery-1': choices(
    'discovery-1',
    [
      'Take the carved bone',
      'The clue earns 1 Renown but waking the chamber raises Danger by 2.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 2, bondDelta: 0 },
    ],
    [
      'Preserve the sleeping ward',
      'The chamber remains sealed and the squad recovers 1 Provision.',
      { renownDelta: 0, provisionsDelta: 1, dangerDelta: -1, bondDelta: 0 },
    ],
  ),
  'discovery-2': choices(
    'discovery-2',
    [
      'Pay with the memory',
      'The ferryman grants 1 Provision and a safe route, but the shared bond suffers.',
      { renownDelta: 0, provisionsDelta: 1, dangerDelta: -1, bondDelta: -3 },
    ],
    [
      'Refuse the fare',
      'The memory survives and the harder road raises Danger by 2.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 2, bondDelta: 2 },
    ],
  ),
  'discovery-3': choices(
    'discovery-3',
    [
      'Raise the buried saint',
      'The blessing brings 1 Renown and 1 Provision while alerting hostile powers.',
      { renownDelta: 1, provisionsDelta: 1, dangerDelta: 2, bondDelta: 0 },
    ],
    [
      'Seal the well',
      'The secret remains safe and Danger falls by 1.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: -1, bondDelta: 0 },
    ],
  ),
  'discovery-4': choices(
    'discovery-4',
    [
      'Study the prophecy',
      'Knowledge earns 1 Renown but gives the omen another path into the world.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 2, bondDelta: 0 },
    ],
    [
      'Tear out the page',
      'Destroying the clue lowers Danger by 1 and leaves the future unknown.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: -1, bondDelta: 0 },
    ],
  ),
  'rival-1': choices(
    'rival-1',
    [
      'Answer with steel',
      'The public answer earns 2 Renown and sharpens the rivalry.',
      { renownDelta: 2, provisionsDelta: 0, dangerDelta: 1, bondDelta: -1 },
    ],
    [
      'Expose the hidden wager',
      'The party stands together, gaining 1 Renown and 2 Bond.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 0, bondDelta: 2 },
    ],
  ),
  'rival-2': choices(
    'rival-2',
    [
      'Accuse them before the guild',
      'The truth earns 2 Renown but closes the road to cooperation.',
      { renownDelta: 2, provisionsDelta: 0, dangerDelta: 1, bondDelta: -1 },
    ],
    [
      'Make a private bargain',
      'Cooperation grants 1 Provision and strengthens the party bond.',
      { renownDelta: 0, provisionsDelta: 1, dangerDelta: 0, bondDelta: 2 },
    ],
  ),
  'rival-3': choices(
    'rival-3',
    [
      'Learn from the matching Path',
      'Shared lore earns 1 Renown but makes the rival harder to escape.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 1, bondDelta: 1 },
    ],
    [
      'Name them an enemy',
      'The boundary strengthens the squad and pushes Danger forward.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 2, bondDelta: 2 },
    ],
  ),
  'rival-4': choices(
    'rival-4',
    [
      'Accept the altar truce',
      'The safer descent grants 1 Provision while trust within the trio strains.',
      { renownDelta: 0, provisionsDelta: 1, dangerDelta: -1, bondDelta: -1 },
    ],
    [
      'Race them alone',
      'The bold refusal earns 2 Renown and raises Danger by 2.',
      { renownDelta: 2, provisionsDelta: 0, dangerDelta: 2, bondDelta: 1 },
    ],
  ),
  'social-1': choices(
    'social-1',
    [
      'Bless the high table',
      'Faction favour grants 1 Provision and 2 Renown, but the party bond strains.',
      { renownDelta: 2, provisionsDelta: 1, dangerDelta: 1, bondDelta: -1 },
    ],
    [
      'Feast among the people',
      'The public answer earns 1 Renown and strengthens the trio.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 0, bondDelta: 2 },
    ],
  ),
  'social-2': choices(
    'social-2',
    [
      "Swear the shrinekeepers' oath",
      'The oath lowers Danger and builds trust between companions.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: -1, bondDelta: 2 },
    ],
    [
      'Keep the Path free',
      'Freedom preserves future choices while public fear raises Danger.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 2, bondDelta: 0 },
    ],
  ),
  'social-3': choices(
    'social-3',
    [
      'Lead the pilgrims to shelter',
      'The rescue costs 1 Provision and earns 2 Renown plus party trust.',
      { renownDelta: 2, provisionsDelta: -1, dangerDelta: 1, bondDelta: 2 },
    ],
    [
      'Turn the crowd away',
      'The expedition keeps its supplies while fear raises Danger.',
      { renownDelta: 0, provisionsDelta: 0, dangerDelta: 2, bondDelta: -1 },
    ],
  ),
  'social-4': choices(
    'social-4',
    [
      'Accept the secret title',
      'Royal favour grants 2 Provisions and 2 Renown while allegiance strains the squad.',
      { renownDelta: 2, provisionsDelta: 2, dangerDelta: 1, bondDelta: -2 },
    ],
    [
      'Refuse the crown',
      'The refusal strengthens the trio and turns the throne into a growing danger.',
      { renownDelta: 1, provisionsDelta: 0, dangerDelta: 2, bondDelta: 2 },
    ],
  ),
};
