import type { ScenarioCategory } from '../engine/model/scenario';
import type { QuestWorldId } from './quest-arcs';

export interface OpeningChoiceDefinition {
  id: string;
  label: string;
  description: string;
  consequence: string;
  outcomeConsequences?: {
    victory: string;
    defeat: string;
    roundCap: string;
  };
  effects: {
    renownDelta: number;
    provisionsDelta: number;
    dangerDelta: number;
    bondDelta: number;
  };
}

export interface OpeningChapterDefinition {
  turn: 1 | 2 | 3;
  category: ScenarioCategory;
  templateId: string;
  title: string;
  actTitle: string;
  objective: string;
  hook: string;
  cause: string;
  stakes: string;
  decision: string;
  choices: readonly OpeningChoiceDefinition[];
}

export interface OpeningJourneyDefinition {
  id: string;
  worldId: QuestWorldId;
  chapters: readonly [OpeningChapterDefinition, OpeningChapterDefinition, OpeningChapterDefinition];
}

const effects = (
  renownDelta: number,
  provisionsDelta: number,
  dangerDelta: number,
  bondDelta: number,
) => ({ renownDelta, provisionsDelta, dangerDelta, bondDelta });

const OPENING_JOURNEYS_SOURCE: Record<QuestWorldId, OpeningJourneyDefinition> = {
  'fallen-heavens': {
    id: 'opening-starfall-trio',
    worldId: 'fallen-heavens',
    chapters: [
      {
        turn: 1,
        category: 'social',
        templateId: 'opening-recruit-1',
        title: 'A Stranger on Starfall Road',
        actTitle: 'Gather the Trio',
        objective: 'Find two companions before the fourth Godgrave opens.',
        hook: 'The fourth star breaks open above Starfall Road while {lead} is still travelling alone. {firstCompanion} is holding a pilgrim cart against a slope of falling godbone.',
        cause:
          'The guild accepted {lead} for the Bronze trial, but no hunter may enter a Godgrave without two companions.',
        stakes:
          'The cart wheel is splitting. If it falls, the families inside will be trapped before the crater road closes.',
        decision: 'Will {lead} trust {firstCompanion} at once, or take command of the rescue?',
        choices: [
          {
            id: 'fallen-opening-t1-trust',
            label: 'Lift together',
            description:
              'Trust the stranger with half the weight. The rescue is riskier, but it begins as a partnership.',
            consequence:
              '{lead} took one beam while {firstCompanion} took the other. They pulled the cart clear as the road split beneath them. After seeing the Mythic Awakening called {leadAwakening} answer their own {firstAwakening}, {firstCompanion} asked to face the falling god together.',
            effects: effects(0, 0, 1, 2),
          },
          {
            id: 'fallen-opening-t1-lead',
            label: 'Call the rescue',
            description:
              'Set the order and keep everyone moving. The road is safer, but the stranger must choose to follow your lead.',
            consequence:
              '{lead} set the rope, named each move, and brought the cart across without losing anyone. {firstCompanion} saw the Mythic Awakening called {leadAwakening} hold steady beside {firstAwakening}, then agreed to join the trial under one clear condition: every companion gets a voice.',
            effects: effects(1, 0, 0, 1),
          },
        ],
      },
      {
        turn: 2,
        category: 'personal',
        templateId: 'opening-recruit-2',
        title: 'The Third Hunter in the God-Rib',
        actTitle: 'Gather the Trio',
        objective: 'Recruit one more companion and reach the newborn Godgrave.',
        hook: 'At the crater rim, {lead} and {firstCompanion} find {secondCompanion} inside a split god-rib, holding a passage open for three trapped trial hunters. The Mythic Awakening called {secondAwakening} flares each time the bone tries to close.',
        cause:
          '{lead} and {firstCompanion} reached the crater as a pair after the rescue on Starfall Road.',
        stakes:
          'One hunter is still inside, and the rib is cooling into stone. If it seals, the last safe route to the trial seals with it.',
        decision:
          'Will the pair enter the closing rib beside {secondCompanion}, or hold it open from outside?',
        choices: [
          {
            id: 'fallen-opening-t2-enter',
            label: 'Enter the closing rib',
            description: 'Share the immediate danger and guide the last hunter out from within.',
            consequence:
              '{lead} and {firstCompanion} entered the rib while {secondCompanion} held the bone apart. All three brought the final hunter out. {secondCompanion} joined them before the passage closed, and the new trio reached the trial gate as guardians climbed from the crater.',
            effects: effects(1, 0, 1, 2),
          },
          {
            id: 'fallen-opening-t2-anchor',
            label: 'Hold the rib from outside',
            description:
              'Build a safer anchor and trust the stranger to bring the last hunter back.',
            consequence:
              '{lead} and {firstCompanion} anchored the rib while {secondCompanion} carried the last hunter through. The plan held. {secondCompanion} joined them at the trial gate, where guardians were already climbing from the crater toward the waiting candidates.',
            effects: effects(0, 0, 0, 1),
          },
        ],
      },
      {
        turn: 3,
        category: 'operation',
        templateId: 'operation-1',
        title: 'The Fourth God Falls',
        actTitle: 'A Star Falls',
        objective: 'Survive the first battle and learn what fell from the sky.',
        hook: '{lead}, {firstCompanion}, and {secondCompanion} reach the trial gate as {enemyOne} drives the other candidates toward a cliff and {enemyTwo} marks anyone who tries to flee.',
        cause:
          'Two rescues turned three lone hunters into a trio just before the newborn Godgrave released its guardians.',
        stakes:
          'Breaking the charger first leaves the mark unanswered. Hunting the seer leaves the cliff without a shield. This is the first time all three Mythic Awakenings must work as one.',
        decision: "Set the trio's formation and choose which threat they will stop first.",
        choices: [
          {
            id: 'fallen-opening-t3-fight',
            label: 'Stand together',
            description:
              'Set formation, stances, and team priority before the new trio enters its first battle.',
            consequence:
              "The new trio defeated the guardians and entered the fourth Godgrave. Behind an empty altar, they found a fresh human name cut into the god's rib.",
            outcomeConsequences: {
              victory:
                "The new trio defeated the guardians and entered the fourth Godgrave. Behind an empty altar, they found a fresh human name cut into the god's rib.",
              defeat:
                "The guardians broke the new formation, but the trio escaped through the same rib they had kept open together. Behind an empty altar, they found a fresh human name cut into the god's rib.",
              roundCap:
                'The trial ended before either side won. The trio withdrew through the same rib they had kept open together and found a fresh human name cut inside it.',
            },
            effects: effects(0, 0, 0, 0),
          },
        ],
      },
    ],
  },
  'underworld-tide': {
    id: 'opening-early-tide-trio',
    worldId: 'underworld-tide',
    chapters: [
      {
        turn: 1,
        category: 'social',
        templateId: 'opening-recruit-1',
        title: 'A Stranger at the Last Bell',
        actTitle: 'Gather the Trio',
        objective: 'Find two companions before the early tide cuts off the shore.',
        hook: 'The sea withdraws three nights early while {lead} is still travelling alone. At the last wet bell, {firstCompanion} holds a rescue skiff against the pull of the exposed Underworld stair.',
        cause:
          'The Tide Guild granted {lead} a descent token, but the black stair admits only trios and dawn is already approaching.',
        stakes:
          'Three families are stranded on the newly bare seabed. If the skiff breaks loose, the returning drowned will reach them first.',
        decision: 'Will {lead} take the second oar beside {firstCompanion}, or clear a path ahead?',
        choices: [
          {
            id: 'tide-opening-t1-oar',
            label: 'Take the second oar',
            description:
              'Trust the stranger to set the rhythm and pull every family back together.',
            consequence:
              "{lead} matched {firstCompanion} stroke for stroke until the skiff reached dry ground. When the Mythic Awakening called {leadAwakening} answered {firstAwakening} across the oars, {firstCompanion} chose to follow the bell below the sea at {lead}'s side.",
            effects: effects(0, 0, 1, 2),
          },
          {
            id: 'tide-opening-t1-path',
            label: 'Clear the path ahead',
            description:
              'Guide the skiff around the drowned and bring the families home by the safer line.',
            consequence:
              "{lead} cleared each pale shape from the skiff's path while {firstCompanion} brought the families ashore. Seeing {leadAwakening} and {firstAwakening} hold the same line, {firstCompanion} agreed to join the descent and make the temporary alliance a true pair.",
            effects: effects(1, 0, 0, 1),
          },
        ],
      },
      {
        turn: 2,
        category: 'personal',
        templateId: 'opening-recruit-2',
        title: 'The Hunter the Tide Forgot',
        actTitle: 'Gather the Trio',
        objective: 'Recruit one more companion and reach the black stair.',
        hook: 'Below the last bell, {lead} and {firstCompanion} find {secondCompanion} kneeling beside a returned hunter who has forgotten their own name. The Mythic Awakening called {secondAwakening} keeps one bright syllable alive above the water.',
        cause:
          '{lead} and {firstCompanion} reached the black stair as a pair after bringing the rescue skiff home.',
        stakes:
          'The next bell will wash the syllable away. Saving it costs precious rations; leaving now gives the hunters time to reach the stair before the drowned surround it.',
        decision:
          'Will the pair help {secondCompanion} restore the name, or mark a road that can bring the returned hunter home later?',
        choices: [
          {
            id: 'tide-opening-t2-name',
            label: 'Restore the lost name',
            description:
              'Spend one ration on the rite and return one true memory before moving on.',
            consequence:
              '{lead} and {firstCompanion} gave up a ration while {secondCompanion} spoke the bright syllable back into the hunter. The hunter remembered the way home. {secondCompanion} joined the pair, and all three reached the stair as drowned guardians rose between them and the bell.',
            effects: effects(1, -1, 0, 2),
          },
          {
            id: 'tide-opening-t2-road',
            label: 'Mark the road home',
            description:
              'Keep the rations and leave a path the returned hunter can follow after the fight.',
            consequence:
              '{lead} and {firstCompanion} carved a line of names toward the shore while {secondCompanion} kept the last syllable alive. {secondCompanion} joined them to defend that road, and the new trio reached the stair as drowned guardians rose beneath the bell.',
            effects: effects(0, 0, 1, 1),
          },
        ],
      },
      {
        turn: 3,
        category: 'operation',
        templateId: 'operation-5',
        title: 'The Sea Opens Early',
        actTitle: 'The Early Tide',
        objective: 'Protect the shore and learn why the sea opened early.',
        hook: '{lead}, {firstCompanion}, and {secondCompanion} reach the black stair as {enemyOne} charges the waiting families and {enemyTwo} begins stealing names from the rear of the line.',
        cause:
          'Two rescues turned three lone hunters into a trio just before the early tide sent its guardians toward the shore.',
        stakes:
          'Stopping the charger first leaves its omen alive. Hunting the name-thief leaves the families exposed. This is the first time all three Mythic Awakenings must work as one.',
        decision: "Set the trio's formation and choose which threat they will stop first.",
        choices: [
          {
            id: 'tide-opening-t3-fight',
            label: 'Hold the shore together',
            description:
              'Set formation, stances, and team priority before the new trio enters its first battle.',
            consequence:
              "The new trio drove the guardians from the shore and entered the black stair. Below the first landing, they found the dead king's royal seal nailed beneath the bell.",
            outcomeConsequences: {
              victory:
                "The new trio drove the guardians from the shore and entered the black stair. Below the first landing, they found the dead king's royal seal nailed beneath the bell.",
              defeat:
                "The drowned broke the new formation, but the trio escaped along the road of names they had made together. Beneath the last bell, they found the dead king's royal seal.",
              roundCap:
                "Dawn ended the fight before either side won. The trio withdrew along the road of names and found the dead king's royal seal beneath the last bell.",
            },
            effects: effects(0, 0, 0, 0),
          },
        ],
      },
    ],
  },
};

const OPENING_SLOTS = new Set([
  'lead',
  'leadAwakening',
  'firstCompanion',
  'firstAwakening',
  'secondCompanion',
  'secondAwakening',
  'enemyOne',
  'enemyTwo',
]);

const SLOT_PATTERN = /\{([A-Za-z][A-Za-z0-9]*)\}/g;

for (const journey of Object.values(OPENING_JOURNEYS_SOURCE)) {
  journey.chapters.forEach((chapter, index) => {
    if (chapter.turn !== index + 1) throw new Error(`${journey.id} has a broken chapter order.`);
    if (chapter.turn === 3 ? chapter.category !== 'operation' : chapter.category === 'operation') {
      throw new Error(`${journey.id} has combat in the wrong opening chapter.`);
    }
    if (chapter.turn === 3 ? chapter.choices.length !== 1 : chapter.choices.length !== 2) {
      throw new Error(`${journey.id} has the wrong number of choices on Turn ${chapter.turn}.`);
    }
    const prose = [
      chapter.title,
      chapter.actTitle,
      chapter.objective,
      chapter.hook,
      chapter.cause,
      chapter.stakes,
      chapter.decision,
      ...chapter.choices.flatMap((candidate) => [
        candidate.label,
        candidate.description,
        candidate.consequence,
        ...(candidate.outcomeConsequences === undefined
          ? []
          : Object.values(candidate.outcomeConsequences)),
      ]),
    ].join(' ');
    const unsupportedSlots = [...prose.matchAll(SLOT_PATTERN)]
      .map((match) => match[1]!)
      .filter((slot) => !OPENING_SLOTS.has(slot));
    if (unsupportedSlots.length > 0) {
      throw new Error(`${journey.id} contains unsupported slots: ${unsupportedSlots.join(', ')}`);
    }
    if (/\bCalling\b|\bMythic Path\b/i.test(prose)) {
      throw new Error(`${journey.id} uses rejected player-facing power terminology.`);
    }
  });
}

export const OPENING_JOURNEYS: Readonly<Record<QuestWorldId, OpeningJourneyDefinition>> =
  OPENING_JOURNEYS_SOURCE;
