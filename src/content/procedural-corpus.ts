import type {
  AntagonistAgenda,
  ArcBeat,
  ArcSkeleton,
  EnemyPackage,
  MythicDomain,
  WorldThesis,
} from '../engine/model/campaign-plan';

/**
 * A small, authored ontology rather than a bag of sentence fragments.
 * Every record is usable as a complete semantic module. The source corpus informed
 * the trope coverage; all Anotherverse wording below is original and deliberately plain.
 */

export const WORLD_THESES = [
  {
    id: 'storm-court',
    domain: 'storm',
    title: 'The Court Above the Rain',
    mortalOrder: 'Nine harbor clans rule by keeping the sea roads open.',
    divineLaw: 'Thunder answers an oath spoken beneath an open sky.',
    awakeningLaw: 'A mortal awakens after protecting someone from a fate meant for them.',
    taboo: 'No ruler may command the storm for private vengeance.',
    lexicon: ['storm court', 'thunder oath', 'sea gate', 'sky mark'],
  },
  {
    id: 'storm-tower',
    domain: 'storm',
    title: 'The Tower of the Drowned Sky',
    mortalOrder: 'Clearers earn food and shelter by climbing through the flooded floors.',
    divineLaw: 'Each conquered floor returns one stolen season to the land.',
    awakeningLaw: 'A hidden class appears when a clearer survives a trial above their rank.',
    taboo: 'A floor seal must never be broken from the outside.',
    lexicon: ['sky floor', 'clear mark', 'rain vault', 'hidden class'],
  },
  {
    id: 'ashen-underworld',
    domain: 'underworld',
    title: 'The Kingdom Beneath the Ash',
    mortalOrder: 'The living pay for safe roads by carrying names to the dead.',
    divineLaw: 'A forgotten name becomes a hungry shade.',
    awakeningLaw: 'Soul arts awaken when a mortal returns a true name to its owner.',
    taboo: 'No shade may be bound after it remembers its life.',
    lexicon: ['ash road', 'name bearer', 'shade gate', 'soul art'],
  },
  {
    id: 'moon-graves',
    domain: 'underworld',
    title: 'The Moonlit Graves',
    mortalOrder: 'Grave wardens guard towns built on the doors of the dead.',
    divineLaw: 'Moonlight reveals every promise that death left unfinished.',
    awakeningLaw: 'A warden gains a rank by laying a powerful ghost to rest without chains.',
    taboo: 'The dead may advise the living, but never rule them.',
    lexicon: ['moon grave', 'grave warden', 'last promise', 'spirit rank'],
  },
  {
    id: 'sunken-heaven',
    domain: 'celestial',
    title: 'The Fallen Houses of Heaven',
    mortalOrder: 'Star houses compete for fragments of a shattered heavenly throne.',
    divineLaw: 'A constellation grants power only to a mortal who completes its unfinished deed.',
    awakeningLaw: 'Star paths open when a mortal refuses a command from their patron.',
    taboo: 'No constellation may take a mortal body by force.',
    lexicon: ['star house', 'heaven shard', 'patron trial', 'star path'],
  },
  {
    id: 'jade-ranking',
    domain: 'celestial',
    title: 'The Jade Ranking',
    mortalOrder:
      'The celestial board assigns every school its rank and yearly share of spirit wells.',
    divineLaw: 'A recorded victory cannot be erased, even by a god.',
    awakeningLaw: 'An unranked fighter awakens after defeating a named disciple in public.',
    taboo: 'The ranking may judge deeds, never bloodlines.',
    lexicon: ['jade board', 'spirit well', 'named disciple', 'ascension rank'],
  },
  {
    id: 'beast-covenant',
    domain: 'beast',
    title: 'The Covenant of Fang and Crown',
    mortalOrder: 'Border villages survive by sharing their harvest with guardian beasts.',
    divineLaw: 'A sacred beast lends strength only while its human partner remains free.',
    awakeningLaw: 'Beast paths open when hunter and quarry choose to spare each other.',
    taboo: 'A guardian beast must never be sold or inherited.',
    lexicon: ['fang covenant', 'guardian beast', 'wild crown', 'beast path'],
  },
  {
    id: 'wyrm-march',
    domain: 'beast',
    title: 'The Wyrm March',
    mortalOrder: 'March companies defend the last green valley from scaled armies.',
    divineLaw: 'Dragon blood remembers every hand that spilled it.',
    awakeningLaw: 'A warrior gains a scale mark after surviving a dragon without taking its heart.',
    taboo: 'No living wyrm may be made into a weapon.',
    lexicon: ['wyrm march', 'scale mark', 'green hold', 'dragon oath'],
  },
] as const satisfies readonly WorldThesis[];

const beat = (id: string, title: string, prose: string): ArcBeat => ({ id, title, prose });

export const ARC_SKELETONS = [
  {
    id: 'broken-ascent',
    title: 'The Broken Ascent',
    compatibleDomains: ['storm', 'celestial'],
    shape: 'ascent',
    beats: [
      beat(
        'gate-opens',
        'The Gate Opens',
        'A forbidden gate opens during a public trial. The hero enters before the guards can seal it.',
      ),
      beat(
        'first-law',
        'The First Law',
        'Inside, the hero learns the realm has one rule its rulers have hidden from everyone.',
      ),
      beat(
        'price-of-height',
        'The Price of Height',
        'The path upward demands a relic that was lost when the old order fell.',
      ),
      beat(
        'name-the-power',
        'Name the Power',
        'The recovered relic answers the hero and reveals what their Awakening can become.',
      ),
      beat(
        'false-summit',
        'The False Summit',
        'The enemy holds the final road and offers peace in exchange for obedience.',
      ),
      beat(
        'clear-the-crown',
        'Clear the Crown',
        'The hero rejects the bargain and fights for the right to choose what waits above.',
      ),
    ],
  },
  {
    id: 'god-hunt',
    title: 'The God Hunt',
    compatibleDomains: ['storm', 'underworld'],
    shape: 'hunt',
    beats: [
      beat(
        'divine-wound',
        'A Divine Wound',
        'A wounded god crosses the mortal border, leaving monsters in its wake.',
      ),
      beat(
        'hunter-witness',
        'The Witness',
        'A lone survivor identifies the hunter who drove the god from its sanctuary.',
      ),
      beat(
        'track-the-relic',
        'The Stolen Relic',
        "The trail leads to a relic that can expose the god hunter's hidden path.",
      ),
      beat(
        'awaken-the-sign',
        'The Living Sign',
        'The relic wakes and marks the hero as the next quarry.',
      ),
      beat(
        'close-the-net',
        'Close the Net',
        'The party turns the hunt around and forces the enemy onto sacred ground.',
      ),
      beat(
        'mercy-or-vengeance',
        'The Last Quarry',
        'The god and its hunter meet at last. The hero decides which law survives them.',
      ),
    ],
  },
  {
    id: 'last-gate-siege',
    title: 'The Siege of the Last Gate',
    compatibleDomains: ['storm', 'beast'],
    shape: 'siege',
    beats: [
      beat(
        'walls-cry',
        'When the Walls Cry',
        'The last gate sounds its warning as an impossible army appears beyond it.',
      ),
      beat(
        'enemy-within',
        'The Enemy Within',
        'Evidence shows that someone inside the walls prepared the invasion.',
      ),
      beat(
        'buried-key',
        'The Buried Key',
        "The defenders search the ruined lower ward for the gate's missing key.",
      ),
      beat(
        'oath-of-stone',
        'The Oath of Stone',
        'The key wakes an older defence, but only after the hero accepts its burden.',
      ),
      beat(
        'open-sally',
        'Open the Sally Road',
        'The party breaks the siege line and opens a path to the enemy commander.',
      ),
      beat(
        'hold-at-dawn',
        'Hold at Dawn',
        'At sunrise, the hero meets the commander while the wounded city holds behind them.',
      ),
    ],
  },
  {
    id: 'rank-trial',
    title: 'The Trial Beyond Rank',
    compatibleDomains: ['celestial'],
    shape: 'trial',
    beats: [
      beat(
        'unfair-draw',
        'The Unfair Draw',
        'The ranking court assigns the hero a trial meant for a veteran party.',
      ),
      beat(
        'rigged-floor',
        'The Rigged Floor',
        'The first chamber proves that an examiner changed the trial after it began.',
      ),
      beat(
        'hidden-prize',
        'The Hidden Prize',
        'A sealed reward waits beneath the arena where no contestant should find it.',
      ),
      beat(
        'class-answer',
        'The Class Answers',
        'The reward recognizes the hero and unlocks a path the court cannot measure.',
      ),
      beat(
        'judge-descends',
        'The Judge Descends',
        'The corrupt examiner enters the final chamber to erase the evidence.',
      ),
      beat(
        'public-clear',
        'A Public Clear',
        'The hero clears the trial in sight of the full court and makes denial impossible.',
      ),
    ],
  },
  {
    id: 'pilgrim-road',
    title: 'The Road of Seven Shrines',
    compatibleDomains: ['underworld', 'celestial'],
    shape: 'pilgrimage',
    beats: [
      beat(
        'silent-shrine',
        'The Silent Shrine',
        'The first shrine falls silent on the night the hero arrives.',
      ),
      beat(
        'stolen-prayer',
        'The Stolen Prayer',
        'A keeper reveals that someone has been stealing the offerings meant for the old gods.',
      ),
      beat(
        'road-relic',
        'The Road Relic',
        'The chase uncovers a pilgrim relic hidden beneath a ruined bridge.',
      ),
      beat(
        'shared-vow',
        'A Shared Vow',
        'The relic wakes only when the travelers promise to finish the road together.',
      ),
      beat(
        'seventh-path',
        'The Seventh Path',
        'A secret road opens toward the shrine where the thief is waiting.',
      ),
      beat(
        'answer-at-sunrise',
        'The Answer at Sunrise',
        'The pilgrims reach the final shrine and defend the right of mortals to be heard.',
      ),
    ],
  },
  {
    id: 'unranked-rebellion',
    title: 'The Unranked Rebellion',
    compatibleDomains: ['celestial'],
    shape: 'rebellion',
    beats: [
      beat(
        'names-erased',
        'Names Erased',
        'The ranking board removes an entire village from its protection rolls.',
      ),
      beat(
        'proof-of-order',
        'Proof of the Order',
        'The hero finds evidence that the erasure was deliberate, not a clerical mistake.',
      ),
      beat(
        'founder-token',
        "The Founder's Token",
        'An old token could restore the village if anyone can make it answer.',
      ),
      beat(
        'rank-refused',
        'The Rank Refused',
        'The token offers authority. The hero takes its power but refuses its title.',
      ),
      beat(
        'board-broken',
        'Break the Board',
        'The rebels open the sealed hall where the ranking records are kept.',
      ),
      beat(
        'deeds-remain',
        'What Deeds Remain',
        'The hero defeats the keeper and replaces inherited rank with witnessed deeds.',
      ),
    ],
  },
  {
    id: 'stolen-companion',
    title: 'The Stolen Companion',
    compatibleDomains: ['beast'],
    shape: 'rescue',
    beats: [
      beat(
        'empty-bond',
        'The Empty Bond',
        'A sacred companion vanishes, and every trail points beyond the lawful border.',
      ),
      beat(
        'buyers-mark',
        "The Buyer's Mark",
        'The party identifies the broker who ordered the capture.',
      ),
      beat(
        'broken-chain',
        'The Broken Chain',
        'A discarded binding chain reveals where the captives are being taken.',
      ),
      beat(
        'bond-awakes',
        'The Bond Awakes',
        "The chain changes in the hero's hands and becomes a key instead of a leash.",
      ),
      beat(
        'hidden-menagerie',
        'The Hidden Menagerie',
        "The rescuers open the enemy's private road into a prison of sacred beasts.",
      ),
      beat(
        'no-one-owned',
        'No One Is Owned',
        "The captives fight beside the hero and bring the broker's house down from within.",
      ),
    ],
  },
  {
    id: 'prophecy-reckoning',
    title: 'The Reckoning That Lied',
    compatibleDomains: ['underworld', 'celestial'],
    shape: 'reckoning',
    beats: [
      beat(
        'bad-prophecy',
        'The Day Foretold',
        'A famous prophecy begins exactly as the temples promised, then names the wrong victim.',
      ),
      beat(
        'edited-verse',
        'The Edited Verse',
        'The hero discovers that the final line was changed by a living hand.',
      ),
      beat(
        'truth-seal',
        'The Truth Seal',
        'The original verse survives inside a seal guarded by those condemned by the lie.',
      ),
      beat(
        'choose-the-verse',
        'Choose the Verse',
        'The seal wakes and gives the hero enough power to challenge the promised ending.',
      ),
      beat(
        'reach-the-altar',
        'Reach the Altar',
        'The party opens a route through the holy guard before the sacrifice begins.',
      ),
      beat(
        'future-unwritten',
        'The Future Unwritten',
        'The hero defeats the author of the lie and leaves the next day without a prophecy.',
      ),
    ],
  },
] as const satisfies readonly ArcSkeleton[];

export const ANTAGONIST_AGENDAS = [
  {
    id: 'mercy-council',
    title: 'The Council of Necessary Mercy',
    compatibleDomains: ['storm', 'underworld'],
    publicAim: 'Keep the realm safe through strict order.',
    hiddenAim: 'Feed condemned districts to an ancient defence.',
    grievance: 'The old rulers abandoned the council during the last invasion.',
    escalation: 'The council marks every witness as a traitor.',
  },
  {
    id: 'dying-patron',
    title: 'The Dying Patron',
    compatibleDomains: ['storm', 'celestial'],
    publicAim: 'Protect its remaining worshippers.',
    hiddenAim: 'Take an Awakened mortal body and escape death.',
    grievance: 'Mortals accepted its miracles and forgot their cost.',
    escalation: 'The patron withdraws protection from an entire region.',
  },
  {
    id: 'hoarding-master',
    title: 'The Master of the Closed Path',
    compatibleDomains: ['celestial'],
    publicAim: 'Prevent unworthy fighters from Awakening.',
    hiddenAim: 'Hoard every ascension resource for one chosen heir.',
    grievance: "A reckless disciple once destroyed the master's school.",
    escalation: 'The master sends named disciples to seize independent relics.',
  },
  {
    id: 'fallen-ranker',
    title: 'The Ranker Who Came Back Wrong',
    compatibleDomains: ['underworld', 'celestial'],
    publicAim: 'Destroy the rank law that made heroes disposable.',
    hiddenAim: 'Force every living fighter into the same corrupted path.',
    grievance: "The ranking court abandoned the ranker's party to protect its reputation.",
    escalation: 'The ranker begins converting defeated guardians.',
  },
  {
    id: 'grieving-usurper',
    title: 'The Usurper with a Blood Debt',
    compatibleDomains: ['storm', 'beast'],
    publicAim: 'Return stolen land to the families who lost it.',
    hiddenAim: 'Bind the realm to a crown that cannot forgive.',
    grievance: 'The lawful dynasty built its peace on an unpunished massacre.',
    escalation: 'The usurper calls every old debt due at once.',
  },
  {
    id: 'indifferent-keeper',
    title: 'The Keeper of the Trial',
    compatibleDomains: ['celestial', 'underworld'],
    publicAim: 'Enforce the trials exactly as written.',
    hiddenAim: 'Create a champion capable of killing its absent maker.',
    grievance: 'The gods gave the keeper purpose but no freedom.',
    escalation: 'The keeper raises every trial above its declared rank.',
  },
  {
    id: 'mirror-heir',
    title: 'The Other Chosen Heir',
    compatibleDomains: ['storm', 'underworld', 'celestial'],
    publicAim: 'Prove the prophecy selected the wrong hero.',
    hiddenAim: "Take the hero's Awakening and rewrite their own past.",
    grievance: 'The heir endured the same loss without receiving a miracle.',
    escalation: 'The heir attacks the people who remember the hero before Awakening.',
  },
  {
    id: 'beast-broker',
    title: 'The Broker of Sacred Beasts',
    compatibleDomains: ['beast'],
    publicAim: 'End monster attacks by controlling every guardian beast.',
    hiddenAim: 'Fuse their hearts into an obedient god.',
    grievance: "A guardian chose the broker's sibling and left the broker powerless.",
    escalation: 'The broker places a bounty on every free bond.',
  },
] as const satisfies readonly AntagonistAgenda[];

export interface EncounterSuite {
  readonly id: string;
  readonly title: string;
  readonly compatibleDomains: readonly MythicDomain[];
  readonly families: readonly [
    Omit<EnemyPackage, 'id' | 'tier' | 'statJitter'>,
    Omit<EnemyPackage, 'id' | 'tier' | 'statJitter'>,
    Omit<EnemyPackage, 'id' | 'tier' | 'statJitter'>,
  ];
}

export const ENCOUNTER_SUITES = [
  {
    id: 'oathbreakers',
    title: 'The Oathbroken Host',
    compatibleDomains: ['storm'],
    families: [
      { familyId: 'shield-dead', title: 'Shield Dead', behavior: 'guard' },
      { familyId: 'vow-eater', title: 'Vow Eater', behavior: 'drain' },
      { familyId: 'thunder-judge', title: 'Thunder Judge', behavior: 'counter' },
    ],
  },
  {
    id: 'hollow-court',
    title: 'The Hollow Court',
    compatibleDomains: ['underworld'],
    families: [
      { familyId: 'ash-knight', title: 'Ash Knight', behavior: 'press' },
      { familyId: 'name-thief', title: 'Name Thief', behavior: 'disrupt' },
      { familyId: 'pale-regent', title: 'Pale Regent', behavior: 'summon' },
    ],
  },
  {
    id: 'rank-hunters',
    title: 'The Rank Hunters',
    compatibleDomains: ['celestial'],
    families: [
      { familyId: 'trial-scout', title: 'Trial Scout', behavior: 'ambush' },
      { familyId: 'board-enforcer', title: 'Board Enforcer', behavior: 'execute' },
      { familyId: 'named-examiner', title: 'Named Examiner', behavior: 'counter' },
    ],
  },
  {
    id: 'starved-gods',
    title: 'The Starved Gods',
    compatibleDomains: ['celestial', 'underworld'],
    families: [
      { familyId: 'prayer-hound', title: 'Prayer Hound', behavior: 'press' },
      { familyId: 'fallen-oracle', title: 'Fallen Oracle', behavior: 'drain' },
      { familyId: 'empty-saint', title: 'Empty Saint', behavior: 'summon' },
    ],
  },
  {
    id: 'scaled-legion',
    title: 'The Scaled Legion',
    compatibleDomains: ['beast'],
    families: [
      { familyId: 'scale-runner', title: 'Scale Runner', behavior: 'ambush' },
      { familyId: 'wyrm-guard', title: 'Wyrm Guard', behavior: 'guard' },
      { familyId: 'heart-drake', title: 'Heart Drake', behavior: 'execute' },
    ],
  },
  {
    id: 'moon-shades',
    title: 'The Moon Shades',
    compatibleDomains: ['underworld'],
    families: [
      { familyId: 'grave-walker', title: 'Grave Walker', behavior: 'press' },
      { familyId: 'memory-wraith', title: 'Memory Wraith', behavior: 'disrupt' },
      { familyId: 'moon-devourer', title: 'Moon Devourer', behavior: 'drain' },
    ],
  },
  {
    id: 'chain-menagerie',
    title: 'The Chained Menagerie',
    compatibleDomains: ['beast'],
    families: [
      { familyId: 'collared-wolf', title: 'Collared Wolf', behavior: 'ambush' },
      { familyId: 'iron-tortoise', title: 'Iron Tortoise', behavior: 'guard' },
      { familyId: 'chain-master', title: 'Chain Master', behavior: 'counter' },
    ],
  },
  {
    id: 'false-heroes',
    title: 'The False Heroes',
    compatibleDomains: ['storm', 'celestial'],
    families: [
      { familyId: 'glory-seeker', title: 'Glory Seeker', behavior: 'press' },
      { familyId: 'relic-poacher', title: 'Relic Poacher', behavior: 'disrupt' },
      { familyId: 'borrowed-champion', title: 'Borrowed Champion', behavior: 'execute' },
    ],
  },
] as const satisfies readonly EncounterSuite[];

export interface RewardStyle {
  readonly id: string;
  readonly compatibleDomains: readonly MythicDomain[];
  readonly currency: string;
  readonly material: string;
  readonly relic: string;
  readonly skill: string;
  readonly tags: readonly [string, string];
}

export const REWARD_STYLES = [
  {
    id: 'storm-spoils',
    compatibleDomains: ['storm'],
    currency: 'Storm Marks',
    material: 'Cloud Iron',
    relic: 'Oath Bell',
    skill: 'Thunder Step',
    tags: ['storm', 'oath'],
  },
  {
    id: 'grave-offerings',
    compatibleDomains: ['underworld'],
    currency: 'Grave Silver',
    material: 'Quiet Ash',
    relic: 'Moon Lantern',
    skill: 'Shade Passage',
    tags: ['spirit', 'memory'],
  },
  {
    id: 'heaven-shards',
    compatibleDomains: ['celestial'],
    currency: 'Star Seals',
    material: 'Heaven Glass',
    relic: 'Broken Halo',
    skill: 'Falling Star',
    tags: ['celestial', 'patron'],
  },
  {
    id: 'beast-trophies',
    compatibleDomains: ['beast'],
    currency: 'Fang Tokens',
    material: 'Living Hide',
    relic: 'Wild Crown',
    skill: 'Guardian Rush',
    tags: ['beast', 'bond'],
  },
  {
    id: 'trial-rewards',
    compatibleDomains: ['celestial'],
    currency: 'Clear Marks',
    material: 'Floor Crystal',
    relic: 'Hidden Key',
    skill: 'Limit Break',
    tags: ['trial', 'rank'],
  },
  {
    id: 'royal-remains',
    compatibleDomains: ['storm'],
    currency: 'Old Crowns',
    material: 'Oath Steel',
    relic: 'Treaty Seal',
    skill: 'Last Command',
    tags: ['kingdom', 'duty'],
  },
  {
    id: 'sect-treasures',
    compatibleDomains: ['celestial', 'beast'],
    currency: 'Merit Jade',
    material: 'Spirit Root',
    relic: 'Founder Token',
    skill: 'Open Hand Form',
    tags: ['sect', 'ascension'],
  },
  {
    id: 'pilgrim-gifts',
    compatibleDomains: ['underworld', 'beast'],
    currency: 'Shrine Coins',
    material: 'Sacred Thread',
    relic: 'Road Compass',
    skill: 'Sevenfold Step',
    tags: ['shrine', 'journey'],
  },
] as const satisfies readonly RewardStyle[];

export const COMBAT_PATTERNS = [
  [true, false, true, false, true, true],
  [true, true, true, false, true, true],
  [true, false, true, true, true, true],
  [true, true, true, true, false, true],
  [true, false, true, true, false, true],
  [true, true, true, false, false, true],
  [true, false, true, false, true, true],
  [true, true, true, true, true, true],
] as const;

export function domainLabel(domain: MythicDomain): string {
  return { storm: 'storm', underworld: 'the dead', celestial: 'heaven', beast: 'the wild' }[domain];
}
