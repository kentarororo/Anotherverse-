import { z } from 'zod';
import type { CampaignBible } from '../model/world';
import { CampaignBibleSchema } from '../model/world';
import type { CharacterBlueprint, CoreStats } from '../model/character';
import { CharacterBlueprintSchema } from '../model/character';
import type { RngStreamName, RngStreamsState } from '../rng/streams';
import { createRngStreams, drawInteger } from '../rng/streams';
import {
  createMilestoneOneDefinitions,
  createMilestoneOnePartyState,
  temporaryEncounter,
} from '../../content/milestone-one';

const worldPacks = [
  {
    id: 'lumen-port',
    city: 'Lumen Port',
    civic: 'Breach Safety Directorate',
    guild: 'Contract Squad Registry',
    pressure: 'Transit breaches are surfacing beneath districts rebuilt after the First Cascade.',
    faction: ['The Meridian Office', 'Monopolise pre-Cascade breach records.'],
  },
  {
    id: 'vanta-cross',
    city: 'Vanta Cross',
    civic: 'Municipal Threshold Bureau',
    guild: 'Licensed Company Compact',
    pressure: 'Public rankings determine which districts receive protection during breach season.',
    faction: ['The Crownless Academy', 'Recruit unsponsored talents before guild assessment.'],
  },
  {
    id: 'halcyon-ward',
    city: 'Halcyon Ward',
    civic: 'Civic Incursion Authority',
    guild: 'Threefold Licence Council',
    pressure: 'Living relics are waking inside sealed infrastructure projects.',
    faction: ['The Quiet Survey', 'Hide evidence that relic awakenings follow civic excavation.'],
  },
  {
    id: 'cinder-bay',
    city: 'Cinder Bay',
    civic: 'District Breach Commission',
    guild: 'Independent Squad Exchange',
    pressure: 'Illegal breach harvesting has made ordinary closures politically dangerous.',
    faction: ['Ashline Holdings', 'Turn unstable breach matter into exclusive licensed equipment.'],
  },
] as const;

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

const origins = [
  'A district response unit dissolved after a disputed breach closure.',
  'An academy programme that erased unsuccessful awakening records.',
  'The unsponsored assessment circuit beneath the public rankings.',
  'A family-run relic clinic operating beyond guild jurisdiction.',
  'A transit district repeatedly excluded from official protection maps.',
  'A corporate breach survey team abandoned during an extraction failure.',
  'A civic archive responsible for sealed pre-Cascade testimony.',
  'A rural licence office where unusual Callings were routinely misclassified.',
] as const;

const formativeEvents = [
  'They held an evacuation route after the assigned squad withdrew.',
  'A relic answered them during an assessment designed to reject them.',
  'They exposed a false closure report and lost their sponsor.',
  'A rival took responsibility for a technique they developed together.',
  'They survived a breach whose official record lists no survivors.',
  'They chose to save a witness instead of securing a ranking promotion.',
] as const;

const drives = [
  'Build a record no institution can quietly revise.',
  'Earn enough authority to protect overlooked districts.',
  'Discover why their Calling violates accepted power law.',
  'Find the person removed from their formative incident report.',
  'Prove that unsponsored squads can outperform guild companies.',
  'Prevent living relics from becoming institutional property.',
] as const;

const contradictions = [
  'They demand honesty while guarding one decisive secret.',
  'They reject hierarchy but instinctively take command under pressure.',
  'They protect strangers easily and struggle to trust allies.',
  'They crave public recognition and resent being observed.',
  'They value restraint but become reckless when a rival is involved.',
  'They study every risk except the one tied to their own Calling.',
] as const;

const temperaments = [
  'Measured and protective.',
  'Direct and competitive.',
  'Observant and quietly compassionate.',
  'Methodical with a dry sense of humour.',
  'Restless, candid, and loyal under pressure.',
  'Formal in public and unexpectedly impulsive in private.',
] as const;

interface CallingModule {
  id: string;
  name: string;
  role: 'vanguard' | 'striker' | 'support';
  stats: CoreStats;
  signatureRuleId: string;
  signature: string;
  reactionRuleId: string;
  reaction: string;
  limitationRuleId: string;
  limitation: string;
  techniques: Array<Pick<CharacterBlueprint['techniques'][number], 'id' | 'name' | 'description'>>;
  awakening: string;
  coverage: CharacterBlueprint['coverageTags'];
}

const callings: Record<CallingModule['role'], CallingModule[]> = {
  vanguard: [
    {
      id: 'iron-echo',
      name: 'Iron Echo',
      role: 'vanguard',
      stats: { vitality: 12, power: 7, guard: 12, speed: 6, focus: 8 },
      signatureRuleId: 'rear-intercept',
      signature: 'Intercepts the first attack aimed at the rear each round.',
      reactionRuleId: 'intercept-brace',
      reaction: 'Intercepting an attack immediately grants a one-round Ward.',
      limitationRuleId: 'measured-strikes',
      limitation: 'Protective technique geometry reduces direct attack output.',
      techniques: [
        { id: 'aegis-break', name: 'Aegis Break', description: 'Damages and Exposes one enemy.' },
        { id: 'hold-the-line', name: 'Hold the Line', description: 'Reinforces the squad front.' },
      ],
      awakening: 'Intercept a lethal attack while already Strained.',
      coverage: ['defence', 'control'],
    },
    {
      id: 'anchor-saint',
      name: 'Anchor Saint',
      role: 'vanguard',
      stats: { vitality: 11, power: 8, guard: 13, speed: 5, focus: 8 },
      signatureRuleId: 'rear-intercept',
      signature: 'Redirects the first rear-line attack through a spectral anchor.',
      reactionRuleId: 'intercept-brace',
      reaction: 'A redirected attack reinforces the spectral anchor with a one-round Ward.',
      limitationRuleId: 'measured-strikes',
      limitation: 'The anchor weakens attacks made without a stable formation.',
      techniques: [
        {
          id: 'aegis-break',
          name: 'Anchor Fracture',
          description: 'Damages and Exposes one enemy.',
        },
        { id: 'hold-the-line', name: 'Fixed Horizon', description: 'Reinforces the squad front.' },
      ],
      awakening: 'Hold formation through three consecutive enemy techniques.',
      coverage: ['defence', 'control'],
    },
    {
      id: 'storm-bastion',
      name: 'Storm Bastion',
      role: 'vanguard',
      stats: { vitality: 10, power: 9, guard: 11, speed: 8, focus: 7 },
      signatureRuleId: 'rear-intercept',
      signature: 'Crosses the formation on a lightning guard-step once each round.',
      reactionRuleId: 'intercept-brace',
      reaction: 'A lightning guard-step leaves a one-round Ward around the interception point.',
      limitationRuleId: 'measured-strikes',
      limitation: 'Stored charge disperses when used only for direct offense.',
      techniques: [
        { id: 'aegis-break', name: 'Thunder Brace', description: 'Damages and Exposes one enemy.' },
        { id: 'hold-the-line', name: 'Stormwall', description: 'Reinforces the squad front.' },
      ],
      awakening: 'Intercept for every other squad member in one operation.',
      coverage: ['defence', 'control'],
    },
  ],
  striker: [
    {
      id: 'vector-edge',
      name: 'Vector Edge',
      role: 'striker',
      stats: { vitality: 8, power: 13, guard: 6, speed: 12, focus: 9 },
      signatureRuleId: 'exploit-exposed',
      signature: 'Deals +3 damage to Exposed targets.',
      reactionRuleId: 'finisher-surge',
      reaction: 'Committing to a conditional finisher Inspires that attack.',
      limitationRuleId: 'open-guard',
      limitation: 'Aggressive stance reduces effective Guard by 3.',
      techniques: [
        { id: 'arc-finish', name: 'Arc Finish', description: 'A costly conditional finisher.' },
        { id: 'cross-step', name: 'Cross Step', description: 'Cuts through a threatened line.' },
      ],
      awakening: 'Finish an Exposed threat while below half Vitality.',
      coverage: ['damage'],
    },
    {
      id: 'red-interval',
      name: 'Red Interval',
      role: 'striker',
      stats: { vitality: 9, power: 12, guard: 7, speed: 11, focus: 10 },
      signatureRuleId: 'exploit-exposed',
      signature: 'Turns an Exposed defence gap into +3 damage.',
      reactionRuleId: 'finisher-surge',
      reaction: 'A committed interval finisher Inspires its own resolution.',
      limitationRuleId: 'open-guard',
      limitation: 'Accelerated intervals leave Guard open in Aggressive stance.',
      techniques: [
        { id: 'arc-finish', name: 'Interval End', description: 'A costly conditional finisher.' },
        { id: 'cross-step', name: 'Red Transit', description: 'Cuts through a threatened line.' },
      ],
      awakening: 'Chain two finishers without receiving recovery.',
      coverage: ['damage'],
    },
    {
      id: 'comet-thread',
      name: 'Comet Thread',
      role: 'striker',
      stats: { vitality: 7, power: 14, guard: 5, speed: 13, focus: 9 },
      signatureRuleId: 'exploit-exposed',
      signature: 'Pulls +3 damage through fractures in an Exposed target.',
      reactionRuleId: 'finisher-surge',
      reaction: 'Committing the Comet Thread to a finisher Inspires the attack.',
      limitationRuleId: 'open-guard',
      limitation: 'The thread offers little protection during Aggressive pursuit.',
      techniques: [
        { id: 'arc-finish', name: 'Comet Fall', description: 'A costly conditional finisher.' },
        { id: 'cross-step', name: 'Trailing Step', description: 'Cuts through a threatened line.' },
      ],
      awakening: 'Defeat a marked rival with exact finishing damage.',
      coverage: ['damage'],
    },
  ],
  support: [
    {
      id: 'quiet-lattice',
      name: 'Quiet Lattice',
      role: 'support',
      stats: { vitality: 9, power: 7, guard: 8, speed: 9, focus: 13 },
      signatureRuleId: 'mending-ward',
      signature: 'Recovery also grants a 3-point Ward.',
      reactionRuleId: 'recovery-loop',
      reaction: 'Completing a recovery technique refunds one action resource.',
      limitationRuleId: 'low-direct-output',
      limitation: 'Direct attacks have reduced output.',
      techniques: [
        {
          id: 'restorative-sigil',
          name: 'Restorative Sigil',
          description: 'Heals and Wards one ally.',
        },
        {
          id: 'binding-shot',
          name: 'Binding Shot',
          description: 'Damages and Staggers one enemy.',
        },
      ],
      awakening: 'Ward an ally against a lethal hit.',
      coverage: ['sustain', 'control'],
    },
    {
      id: 'mercy-engine',
      name: 'Mercy Engine',
      role: 'support',
      stats: { vitality: 10, power: 6, guard: 9, speed: 8, focus: 14 },
      signatureRuleId: 'mending-ward',
      signature: 'Converts excess recovery into a 3-point Ward.',
      reactionRuleId: 'recovery-loop',
      reaction: 'A completed Mercy Cycle returns one action resource to the Engine.',
      limitationRuleId: 'low-direct-output',
      limitation: 'The Engine routes most output away from direct attacks.',
      techniques: [
        { id: 'restorative-sigil', name: 'Mercy Cycle', description: 'Heals and Wards one ally.' },
        {
          id: 'binding-shot',
          name: 'Arresting Pulse',
          description: 'Damages and Staggers one enemy.',
        },
      ],
      awakening: 'Restore every squad member during the same round.',
      coverage: ['sustain', 'control'],
    },
    {
      id: 'spirit-switchboard',
      name: 'Spirit Switchboard',
      role: 'support',
      stats: { vitality: 8, power: 8, guard: 7, speed: 10, focus: 13 },
      signatureRuleId: 'mending-ward',
      signature: 'Routes recovery through a spirit that leaves a 3-point Ward.',
      reactionRuleId: 'recovery-loop',
      reaction: 'A spirit completing recovery returns one action resource to the switchboard.',
      limitationRuleId: 'low-direct-output',
      limitation: 'Bound spirits resist being used for direct harm.',
      techniques: [
        {
          id: 'restorative-sigil',
          name: 'Kindred Circuit',
          description: 'Heals and Wards one ally.',
        },
        {
          id: 'binding-shot',
          name: 'Signal Snare',
          description: 'Damages and Staggers one enemy.',
        },
      ],
      awakening: 'Keep a spirit link active while all allies are Strained.',
      coverage: ['sustain', 'control'],
    },
  ],
};

function completeTechniques(
  role: CallingModule['role'],
  techniques: CallingModule['techniques'],
): CharacterBlueprint['techniques'] {
  return techniques.map((technique, index) => {
    if (role === 'vanguard') {
      return {
        ...technique,
        resourceCost: index === 0 ? 2 : 1,
        cooldownRounds: 2,
        condition:
          index === 0
            ? 'At least 2 resource and an active target.'
            : 'Protect Rear priority and at least 1 resource.',
      };
    }
    if (role === 'striker') {
      return {
        ...technique,
        resourceCost: index === 0 ? 2 : 1,
        cooldownRounds: index === 0 ? 2 : 1,
        condition:
          index === 0
            ? 'Aggressive stance or a target at 65% HP, with 2 resource.'
            : 'Rear position or Tactical stance, with 1 resource.',
      };
    }
    return {
      ...technique,
      resourceCost: 2,
      cooldownRounds: 2,
      condition:
        index === 0
          ? 'An ally is below the stance recovery threshold, with 2 resource.'
          : 'Tactical stance and at least 2 resource.',
    };
  });
}

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
  characters: CharacterBlueprint[];
  semanticFingerprint: string;
  rngStreams: RngStreamsState;
}

export function generateCampaignDraft(seed: string): CampaignDraft {
  let streams = createRngStreams(seed);
  const world = pick(streams, 'world', worldPacks);
  streams = world.streams;
  const pack = world.value;
  const bible = CampaignBibleSchema.parse({
    seed,
    city: { id: `city-${pack.id}`, name: pack.city, tags: ['modern', 'breach-city'] },
    civicOrder: {
      id: `civic-${pack.id}`,
      name: pack.civic,
      mandate: 'License squads, publish threat forecasts, and certify breach closures.',
      tags: ['regulator'],
    },
    guildModel: {
      id: `guild-${pack.id}`,
      name: pack.guild,
      mandate: 'Match three-person licensed squads to district contracts.',
      tags: ['contracts', 'rankings'],
    },
    rankSystem: { id: 'public-licence-ranks', tiers: ['Unranked', 'Bronze', 'Silver', 'Gold'] },
    breachLaw: {
      id: 'pressure-trace-law',
      summary:
        'Every open breach leaves a measurable pressure trace and an accountable closure record.',
    },
    powerLaw: {
      id: 'calling-condition-law',
      summary: 'A Calling grows only when its bearer fulfils a visible personal condition.',
    },
    threatEcology: { id: 'adaptive-ecology', summary: pack.pressure, tags: ['adaptive', 'urban'] },
    activeFactions: [
      {
        id: `faction-${pack.id}`,
        name: pack.faction[0],
        motive: pack.faction[1],
        tags: ['active'],
      },
    ],
    terminology: {
      heroCollective: 'licensed squad',
      incursion: 'breach',
      powerSource: 'Calling',
      technique: 'technique',
    },
    toneProfileId: 'modern-progression',
  });

  const shuffledNames = shuffle(streams, 'characters', names);
  streams = shuffledNames.streams;
  const roles: CallingModule['role'][] = ['vanguard', 'striker', 'support'];
  const characters: CharacterBlueprint[] = [];
  for (const [slot, role] of roles.entries()) {
    const callingPick = pick(streams, 'characters', callings[role]);
    streams = callingPick.streams;
    const originPick = pick(streams, 'characters', origins);
    streams = originPick.streams;
    const eventPick = pick(streams, 'characters', formativeEvents);
    streams = eventPick.streams;
    const drivePick = pick(streams, 'characters', drives);
    streams = drivePick.streams;
    const contradictionPick = pick(streams, 'characters', contradictions);
    streams = contradictionPick.streams;
    const temperamentPick = pick(streams, 'characters', temperaments);
    streams = temperamentPick.streams;
    const agePick = pick(streams, 'characters', ['young-adult', 'adult', 'veteran'] as const);
    streams = agePick.streams;
    const calling = callingPick.value;
    const completedTechniques = completeTechniques(role, calling.techniques);
    const name = shuffledNames.values[slot]!;
    const id = `${slug(name)}-${slot + 1}`;
    const hookOne = `A witness connected to ${originPick.value.toLowerCase()}`;
    const hookTwo = `The unresolved claim that ${eventPick.value.charAt(0).toLowerCase()}${eventPick.value.slice(1)}`;
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
        callingId: calling.id,
        callingName: calling.name,
        role,
        ageBand: agePick.value,
        origin: originPick.value,
        formativeEvent: eventPick.value,
        drive: drivePick.value,
        contradiction: contradictionPick.value,
        temperament: temperamentPick.value,
        stats: calling.stats,
        signatureRuleId: calling.signatureRuleId,
        signature: calling.signature,
        reactionRuleId: calling.reactionRuleId,
        reaction: calling.reaction,
        limitationRuleId: calling.limitationRuleId,
        limitation: calling.limitation,
        techniqueIds: completedTechniques.map((technique) => technique.id),
        techniques: completedTechniques,
        personalHookIds: [`hook-${id}-origin`, `hook-${id}-event`],
        personalHooks: [hookOne, hookTwo],
        awakeningCondition: calling.awakening,
        coverageTags: calling.coverage,
        semanticFingerprint: [
          role,
          calling.id,
          originPick.index,
          eventPick.index,
          drivePick.index,
          contradictionPick.index,
          temperamentPick.index,
        ].join(':'),
      }),
    );
  }
  return {
    seed,
    bible,
    premise: `${pack.city} licenses three-person squads through the ${pack.guild}. ${pack.pressure} Your newly registered trio has received its first closure contract while ${pack.faction[0]} pursues its own interest in the district.`,
    characters,
    semanticFingerprint: `${pack.id}|${characters.map((character) => character.semanticFingerprint).join('|')}`,
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
  characters: z.array(CharacterBlueprintSchema).length(3),
  semanticFingerprint: z.string().min(1),
});
