import type { CharacterBlueprint } from '../engine/model/character';
import type {
  CombatantDefinition,
  EncounterState,
  PartyMemberState,
  StanceId,
} from '../engine/model/combat';
import type { Position } from '../engine/model/commands';
import { maximumHp } from '../engine/combat/stats';
import type { EquipmentDefinition } from '../engine/model/progression';

export const TEMPORARY_HERO_IDS = ['mira-vale', 'dax-ren', 'sorrel-voss'] as const;

export const temporaryCharacters: CharacterBlueprint[] = [
  {
    id: 'mira-vale',
    name: 'Mira Vale',
    pronouns: { subject: 'she', object: 'her', possessive: 'her' },
    callingId: 'iron-echo',
    callingName: 'Iron Echo',
    pathClassId: 'oathward',
    pathClassName: 'Oathward',
    pathClassSummary:
      'A front-line guardian who turns a promise into armour and intercepts danger meant for an ally.',
    backgroundName: 'Survivor of the Broken Shrine',
    bond: 'No companion standing behind her will be abandoned again.',
    role: 'vanguard',
    ageBand: 'adult',
    origin: 'Former district response officer.',
    formativeEvent: 'Held a breach line after official support withdrew.',
    drive: 'Make squad protection a promise institutions cannot revoke.',
    contradiction: 'Distrusts authority but still follows its procedures.',
    temperament: 'Measured and protective.',
    story: {
      portrait:
        'Mira Vale once held a district breach line after official support withdrew. She now treats every formation as a promise that no institution may quietly revoke. The Iron Echo answers that conviction with a resonant shield-tone whenever an ally is threatened. Mira fears that following the old procedures will make her repeat the abandonment she survived.',
      fear: 'She fears becoming the kind of officer who mistakes procedure for protection.',
      interiorVoice: 'Count the exits, name the people at risk, and hold until everyone is clear.',
      signature:
        'The Iron Echo crosses the formation as a ringing shield-presence whenever danger reaches for the rear line.',
      reaction:
        'Each interception leaves a brief resonance around Mira, as though the defence remembers where she stood.',
      limitation:
        'The Calling loses force when Mira turns its protective geometry toward harm alone.',
    },
    stats: { vitality: 12, power: 7, guard: 12, speed: 6, focus: 8 },
    signatureRuleId: 'rear-intercept',
    signature: 'Intercepts the first attack aimed at the rear each round.',
    reactionRuleId: 'intercept-brace',
    reaction: 'Intercepting an attack immediately grants a one-round Ward.',
    limitationRuleId: 'measured-strikes',
    limitation: 'Measured attacks trade damage for protection.',
    techniqueIds: ['aegis-break', 'hold-the-line'],
    techniques: [
      {
        id: 'aegis-break',
        name: 'Aegis Break',
        storyDescription:
          'Mira drives a resonant edge through an enemy guard, leaving its defensive pattern visibly fractured.',
        mechanicLabel: 'Damage one enemy and apply Exposed.',
        resourceCost: 2,
        cooldownRounds: 2,
        condition: 'At least 2 resource and an active target.',
      },
      {
        id: 'hold-the-line',
        name: 'Hold the Line',
        storyDescription:
          'Mira plants the Iron Echo across the squad front until its ringing boundary becomes a shared shelter.',
        mechanicLabel: 'Guard the squad front and apply Ward.',
        resourceCost: 1,
        cooldownRounds: 2,
        condition: 'Protect Rear priority and at least 1 resource.',
      },
    ],
    personalHookIds: ['sealed-service-record', 'unpaid-district-debt'],
    personalHooks: ['A sealed service record', 'An unpaid district debt'],
    awakeningCondition: 'Protect an ally while already Strained.',
    coverageTags: ['defence', 'control'],
    semanticFingerprint: 'm1:vanguard:shield:intercept',
  },
  {
    id: 'dax-ren',
    name: 'Dax Ren',
    pronouns: { subject: 'he', object: 'him', possessive: 'his' },
    callingId: 'vector-edge',
    callingName: 'Vector Edge',
    pathClassId: 'doomseeker',
    pathClassName: 'Doomseeker',
    pathClassSummary:
      "A relentless finisher who reads the fracture in a monster's legend and turns it into a killing line.",
    backgroundName: 'Heir to a Vanished Hunter',
    bond: 'The truth about the vanished hunters matters more than rank.',
    role: 'striker',
    ageBand: 'young-adult',
    origin: 'Independent assessment circuit duelist.',
    formativeEvent: 'Won a licensed bout with a technique no examiner recognised.',
    drive: 'Prove that an unregistered style can reach the public rankings.',
    contradiction: 'Craves recognition but rejects instruction.',
    temperament: 'Direct and competitive.',
    story: {
      portrait:
        'Dax Ren won an assessment bout with a technique the examiners refused to recognise. He now pursues a public ranking that cannot omit what everyone has seen. The Vector Edge appears as bright trajectory lines that turn his decisions into cutting routes. Dax fears that recognition will arrive only after an institution has renamed his work as its own.',
      fear: 'He fears that official recognition will erase the independence that made him worth noticing.',
      interiorVoice: 'If the route is real, commit to it before someone else draws the line.',
      signature:
        'The Vector Edge finds the shortest violent route through a defence that an ally has already opened.',
      reaction:
        'A committed finishing line sharpens Dax’s focus until hesitation falls away from the attack.',
      limitation:
        'Every aggressive route leaves a readable opening behind him, trading safety for certainty.',
    },
    stats: { vitality: 8, power: 13, guard: 6, speed: 12, focus: 9 },
    signatureRuleId: 'exploit-exposed',
    signature: 'Deals +3 damage to Exposed targets.',
    reactionRuleId: 'finisher-surge',
    reaction: 'Committing to a conditional finisher Inspires that attack.',
    limitationRuleId: 'open-guard',
    limitation: 'Aggressive stance reduces effective Guard by 3.',
    techniqueIds: ['arc-finish', 'cross-step'],
    techniques: [
      {
        id: 'arc-finish',
        name: 'Arc Finish',
        storyDescription:
          'Dax commits every visible trajectory to a single closing line meant to end a weakened threat.',
        mechanicLabel: 'Heavy damage against an Exposed or weakened target.',
        resourceCost: 2,
        cooldownRounds: 2,
        condition: 'Aggressive stance or a target at 65% HP, with 2 resource.',
      },
      {
        id: 'cross-step',
        name: 'Cross Step',
        storyDescription:
          'Dax crosses the threatened line in one exact step and attacks from the angle it exposes.',
        mechanicLabel: 'Reposition and attack through the target line.',
        resourceCost: 1,
        cooldownRounds: 1,
        condition: 'Rear position or Tactical stance, with 1 resource.',
      },
    ],
    personalHookIds: ['missing-rival', 'forbidden-score'],
    personalHooks: ['A missing rival', 'A forbidden assessment score'],
    awakeningCondition: 'Finish an Exposed threat while below half Vitality.',
    coverageTags: ['damage'],
    semanticFingerprint: 'm1:striker:blade:finisher',
  },
  {
    id: 'sorrel-voss',
    name: 'Sorrel Voss',
    pronouns: { subject: 'they', object: 'them', possessive: 'their' },
    callingId: 'Quiet Lattice',
    callingName: 'Quiet Lattice',
    pathClassId: 'fateweaver',
    pathClassName: 'Fateweaver',
    pathClassSummary:
      'A keeper of living threads who mends wounds, binds threats, and returns strength to the party.',
    backgroundName: 'Keeper of the Unanswered Prayer',
    bond: 'Every life restored is a promise that the old disaster will not repeat.',
    role: 'support',
    ageBand: 'adult',
    origin: 'Expelled academy field researcher.',
    formativeEvent: 'Stabilised an illegal relic bond during a campus breach.',
    drive: 'Document powers the academies prefer to erase.',
    contradiction: 'Seeks truth but conceals their own evidence.',
    temperament: 'Observant and dryly compassionate.',
    story: {
      portrait:
        'Sorrel Voss was expelled after stabilising a relic bond the academy had declared impossible. They now document the powers that official catalogues prefer to erase. The Quiet Lattice gathers around their hands as a patient geometry of light and listening spirits. Sorrel fears that protecting dangerous evidence may eventually become another way of hiding it.',
      fear: 'They fear that caution will preserve the evidence while abandoning the people inside it.',
      interiorVoice: 'Listen for the pattern that remains after every official explanation stops.',
      signature:
        'The Quiet Lattice lets every act of recovery leave a second protective pattern behind.',
      reaction:
        'A completed recovery circuit returns a measure of power through the same paths it repaired.',
      limitation:
        'The lattice resists direct harm and diffuses force that is not shaped toward restraint.',
    },
    stats: { vitality: 9, power: 7, guard: 8, speed: 9, focus: 13 },
    signatureRuleId: 'mending-ward',
    signature: 'Restorative Sigil also grants a 3-point Ward.',
    reactionRuleId: 'recovery-loop',
    reaction: 'Completing a recovery technique refunds one action resource.',
    limitationRuleId: 'low-direct-output',
    limitation: 'Direct attacks have reduced output.',
    techniqueIds: ['restorative-sigil', 'binding-shot'],
    techniques: [
      {
        id: 'restorative-sigil',
        name: 'Restorative Sigil',
        storyDescription:
          'Sorrel closes an ally’s wounds with a quiet sigil that remains behind as a protective lattice.',
        mechanicLabel: 'Heal one ally and apply Ward.',
        resourceCost: 2,
        cooldownRounds: 2,
        condition: 'An ally is below the stance recovery threshold, with 2 resource.',
      },
      {
        id: 'binding-shot',
        name: 'Binding Shot',
        storyDescription:
          'Sorrel pins an enemy’s movement inside intersecting lines until its next action loses rhythm.',
        mechanicLabel: 'Damage one enemy and apply Staggered.',
        resourceCost: 2,
        cooldownRounds: 2,
        condition: 'Tactical stance and at least 2 resource.',
      },
    ],
    personalHookIds: ['responsive-relic', 'academy-expulsion'],
    personalHooks: ['A responsive relic', 'A disputed academy expulsion'],
    awakeningCondition: 'Ward an ally against a lethal hit.',
    coverageTags: ['sustain', 'control'],
    semanticFingerprint: 'm1:support:sigil:ward',
  },
];

export const temporaryEnemies: CombatantDefinition[] = [
  {
    id: 'rift-hound',
    name: 'Grave Hound',
    side: 'enemies',
    role: 'charger',
    policyId: 'charger',
    stats: { vitality: 10, power: 10, guard: 7, speed: 11, focus: 8 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Grave Charge strains the front line every third round.',
    signatureRuleId: 'breach-charge',
    limitation: 'Its guard collapses when Exposed.',
    limitationRuleId: 'exposed-collapse',
    ecology:
      'A temple guardian twisted by centuries beneath a dead god’s ribs. It hunts whoever carries the brightest living oath.',
    counterplay: 'Expose it, hold the front, or counter charger actions.',
    rewardIdentity: 'Godbone fangs suitable for a weapon against charging beasts.',
    scenarioTags: ['godgrave', 'guardian', 'charger'],
    threat: 7,
  },
  {
    id: 'glass-weaver',
    name: 'Pale Augur',
    side: 'enemies',
    role: 'hexer',
    policyId: 'hexer',
    stats: { vitality: 10, power: 9, guard: 5, speed: 8, focus: 12 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Funeral Omen marks the rear hero for amplified damage.',
    signatureRuleId: 'rending-hex',
    limitation: 'Low Vitality makes it vulnerable to focused pressure.',
    limitationRuleId: 'fragile-body',
    ecology:
      'A sightless oracle hatched from a forgotten prophecy. It reads fear through the tremor of a spoken name.',
    counterplay: 'Focus its low Vitality or protect the rear from marks.',
    rewardIdentity: 'A prophecy thread suitable for a warding relic.',
    scenarioTags: ['godgrave', 'oracle', 'hexer'],
    threat: 10,
  },
  {
    id: 'storm-jackal',
    name: 'Storm Jackal',
    side: 'enemies',
    role: 'charger',
    policyId: 'charger',
    stats: { vitality: 9, power: 11, guard: 6, speed: 12, focus: 8 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Surge Pounce strains the front before its own guard can settle.',
    signatureRuleId: 'surge-pounce',
    limitation: 'Focused pressure exploits its unstable landing stance.',
    limitationRuleId: 'unstable-landing',
    ecology: 'A pack hunter born where a storm god’s blood entered the mountain springs.',
    counterplay: 'Break Threat before its repeated landing pattern stabilises.',
    rewardIdentity: 'A thunder claw used to temper relics against sudden charges.',
    scenarioTags: ['mountain', 'storm', 'charger'],
    threat: 9,
  },
  {
    id: 'signal-leech',
    name: 'Echo Leech',
    side: 'enemies',
    role: 'hexer',
    policyId: 'hexer',
    stats: { vitality: 9, power: 8, guard: 7, speed: 9, focus: 13 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Borrowed Voice marks the rear hero and amplifies follow-up damage.',
    signatureRuleId: 'borrowed-signal',
    limitation: 'Breaking the largest threat denies it a stable voice to imitate.',
    limitationRuleId: 'borrowed-focus',
    ecology: 'A spirit parasite that survives by stealing the battle cries of stronger monsters.',
    counterplay: 'Break its partner or protect the rear while the stolen voice decays.',
    rewardIdentity: 'A sealed echo that reveals one hidden monster habit.',
    scenarioTags: ['ruin', 'parasite', 'hexer'],
    threat: 7,
  },
  {
    id: 'ironback-mauler',
    name: 'Ironback Minotaur',
    side: 'enemies',
    role: 'charger',
    policyId: 'charger',
    stats: { vitality: 12, power: 10, guard: 9, speed: 8, focus: 7 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Labyrinth Charge strains whoever holds the front position.',
    signatureRuleId: 'rail-charge',
    limitation: 'Its heavy guard is vulnerable after an Exposed break.',
    limitationRuleId: 'heavy-recovery',
    ecology: 'A plated beast that grows a new layer of iron each time it escapes its labyrinth.',
    counterplay: 'Apply Exposed before committing focused damage.',
    rewardIdentity: 'Ironback plates suitable for a guardian’s relic.',
    scenarioTags: ['labyrinth', 'armoured', 'charger'],
    threat: 11,
  },
  {
    id: 'veil-scribe',
    name: 'Name-Eater',
    side: 'enemies',
    role: 'hexer',
    policyId: 'hexer',
    stats: { vitality: 8, power: 10, guard: 5, speed: 11, focus: 12 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Erasure Mark hunts the rear hero before their true name can settle.',
    signatureRuleId: 'erasure-mark',
    limitation: 'Low Vitality leaves it exposed to a fast focused finish.',
    limitationRuleId: 'fragile-body',
    ecology: 'A parchment-skinned spirit that hides in ruined prayers and feeds on erased names.',
    counterplay: 'Reach it quickly or protect the rear hero against Erasure Mark.',
    rewardIdentity: 'A surviving true-name glyph that can restore a stolen memory.',
    scenarioTags: ['archive', 'spirit', 'hexer'],
    threat: 8,
  },
  {
    id: 'survey-beast',
    name: 'Crown Beast',
    side: 'enemies',
    role: 'charger',
    policyId: 'charger',
    stats: { vitality: 10, power: 11, guard: 8, speed: 10, focus: 9 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Claimant Rush strains the front while the Veiled Court judges the impact.',
    signatureRuleId: 'claimant-rush',
    limitation: 'Protective formations deny it the duel its binding oath demands.',
    limitationRuleId: 'observed-charge',
    ecology:
      'A royal chimera bound to challenge newly awakened Paths before they can threaten the old throne.',
    counterplay: 'Use Guarded formation and deny the ritual charge a vulnerable target.',
    rewardIdentity: 'A crown-chain bearing proof of the Veiled Court’s command.',
    scenarioTags: ['faction', 'crown', 'charger'],
    threat: 8,
  },
  {
    id: 'mirror-oracle',
    name: 'Mirror Oracle',
    side: 'enemies',
    role: 'hexer',
    policyId: 'hexer',
    stats: { vitality: 10, power: 9, guard: 7, speed: 9, focus: 13 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Reflected Verdict marks the rear hero and turns doubt into amplified harm.',
    signatureRuleId: 'reflected-verdict',
    limitation: 'Breaking its partner leaves the prediction without an anchor.',
    limitationRuleId: 'paired-anchor',
    ecology:
      'A silver-eyed oracle that predicts movement only while bound to a stronger monster’s legend.',
    counterplay: 'Break its partner, then pressure the Oracle before it finds a new anchor.',
    rewardIdentity: 'Mirror fragments that preserve one possible future.',
    scenarioTags: ['faction', 'oracle', 'hexer'],
    threat: 10,
  },
];

export const temporaryEncounter: EncounterState = {
  id: 'm1-fallen-god-trial',
  title: 'The Fourth God Falls',
  brief:
    'A Grave Hound charges whoever holds the front while a Pale Augur marks the rear hero with a funeral omen. Formation and target priority decide which legend controls the opening rounds.',
  enemyIds: ['rift-hound', 'glass-weaver'],
  signature: 'Grave Charge pressures the front; Funeral Omen hunts the rear.',
  rewardPreview: 'Hunter experience, two Provisions, and three Renown on victory.',
};

export const operationEncounters: EncounterState[] = [
  temporaryEncounter,
  {
    id: 'm4-east-junction',
    title: 'The Storm-God Spring',
    brief:
      'A Storm Jackal crosses the ruined shrine in sudden bursts while an Echo Leech steals its battle cry. The largest threat and the rear line demand different counters.',
    enemyIds: ['storm-jackal', 'signal-leech'],
    signature: 'Surge Pounce pressures the front; Borrowed Voice marks the rear.',
    rewardPreview: 'Hunter experience, Provisions, and Bestiary knowledge.',
  },
  {
    id: 'm4-split-concourse',
    title: 'The Split Labyrinth',
    brief:
      'An Ironback Minotaur controls the narrow path while a Name-Eater erases the runes leading home. Breaking guard quickly competes with protecting the rear.',
    enemyIds: ['ironback-mauler', 'veil-scribe'],
    signature: 'Labyrinth Charge holds the front; Erasure Mark attacks the rear hero.',
    rewardPreview: 'Hunter experience, Provisions, and a restored true-name glyph.',
  },
  {
    id: 'm4-closure-under-watch',
    title: 'Trial of the Veiled Court',
    brief:
      'A Crown Beast charges for the Veiled Court while a Mirror Oracle turns the trio’s doubts against the rear line. The plan will also shape public Renown.',
    enemyIds: ['survey-beast', 'mirror-oracle'],
    signature: 'Claimant Rush pressures the front; Reflected Verdict marks the rear.',
    rewardPreview: 'Hunter experience, Provisions, a relic, and Renown.',
  },
];

export function encounterForOperationTemplate(templateId: string): EncounterState {
  const parsedIndex = Number.parseInt(templateId.split('-').at(-1) ?? '1', 10) - 1;
  return operationEncounters[parsedIndex] ?? temporaryEncounter;
}

export const prototypeEquipment: EquipmentDefinition[] = [
  {
    id: 'houndglass-edge',
    name: 'Godbone Edge',
    slot: 'weapon',
    description: 'A blade set with a Grave Hound fang that adds 2 Power against charging threats.',
    powerBonus: 2,
    guardBonus: 0,
    counterTag: 'charger',
  },
  {
    id: 'weaver-ward',
    name: 'Augur Ward',
    slot: 'support',
    description: 'A bound prophecy thread that adds 2 Guard against hexing threats.',
    powerBonus: 0,
    guardBonus: 2,
    counterTag: 'hexer',
  },
];

export function createMilestoneOneDefinitions(characters = temporaryCharacters) {
  const heroes: CombatantDefinition[] = characters.map((character) => ({
    id: character.id,
    name: character.name,
    side: 'heroes',
    role: character.role,
    policyId: character.role,
    stats: character.stats,
    maxResource: 3,
    basicActionId:
      character.role === 'vanguard'
        ? 'shield-strike'
        : character.role === 'striker'
          ? 'vector-cut'
          : 'lattice-bolt',
    techniqueIds: character.techniqueIds,
    techniqueCosts: Object.fromEntries(
      character.techniques.map((technique) => [technique.id, technique.resourceCost]),
    ),
    techniqueCooldowns: Object.fromEntries(
      character.techniques.map((technique) => [technique.id, technique.cooldownRounds]),
    ),
    signature: character.signature,
    signatureRuleId: character.signatureRuleId,
    reaction: character.reaction,
    reactionRuleId: character.reactionRuleId,
    limitation: character.limitation,
    limitationRuleId: character.limitationRuleId,
    threat: character.role === 'vanguard' ? 9 : character.role === 'striker' ? 7 : 5,
  }));
  const all = [...heroes, ...temporaryEnemies];
  return {
    characters,
    combatants: Object.fromEntries(all.map((definition) => [definition.id, definition])),
    enemies: Object.fromEntries(temporaryEnemies.map((definition) => [definition.id, definition])),
    items: Object.fromEntries(prototypeEquipment.map((item) => [item.id, item])),
    techniques: Object.fromEntries(
      characters.map((character) => [
        `${character.callingId}-awakening`,
        {
          id: `${character.callingId}-awakening`,
          name: `${character.callingName} Mastery`,
          storyDescription: `The next form of ${character.callingName} waits behind the choice that has shaped ${character.name} from the beginning.`,
          unlockCondition: `Progress toward: ${character.awakeningCondition}`,
        },
      ]),
    ),
  };
}

export function createMilestoneOnePartyState(
  characters = temporaryCharacters,
): Record<string, PartyMemberState> {
  return Object.fromEntries(
    characters.map((character) => {
      const maxHp = maximumHp(character.stats);
      return [
        character.id,
        {
          characterId: character.id,
          hp: maxHp,
          maxHp,
          resource: 2,
          maxResource: 3,
          readiness: 100,
          experience: 0,
          level: 1,
          callingRank: 1,
          trainingPoints: 0,
          learnedTechniqueIds: character.techniqueIds.slice(0, 2),
          equipment: { weapon: null, support: null },
          statuses: [],
        },
      ];
    }),
  );
}

export const defaultPositions: Record<string, Position> = {
  'mira-vale': 'front',
  'dax-ren': 'centre',
  'sorrel-voss': 'rear',
};

export const defaultStances: Record<string, StanceId> = {
  'mira-vale': 'guarded',
  'dax-ren': 'aggressive',
  'sorrel-voss': 'supportive',
};

export function createDefaultPositions(characters: CharacterBlueprint[]): Record<string, Position> {
  return Object.fromEntries(
    characters.map((character) => [
      character.id,
      character.role === 'vanguard' ? 'front' : character.role === 'striker' ? 'centre' : 'rear',
    ]),
  );
}

export function createDefaultStances(characters: CharacterBlueprint[]): Record<string, StanceId> {
  return Object.fromEntries(
    characters.map((character) => [
      character.id,
      character.role === 'vanguard'
        ? 'guarded'
        : character.role === 'striker'
          ? 'aggressive'
          : 'supportive',
    ]),
  );
}
