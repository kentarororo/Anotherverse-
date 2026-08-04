import { createRngStreams, drawInteger, type RngStreamsState } from '../engine/rng/streams';

export const MYTHIC_REVIEW_SEEDS = ['moon-shard', 'underworld-oath', 'fallen-crown'] as const;

export type MythicRole = 'vanguard' | 'striker' | 'support';

export interface MythicStats {
  vitality: number;
  power: number;
  guard: number;
  speed: number;
  focus: number;
}

export interface MythicTechnique {
  id: string;
  name: string;
  visibleAction: string;
  tacticalPurpose: string;
  mechanicRule: string;
  cost: number;
  cooldown: number;
}

export interface MythicHero {
  id: string;
  name: string;
  role: MythicRole;
  pathName: string;
  introduction: string;
  desire: string;
  flaw: string;
  voiceLine: string;
  stats: MythicStats;
  techniques: [MythicTechnique, MythicTechnique];
}

export interface MythicRelic {
  id: string;
  name: string;
  ownerId: string;
  description: string;
  mechanic: string;
}

export interface MythicChapter {
  id: string;
  title: string;
  category: 'operation' | 'personal' | 'discovery';
  paragraph: string;
  choices: readonly [string, string];
  consequenceHint: string;
}

interface WorldTemplate {
  id: string;
  name: string;
  subtitle: string;
  opening: readonly [string, string];
  mythLaw: string;
  progressionLaw: string;
  rankNames: readonly string[];
  roleBonds: Record<MythicRole, string>;
  chapters: readonly ChapterTemplate[];
}

interface TechniqueTemplate extends Omit<MythicTechnique, 'visibleAction'> {
  visualVariants: readonly [string, string];
}

interface HeroTemplate extends Omit<MythicHero, 'introduction' | 'techniques'> {
  biography: string;
  techniques: readonly [TechniqueTemplate, TechniqueTemplate];
}

interface RelicTemplate {
  id: string;
  role: MythicRole;
  baseName: string;
  epithets: readonly [string, string];
  descriptions: readonly [string, string];
  mechanic: string;
}

interface ChapterTemplate {
  id: string;
  title: string;
  category: MythicChapter['category'];
  leadRole: MythicRole;
  variants: readonly [string, string];
  choices: readonly [string, string];
  consequenceHint: string;
}

const WORLDS: readonly WorldTemplate[] = [
  {
    id: 'fallen-heavens',
    name: 'Orison, Beneath the Fallen Heavens',
    subtitle: 'Dead gods became dungeons, and mortals learned to climb through their bones.',
    opening: [
      'Eight years ago, the moon cracked and three gods fell out of the sky. Their bodies struck the kingdom of Orison and became vast dungeons called Godgraves. Monsters crawl from them each winter, but so do relics that can turn a shepherd into a ranked hunter. The strongest guilds now own every road to the graves. Tonight, a fourth star is falling.',
      'Everyone in Orison knows the five hunter ranks: Ash, Bronze, Silver, Gold, and Divine. Most Ash-ranks spend their lives carrying torches for stronger parties. A rare few awaken a Mythic Path and hear the Soul Ledger count their victories. No one has reached Divine rank since the moon broke. The nameless thing descending through the clouds may be the reason why.',
    ],
    mythLaw:
      'A dead god cannot speak its own name, but it can lend one fragment of its legend to a mortal who completes its unfinished trial.',
    progressionLaw:
      'Stats rise through battle, but a Mythic Path evolves only when its bearer makes the same kind of choice that created the legend.',
    rankNames: ['Ash', 'Bronze', 'Silver', 'Gold', 'Divine'],
    roleBonds: {
      vanguard:
        '{hero} discovers the sun-lion crest of {path} carved into the falling god before anyone else sees it.',
      striker:
        'The broken moonlight around the grave bends toward {hero}, as if {path} has hunted here before.',
      support:
        'When the grave opens, {hero} hears {path} answer a prayer that has been trapped inside the god for eight years.',
    },
    chapters: [
      {
        id: 'fourth-god-falls',
        title: 'The Fourth God Falls',
        category: 'operation',
        leadRole: 'vanguard',
        variants: [
          "The falling star strikes the hills during the trio's Bronze-rank trial. A horned guardian climbs from the crater and drives the other candidates toward a cliff, while a pale oracle marks anyone who tries to flee. {lead} sees the same crest that appears whenever {path} awakens. If the squad breaks the guardian first, the oracle will keep choosing victims; if they silence the oracle, {lead} must hold the cliff alone. The formation they choose will become the first line of their legend.",
          "The fourth Godgrave opens before it has finished falling. A bronze giant lands on the trial road, and a moth-winged seer begins whispering each hunter's next mistake before they make it. {lead} recognises {path} in the giant's shattered shield. The squad can crush the seer before its prophecy settles, but doing so leaves the giant a clear charge at the weaker candidates. Their first ranked battle begins with a choice about who stands in front.",
        ],
        choices: ['Break the horned guardian', 'Silence the pale oracle'],
        consequenceHint:
          'Target priority changes which enemy controls the opening rounds and who carries the first wound forward.',
      },
      {
        id: 'name-in-the-bone',
        title: 'A Name in the Bone',
        category: 'discovery',
        leadRole: 'support',
        variants: [
          "After the battle, {lead} finds a human name cut into the inside of the god's rib. The letters are fresh, and {path} reacts as though the writer is still nearby. The guild examiner orders the squad to surrender the bone before the other candidates notice it. Keeping it may cost them their new rank; handing it over may erase the first proof that someone entered the grave before it fell. {lead} has until sunrise to choose which loss can still be repaired.",
          "The Godgrave should be empty once its guardians die, yet {lead} hears someone breathing behind the altar. There is no person there, only a rib carved with a hunter's name and tomorrow's date. {path} can preserve the echo long enough to question it, but the rank examiner is already coming down the passage. The squad can hide the relic and risk expulsion, or report it and trust a guild that has lied about every earlier grave. Either choice gives the unknown hunter a different future.",
        ],
        choices: ['Hide the carved bone', 'Give it to the examiner'],
        consequenceHint:
          'The decision determines whether the squad gains a forbidden clue or safer access to ranked trials.',
      },
      {
        id: 'hunter-who-came-back',
        title: 'The Hunter Who Came Back',
        category: 'personal',
        leadRole: 'striker',
        variants: [
          "A Gold-rank hunter walks out of the new grave carrying {lead}'s childhood knife. He has not aged since the night the moon broke, and he remembers a promise {lead} never told the squad. He offers to teach {path} its next form if the trio abandons the carved bone. The lesson could double {lead}'s power before the next descent, but the man refuses to say whose name is written inside the god. For the first time, advancement and the truth demand opposite choices.",
          "The stranger waiting at the grave mouth knows the private name {lead} gave {path} as a child. He wears a dead guild's Gold-rank cloak and carries a weapon that vanished eight years ago. One duel would reveal whether {lead} is ready for the Path's second form. Winning, however, requires staking the carved bone as the prize. {lead} must decide whether power is still progress when someone else chooses its price.",
        ],
        choices: ["Accept the hunter's lesson", 'Keep the bone and refuse'],
        consequenceHint:
          'One branch accelerates Path mastery; the other preserves the central mystery and strengthens squad trust.',
      },
    ],
  },
  {
    id: 'underworld-tide',
    name: 'Morcant, Kingdom of the Underworld Tide',
    subtitle: 'Each new moon reveals a stair beneath the sea, and every descent demands a memory.',
    opening: [
      'On the first night of every new moon, the sea withdraws from Morcant and reveals a black stair descending beyond the horizon. Hunters have until dawn to enter the Underworld, claim a relic, and return before the water closes above them. Those who fail do not drown. They come back one month later with white eyes and no memory of the people waiting on shore.',
      'The Tide Guild ranks hunters by the depth they survive: Shell, Coral, Pearl, Abyss, and Crown. Every descent strengthens the Soul Ledger, and every relic carries a blessing from a forgotten god. This month the sea retreats three nights early. At the bottom of the exposed stair, someone is ringing the funeral bell of a king who has not died yet.',
    ],
    mythLaw:
      'Nothing crosses the Underworld Tide for free; a relic, a life, or a true memory must remain behind whenever the sea closes.',
    progressionLaw:
      'A Mythic Path gains a new form when its bearer pays a meaningful price without surrendering the reason they chose to descend.',
    rankNames: ['Shell', 'Coral', 'Pearl', 'Abyss', 'Crown'],
    roleBonds: {
      vanguard:
        "The funeral bell answers {hero}'s heartbeat, and the shield of {path} grows heavier with every step toward the sea.",
      striker:
        'A trail of silver footprints appears only for {hero}, leading {path} toward something that fled death once before.',
      support:
        '{hero} can hear the drowned calling through {path}, including one voice that knows how the next king will die.',
    },
    chapters: [
      {
        id: 'sea-opens-early',
        title: 'The Sea Opens Early',
        category: 'operation',
        leadRole: 'vanguard',
        variants: [
          'The trio reaches the black stair as the first drowned hunters climb toward the shore. A grave-hound tears through the waiting families while a veiled priest counts names for the Underworld Tide. {lead} feels the funeral bell strike inside {path}. The hound will break the front line if ignored, but the priest can steal a living name with every completed verse. The squad has one battle to learn what the early tide came to collect.',
          'The sea parts without wind, exposing a stair crowded with hunters who should have died last month. A bone-armoured beast charges the shore while a drowned augur points at the weakest member of every party. The bell beneath the waves rings when {lead} raises {path}. Protecting the crowd gives the augur time to finish its omen; hunting the augur leaves the beast a path to the village. Dawn is six rounds away.',
        ],
        choices: ['Hold back the grave-hound', 'Break the drowned augur'],
        consequenceHint:
          'The chosen threat changes incoming pressure, Bestiary knowledge, and which enemy relic can drop.',
      },
      {
        id: 'ferrymans-price',
        title: "The Ferryman's Price",
        category: 'discovery',
        leadRole: 'support',
        variants: [
          'Beyond the first landing, {lead} finds a ferryman chained to an empty boat. He offers safe passage to the bell in exchange for one memory from each hero. {path} reveals the trick: the memories will not vanish, but the people inside them will forget the heroes instead. Refusing means taking the stair through an army of drowned hunters. Accepting means returning to a world where someone beloved no longer knows their face.',
          "The ferryman has three coins on his tongue, each stamped with one hero's face. He promises to carry the squad past the drowned army if {lead} chooses which coin he may keep. {path} can tell that the chosen hero will lose no memory; someone waiting on shore will lose it for them. The safer route therefore costs no stats and no blood, only a relationship the player has already seen. The boat will leave when the funeral bell rings again.",
        ],
        choices: ['Pay with a shared memory', 'Take the drowned stair'],
        consequenceHint:
          'The price trades relationship progress for safety, while refusal preserves bonds and creates a harder operation.',
      },
      {
        id: 'crown-for-drowned',
        title: 'A Crown for the Drowned',
        category: 'personal',
        leadRole: 'striker',
        variants: [
          "The bell chamber contains a crown and the living king's shadow. It kneels to {lead}, calling {path} by a title that belongs to the Underworld's executioner. Wearing the crown for one minute would unlock that title and raise the Path immediately. It would also mark {lead} as the person destined to kill Morcant's king. The Soul Ledger offers the advancement before the squad has decided whether prophecy deserves an answer.",
          "At the bottom of the stair, {lead} meets a child wearing the king's shadow like a cloak. The child claims {path} once guarded the Underworld throne and can reclaim its lost rank by drawing one ceremonial blade. The blade is harmless today; the vision it creates ends with Morcant's king dead at {lead}'s feet. Refusing leaves the Path unchanged, while accepting turns every future royal hunter into an enemy. The choice is powerful because both consequences will survive the chapter.",
        ],
        choices: ['Claim the Underworld title', "Refuse the crown's prophecy"],
        consequenceHint:
          'The title grants an early offensive breakpoint but opens a royal pursuit thread for later turns.',
      },
    ],
  },
];

const HEROES: readonly HeroTemplate[] = [
  {
    id: 'lyra-vale',
    name: 'Lyra Vale',
    role: 'vanguard',
    pathName: 'Aegis Heir',
    biography:
      'Lyra was thirteen when a Gate opened beneath her village shrine. She survived by holding a cracked bronze door while everyone else escaped through the roof. The people behind her lived, but her older brother never made it to the door. Lyra became a hunter because she refuses to believe survival should depend on who happens to stand closest to the exit.',
    desire: 'Become strong enough that nobody behind her has to be chosen for sacrifice.',
    flaw: 'She treats retreat as betrayal, even when staying will endanger the entire squad.',
    voiceLine: 'If it wants the others, it can learn to get through me first.',
    stats: { vitality: 12, power: 7, guard: 12, speed: 6, focus: 8 },
    techniques: [
      {
        id: 'aegis-break',
        name: 'Godbreaker',
        visualVariants: [
          "Lyra catches the enemy's strike on her bronze shield, twists, and drives the shield rim through its guard.",
          "The lion carved on Lyra's shield opens its eyes as she slams the enemy off balance.",
        ],
        tacticalPurpose: 'Open a defended target so the striker can finish it.',
        mechanicRule: 'Spend 2 AP to attack with +3 Power and apply Exposed for 2 rounds.',
        cost: 2,
        cooldown: 2,
      },
      {
        id: 'hold-the-line',
        name: 'Stand Behind Me',
        visualVariants: [
          'Lyra plants her shield, and the bronze lion grows into a wall around the front position.',
          "A ring of old shields rises from the ground and locks around Lyra's chosen ally.",
        ],
        tacticalPurpose: 'Absorb an incoming charge and keep the rear line free to act.',
        mechanicRule: 'Spend 1 AP to grant the front hero 3 Ward for 2 rounds.',
        cost: 1,
        cooldown: 2,
      },
    ],
  },
  {
    id: 'doran-vey',
    name: 'Doran Vey',
    role: 'vanguard',
    pathName: 'Titanbound',
    biography:
      'Doran grew up carrying stone for a temple that promised the gods would protect obedient families. When a monster came through the altar, the priests fled and Doran brought the roof down on it with his bare hands. A dying earth-titan offered him its heart after the battle. Doran accepted, but he has never decided whether the voice in his chest is a companion or a second monster waiting to wake.',
    desire: 'Build a refuge no god, guild, or king can take away from ordinary people.',
    flaw: 'He hides pain until it becomes a crisis that the rest of the squad must solve.',
    voiceLine: 'I can carry it. Ask me whether I should, not whether I can.',
    stats: { vitality: 14, power: 8, guard: 11, speed: 5, focus: 7 },
    techniques: [
      {
        id: 'aegis-break',
        name: "Titan's Rebuke",
        visualVariants: [
          'Doran catches the target in one stone hand and hammers its guard apart with the other.',
          "The ground rises behind Doran's fist, turning one short punch into the weight of a falling hill.",
        ],
        tacticalPurpose: 'Break a durable enemy before it can settle into a long fight.',
        mechanicRule: 'Spend 2 AP to attack with +3 Power and apply Exposed for 2 rounds.',
        cost: 2,
        cooldown: 2,
      },
      {
        id: 'hold-the-line',
        name: 'Earth Keeps Faith',
        visualVariants: [
          'Doran stamps once, raising a curved wall of stone around the hero holding the front.',
          'The titan-heart beats, and every loose stone nearby locks into a shield around the front line.',
        ],
        tacticalPurpose: 'Protect the front hero when enemy pressure cannot be avoided.',
        mechanicRule: 'Spend 1 AP to grant the front hero 3 Ward for 2 rounds.',
        cost: 1,
        cooldown: 2,
      },
    ],
  },
  {
    id: 'mira-rook',
    name: 'Mira Rook',
    role: 'striker',
    pathName: 'Moonfang',
    biography:
      'Mira learned to hunt monsters for the bounty on their teeth. Every coin paid for medicine that kept her younger sister alive one more week. On her final unranked hunt, the wounded moon-wolf she cornered offered its fang instead of its life. Mira took the bargain and awakened Moonfang, a Path that grows stronger whenever she chooses the dangerous target everyone else avoids.',
    desire: "Reach Gold rank before her sister's borrowed time runs out.",
    flaw: 'She measures every delay as a life lost and rushes decisions that require trust.',
    voiceLine: 'You can call it reckless after we survive it.',
    stats: { vitality: 9, power: 12, guard: 7, speed: 11, focus: 10 },
    techniques: [
      {
        id: 'arc-finish',
        name: 'Crescent Execution',
        visualVariants: [
          "Mira vanishes beneath the target's shadow and rises through it in a single silver arc.",
          "Moonlight gathers along Mira's fang-blade before she cuts through the wound her ally opened.",
        ],
        tacticalPurpose: 'Finish a wounded or Exposed enemy before it can act again.',
        mechanicRule: 'Spend 2 AP to make a high-damage attack with +8 Power.',
        cost: 2,
        cooldown: 2,
      },
      {
        id: 'cross-step',
        name: 'Wolf Between Shadows',
        visualVariants: [
          "Mira steps into one shadow and out of another behind the enemy's unfinished swing.",
          'A silver wolf crosses the field first; Mira appears wherever its paws touch darkness.',
        ],
        tacticalPurpose: 'Attack safely from the rear or turn Tactical stance into an ambush.',
        mechanicRule: 'Spend 1 AP to attack with +4 Power from rear position or Tactical stance.',
        cost: 1,
        cooldown: 1,
      },
    ],
  },
  {
    id: 'ren-ash',
    name: 'Ren Ash',
    role: 'striker',
    pathName: 'Underworld Blade',
    biography:
      'Ren died for eleven seconds during his first dungeon collapse. He woke beside his own body with a black sword in his hand and a gatekeeper demanding payment. Ren escaped without paying, which should have been impossible. Now the Underworld sends collectors after him, and every one he defeats teaches the stolen blade a new way to cut what mortals are not meant to touch.',
    desire: 'Learn why the Underworld let him escape before it takes payment from someone else.',
    flaw: 'He jokes whenever he is afraid, making honest warnings sound like another performance.',
    voiceLine: 'Good news: I have died before. Bad news: they remember me.',
    stats: { vitality: 8, power: 13, guard: 6, speed: 12, focus: 10 },
    techniques: [
      {
        id: 'arc-finish',
        name: 'Second Death',
        visualVariants: [
          "Ren draws the black blade through the target's shadow, and the wound appears a heartbeat later.",
          "The gatekeeper's mark opens beneath the enemy as Ren delivers the strike death was still owed.",
        ],
        tacticalPurpose: 'Convert a weakened target into a decisive kill before help can reach it.',
        mechanicRule: 'Spend 2 AP to make a high-damage attack with +8 Power.',
        cost: 2,
        cooldown: 2,
      },
      {
        id: 'cross-step',
        name: 'Grave Passage',
        visualVariants: [
          "Ren crosses the thin dark line between two shadows and attacks from the enemy's blind side.",
          'For one step, Ren becomes the pale outline he left in the Underworld and ignores the space between him and his target.',
        ],
        tacticalPurpose:
          'Strike from safety when the rear position or Tactical stance is available.',
        mechanicRule: 'Spend 1 AP to attack with +4 Power from rear position or Tactical stance.',
        cost: 1,
        cooldown: 1,
      },
    ],
  },
  {
    id: 'sena-quill',
    name: 'Sena Quill',
    role: 'support',
    pathName: 'Fatekeeper',
    biography:
      'Sena could see the red threads joining people long before she knew they were real. She became a village healer and spent years pretending each impossible recovery was luck. Then she saw her own thread end inside a Gate that had not opened yet. Sena entered the hunter trials to find that Gate first and discovered Fatekeeper, a Path that can knot a life back together without deciding what that life must become.',
    desire: 'Reach the place where her future ends and prove that prophecy is only a warning.',
    flaw: 'She protects other people from painful truths until secrecy becomes its own betrayal.',
    voiceLine: 'Fate is a thread, not a chain. Hold still while I prove it.',
    stats: { vitality: 10, power: 6, guard: 9, speed: 8, focus: 14 },
    techniques: [
      {
        id: 'restorative-sigil',
        name: 'Mend the Red Thread',
        visualVariants: [
          "Sena gathers the torn red strands above an ally's wound and knots them back into one bright line.",
          'A web of red fate settles around the most wounded ally, pulling breath and strength back into place.',
        ],
        tacticalPurpose: 'Restore the most wounded ally and protect them from the next hit.',
        mechanicRule: 'Spend 2 AP to heal Focus + 5 HP, grant Inspired, and add a 3-point Ward.',
        cost: 2,
        cooldown: 2,
      },
      {
        id: 'binding-shot',
        name: "Knot the Monster's Fate",
        visualVariants: [
          "Sena loops three red threads around the enemy's limbs and pulls its next movement out of order.",
          "The enemy's shadow snags on a red knot only Sena can see, breaking its rhythm mid-step.",
        ],
        tacticalPurpose: 'Slow a dangerous enemy when healing is not yet necessary.',
        mechanicRule: 'Spend 2 AP to attack with +2 Power and apply Staggered for 2 rounds.',
        cost: 2,
        cooldown: 2,
      },
    ],
  },
  {
    id: 'tarin-sol',
    name: 'Tarin Sol',
    role: 'support',
    pathName: 'Phoenix Psalm',
    biography:
      'Tarin was raised to sing the dawn hymn that kept his mountain temple warm. The hymn failed during the longest winter, and the elders chose three novices to feed the sacred flame. Tarin broke the altar instead. The phoenix sleeping beneath it chose him for that refusal, granting a Path whose fire heals only those who still have something they are willing to live for.',
    desire: 'Turn a sacrificial faith into one that asks people to survive together.',
    flaw: 'He needs suffering to have meaning and struggles to accept losses that solve nothing.',
    voiceLine: 'No sacrifices today. I checked with the god living in my lungs.',
    stats: { vitality: 9, power: 7, guard: 8, speed: 9, focus: 14 },
    techniques: [
      {
        id: 'restorative-sigil',
        name: 'Ashes Remember',
        visualVariants: [
          'Tarin sings one clear note, and warm gold feathers close around the most wounded ally.',
          'The phoenix breathes through Tarin, burning pain into harmless ash and leaving a shield of bright wings.',
        ],
        tacticalPurpose: 'Recover a wounded ally and leave them guarded against immediate danger.',
        mechanicRule: 'Spend 2 AP to heal Focus + 5 HP, grant Inspired, and add a 3-point Ward.',
        cost: 2,
        cooldown: 2,
      },
      {
        id: 'binding-shot',
        name: 'Cinder Chorus',
        visualVariants: [
          'Tarin sends a ring of singing embers around the enemy, forcing its body to move against the rhythm.',
          'Three phoenix notes strike the ground around the target and erupt whenever it tries to advance.',
        ],
        tacticalPurpose: 'Disrupt a fast enemy while the squad prepares its next attack.',
        mechanicRule: 'Spend 2 AP to attack with +2 Power and apply Staggered for 2 rounds.',
        cost: 2,
        cooldown: 2,
      },
    ],
  },
];

const RELICS: readonly RelicTemplate[] = [
  {
    id: 'lion-god-bracer',
    role: 'vanguard',
    baseName: 'Lion-God Bracer',
    epithets: ['of the First Oath', 'of the Sleeping Gate'],
    descriptions: [
      'A bronze forearm guard that grows warm whenever its wearer stands between danger and an ally.',
      'The lion engraved on this bracer opens one eye when an enemy prepares to charge.',
    ],
    mechanic: '+2 Guard. The first Ward granted each battle gains +1 strength.',
  },
  {
    id: 'titan-heart-chain',
    role: 'vanguard',
    baseName: 'Titan-Heart Chain',
    epithets: ['of the Deep Root', 'of the Last Mountain'],
    descriptions: [
      'Each stone link carries the weight of a promise the earth refused to let die.',
      'The chain tightens before impact and shares its weight with the ground beneath the wearer.',
    ],
    mechanic: '+2 Vitality. Gain 1 AP the first time HP falls below 50%.',
  },
  {
    id: 'moon-wolf-ring',
    role: 'striker',
    baseName: 'Moon-Wolf Ring',
    epithets: ['of the Last Hunt', 'of the Silver Scar'],
    descriptions: [
      'A silver ring cut from a moon-wolf fang; it points toward the weakest heartbeat nearby.',
      'The ring leaves a crescent of frost on the hand whenever its wearer chooses a wounded target.',
    ],
    mechanic: '+2 Power against enemies below 65% HP.',
  },
  {
    id: 'gatekeepers-coin',
    role: 'striker',
    baseName: "Gatekeeper's Coin",
    epithets: ['of the Unpaid Dead', 'of the Narrow Passage'],
    descriptions: [
      'One face shows a closed eye; the other shows a door that appears only in shadow.',
      'The coin always lands on its edge when someone nearby is marked for death.',
    ],
    mechanic: '+2 Speed. Rear-position attacks gain +1 Power.',
  },
  {
    id: 'fates-red-knot',
    role: 'support',
    baseName: "Fate's Red Knot",
    epithets: ['of the Uncut Thread', 'of the Second Ending'],
    descriptions: [
      'A loop of red cord that cannot be cut while its wearer remembers why an ally must survive.',
      'The knot loosens around healed wounds and tightens around futures that have begun to break.',
    ],
    mechanic: '+2 Focus. Recovery techniques grant +1 additional Ward.',
  },
  {
    id: 'phoenix-ash-bell',
    role: 'support',
    baseName: 'Phoenix-Ash Bell',
    epithets: ['of the Returning Dawn', 'of the Warm Cinder'],
    descriptions: [
      'The tiny gold bell rings only when someone nearby decides not to give up.',
      'Warm ash gathers inside the bell after every recovery and glows before the next wound lands.',
    ],
    mechanic: '+2 Focus. The first recovery each battle refunds 1 AP.',
  },
];

function pick<T>(
  streams: RngStreamsState,
  stream: 'world' | 'characters' | 'scenarios' | 'rewards',
  values: readonly T[],
) {
  const draw = drawInteger(streams, stream, 0, values.length - 1);
  return { value: values[draw.value]!, streams: draw.streams, index: draw.value };
}

function bind(text: string, values: Record<string, string>) {
  const result = text.replace(/\{([a-zA-Z]+)\}/g, (token, key: string) => values[key] ?? token);
  if (/\{[^}]+\}/.test(result)) throw new Error(`Unresolved mythic review slot in: ${result}`);
  return result;
}

export interface MythicReviewDraft {
  seed: string;
  world: {
    id: string;
    name: string;
    subtitle: string;
    opening: readonly [string, string];
    mythLaw: string;
    progressionLaw: string;
    rankNames: readonly string[];
  };
  trio: MythicHero[];
  relics: MythicRelic[];
  chapters: MythicChapter[];
  fingerprint: string;
}

export function generateMythicReviewDraft(seed: string): MythicReviewDraft {
  let streams = createRngStreams(`mythic-review:${seed}`);
  const worldPick = pick(streams, 'world', WORLDS);
  streams = worldPick.streams;
  const world = worldPick.value;
  const trio: MythicHero[] = [];

  for (const role of ['vanguard', 'striker', 'support'] as const) {
    const heroPick = pick(
      streams,
      'characters',
      HEROES.filter((hero) => hero.role === role),
    );
    streams = heroPick.streams;
    const hero = heroPick.value;
    const techniques = hero.techniques.map((technique) => {
      const visualPick = pick(streams, 'characters', technique.visualVariants);
      streams = visualPick.streams;
      return {
        id: technique.id,
        name: technique.name,
        visibleAction: visualPick.value,
        tacticalPurpose: technique.tacticalPurpose,
        mechanicRule: technique.mechanicRule,
        cost: technique.cost,
        cooldown: technique.cooldown,
      };
    }) as [MythicTechnique, MythicTechnique];
    trio.push({
      id: hero.id,
      name: hero.name,
      role: hero.role,
      pathName: hero.pathName,
      introduction: `${hero.biography} ${bind(world.roleBonds[role], {
        hero: hero.name,
        path: hero.pathName,
      })}`,
      desire: hero.desire,
      flaw: hero.flaw,
      voiceLine: hero.voiceLine,
      stats: hero.stats,
      techniques,
    });
  }

  const relics = trio.map((hero) => {
    const relicPick = pick(
      streams,
      'rewards',
      RELICS.filter((relic) => relic.role === hero.role),
    );
    streams = relicPick.streams;
    const epithetPick = pick(streams, 'rewards', relicPick.value.epithets);
    streams = epithetPick.streams;
    const descriptionPick = pick(streams, 'rewards', relicPick.value.descriptions);
    streams = descriptionPick.streams;
    return {
      id: relicPick.value.id,
      name: `${relicPick.value.baseName} ${epithetPick.value}`,
      ownerId: hero.id,
      description: descriptionPick.value,
      mechanic: relicPick.value.mechanic,
    };
  });

  const chapters = world.chapters.map((chapter) => {
    const lead = trio.find((hero) => hero.role === chapter.leadRole)!;
    const variantPick = pick(streams, 'scenarios', chapter.variants);
    streams = variantPick.streams;
    return {
      id: chapter.id,
      title: chapter.title,
      category: chapter.category,
      paragraph: bind(variantPick.value, { lead: lead.name, path: lead.pathName }),
      choices: chapter.choices,
      consequenceHint: chapter.consequenceHint,
    };
  });

  return {
    seed,
    world: {
      id: world.id,
      name: world.name,
      subtitle: world.subtitle,
      opening: world.opening,
      mythLaw: world.mythLaw,
      progressionLaw: world.progressionLaw,
      rankNames: world.rankNames,
    },
    trio,
    relics,
    chapters,
    fingerprint: `${world.id}|${trio.map((hero) => hero.id).join('|')}|${chapters
      .map((chapter) => chapter.paragraph.slice(0, 24))
      .join('|')}`,
  };
}
