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
    role: 'vanguard',
    ageBand: 'adult',
    origin: 'Former district response officer.',
    formativeEvent: 'Held a breach line after official support withdrew.',
    drive: 'Make squad protection a promise institutions cannot revoke.',
    contradiction: 'Distrusts authority but still follows its procedures.',
    temperament: 'Measured and protective.',
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
        description: 'Damages and Exposes one enemy.',
        resourceCost: 2,
        cooldownRounds: 2,
        condition: 'At least 2 resource and an active target.',
      },
      {
        id: 'hold-the-line',
        name: 'Hold the Line',
        description: 'Reinforces the squad front.',
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
    role: 'striker',
    ageBand: 'young-adult',
    origin: 'Independent assessment circuit duelist.',
    formativeEvent: 'Won a licensed bout with a technique no examiner recognised.',
    drive: 'Prove that an unregistered style can reach the public rankings.',
    contradiction: 'Craves recognition but rejects instruction.',
    temperament: 'Direct and competitive.',
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
        description: 'A costly conditional finisher.',
        resourceCost: 2,
        cooldownRounds: 2,
        condition: 'Aggressive stance or a target at 65% HP, with 2 resource.',
      },
      {
        id: 'cross-step',
        name: 'Cross Step',
        description: 'Repositions through a target line.',
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
    role: 'support',
    ageBand: 'adult',
    origin: 'Expelled academy field researcher.',
    formativeEvent: 'Stabilised an illegal relic bond during a campus breach.',
    drive: 'Document powers the academies prefer to erase.',
    contradiction: 'Seeks truth but conceals their own evidence.',
    temperament: 'Observant and dryly compassionate.',
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
        description: 'Heals and Wards one ally.',
        resourceCost: 2,
        cooldownRounds: 2,
        condition: 'An ally is below the stance recovery threshold, with 2 resource.',
      },
      {
        id: 'binding-shot',
        name: 'Binding Shot',
        description: 'Damages and Staggers one enemy.',
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
    name: 'Rift Hound',
    side: 'enemies',
    role: 'charger',
    policyId: 'charger',
    stats: { vitality: 10, power: 10, guard: 7, speed: 11, focus: 8 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Breach Charge strains the front line every third round.',
    signatureRuleId: 'breach-charge',
    limitation: 'Its guard collapses when Exposed.',
    limitationRuleId: 'exposed-collapse',
    ecology:
      'A transit predator that feeds on fresh breach pressure and follows evacuation routes.',
    counterplay: 'Expose it, hold the front, or counter charger actions.',
    rewardIdentity: 'Houndglass splinters suitable for a breach-tempered weapon.',
    scenarioTags: ['transit', 'predator', 'charger'],
    threat: 7,
  },
  {
    id: 'glass-weaver',
    name: 'Glass Weaver',
    side: 'enemies',
    role: 'hexer',
    policyId: 'hexer',
    stats: { vitality: 10, power: 9, guard: 5, speed: 8, focus: 12 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Rending Hex marks the rear hero for amplified damage.',
    signatureRuleId: 'rending-hex',
    limitation: 'Low Vitality makes it vulnerable to focused pressure.',
    limitationRuleId: 'fragile-body',
    ecology:
      'A silica colony that nests along stable breach edges and reads movement through vibration.',
    counterplay: 'Focus its low Vitality or protect the rear from marks.',
    rewardIdentity: 'A traced Weaver sigil suitable for defensive support equipment.',
    scenarioTags: ['transit', 'colony', 'hexer'],
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
    ecology: 'A storm-fed pack hunter drawn to exposed civic power relays.',
    counterplay: 'Break Threat before its repeated landing pattern stabilises.',
    rewardIdentity: 'Charged claw conductors used in junction countermeasures.',
    scenarioTags: ['junction', 'storm', 'charger'],
    threat: 9,
  },
  {
    id: 'signal-leech',
    name: 'Signal Leech',
    side: 'enemies',
    role: 'hexer',
    policyId: 'hexer',
    stats: { vitality: 9, power: 8, guard: 7, speed: 9, focus: 13 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Borrowed Signal marks the rear hero and amplifies follow-up damage.',
    signatureRuleId: 'borrowed-signal',
    limitation: 'Breaking the largest threat denies it a stable signal source.',
    limitationRuleId: 'borrowed-focus',
    ecology: 'A breach parasite that survives by copying licensed telemetry and Calling emissions.',
    counterplay: 'Break its partner or protect the rear while the copied signal decays.',
    rewardIdentity: 'Recovered signal tissue that improves Directorate intelligence.',
    scenarioTags: ['junction', 'parasite', 'hexer'],
    threat: 7,
  },
  {
    id: 'ironback-mauler',
    name: 'Ironback Mauler',
    side: 'enemies',
    role: 'charger',
    policyId: 'charger',
    stats: { vitality: 12, power: 10, guard: 9, speed: 8, focus: 7 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Rail Charge strains whoever holds the front position.',
    signatureRuleId: 'rail-charge',
    limitation: 'Its heavy guard is vulnerable after an Exposed break.',
    limitationRuleId: 'heavy-recovery',
    ecology: 'A plated scavenger that converts rail vibration into dense defensive growth.',
    counterplay: 'Apply Exposed before committing focused damage.',
    rewardIdentity: 'Ironback plates recognised as contract-grade reinforcement.',
    scenarioTags: ['concourse', 'armoured', 'charger'],
    threat: 11,
  },
  {
    id: 'veil-scribe',
    name: 'Veil Scribe',
    side: 'enemies',
    role: 'hexer',
    policyId: 'hexer',
    stats: { vitality: 8, power: 10, guard: 5, speed: 11, focus: 12 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Erasure Mark hunts the rear hero before the record can stabilise.',
    signatureRuleId: 'erasure-mark',
    limitation: 'Low Vitality leaves it exposed to a fast focused finish.',
    limitationRuleId: 'fragile-body',
    ecology: 'A record-eating breach organism that hides inside damaged route signage.',
    counterplay: 'Reach it quickly or preserve the rear record against Erasure Mark.',
    rewardIdentity: 'A surviving route glyph that restores lost civic records.',
    scenarioTags: ['concourse', 'record', 'hexer'],
    threat: 8,
  },
  {
    id: 'survey-beast',
    name: 'Survey Beast',
    side: 'enemies',
    role: 'charger',
    policyId: 'charger',
    stats: { vitality: 10, power: 11, guard: 8, speed: 10, focus: 9 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Claimant Rush strains the front while a faction records the impact.',
    signatureRuleId: 'claimant-rush',
    limitation: 'Protective formations deny it a clean public demonstration.',
    limitationRuleId: 'observed-charge',
    ecology:
      'A conditioned breach beast released by survey crews to produce measurable public threats.',
    counterplay: 'Use Guarded formation and deny the observed charge a dramatic target.',
    rewardIdentity: 'Faction handling tags that prove responsibility for the release.',
    scenarioTags: ['faction', 'survey', 'charger'],
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
    signature: 'Reflected Verdict marks the rear hero and records amplified harm.',
    signatureRuleId: 'reflected-verdict',
    limitation: 'Breaking its partner leaves the prediction without an anchor.',
    limitationRuleId: 'paired-anchor',
    ecology:
      'A reflective colony that predicts movement only while linked to a larger breach organism.',
    counterplay: 'Break its partner, then pressure the Oracle before it finds a new anchor.',
    rewardIdentity: 'Mirror fragments containing an auditable prediction trace.',
    scenarioTags: ['faction', 'oracle', 'hexer'],
    threat: 10,
  },
];

export const temporaryEncounter: EncounterState = {
  id: 'm1-glassline-breach',
  title: 'Glassline Breach',
  brief:
    'A Rift Hound pins the transit concourse while a Glass Weaver marks targets from the breach line. Formation and target priority will decide who absorbs the opening pressure.',
  enemyIds: ['rift-hound', 'glass-weaver'],
  signature: 'Breach Charge pressures the front; Rending Hex hunts the rear.',
  rewardPreview: 'Squad experience, two supplies, and a recorded breach closure.',
};

export const operationEncounters: EncounterState[] = [
  temporaryEncounter,
  {
    id: 'm4-east-junction',
    title: 'Pressure at East Junction',
    brief:
      'A Storm Jackal crosses the junction in sudden bursts while a Signal Leech borrows the squad telemetry. The largest threat and the rear line demand different counters.',
    enemyIds: ['storm-jackal', 'signal-leech'],
    signature: 'Surge Pounce pressures the front; Borrowed Signal marks the rear.',
    rewardPreview: 'Squad experience, supplies, and junction intelligence.',
  },
  {
    id: 'm4-split-concourse',
    title: 'The Split Concourse',
    brief:
      'An Ironback Mauler controls the narrow line while a Veil Scribe erases safe-route records. Breaking guard quickly competes with protecting the rear.',
    enemyIds: ['ironback-mauler', 'veil-scribe'],
    signature: 'Rail Charge holds the front; Erasure Mark attacks the rear record.',
    rewardPreview: 'Squad experience, supplies, and a restored transit record.',
  },
  {
    id: 'm4-closure-under-watch',
    title: 'Closure Under Watch',
    brief:
      'A faction Survey Beast performs for its observers while a Mirror Oracle turns the squad record against its rear line. The plan will also shape public reputation.',
    enemyIds: ['survey-beast', 'mirror-oracle'],
    signature: 'Claimant Rush pressures the front; Reflected Verdict marks the rear.',
    rewardPreview: 'Squad experience, supplies, equipment evidence, and reputation.',
  },
];

export function encounterForOperationTemplate(templateId: string): EncounterState {
  const parsedIndex = Number.parseInt(templateId.split('-').at(-1) ?? '1', 10) - 1;
  return operationEncounters[parsedIndex] ?? temporaryEncounter;
}

export const prototypeEquipment: EquipmentDefinition[] = [
  {
    id: 'houndglass-edge',
    name: 'Houndglass Edge',
    slot: 'weapon',
    description: 'A breach-tempered edge that adds 2 Power against charging threats.',
    powerBonus: 2,
    guardBonus: 0,
    counterTag: 'charger',
  },
  {
    id: 'weaver-ward',
    name: 'Weaver Ward',
    slot: 'support',
    description: 'A traced sigil that adds 2 Guard against marked-target pressure.',
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
          description: `Unlocked by progress toward: ${character.awakeningCondition}`,
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
