import type { CharacterBlueprint } from '../engine/model/character';
import type {
  CombatantDefinition,
  EncounterState,
  PartyMemberState,
  StanceId,
} from '../engine/model/combat';
import type { Position } from '../engine/model/commands';
import { maximumHp } from '../engine/combat/stats';

export const TEMPORARY_HERO_IDS = ['mira-vale', 'dax-ren', 'sorrel-voss'] as const;

export const temporaryCharacters: CharacterBlueprint[] = [
  {
    id: 'mira-vale',
    name: 'Mira Vale',
    pronouns: { subject: 'she', object: 'her', possessive: 'her' },
    callingId: 'iron-echo',
    callingName: 'Iron Echo',
    role: 'vanguard',
    stats: { vitality: 12, power: 7, guard: 12, speed: 6, focus: 8 },
    signatureRuleId: 'rear-intercept',
    limitationRuleId: 'measured-strikes',
    techniqueIds: ['aegis-break', 'hold-the-line'],
    personalHookIds: ['sealed-service-record', 'unpaid-district-debt'],
    semanticFingerprint: 'm1:vanguard:shield:intercept',
  },
  {
    id: 'dax-ren',
    name: 'Dax Ren',
    pronouns: { subject: 'he', object: 'him', possessive: 'his' },
    callingId: 'vector-edge',
    callingName: 'Vector Edge',
    role: 'striker',
    stats: { vitality: 8, power: 13, guard: 6, speed: 12, focus: 9 },
    signatureRuleId: 'exploit-exposed',
    limitationRuleId: 'open-guard',
    techniqueIds: ['arc-finish', 'cross-step'],
    personalHookIds: ['missing-rival', 'forbidden-score'],
    semanticFingerprint: 'm1:striker:blade:finisher',
  },
  {
    id: 'sorrel-voss',
    name: 'Sorrel Voss',
    pronouns: { subject: 'they', object: 'them', possessive: 'their' },
    callingId: 'Quiet Lattice',
    callingName: 'Quiet Lattice',
    role: 'support',
    stats: { vitality: 9, power: 7, guard: 8, speed: 9, focus: 13 },
    signatureRuleId: 'mending-ward',
    limitationRuleId: 'low-direct-output',
    techniqueIds: ['restorative-sigil', 'binding-shot'],
    personalHookIds: ['responsive-relic', 'academy-expulsion'],
    semanticFingerprint: 'm1:support:sigil:ward',
  },
];

export const temporaryEnemies: CombatantDefinition[] = [
  {
    id: 'rift-hound',
    name: 'Rift Hound',
    side: 'enemies',
    role: 'charger',
    stats: { vitality: 10, power: 10, guard: 7, speed: 11, focus: 8 },
    maxResource: 3,
    basicActionId: 'rending-claw',
    techniqueIds: ['breach-charge'],
    signature: 'Breach Charge strains the front line every third round.',
    limitation: 'Its guard collapses when Exposed.',
    threat: 7,
  },
  {
    id: 'glass-weaver',
    name: 'Glass Weaver',
    side: 'enemies',
    role: 'hexer',
    stats: { vitality: 10, power: 9, guard: 5, speed: 8, focus: 12 },
    maxResource: 3,
    basicActionId: 'shard-bolt',
    techniqueIds: ['rending-hex'],
    signature: 'Rending Hex marks the rear hero for amplified damage.',
    limitation: 'Low Vitality makes it vulnerable to focused pressure.',
    threat: 10,
  },
];

export const temporaryEncounter: EncounterState = {
  id: 'm1-glassline-breach',
  title: 'Glassline Breach',
  brief:
    'A Rift Hound pins the transit concourse while a Glass Weaver marks targets from the breach line. Formation and target priority will decide who absorbs the opening pressure.',
  enemyIds: temporaryEnemies.map((enemy) => enemy.id),
  signature: 'Breach Charge pressures the front; Rending Hex hunts the rear.',
  rewardPreview: 'Squad experience, two supplies, and a recorded breach closure.',
};

export function createMilestoneOneDefinitions() {
  const heroes: CombatantDefinition[] = temporaryCharacters.map((character) => ({
    id: character.id,
    name: character.name,
    side: 'heroes',
    role: character.role,
    stats: character.stats,
    maxResource: 3,
    basicActionId:
      character.id === 'mira-vale'
        ? 'shield-strike'
        : character.id === 'dax-ren'
          ? 'vector-cut'
          : 'lattice-bolt',
    techniqueIds: character.techniqueIds,
    signature:
      character.id === 'mira-vale'
        ? 'Intercepts the first attack aimed at the rear each round.'
        : character.id === 'dax-ren'
          ? 'Deals +3 damage to Exposed targets.'
          : 'Restorative Sigil also grants a 3-point Ward.',
    limitation:
      character.id === 'mira-vale'
        ? 'Measured attacks trade damage for protection.'
        : character.id === 'dax-ren'
          ? 'Aggressive stance reduces effective Guard by 3.'
          : 'Direct attacks have reduced output.',
    threat: character.role === 'vanguard' ? 9 : character.role === 'striker' ? 7 : 5,
  }));
  const all = [...heroes, ...temporaryEnemies];
  return {
    characters: temporaryCharacters,
    combatants: Object.fromEntries(all.map((definition) => [definition.id, definition])),
    enemies: Object.fromEntries(temporaryEnemies.map((definition) => [definition.id, definition])),
    items: {},
    techniques: {},
  };
}

export function createMilestoneOnePartyState(): Record<string, PartyMemberState> {
  return Object.fromEntries(
    temporaryCharacters.map((character) => {
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
