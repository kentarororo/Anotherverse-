import {
  ANTAGONIST_AGENDAS,
  ARC_SKELETONS,
  COMBAT_PATTERNS,
  ENCOUNTER_SUITES,
  REWARD_STYLES,
  WORLD_THESES,
  type EncounterSuite,
  type RewardStyle,
} from '../../content/procedural-corpus';
import type {
  CampaignCastMember,
  AntagonistAgenda,
  CampaignFact,
  CampaignFactKey,
  CampaignMiracle,
  CampaignPlan,
  CampaignPlanValidation,
  CampaignScenePlan,
  FactPredicate,
  FactTransition,
  MythicDomain,
  PlannedPromise,
  RewardPackage,
} from '../model/campaign-plan';
import { CAMPAIGN_TURN_COUNT } from '../model/campaign-plan';
import {
  createRngStreams,
  drawInteger,
  type RngStreamName,
  type RngStreamsState,
} from '../rng/streams';

const HERO_NAMES = ['Mira', 'Ronan', 'Yuna', 'Kael', 'Hana', 'Cassian', 'Sora', 'Wren'] as const;
const ALLY_NAMES = ['Ilya', 'Tae-jun', 'Brenna', 'Suho', 'Astrid', 'Ryu', 'Maren', 'Lin'] as const;
const FORBIDDEN_WORLD_TERMS = [
  'telemetry',
  'network protocol',
  'licensed operator',
  'bureau ticket',
] as const;

interface Selection<T> {
  readonly value: T;
  readonly streams: RngStreamsState;
}

function select<T>(
  values: readonly T[],
  streams: RngStreamsState,
  stream: RngStreamName,
): Selection<T> {
  const draw = drawInteger(streams, stream, 0, values.length - 1);
  return { value: values[draw.value]!, streams: draw.streams };
}

function supportsDomain(
  module: { readonly compatibleDomains: readonly MythicDomain[] },
  domain: MythicDomain,
): boolean {
  return module.compatibleDomains.includes(domain);
}

function fact(key: CampaignFactKey, state: CampaignFact['state']): FactPredicate {
  return { key, state };
}

function transitions(
  worldId: string,
  agendaId: string,
): readonly [
  FactTransition,
  FactTransition,
  FactTransition,
  FactTransition,
  FactTransition,
  FactTransition,
] {
  return [
    {
      requires: [fact('world-law', 'known')],
      forbids: [fact('main-threat', 'defeated')],
      retires: [],
      produces: [
        { key: 'main-threat', kind: 'threat', agendaId, state: 'rumored' },
        { key: 'act-relic', kind: 'relic', state: 'missing' },
      ],
    },
    {
      requires: [fact('main-threat', 'rumored'), fact('party-bond', 'alone')],
      forbids: [fact('party-bond', 'sworn')],
      retires: [fact('party-bond', 'alone')],
      produces: [{ key: 'party-bond', kind: 'bond', state: 'allied' }],
    },
    {
      requires: [
        fact('main-threat', 'rumored'),
        fact('act-relic', 'missing'),
        fact('enemy-weakness', 'unknown'),
      ],
      forbids: [fact('act-relic', 'found')],
      retires: [
        fact('main-threat', 'rumored'),
        fact('act-relic', 'missing'),
        fact('enemy-weakness', 'unknown'),
      ],
      produces: [
        { key: 'main-threat', kind: 'threat', agendaId, state: 'identified' },
        { key: 'act-relic', kind: 'relic', state: 'found' },
        { key: 'enemy-weakness', kind: 'weakness', state: 'learned' },
      ],
    },
    {
      requires: [
        fact('act-relic', 'found'),
        fact('party-bond', 'allied'),
        fact('hero-oath', 'unmade'),
      ],
      forbids: [fact('hero-oath', 'paid')],
      retires: [
        fact('act-relic', 'found'),
        fact('party-bond', 'allied'),
        fact('hero-oath', 'unmade'),
      ],
      produces: [
        { key: 'act-relic', kind: 'relic', state: 'awakened' },
        { key: 'party-bond', kind: 'bond', state: 'sworn' },
        { key: 'hero-oath', kind: 'oath', state: 'sworn' },
      ],
    },
    {
      requires: [
        fact('main-threat', 'identified'),
        fact('enemy-weakness', 'learned'),
        fact('final-route', 'sealed'),
      ],
      forbids: [fact('main-threat', 'defeated')],
      retires: [fact('main-threat', 'identified'), fact('final-route', 'sealed')],
      produces: [
        { key: 'main-threat', kind: 'threat', agendaId, state: 'cornered' },
        { key: 'final-route', kind: 'route', state: 'opened' },
      ],
    },
    {
      requires: [
        fact('main-threat', 'cornered'),
        fact('final-route', 'opened'),
        fact('act-relic', 'awakened'),
        fact('hero-oath', 'sworn'),
      ],
      forbids: [fact('main-threat', 'defeated')],
      retires: [
        fact('main-threat', 'cornered'),
        fact('final-route', 'opened'),
        fact('enemy-weakness', 'learned'),
        fact('hero-oath', 'sworn'),
      ],
      produces: [
        { key: 'main-threat', kind: 'threat', agendaId, state: 'defeated' },
        { key: 'final-route', kind: 'route', state: 'crossed' },
        { key: 'enemy-weakness', kind: 'weakness', state: 'exploited' },
        { key: 'hero-oath', kind: 'oath', state: 'paid' },
      ],
    },
  ];
}

function makePromises(): readonly PlannedPromise[] {
  return [
    {
      id: 'promise-main-threat',
      kind: 'threat',
      description: 'Reveal who caused the crisis and stop their final move.',
      setupTurn: 1,
      payoffTurn: 6,
      payoff: fact('main-threat', 'defeated'),
    },
    {
      id: 'promise-act-relic',
      kind: 'relic',
      description: 'Recover the lost relic and discover why it answers the hero.',
      setupTurn: 1,
      payoffTurn: 4,
      payoff: fact('act-relic', 'awakened'),
    },
    {
      id: 'promise-hero-oath',
      kind: 'oath',
      description: 'Make the alliance matter when victory demands a personal cost.',
      setupTurn: 2,
      payoffTurn: 6,
      payoff: fact('hero-oath', 'paid'),
    },
  ];
}

function rewardFor(style: RewardStyle, turn: number, amountJitter: number): RewardPackage {
  const categories = ['currency', 'material', 'material', 'relic', 'material', 'skill'] as const;
  const category = categories[turn - 1]!;
  const title = style[category];
  return {
    id: `${style.id}-${category}-${turn}`,
    styleId: style.id,
    category,
    title,
    amount:
      category === 'currency'
        ? Math.max(10, 12 + turn + amountJitter)
        : category === 'material'
          ? Math.max(1, Math.min(4, 1 + Math.floor(turn / 3) + amountJitter))
          : 1,
    tags: style.tags,
  };
}

function makeMiracle(streams: RngStreamsState): {
  readonly miracle: CampaignMiracle | null;
  readonly streams: RngStreamsState;
} {
  const chance = drawInteger(streams, 'narration', 0, 99);
  if (chance.value >= 5) return { miracle: null, streams: chance.streams };

  const kinds = ['second-awakening', 'divine-intercession', 'relic-transfiguration'] as const;
  const kindDraw = drawInteger(chance.streams, 'narration', 0, kinds.length - 1);
  const turnDraw = drawInteger(kindDraw.streams, 'narration', 3, 5);
  const kind = kinds[kindDraw.value]!;
  const text = {
    'second-awakening': {
      boon: 'The hero acts once beyond their current rank.',
      cost: 'Their strongest skill is sealed until the next act.',
    },
    'divine-intercession': {
      boon: 'A forgotten god prevents a defeat that should have been certain.',
      cost: "The party inherits the god's unfinished vow.",
    },
    'relic-transfiguration': {
      boon: 'The act relic changes form and breaks one enemy law.',
      cost: 'The relic loses that power when the act ends.',
    },
  }[kind];
  return { miracle: { turn: turnDraw.value, kind, ...text }, streams: turnDraw.streams };
}

function namesFor(
  streams: RngStreamsState,
  antagonistTitle: string,
): { readonly cast: CampaignPlan['cast']; readonly streams: RngStreamsState } {
  const hero = select(HERO_NAMES, streams, 'characters');
  const firstAlly = select(ALLY_NAMES, hero.streams, 'characters');
  const secondAlly = select(
    ALLY_NAMES.filter((name) => name !== firstAlly.value),
    firstAlly.streams,
    'characters',
  );
  const cast: CampaignPlan['cast'] = [
    { id: 'cast-hero', role: 'hero', name: hero.value, introductionTurn: 1 },
    { id: 'cast-ally-one', role: 'ally', name: firstAlly.value, introductionTurn: 2 },
    { id: 'cast-ally-two', role: 'ally', name: secondAlly.value, introductionTurn: 3 },
    { id: 'cast-antagonist', role: 'antagonist', name: antagonistTitle, introductionTurn: 1 },
  ];
  return { cast, streams: secondAlly.streams };
}

function castForTurn(turn: number): Pick<CampaignScenePlan, 'castIds' | 'introducedCastIds'> {
  if (turn === 1) {
    return {
      castIds: ['cast-hero', 'cast-antagonist'],
      introducedCastIds: ['cast-hero', 'cast-antagonist'],
    };
  }
  if (turn === 2)
    return {
      castIds: ['cast-hero', 'cast-ally-one'],
      introducedCastIds: ['cast-ally-one'],
    };
  if (turn === 3)
    return {
      castIds: ['cast-hero', 'cast-ally-one', 'cast-ally-two'],
      introducedCastIds: ['cast-ally-two'],
    };
  return {
    castIds:
      turn === CAMPAIGN_TURN_COUNT
        ? ['cast-hero', 'cast-ally-one', 'cast-ally-two', 'cast-antagonist']
        : ['cast-hero', 'cast-ally-one', 'cast-ally-two'],
    introducedCastIds: [],
  };
}

function worldNameInSentence(title: string): string {
  return title.replace(/^The\s+/, 'the ');
}

function stakesForTurn(
  antagonist: AntagonistAgenda,
  worldTitle: string,
  turn: number,
): string {
  if (turn === 1) {
    return `${antagonist.title} is behind the attack. ${antagonist.escalation}`;
  }
  if (turn === 2) {
    return `The enemy is closing on the new alliance. If the party falls here, they will face ${antagonist.title} alone.`;
  }
  if (turn === 3) {
    return `${antagonist.title}'s agents guard the next clue. Losing it would end the trail.`;
  }
  if (turn === 4) {
    return `${antagonist.title} wants the awakened relic. If it is taken, the party loses its only advantage.`;
  }
  if (turn === 5) {
    return `${antagonist.title} controls the final road. Breaking this line is the only way forward.`;
  }
  return `${antagonist.title} makes the final move. Defeat would leave ${worldNameInSentence(worldTitle)} under their rule.`;
}

export function getStructuralFingerprint(plan: CampaignPlan): string {
  const scenes = plan.scenes
    .map((scene) => {
      const encounter = scene.encounter
        ? `${scene.encounter.id}:${scene.encounter.enemies.map((enemy) => `${enemy.familyId}.${enemy.behavior}`).join('+')}`
        : 'story';
      const transition = scene.transition.produces
        .map((produced) => `${produced.key}.${produced.state}`)
        .join('+');
      return `${scene.beatId}:${encounter}:${scene.reward.styleId}.${scene.reward.category}:${transition}`;
    })
    .join('>');
  const miracle = plan.miracle ? `${plan.miracle.kind}@${plan.miracle.turn}` : 'ordinary';
  return [plan.world.id, plan.arc.id, plan.antagonist.id, miracle, scenes].join('|');
}

export function compileCampaignPlan(seed: string): CampaignPlan {
  let streams = createRngStreams(`campaign-plan:${seed}`);
  const world = select(WORLD_THESES, streams, 'world');
  streams = world.streams;
  const arc = select(
    ARC_SKELETONS.filter((module) => supportsDomain(module, world.value.domain)),
    streams,
    'scenarios',
  );
  streams = arc.streams;
  const antagonist = select(
    ANTAGONIST_AGENDAS.filter((module) => supportsDomain(module, world.value.domain)),
    streams,
    'enemies',
  );
  streams = antagonist.streams;
  const suite = select(
    ENCOUNTER_SUITES.filter((module) => supportsDomain(module, world.value.domain)),
    streams,
    'scenarios',
  );
  streams = suite.streams;
  const rewardStyle = select(
    REWARD_STYLES.filter((module) => supportsDomain(module, world.value.domain)),
    streams,
    'rewards',
  );
  streams = rewardStyle.streams;
  const combatPattern = select(COMBAT_PATTERNS, streams, 'combat');
  streams = combatPattern.streams;
  const miracleResult = makeMiracle(streams);
  streams = miracleResult.streams;
  const namedCast = namesFor(streams, antagonist.value.title);
  streams = namedCast.streams;
  const sceneTransitions = transitions(world.value.id, antagonist.value.id);
  const promises = makePromises();

  const scenes = arc.value.beats.map((arcBeat, index) => {
    const turn = index + 1;
    const amountDraw = drawInteger(streams, 'rewards', -1, 2);
    streams = amountDraw.streams;
    const statDraw = drawInteger(streams, 'enemies', -10, 10);
    streams = statDraw.streams;
    const family = suite.value.families[index % suite.value.families.length]!;
    const bossFamily = suite.value.families[2]!;
    const isCombat = combatPattern.value[index]!;
    const enemies =
      turn === CAMPAIGN_TURN_COUNT
        ? ([
            {
              ...family,
              id: `${suite.value.id}-${family.familyId}-${turn}`,
              tier: turn + 1,
              statJitter: statDraw.value,
            },
            {
              ...bossFamily,
              id: `${suite.value.id}-${bossFamily.familyId}-boss`,
              tier: turn + 2,
              statJitter: statDraw.value + 2,
            },
          ] as const)
        : ([
            {
              ...family,
              id: `${suite.value.id}-${family.familyId}-${turn}`,
              tier: turn + 1,
              statJitter: statDraw.value,
            },
          ] as const);
    const encounter = isCombat
      ? {
          id: `${suite.value.id}-turn-${turn}`,
          kind: 'combat' as const,
          stakes: stakesForTurn(antagonist.value, world.value.title, turn),
          enemies,
        }
      : null;
    const reward = rewardFor(rewardStyle.value, turn, amountDraw.value);
    const miracle = miracleResult.miracle?.turn === turn ? miracleResult.miracle : null;
    const miracleOutcome = miracle ? ` A miracle occurs: ${miracle.boon} ${miracle.cost}` : '';
    const combatOutcome = encounter
      ? `The party survives the battle and claims ${reward.title}.`
      : `The party secures ${reward.title} and keeps moving.`;

    return {
      turn,
      id: `${arc.value.id}-turn-${turn}`,
      beatId: arcBeat.id,
      title: arcBeat.title,
      prose:
        turn === 1
          ? `${arcBeat.prose} The warning reaches every corner of ${worldNameInSentence(world.value.title)}.`
          : arcBeat.prose,
      outcomeText: `${combatOutcome}${miracleOutcome}`,
      transition: sceneTransitions[index]!,
      promiseSetups:
        turn === 1
          ? ['promise-main-threat', 'promise-act-relic']
          : turn === 2
            ? ['promise-hero-oath']
            : [],
      promisePayoffs:
        turn === 4
          ? ['promise-act-relic']
          : turn === 6
            ? ['promise-main-threat', 'promise-hero-oath']
            : [],
      encounter,
      reward,
      ...castForTurn(turn),
    } satisfies CampaignScenePlan;
  }) as unknown as CampaignPlan['scenes'];

  const draft: CampaignPlan = {
    version: 1,
    seed,
    world: world.value,
    arc: arc.value,
    antagonist: antagonist.value,
    cast: namedCast.cast,
    miracle: miracleResult.miracle,
    initialFacts: [
      { key: 'world-law', kind: 'world-law', lawId: world.value.id, state: 'known' },
      { key: 'party-bond', kind: 'bond', state: 'alone' },
      { key: 'final-route', kind: 'route', state: 'sealed' },
      { key: 'enemy-weakness', kind: 'weakness', state: 'unknown' },
      { key: 'hero-oath', kind: 'oath', state: 'unmade' },
    ],
    promises,
    scenes,
    structuralFingerprint: '',
  };
  return { ...draft, structuralFingerprint: getStructuralFingerprint(draft) };
}

function matches(current: CampaignFact | undefined, predicate: FactPredicate): boolean {
  return current?.key === predicate.key && current.state === predicate.state;
}

export function validateCampaignPlan(plan: CampaignPlan): CampaignPlanValidation {
  const errors: string[] = [];
  const facts = new Map<CampaignFactKey, CampaignFact>();
  const castById = new Map(plan.cast.map((member) => [member.id, member]));
  const introduced = new Set<string>();
  const knownPromises = new Map(plan.promises.map((promise) => [promise.id, promise]));
  const setups = new Map<string, number[]>();
  const payoffs = new Map<string, number[]>();

  if (plan.scenes.length !== CAMPAIGN_TURN_COUNT)
    errors.push('Campaign must contain exactly six scenes.');
  if (getStructuralFingerprint(plan) !== plan.structuralFingerprint) {
    errors.push('Structural fingerprint does not match the plan.');
  }

  for (const initial of plan.initialFacts) {
    if (facts.has(initial.key)) errors.push(`Initial fact ${initial.key} is duplicated.`);
    facts.set(initial.key, initial);
  }

  for (const scene of plan.scenes) {
    if (scene.turn < 1 || scene.turn > CAMPAIGN_TURN_COUNT)
      errors.push(`Scene ${scene.id} has an invalid turn.`);
    if (
      scene.turn > 1 &&
      (scene.transition.requires.length === 0 || scene.transition.produces.length === 0)
    ) {
      errors.push(`Non-opening scene ${scene.id} must consume and produce facts.`);
    }

    for (const castId of scene.introducedCastIds) {
      const member = castById.get(castId);
      if (!member) errors.push(`Scene ${scene.id} introduces unknown cast member ${castId}.`);
      else if (member.introductionTurn !== scene.turn)
        errors.push(`${castId} is introduced on the wrong turn.`);
      else if (introduced.has(castId)) errors.push(`${castId} is introduced more than once.`);
      introduced.add(castId);
    }
    for (const castId of scene.castIds) {
      if (!castById.has(castId))
        errors.push(`Scene ${scene.id} references unknown cast member ${castId}.`);
      else if (!introduced.has(castId))
        errors.push(`Scene ${scene.id} uses ${castId} before introduction.`);
    }

    for (const required of scene.transition.requires) {
      if (!matches(facts.get(required.key), required)) {
        errors.push(`Scene ${scene.id} requires missing fact ${required.key}.${required.state}.`);
      }
    }
    for (const forbidden of scene.transition.forbids) {
      if (matches(facts.get(forbidden.key), forbidden)) {
        errors.push(
          `Scene ${scene.id} violates forbidden fact ${forbidden.key}.${forbidden.state}.`,
        );
      }
    }
    for (const retired of scene.transition.retires) {
      if (!matches(facts.get(retired.key), retired)) {
        errors.push(`Scene ${scene.id} retires missing fact ${retired.key}.${retired.state}.`);
      } else {
        facts.delete(retired.key);
      }
    }
    for (const produced of scene.transition.produces) {
      if (facts.has(produced.key))
        errors.push(`Scene ${scene.id} overwrites active fact ${produced.key}.`);
      facts.set(produced.key, produced);
    }

    for (const id of scene.promiseSetups) {
      if (!knownPromises.has(id)) errors.push(`Scene ${scene.id} sets up unknown promise ${id}.`);
      setups.set(id, [...(setups.get(id) ?? []), scene.turn]);
    }
    for (const id of scene.promisePayoffs) {
      const promise = knownPromises.get(id);
      if (!promise) errors.push(`Scene ${scene.id} pays off unknown promise ${id}.`);
      else if (!scene.transition.produces.some((produced) => matches(produced, promise.payoff))) {
        errors.push(`Scene ${scene.id} does not produce the promised payoff for ${id}.`);
      }
      payoffs.set(id, [...(payoffs.get(id) ?? []), scene.turn]);
    }

    if (
      FORBIDDEN_WORLD_TERMS.some((term) =>
        `${scene.prose} ${scene.outcomeText}`.toLowerCase().includes(term),
      )
    ) {
      errors.push(`Scene ${scene.id} uses forbidden techno vocabulary.`);
    }
  }

  const worldVocabulary = [plan.world.title, ...plan.world.lexicon];
  const actProse = plan.scenes.map((scene) => scene.prose).join(' ').toLowerCase();
  if (!worldVocabulary.some((term) => actProse.includes(term.toLowerCase()))) {
    errors.push('Campaign prose never establishes the selected world.');
  }

  for (const promise of plan.promises) {
    const actualSetups = setups.get(promise.id) ?? [];
    const actualPayoffs = payoffs.get(promise.id) ?? [];
    if (actualSetups.length !== 1 || actualSetups[0] !== promise.setupTurn) {
      errors.push(
        `Promise ${promise.id} does not have exactly one setup on turn ${promise.setupTurn}.`,
      );
    }
    if (actualPayoffs.length !== 1 || actualPayoffs[0] !== promise.payoffTurn) {
      errors.push(
        `Promise ${promise.id} does not have exactly one payoff on turn ${promise.payoffTurn}.`,
      );
    }
    if (promise.payoffTurn <= promise.setupTurn)
      errors.push(`Promise ${promise.id} pays off before its setup.`);
    if (!matches(facts.get(promise.payoff.key), promise.payoff)) {
      errors.push(`Promise ${promise.id} is dangling at the end of the act.`);
    }
  }

  for (const member of plan.cast) {
    if (!introduced.has(member.id)) errors.push(`Cast member ${member.id} is never introduced.`);
  }
  const combatCount = plan.scenes.filter((scene) => scene.encounter !== null).length;
  if (combatCount < 4 || combatCount > 6)
    errors.push(`Campaign has ${combatCount} combat scenes; expected 4–6.`);
  if (plan.miracle && (plan.miracle.turn < 3 || plan.miracle.turn > 5)) {
    errors.push('Miracles must occur between turns 3 and 5.');
  }

  return { valid: errors.length === 0, errors, finalFacts: facts };
}
