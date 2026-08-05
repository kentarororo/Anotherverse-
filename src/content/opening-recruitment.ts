import type { ScenarioCategory } from '../engine/model/scenario';
import type { QuestWorldId } from './quest-arcs';

export interface OpeningChoiceDefinition {
  id: string;
  label: string;
  description: string;
  consequence: string;
  encounterId?: string;
  outcomeConsequences?: { victory: string; defeat: string; roundCap: string };
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
    id: 'opening-starfall-road',
    worldId: 'fallen-heavens',
    chapters: [
      {
        turn: 1,
        category: 'operation',
        templateId: 'opening-solo-fallen',
        title: 'The Hound on Starfall Road',
        actTitle: 'A Star Falls',
        objective: 'Protect the pilgrims and reach the new crater.',
        hook: '{lead} is alone on Starfall Road when a star tears across the afternoon sky. Its impact throws a pilgrim cart onto its side, and a Grave Hound climbs from the smoking earth.',
        cause:
          'The road to the Bronze trial now runs through the crater, and no guild hunter has arrived to help.',
        stakes:
          'The beast stands between the cart and the only safe path down the mountain. The trapped pilgrims cannot move until it falls.',
        decision: 'Choose a stance and face the Grave Hound.',
        choices: [
          {
            id: 'fallen-opening-t1-fight',
            label: 'Face the hound',
            description: 'Set your stance and let the battle play out.',
            encounterId: 'opening-starfall-hound',
            consequence:
              '{lead} drove the hound away from the cart. One pilgrim saw a masked hunter carry a burning shard toward the crater.',
            outcomeConsequences: {
              victory:
                '{lead} killed the hound and freed the pilgrims. One of them saw a masked hunter carry a burning shard toward the crater.',
              defeat:
                '{lead} was forced back, but the pilgrims escaped while the hound gave chase. One of them saw a masked hunter carry a burning shard toward the crater.',
              roundCap:
                'The hound fled when the fallen star shook the road again. The pilgrims were safe, and one had seen a masked hunter carry a burning shard toward the crater.',
            },
            effects: effects(0, 0, 1, 0),
          },
        ],
      },
      {
        turn: 2,
        category: 'personal',
        templateId: 'opening-recruit-1',
        title: 'The Broken Bridge',
        actTitle: 'A Star Falls',
        objective: 'Cross the ravine before the crater road closes.',
        hook: 'At the broken bridge, {lead} finds {firstCompanion} lowering stranded children across the ravine. Each use of the Mythic Awakening {firstAwakening} pulls another stone loose.',
        cause: 'The fight on Starfall Road pointed {lead} toward the crater.',
        stakes:
          'Three children remain on the far side. The bridge will not survive another heavy crossing.',
        decision: 'Will {lead} cross to help, or secure the ropes from this side?',
        choices: [
          {
            id: 'fallen-opening-t2-cross',
            label: 'Cross the bridge',
            description: 'Share the danger and bring the children over together.',
            consequence:
              '{lead} crossed before the centre gave way. Together, {lead} and {firstCompanion} brought every child to safety. {firstCompanion} then joined the road to the crater.',
            effects: effects(1, 0, 1, 2),
          },
          {
            id: 'fallen-opening-t2-anchor',
            label: 'Secure the ropes',
            description: 'Build a safer line and guide the rescue from solid ground.',
            consequence:
              '{lead} tied the bridge to an old shrine while {firstCompanion} led the children across. The plan held. {firstCompanion} then joined the road to the crater.',
            effects: effects(0, 0, 0, 1),
          },
        ],
      },
      {
        turn: 3,
        category: 'operation',
        templateId: 'opening-recruit-2',
        title: 'The Guardians at the Crater',
        actTitle: 'A Star Falls',
        objective: 'Reach the buried shrine and follow the stolen shard.',
        hook: '{lead} and {firstCompanion} reach the crater as its guardians attack {secondCompanion} at the buried shrine. The Mythic Awakening {secondAwakening} holds the doorway, but cannot hold it alone.',
        cause:
          'The broken bridge led the two hunters to the crater before the mountain path closed.',
        stakes:
          'The masked thief’s trail runs through the shrine. If the guardians take the doorway, the trail and the trapped hunter will be lost.',
        decision: 'Set the three hunters’ formation and break through the guardians.',
        choices: [
          {
            id: 'fallen-opening-t3-fight',
            label: 'Fight for the shrine',
            description: 'Set formation, stances, and priority before the battle begins.',
            encounterId: 'm1-fallen-god-trial',
            consequence:
              'The three hunters reached the shrine and found the masked thief’s trail beside a fresh human name carved into godbone.',
            outcomeConsequences: {
              victory:
                'The three hunters defeated the guardians. Inside the shrine, they found the masked thief’s trail beside a fresh human name carved into godbone.',
              defeat:
                'The guardians drove the hunters from the doorway, but {secondCompanion} opened a narrow way inside. There they found the masked thief’s trail beside a fresh human name carved into godbone.',
              roundCap:
                'The crater shifted before either side could win. The hunters slipped into the shrine and found the masked thief’s trail beside a fresh human name carved into godbone.',
            },
            effects: effects(0, 0, 0, 1),
          },
        ],
      },
    ],
  },
  'underworld-tide': {
    id: 'opening-early-tide',
    worldId: 'underworld-tide',
    chapters: [
      {
        turn: 1,
        category: 'operation',
        templateId: 'opening-solo-tide',
        title: 'The Lancer at the Last Bell',
        actTitle: 'The Early Tide',
        objective: 'Protect the shore and reach the black stair.',
        hook: '{lead} is travelling alone when the sea retreats three nights early. A Drowned Lancer rises beside the last bell and charges the families crossing the bare seabed.',
        cause:
          'The black stair has opened without warning, and the Tide Guild has not reached the shore.',
        stakes:
          'The returning water will trap anyone still on the seabed. The lancer blocks the shortest road home.',
        decision: 'Choose a stance and stop the Drowned Lancer.',
        choices: [
          {
            id: 'tide-opening-t1-fight',
            label: 'Hold the road',
            description: 'Set your stance and let the battle play out.',
            encounterId: 'opening-drowned-lancer',
            consequence:
              '{lead} held the road until the families reached shore. A ferryman saw a masked hunter descend the black stair with the dead king’s seal.',
            outcomeConsequences: {
              victory:
                '{lead} broke the lancer’s charge and brought the families ashore. A ferryman saw a masked hunter descend the black stair with the dead king’s seal.',
              defeat:
                '{lead} was driven back, but the fight bought enough time for the families to escape. A ferryman saw a masked hunter descend the black stair with the dead king’s seal.',
              roundCap:
                'The returning tide pulled the lancer away before either side fell. The families escaped, and a ferryman saw a masked hunter descend with the dead king’s seal.',
            },
            effects: effects(0, 0, 1, 0),
          },
        ],
      },
      {
        turn: 2,
        category: 'personal',
        templateId: 'opening-recruit-1',
        title: 'The Skiff in the Mud',
        actTitle: 'The Early Tide',
        objective: 'Free the rescue skiff before the water returns.',
        hook: 'Below the last bell, {lead} finds {firstCompanion} trying to drag a rescue skiff from the mud. The Mythic Awakening {firstAwakening} keeps the drowned away, but the boat will not move.',
        cause: 'The fight at the bell revealed where the masked hunter went.',
        stakes:
          'The skiff carries medicine for the cliff village. If it remains stuck, the returning tide will smash it against the stair.',
        decision: 'Will {lead} pull the skiff free, or clear a channel to the sea?',
        choices: [
          {
            id: 'tide-opening-t2-pull',
            label: 'Pull together',
            description: 'Use strength and bring the skiff free at once.',
            consequence:
              '{lead} and {firstCompanion} pulled until the mud released the skiff. With the medicine safe, {firstCompanion} joined the descent to the black stair.',
            effects: effects(1, 0, 1, 2),
          },
          {
            id: 'tide-opening-t2-channel',
            label: 'Clear a channel',
            description: 'Take more time and let the returning water lift the boat.',
            consequence:
              '{lead} cut a channel while {firstCompanion} held back the drowned. The first wave lifted the skiff safely. {firstCompanion} then joined the descent to the black stair.',
            effects: effects(0, 0, 0, 1),
          },
        ],
      },
      {
        turn: 3,
        category: 'operation',
        templateId: 'opening-recruit-2',
        title: 'The Guardians Below the Bell',
        actTitle: 'The Early Tide',
        objective: 'Enter the black stair and follow the stolen seal.',
        hook: '{lead} and {firstCompanion} reach the black stair as drowned guardians close around {secondCompanion}. The Mythic Awakening {secondAwakening} keeps one survivor’s name alive, but the water is still rising.',
        cause: 'Saving the skiff gave the two hunters a safe route to the stair.',
        stakes:
          'The survivor knows where the masked hunter went. The three hunters must hold the landing long enough to save that memory.',
        decision: 'Set the three hunters’ formation and clear the landing.',
        choices: [
          {
            id: 'tide-opening-t3-fight',
            label: 'Hold the landing',
            description: 'Set formation, stances, and priority before the battle begins.',
            encounterId: 'secret-drowned-stair',
            consequence:
              'The three hunters saved the survivor. One memory remained: a masked thief carrying the dead king’s seal below the stair.',
            outcomeConsequences: {
              victory:
                'The three hunters drove the drowned from the landing. The survivor remembered a masked thief carrying the dead king’s seal below the stair.',
              defeat:
                'The drowned broke the formation, but the hunters carried the survivor above the flood. One memory remained: a masked thief carrying the dead king’s seal below the stair.',
              roundCap:
                'The returning tide ended the fight. The hunters saved the survivor, who remembered a masked thief carrying the dead king’s seal below the stair.',
            },
            effects: effects(0, 0, 1, 1),
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
    if (chapter.turn === 2 ? chapter.category === 'operation' : chapter.category !== 'operation') {
      throw new Error(`${journey.id} has combat in the wrong opening chapter.`);
    }
    if (chapter.turn === 2 ? chapter.choices.length !== 2 : chapter.choices.length !== 1) {
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
      ...chapter.choices.flatMap((choice) => [
        choice.label,
        choice.description,
        choice.consequence,
        ...(choice.outcomeConsequences === undefined
          ? []
          : Object.values(choice.outcomeConsequences)),
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
