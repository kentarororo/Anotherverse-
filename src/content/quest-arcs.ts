import type { MythicRole } from './mythic-review';
import type { ScenarioCategory } from '../engine/model/scenario';

export type QuestWorldId = 'fallen-heavens' | 'underworld-tide';

export interface QuestChoiceDefinition {
  id: string;
  label: string;
  description: string;
  consequence: string;
  outcomeConsequences?: {
    victory: string;
    defeat: string;
    roundCap: string;
  };
  encounterId?: string;
  effects: {
    renownDelta: number;
    provisionsDelta: number;
    dangerDelta: number;
    bondDelta: number;
  };
}

export interface QuestChapterDefinition {
  turn: number;
  act: 1 | 2 | 3 | 4;
  category: ScenarioCategory;
  templateId: string;
  leadRole: MythicRole;
  title: string;
  hook: string;
  stakes: string;
  decision: string;
  choices: readonly QuestChoiceDefinition[];
}

export interface QuestArcDefinition {
  id: string;
  title: string;
  worldId: QuestWorldId;
  centralQuestion: string;
  acts: readonly [
    { title: string; objective: string },
    { title: string; objective: string },
    { title: string; objective: string },
    { title: string; objective: string },
  ];
  chapters: readonly QuestChapterDefinition[];
}

export interface QuestChapterVariantDefinition {
  title: string;
  hook: string;
  stakes: string;
  decision: string;
  choices?: readonly QuestChoiceDefinition[];
}

const fx = (
  renownDelta: number,
  provisionsDelta: number,
  dangerDelta: number,
  bondDelta: number,
) => ({ renownDelta, provisionsDelta, dangerDelta, bondDelta });

const choice = (
  id: string,
  label: string,
  description: string,
  consequence: string,
  effects: ReturnType<typeof fx>,
): QuestChoiceDefinition => ({ id, label, description, consequence, effects });

const battle = (id: string, label: string, victory: string, defeat: string, roundCap: string) => ({
  ...choice(
    id,
    label,
    'Set the formation, stances, and team priority before the fight begins.',
    victory,
    fx(0, 0, 0, 0),
  ),
  outcomeConsequences: { victory, defeat, roundCap },
});

const fallenHeavens: QuestArcDefinition = {
  id: 'quest-fourth-god',
  title: 'The Fourth God',
  worldId: 'fallen-heavens',
  centralQuestion:
    'Who entered the fourth Godgrave before it fell, and what did they wake inside it?',
  acts: [
    {
      title: 'A Star Falls',
      objective: 'keep the carved bone and learn who reached the grave first',
    },
    { title: 'The Hidden Heart', objective: 'reach the sealed heart before {faction}' },
    {
      title: 'The Three Keys',
      objective: 'stop {faction} from using the trio to wake the fallen god',
    },
    {
      title: 'The Last Trial',
      objective: 'decide what should happen to the heart of the fourth god',
    },
  ],
  chapters: [
    {
      turn: 4,
      act: 1,
      category: 'rival',
      templateId: 'rival-1',
      leadRole: 'striker',
      title: 'Serin at the Gate',
      hook: 'Serin Kest, a Gold-rank hunter, blocks the road home and asks to see the carved bone.',
      stakes:
        'Serin can open doors inside the guild, but {faction} has paid him to bring the clue back.',
      decision: 'Will the trio show him the bone or keep it hidden?',
      choices: [
        choice(
          'fallen-t4-a',
          'Show Serin the bone',
          'Gain a skilled contact, but let the faction learn what the trio found.',
          'Serin saw the fresh name inside the bone and agreed to help. A spy from {faction} heard every word and called for a guild hearing.',
          fx(1, 0, 2, 1),
        ),
        choice(
          'fallen-t4-b',
          'Keep the bone hidden',
          'Protect the clue and make Serin choose a side.',
          'The trio refused to show the bone. Serin shouted his accusation across the road, and the guild called a hearing before {faction} could arrest them.',
          fx(0, 0, 1, -1),
        ),
      ],
    },
    {
      turn: 5,
      act: 1,
      category: 'social',
      templateId: 'social-1',
      leadRole: 'vanguard',
      title: 'The Guild Hearing',
      hook: 'Examiner Ilyan lays an empty evidence box on the table and asks the trio to surrender the bone.',
      stakes:
        'Giving it up earns lawful passage into the grave; refusing leaves the squad outside when the hidden stair opens at dawn.',
      decision: 'Will the trio trust Ilyan or leave with the clue?',
      choices: [
        choice(
          'fallen-t5-a',
          'Trust Examiner Ilyan',
          'Trade the bone for supplies and lawful access to the grave.',
          'Ilyan sealed the bone in the evidence box and issued three descent tokens. He also gave the trio supplies and ordered them to meet him at the hidden stair.',
          fx(1, 1, 0, 1),
        ),
        choice(
          'fallen-t5-b',
          'Leave with the clue',
          'Keep the bone and take a more dangerous way into the grave.',
          'The trio left with the bone before the guards closed the doors. Serin sent them a hand-drawn route to the hidden stair, but {faction} placed hunters on the road.',
          fx(0, 0, 2, 0),
        ),
      ],
    },
    {
      turn: 6,
      act: 2,
      category: 'operation',
      templateId: 'operation-2',
      leadRole: 'vanguard',
      title: 'Down the Hidden Stair',
      hook: 'At dawn, {enemyOne} crouches on the {hiddenRoute} while {enemyTwo} claws at a sealed door below.',
      stakes:
        'If the lower door breaks, {faction} will reach the god’s heart before the squad can follow.',
      decision: 'Choose the squad order and clear the stair.',
      choices: [
        battle(
          'fallen-t6-a',
          'Clear the hidden stair',
          'The trio cleared the stair and found a wounded shrinekeeper behind the lower door. She called {lead} by name before she fainted.',
          'The squad escaped into a side passage, but the guardians broke the lower door. They found the wounded shrinekeeper while {faction} advanced ahead of them.',
          'The guardians still held the stair when the squad withdrew. The wounded shrinekeeper opened a side door and pulled them through before it sealed.',
        ),
      ],
    },
    {
      turn: 7,
      act: 2,
      category: 'personal',
      templateId: 'personal-2',
      leadRole: 'vanguard',
      title: 'The Wounded Shrinekeeper',
      hook: 'The wounded shrinekeeper knows {lead} and repeats a memory the hero has never shared: {leadMemory}',
      stakes:
        'She can guide the trio to the sealed heart, but only if {lead} explains why the Awakening answered on the night their home fell.',
      decision: 'Will {lead} tell the truth in front of the squad or speak to her alone?',
      choices: [
        choice(
          'fallen-t7-a',
          'Tell the whole squad',
          'Share the old failure and strengthen the party.',
          '{lead} told the others the whole story. The shrinekeeper trusted the confession and marked a safe road on a strip of gravecloth.',
          fx(0, 0, 0, 3),
        ),
        choice(
          'fallen-t7-b',
          'Speak to her alone',
          'Keep the past private and take the quicker route.',
          '{lead} sent the others away and heard the shrinekeeper’s warning alone. She marked a shorter road, but the secrecy left the party uneasy.',
          fx(0, 1, 1, -2),
        ),
      ],
    },
    {
      turn: 8,
      act: 2,
      category: 'discovery',
      templateId: 'discovery-2',
      leadRole: 'support',
      title: 'The Wall of Three Hunters',
      hook: 'The marked road ends at a mural of three mortal hunters driving their weapons into a kneeling god.',
      stakes:
        'A fourth figure has been cut from the stone, and {faction} is searching the chamber for the missing piece.',
      decision: 'Will the trio copy the warning or pull the broken piece from the wall?',
      choices: [
        choice(
          'fallen-t8-a',
          'Copy the warning',
          'Keep the mural intact and carry a readable record to the guild.',
          'The trio copied every name and oath from the mural. The last line warned that three living Paths could open the heart, and Serin arrived in time to read it.',
          fx(1, 0, 0, 0),
        ),
        {
          ...choice(
            'fallen-t8-b',
            'Take the missing piece',
            'Gain the stone key and wake the ward protecting it.',
            'The trio pulled the missing hunter from the wall and found a stone key behind it. They defeated the chamber ward as Serin arrived.',
            fx(0, 0, 2, 0),
          ),
          encounterId: 'secret-awakened-ward',
          outcomeConsequences: {
            victory:
              'The trio took the stone key and defeated the chamber ward. Serin arrived as the last guardian fell.',
            defeat:
              'The chamber ward drove the trio from the mural. Serin pulled them into a side passage, but the stone key remained behind.',
            roundCap:
              'The trio held the chamber ward long enough for Serin to pry the stone key free. They escaped together before the floor collapsed.',
          },
        },
      ],
    },
    {
      turn: 9,
      act: 2,
      category: 'rival',
      templateId: 'rival-2',
      leadRole: 'striker',
      title: 'Serin’s Offer',
      hook: 'Serin lowers his spear and admits that {faction} hired him to find the heart.',
      stakes:
        'He knows where their hunters entered, but he wants the carved bone when the quest is over.',
      decision: 'Will the trio accept his help or race him to the heart?',
      choices: [
        choice(
          'fallen-t9-a',
          'Accept Serin’s help',
          'Gain an ally and promise him a claim on the final clue.',
          'Serin joined the descent and showed the trio a camp used by {faction}. Together they planned to move the families living above it before the attack.',
          fx(0, 1, -1, 2),
        ),
        choice(
          'fallen-t9-b',
          'Race Serin to the heart',
          'Keep the clue and force Serin to follow.',
          'The trio refused Serin’s price and took the lead. Serin followed at a distance, while scouts from {faction} began clearing the families above their camp.',
          fx(1, 0, 2, -1),
        ),
      ],
    },
    {
      turn: 10,
      act: 2,
      category: 'social',
      templateId: 'social-2',
      leadRole: 'support',
      title: 'The Village Above the Grave',
      hook: 'Mara Fen refuses to leave her village until every child has crossed the old rope bridge.',
      stakes:
        'Helping her costs time and food; pressing on gives {faction} no time to finish its camp below.',
      decision: 'Will the trio lead the evacuation or continue the descent?',
      choices: [
        choice(
          'fallen-t10-a',
          'Lead the evacuation',
          'Spend supplies to move the village before the attack.',
          'The trio led Mara’s families across the bridge and left them with one crate of food. Mara then showed the squad a well that opened inside the enemy camp.',
          fx(2, -1, 0, 2),
        ),
        choice(
          'fallen-t10-b',
          'Continue the descent',
          'Reach the enemy camp first and leave the village to Serin.',
          'The trio continued below while Serin stayed with Mara’s families. The squad reached the enemy camp unseen, but Serin would not be there for the first attack.',
          fx(0, 0, 1, -1),
        ),
      ],
    },
    {
      turn: 11,
      act: 3,
      category: 'operation',
      templateId: 'operation-3',
      leadRole: 'striker',
      title: 'Attack on the Heart Camp',
      hook: '{enemyOne} guards the camp entrance while {enemyTwo} carries the first heart-key toward a ritual fire.',
      stakes: 'Once the key burns, the trio will lose the only safe way through the heart door.',
      decision: 'Break the camp before the key reaches the fire.',
      choices: [
        battle(
          'fallen-t11-a',
          'Break the heart camp',
          'The trio broke the camp and recovered the first heart-key. In the ashes, {lead} heard the fallen god offer a private bargain.',
          'The squad retreated from the camp without the heart-key. In the ruins below, {lead} heard the fallen god offer a way past the locked door.',
          'Neither side could hold the camp. The heart-key fell into the ruins, and {lead} heard the fallen god offer a private bargain before anyone could recover it.',
        ),
      ],
    },
    {
      turn: 12,
      act: 3,
      category: 'personal',
      templateId: 'personal-3',
      leadRole: 'striker',
      title: 'The God’s Bargain',
      hook: 'The heart-key speaks in {lead}’s voice and promises enough strength to end the quest alone.',
      stakes:
        'Taking the strength will mark {lead} for {faction}; refusing means facing the heart guardian without it.',
      decision: 'Will {lead} take the mark or give the key to the squad?',
      choices: [
        choice(
          'fallen-t12-a',
          'Take the god’s mark',
          'Gain public proof of power and draw the faction closer.',
          '{lead} closed a hand around the key and accepted the burning mark. {faction} felt the heart answer and sent its leader to the final door.',
          fx(2, 0, 2, -1),
        ),
        choice(
          'fallen-t12-b',
          'Give the key to the squad',
          'Refuse the private bargain and share the burden.',
          '{lead} placed the key between the three heroes, and the mark divided into harmless lines across their hands. The shared mark revealed a message hidden inside the metal.',
          fx(0, 0, 0, 3),
        ),
      ],
    },
    {
      turn: 13,
      act: 3,
      category: 'discovery',
      templateId: 'discovery-3',
      leadRole: 'support',
      title: 'The Message in the Key',
      hook: 'The heart-key names the trio as three living locks, not three chosen champions.',
      stakes:
        '{faction} needs all three Paths at the final door; killing the heroes would ruin the ritual, but capturing them would complete it.',
      decision: 'Will the trio break the key now or use it to draw the faction leader out?',
      choices: [
        choice(
          'fallen-t13-a',
          'Break the heart-key',
          'Close the safest route and weaken the ritual.',
          'The trio broke the heart-key on the altar. The final door lost one lock, but {faction} seized Serin to replace it.',
          fx(1, 0, -1, 1),
        ),
        choice(
          'fallen-t13-b',
          'Use the key as bait',
          'Keep the route open and lure the faction leader closer.',
          'The trio sent a false message through the key. The leader of {faction} answered and brought Serin to the meeting place in chains.',
          fx(0, 0, 2, 0),
        ),
      ],
    },
    {
      turn: 14,
      act: 3,
      category: 'rival',
      templateId: 'rival-3',
      leadRole: 'vanguard',
      title: 'Serin in Chains',
      hook: 'Serin kneels before the final door with a binding chain around his spear arm.',
      stakes:
        'Freeing him risks the faction leader’s escape; taking his spear gives the trio a second key but leaves him behind.',
      decision: 'Will the trio free Serin or take the spear and run?',
      choices: [
        choice(
          'fallen-t14-a',
          'Free Serin',
          'Save an ally and let the faction leader reach the final chamber.',
          'The trio cut Serin free, and he drove the guards back from the door. The faction leader escaped inside, but Serin promised to guard the pilgrims gathering above.',
          fx(1, 0, 1, 3),
        ),
        choice(
          'fallen-t14-b',
          'Take Serin’s spear',
          'Gain the second key and lose Serin’s trust.',
          'The trio took the key hidden in Serin’s spear and left him in the chains. They reached the final chamber first, while frightened pilgrims gathered above without a defender.',
          fx(1, 0, 0, -3),
        ),
      ],
    },
    {
      turn: 15,
      act: 3,
      category: 'social',
      templateId: 'social-3',
      leadRole: 'support',
      title: 'Pilgrims at the Final Door',
      hook: 'Mara arrives with hundreds of pilgrims who believe the fourth god will answer their prayers.',
      stakes:
        'Sending them home clears the battlefield; asking them to hold the entrance keeps {faction} from surrounding the trio.',
      decision: 'Will the trio send the pilgrims away or ask them to stay?',
      choices: [
        choice(
          'fallen-t15-a',
          'Send the pilgrims home',
          'Protect the crowd and face the final guard alone.',
          'Mara led the pilgrims away from the grave. The final chamber was clear, but the trio had no one left to hold the road behind them.',
          fx(1, 0, -1, 1),
        ),
        choice(
          'fallen-t15-b',
          'Ask them to hold the road',
          'Gain help at the entrance and put the pilgrims in danger.',
          'Mara armed the pilgrims with shrine shields and held the road. Their stand kept {faction} outside while the trio entered the final chamber.',
          fx(2, -1, 1, 2),
        ),
      ],
    },
    {
      turn: 16,
      act: 4,
      category: 'discovery',
      templateId: 'discovery-4',
      leadRole: 'vanguard',
      title: 'The Waking Heart',
      hook: 'The living heart hangs above a sleeping guardian bound in black roots.',
      stakes:
        'The roots are breaking one by one, and the guardian will wake before the squad can study the prison.',
      decision: 'Will the trio take the guardian’s chain or cross the roots before it wakes?',
      choices: [
        {
          ...choice(
            'fallen-t16-a',
            'Take the guardian’s chain',
            'Gain a weapon for the final battle and wake the guardian early.',
            '{lead} pulled the chain free and the trio defeated the waking guardian. Black roots wrapped around the hero’s arm.',
            fx(1, 0, 2, 0),
          ),
          encounterId: 'secret-waking-guardian',
          outcomeConsequences: {
            victory:
              '{lead} took the chain and the trio defeated the waking guardian. Black roots wrapped around the hero’s arm.',
            defeat:
              'The guardian drove the trio from the heart. {lead} kept one broken link, but black roots had already reached the hero’s arm.',
            roundCap:
              'The trio held the guardian while {lead} broke one link from its chain. They withdrew as black roots reached the hero’s arm.',
          },
        },
        choice(
          'fallen-t16-b',
          'Cross the heart roots',
          'Reach the prison quietly and leave the guardian bound for now.',
          'The trio crossed the roots without waking the guardian. Black roots wrapped around {lead}’s arm, and the last chain began to crack behind them.',
          fx(0, 0, 0, 2),
        ),
      ],
    },
    {
      turn: 17,
      act: 4,
      category: 'personal',
      templateId: 'personal-4',
      leadRole: 'vanguard',
      title: 'The Curse on the Shield',
      hook: 'Black roots spread across {lead}’s arm each time the heart beats.',
      stakes:
        'One hero can carry the curse safely for a day, or all three can share it and weaken their Paths together.',
      decision: 'Will {lead} bear the curse alone or divide it with the squad?',
      choices: [
        choice(
          'fallen-t17-a',
          'Bear the curse alone',
          'Protect the others and let the heart change one hero.',
          '{lead} took the whole curse and remained standing. When the hero touched the heart, they saw the first hunters build its prison, but {faction} also learned where the trio was.',
          fx(1, 0, 2, -1),
        ),
        choice(
          'fallen-t17-b',
          'Share the curse',
          'Trust the squad and divide the danger between them.',
          'The trio joined hands and divided the black roots between them. Together they opened the heart’s oldest memory without alerting {faction}.',
          fx(0, 0, 0, 3),
        ),
      ],
    },
    {
      turn: 18,
      act: 4,
      category: 'discovery',
      templateId: 'discovery-4',
      leadRole: 'support',
      title: 'What the Fourth God Imprisoned',
      hook: 'The heart’s memory shows the fourth god begging the first three hunters to kill it.',
      stakes:
        'Its body is a prison for the nameless thing that broke the moon; destroying the heart may free that prisoner.',
      decision: 'Will the trio prepare to seal the heart or risk destroying it forever?',
      choices: [
        choice(
          'fallen-t18-a',
          'Prepare the old seal',
          'Preserve the prison and place its burden on future guardians.',
          'The trio restored the three hunter marks around the heart. Serin reached the chamber with a broken chain at his wrist and offered to complete the seal.',
          fx(1, -1, -1, 2),
        ),
        choice(
          'fallen-t18-b',
          'Prepare to destroy the heart',
          'Risk releasing the prisoner to end the Godgrave forever.',
          'The trio cut the heart free from its roots. Serin reached the chamber with a broken chain at his wrist and demanded one last chance to stop the destruction.',
          fx(2, 0, 2, -1),
        ),
      ],
    },
    {
      turn: 19,
      act: 4,
      category: 'rival',
      templateId: 'rival-4',
      leadRole: 'striker',
      title: 'Serin’s Last Oath',
      hook: 'Serin stands between the trio and the heart with his broken spear laid on the floor.',
      stakes:
        'The guardian has reached the guild hall, and the heart must be sealed or destroyed after the battle.',
      decision: 'Will the trio seal the prison with Serin or destroy the heart?',
      choices: [
        choice(
          'fallen-t19-a',
          'Seal the prison with Serin',
          'Keep the nameless prisoner contained and create a new order of guardians.',
          'Serin swore to help seal the heart and carried the old hunter marks into the guild hall. {faction} released the final guardians before the rite could begin.',
          fx(1, 0, -1, 3),
        ),
        choice(
          'fallen-t19-b',
          'Destroy the heart',
          'End the Godgrave and risk freeing what the heart contains.',
          'The trio cut the heart from its final roots and carried it into the guild hall. {faction} released the final guardians to stop them destroying it.',
          fx(1, 0, 2, -2),
        ),
      ],
    },
    {
      turn: 20,
      act: 4,
      category: 'operation',
      templateId: 'operation-4',
      leadRole: 'support',
      title: 'The Last Battle of the Fourth God',
      hook: '{enemyOne} tears through the guild doors while {enemyTwo} rushes toward the unsealed heart.',
      stakes:
        'If the guardians reach the heart, the prison will open before the sealing rite begins.',
      decision: 'Set the final formation and defend the sealing rite.',
      choices: [
        battle(
          'fallen-t20-a',
          'Defend the sealing rite',
          'The trio defeated the final guardians. Serin sealed the heart beneath a new shrine, and the realm began its first public watch over the prison.',
          'The final guardians broke the formation. The squad saved the heart, but the damaged seal will need hunters at the shrine every night.',
          'The battle lasted until the heart began to split. Serin completed a weaker seal, and the realm heard the prisoner moving below.',
        ),
      ],
    },
  ],
};

const underworldTide: QuestArcDefinition = {
  id: 'quest-last-bell',
  title: 'The Bell Beneath the Sea',
  worldId: 'underworld-tide',
  centralQuestion:
    'Why is a dead king’s bell ringing before his death, and whose memories keep it silent?',
  acts: [
    {
      title: 'The Early Tide',
      objective: 'find the royal seal and learn why the sea opened early',
    },
    { title: 'The Drowned Road', objective: 'reach the bell chamber before {faction}' },
    {
      title: 'The King’s Shadow',
      objective: 'stop {faction} from crowning an awakened hunter in the underworld',
    },
    { title: 'Dawn’s Price', objective: 'decide what Morcant must pay when the sea returns' },
  ],
  chapters: [
    {
      turn: 4,
      act: 1,
      category: 'rival',
      templateId: 'rival-1',
      leadRole: 'striker',
      title: 'Captain Cael on the Shore',
      hook: 'Captain Cael, the king’s best tide hunter, waits beside the black stair and asks to see the royal seal.',
      stakes:
        'Cael can grant lawful passage below the sea, but {faction} has promised him a cure for his drowned brother.',
      decision: 'Will the trio show him the seal or keep it hidden?',
      choices: [
        choice(
          'tide-t4-a',
          'Show Cael the seal',
          'Gain a royal contact and let the faction know what the trio found.',
          'Cael recognised the king’s private mark and agreed to help. A singer from {faction} overheard him and called for a hearing at the tide guild.',
          fx(1, 0, 2, 1),
        ),
        choice(
          'tide-t4-b',
          'Keep the seal hidden',
          'Protect the evidence and make Cael choose whether to pursue.',
          'The trio hid the seal and walked away. Cael accused them before the waiting hunters, and the tide guild called a hearing before the next bell.',
          fx(0, 0, 1, -1),
        ),
      ],
    },
    {
      turn: 5,
      act: 1,
      category: 'social',
      templateId: 'social-1',
      leadRole: 'vanguard',
      title: 'The Tide Guild Hearing',
      hook: 'Examiner Rhea places an empty salt box on the table and asks the trio to surrender the royal seal.',
      stakes:
        'Giving it up opens the guarded stair; refusing means finding another road before the sea returns.',
      decision: 'Will the trio trust Rhea or leave with the evidence?',
      choices: [
        choice(
          'tide-t5-a',
          'Trust Examiner Rhea',
          'Trade the seal for supplies and lawful passage below.',
          'Rhea locked the seal in the salt box and issued three descent coins. She gave the trio supplies and ordered them to meet her at the black stair.',
          fx(1, 1, 0, 1),
        ),
        choice(
          'tide-t5-b',
          'Leave with the seal',
          'Keep the evidence and take the unguarded drowned road.',
          'The trio left before the guild doors closed. Cael sent them a map to the drowned road, but hunters from {faction} were already waiting there.',
          fx(0, 0, 2, 0),
        ),
      ],
    },
    {
      turn: 6,
      act: 2,
      category: 'operation',
      templateId: 'operation-2',
      leadRole: 'vanguard',
      title: 'The First Landing',
      hook: '{enemyOne} blocks the {hiddenRoute} while {enemyTwo} drags a bell rope into the dark water.',
      stakes:
        'If the rope reaches the depths, the drowned road will close before the squad reaches the ferryman.',
      decision: 'Choose the squad order and clear the landing.',
      choices: [
        battle(
          'tide-t6-a',
          'Clear the first landing',
          'The trio cleared the landing and found the ferryman chained beneath the bell. He called {lead} by a childhood name.',
          'The squad escaped the landing in the ferryman’s empty boat, but the drowned took the bell-rope below. The ferryman called {lead} by a childhood name.',
          'The drowned still held the landing when the ferryman cut his own chain and pulled the squad into his boat. He called {lead} by a childhood name.',
        ),
      ],
    },
    {
      turn: 7,
      act: 2,
      category: 'personal',
      templateId: 'personal-2',
      leadRole: 'vanguard',
      title: 'The Ferryman Knows Your Name',
      hook: 'The ferryman knows {lead} and repeats a stolen memory: {leadMemory}',
      stakes:
        'He will guide the trio to the bell, but only after {lead} explains why that memory was left in the underworld.',
      decision: 'Will {lead} tell the whole squad or hear the memory alone?',
      choices: [
        choice(
          'tide-t7-a',
          'Tell the whole squad',
          'Share the old wound and strengthen the party.',
          '{lead} told the others why the memory had been abandoned. The ferryman trusted the confession and offered a safe place in his boat.',
          fx(0, 0, 0, 3),
        ),
        choice(
          'tide-t7-b',
          'Hear the memory alone',
          'Keep the past private and take the quicker drowned road.',
          '{lead} sent the others away and heard the ferryman’s price alone. He offered a shorter road, but the secrecy left the party uneasy.',
          fx(0, 1, 1, -2),
        ),
      ],
    },
    {
      turn: 8,
      act: 2,
      category: 'discovery',
      templateId: 'discovery-2',
      leadRole: 'support',
      title: 'The Ferryman’s Ledger',
      hook: 'The ferryman opens a book filled with memories taken from families on the shore.',
      stakes:
        'The king’s name appears on every page, and {faction} is searching the boat for the final entry.',
      decision: 'Will the trio copy the king’s bargain or take the page that bears his name?',
      choices: [
        choice(
          'tide-t8-a',
          'Copy the king’s bargain',
          'Leave the ledger intact and carry proof back to the guild.',
          'The trio copied the king’s promise to feed the tide one memory each month. Captain Cael boarded the boat in time to read the final line.',
          fx(1, 0, 0, 0),
        ),
        {
          ...choice(
            'tide-t8-b',
            'Take the king’s page',
            'Keep the original proof and wake the dead who guard it.',
            'The trio took the king’s page and defeated its drowned guards. Captain Cael arrived as the last hand slipped from the rail.',
            fx(0, 0, 2, 0),
          ),
          encounterId: 'secret-drowned-ward',
          outcomeConsequences: {
            victory:
              'The trio took the king’s page and defeated its drowned guards. Captain Cael arrived as the last hand slipped from the rail.',
            defeat:
              'The drowned guards forced the trio to abandon the king’s page. Captain Cael hauled them onto his boat before the dead could follow.',
            roundCap:
              'The trio held the drowned guards while Captain Cael cut the king’s page free. His boat carried them away before the dead reached the rail.',
          },
        },
      ],
    },
    {
      turn: 9,
      act: 2,
      category: 'rival',
      templateId: 'rival-2',
      leadRole: 'striker',
      title: 'Cael’s Bargain',
      hook: 'Cael lowers his spear and admits that {faction} promised to return his brother’s stolen memories.',
      stakes:
        'He knows a path to the bell chamber, but he wants the trio’s evidence when the quest is over.',
      decision: 'Will the trio accept his help or take the flooded gallery without him?',
      choices: [
        choice(
          'tide-t9-a',
          'Accept Cael’s help',
          'Gain an ally and promise him a claim on the evidence.',
          'Cael joined the boat and showed the trio where {faction} kept its prisoners. Together they planned to move the shore families before the next bell.',
          fx(0, 1, -1, 2),
        ),
        choice(
          'tide-t9-b',
          'Take the flooded gallery',
          'Keep the evidence and leave Cael behind.',
          'The trio entered the flooded gallery without Cael. They reached the prisoners first, but Cael stayed behind with the families waiting on shore.',
          fx(1, 0, 2, -1),
        ),
      ],
    },
    {
      turn: 10,
      act: 2,
      category: 'social',
      templateId: 'social-2',
      leadRole: 'support',
      title: 'Nessa’s Family',
      hook: 'Nessa Vale refuses to board the rescue boat until her white-eyed father remembers her name.',
      stakes:
        'Helping him costs time and food; pressing on gives {faction} no time to move the prisoners.',
      decision: 'Will the trio help Nessa’s father or continue toward the bell?',
      choices: [
        choice(
          'tide-t10-a',
          'Help Nessa’s father',
          'Spend supplies to restore one stolen memory.',
          'The trio spoke the king’s written promise back to the tide. Nessa’s father remembered her name, and she showed them a well that opened inside the drowned chapel.',
          fx(2, -1, 0, 2),
        ),
        choice(
          'tide-t10-b',
          'Continue toward the bell',
          'Reach the chapel first and leave the family with Cael.',
          'The trio continued below while Cael stayed with Nessa’s family. They reached the drowned chapel unseen, but Cael would not be there for the first attack.',
          fx(0, 0, 1, -1),
        ),
      ],
    },
    {
      turn: 11,
      act: 3,
      category: 'operation',
      templateId: 'operation-3',
      leadRole: 'striker',
      title: 'The Drowned Chapel',
      hook: '{enemyOne} guards the chapel door while {enemyTwo} carries the second bell-rope toward a black flame.',
      stakes: 'Once the rope burns, the trio will lose the only safe road to the final bell.',
      decision: 'Break the chapel guard before the rope reaches the fire.',
      choices: [
        battle(
          'tide-t11-a',
          'Break the chapel guard',
          'The trio broke the chapel guard and recovered the second bell-rope. In the ashes, {lead} heard the dead king offer a private crown.',
          'The chapel guard kept the second rope, but the squad escaped through the crypt. There, {lead} heard the dead king offer a private crown.',
          'The rope burned while both sides fought. In the smoke below the chapel, {lead} heard the dead king offer a private crown.',
        ),
      ],
    },
    {
      turn: 12,
      act: 3,
      category: 'personal',
      templateId: 'personal-3',
      leadRole: 'striker',
      title: 'The Dead King’s Crown',
      hook: 'The bell-rope coils around {lead}’s wrist and promises enough strength to cross the underworld alone.',
      stakes:
        'Taking the crown will mark {lead} for {faction}; refusing means facing the bell guardian without it.',
      decision: 'Will {lead} accept the crown or give the rope to the squad?',
      choices: [
        choice(
          'tide-t12-a',
          'Accept the dead crown',
          'Gain visible power and draw the faction closer.',
          '{lead} accepted the cold crown and heard every drowned voice at once. {faction} felt the bell answer and sent its leader to the final stair.',
          fx(2, 0, 2, -1),
        ),
        choice(
          'tide-t12-b',
          'Give the rope to the squad',
          'Refuse the private bargain and share its burden.',
          '{lead} placed the rope between the three heroes, and its frost divided across their hands. Together they heard a message hidden in the bell metal.',
          fx(0, 0, 0, 3),
        ),
      ],
    },
    {
      turn: 13,
      act: 3,
      category: 'discovery',
      templateId: 'discovery-3',
      leadRole: 'support',
      title: 'The King’s First Bargain',
      hook: 'The hidden message says the living king opened the tide to bury an army beneath his palace.',
      stakes:
        '{faction} needs one marked awakened hunter to ring the final bell and place the drowned army under a new crown.',
      decision: 'Will the trio break the bell-rope or use it to call the faction leader out?',
      choices: [
        choice(
          'tide-t13-a',
          'Break the bell-rope',
          'Close the safest route and weaken the crowning rite.',
          'The trio broke the rope on the altar. The final bell lost one voice, but {faction} seized Captain Cael to replace it.',
          fx(1, 0, -1, 1),
        ),
        choice(
          'tide-t13-b',
          'Use the rope as bait',
          'Keep the route open and lure the faction leader closer.',
          'The trio rang one false note through the rope. The leader of {faction} answered and brought Captain Cael to the meeting place in chains.',
          fx(0, 0, 2, 0),
        ),
      ],
    },
    {
      turn: 14,
      act: 3,
      category: 'rival',
      templateId: 'rival-3',
      leadRole: 'vanguard',
      title: 'Cael in Chains',
      hook: 'Cael kneels on the final stair with a binding chain around his spear arm.',
      stakes:
        'Freeing him risks the faction leader’s escape; taking his royal token gives the trio passage but leaves him behind.',
      decision: 'Will the trio free Cael or take the token and run?',
      choices: [
        choice(
          'tide-t14-a',
          'Free Captain Cael',
          'Save an ally and let the faction leader reach the bell chamber.',
          'The trio cut Cael free, and he drove the guards from the stair. The faction leader escaped below, but Cael promised to guard the families gathering on shore.',
          fx(1, 0, 1, 3),
        ),
        choice(
          'tide-t14-b',
          'Take the royal token',
          'Gain passage and lose Cael’s trust.',
          'The trio took the royal token from Cael and left him in the chains. They reached the bell chamber first, while frightened families gathered on shore without a defender.',
          fx(1, 0, 0, -3),
        ),
      ],
    },
    {
      turn: 15,
      act: 3,
      category: 'social',
      templateId: 'social-3',
      leadRole: 'support',
      title: 'The White-Eyed Return',
      hook: 'Nessa arrives with dozens of returned hunters who cannot remember the families waiting for them.',
      stakes:
        'Sending them home clears the stair; asking them to hold it keeps {faction} from surrounding the trio.',
      decision: 'Will the trio lead the returned hunters home or ask them to stay?',
      choices: [
        choice(
          'tide-t15-a',
          'Lead them home',
          'Protect the returned hunters and face the final guard alone.',
          'Nessa led the returned hunters toward the shore. The bell chamber was clear, but the trio had no one left to hold the stair behind them.',
          fx(1, 0, -1, 1),
        ),
        choice(
          'tide-t15-b',
          'Ask them to hold the stair',
          'Gain help at the entrance and put the returned hunters in danger.',
          'Nessa armed the returned hunters with boat hooks and held the stair. Their stand kept {faction} outside while the trio entered the bell chamber.',
          fx(2, -1, 1, 2),
        ),
      ],
    },
    {
      turn: 16,
      act: 4,
      category: 'discovery',
      templateId: 'discovery-4',
      leadRole: 'vanguard',
      title: 'The Bell Begins to Move',
      hook: 'The final bell hangs above a sleeping guardian bound by its own rope.',
      stakes:
        'The rope is tearing, and the guardian will wake before the squad can read the royal marks.',
      decision: 'Will the trio take the bell-rope or climb the frame before it wakes?',
      choices: [
        {
          ...choice(
            'tide-t16-a',
            'Take the bell-rope',
            'Gain control of the bell and wake its guardian early.',
            '{lead} cut the rope free and the trio defeated the waking guardian. A black crown spread across the hero’s arm.',
            fx(1, 0, 2, 0),
          ),
          encounterId: 'secret-bell-guardian',
          outcomeConsequences: {
            victory:
              '{lead} took the bell-rope and the trio defeated the waking guardian. A black crown spread across the hero’s arm.',
            defeat:
              'The guardian drove the trio from the bell. {lead} kept one length of rope, but the black crown had already reached the hero’s arm.',
            roundCap:
              'The trio held the guardian while {lead} cut one length of rope free. They withdrew as the black crown reached the hero’s arm.',
          },
        },
        choice(
          'tide-t16-b',
          'Climb the bell frame',
          'Reach the royal marks quietly and leave the guardian bound for now.',
          'The trio climbed without waking the guardian. A black crown spread across {lead}’s arm, and the last strand of rope began to tear below.',
          fx(0, 0, 0, 2),
        ),
      ],
    },
    {
      turn: 17,
      act: 4,
      category: 'personal',
      templateId: 'personal-4',
      leadRole: 'vanguard',
      title: 'The Royal Mark',
      hook: 'A black crown spreads across {lead}’s arm each time the bell moves.',
      stakes:
        'One hero can carry the mark safely until dawn, or all three can share it and hear the drowned together.',
      decision: 'Will {lead} bear the mark alone or divide it with the squad?',
      choices: [
        choice(
          'tide-t17-a',
          'Bear the mark alone',
          'Protect the others and let the crown change one hero.',
          '{lead} took the whole royal mark and remained standing. When the hero touched the bell, they saw the king order the first memories taken, but {faction} also learned where the trio was.',
          fx(1, 0, 2, -1),
        ),
        choice(
          'tide-t17-b',
          'Share the royal mark',
          'Trust the squad and divide the danger between them.',
          'The trio joined hands and divided the black crown between them. Together they opened the bell’s oldest memory without alerting {faction}.',
          fx(0, 0, 0, 3),
        ),
      ],
    },
    {
      turn: 18,
      act: 4,
      category: 'discovery',
      templateId: 'discovery-4',
      leadRole: 'support',
      title: 'Why the Tide Returns',
      hook: 'The bell’s memory shows the living king feeding his people’s memories to keep the drowned army asleep.',
      stakes:
        'Breaking the crown will return every stolen memory and wake the army; restoring it keeps the coast safe by continuing the theft.',
      decision: 'Will the trio prepare to break the crown or restore its old bargain?',
      choices: [
        choice(
          'tide-t18-a',
          'Prepare to break the crown',
          'Return the stolen memories and risk waking the drowned army.',
          'The trio cut the crown from the bell. Cael reached the chamber with a broken chain at his wrist and demanded a place in the final choice.',
          fx(2, 0, 2, 1),
        ),
        choice(
          'tide-t18-b',
          'Prepare to restore the crown',
          'Keep the army asleep and preserve the cruel bargain.',
          'The trio tied the severed rope back around the bell. Cael reached the chamber with a broken chain at his wrist and offered to share the restored oath.',
          fx(1, -1, -1, 2),
        ),
      ],
    },
    {
      turn: 19,
      act: 4,
      category: 'rival',
      templateId: 'rival-4',
      leadRole: 'striker',
      title: 'Cael’s Last Oath',
      hook: 'Cael stands beside the bell with his broken spear laid across both hands.',
      stakes:
        'The guardian has reached the shore, and the crown must be restored or broken after the battle.',
      decision: 'Will the trio restore the crown with Cael or break it before the coast?',
      choices: [
        choice(
          'tide-t19-a',
          'Restore the crown with Cael',
          'Keep the drowned army asleep and make the realm share the cost openly.',
          'Cael swore to share the restored oath and carried the crown onto the shore. {faction} released the final guardians before the rite could begin.',
          fx(1, 0, -1, 3),
        ),
        choice(
          'tide-t19-b',
          'Break the crown',
          'Return the stolen memories and accept the army waking below.',
          'The trio carried the severed crown onto the shore before dawn. {faction} released the final guardians to stop them breaking it.',
          fx(1, 0, 2, -2),
        ),
      ],
    },
    {
      turn: 20,
      act: 4,
      category: 'operation',
      templateId: 'operation-4',
      leadRole: 'support',
      title: 'The Last Battle at Dawn',
      hook: '{enemyOne} climbs from the surf while {enemyTwo} rushes toward the crown on the wet sand.',
      stakes:
        'If the guardians reach the crown, the drowned army will wake before Cael can restore the oath.',
      decision: 'Set the final formation and defend the restored crown.',
      choices: [
        battle(
          'tide-t20-a',
          'Defend the restored crown',
          'The trio defeated the final guardians. Cael restored the crown before the whole coast, and every guild and noble house took a month of its cost.',
          'The final guardians broke the formation. The squad saved the crown, but the damaged oath will take one memory from every coastal family this year.',
          'The battle lasted until the sea began to return. Cael restored a weaker oath, and the drowned stirred beneath the black water.',
        ),
      ],
    },
  ],
};

export const QUEST_ARCS: Readonly<Record<QuestWorldId, QuestArcDefinition>> = {
  'fallen-heavens': fallenHeavens,
  'underworld-tide': underworldTide,
};

/**
 * Whole-scene alternatives provide seeded variety without assembling prose from fragments. Each
 * alternative occupies the same point in its quest and hands the next chapter a complete result.
 */
export const QUEST_CHAPTER_VARIANTS: Readonly<
  Record<QuestWorldId, Partial<Record<number, readonly QuestChapterVariantDefinition[]>>>
> = {
  'fallen-heavens': {
    4: [
      {
        title: 'The Witness in Ash',
        hook: 'A young trial hunter stops {lead} before Serin can reach the trio. She saw him take silver from {faction}.',
        stakes:
          'Her testimony can expose Serin, but speaking at the guild will place her family in danger.',
        decision: 'Will the trio ask her to testify or send her somewhere safe?',
        choices: [
          choice(
            'fallen-v4-a',
            'Ask her to testify',
            'Expose Serin at the hearing and put the witness at risk.',
            'The young hunter agreed to testify, and Serin followed her into the guild hall. Examiner Ilyan called an immediate hearing before {faction} could silence her.',
            fx(1, 0, 2, 1),
          ),
          choice(
            'fallen-v4-b',
            'Send her somewhere safe',
            'Protect the witness and face Serin without her evidence.',
            'The trio hid the witness with Mara Fen. Serin denied taking the silver, and Examiner Ilyan called a hearing to settle the accusation.',
            fx(0, -1, 1, 1),
          ),
        ],
      },
    ],
    5: [
      {
        title: 'Ilyan’s Descent Tokens',
        hook: 'Examiner Ilyan places three bronze descent tokens in front of {lead}.',
        stakes:
          'The tokens open the lawful stair at dawn; the clue can instead reveal an older road that the guild cannot close.',
        decision: 'Will the trio trade the clue for the tokens or leave by the old road?',
        choices: [
          choice(
            'fallen-v5-a',
            'Take the descent tokens',
            'Gain supplies and lawful passage, but leave the clue with Ilyan.',
            'Ilyan locked the clue away and issued three descent tokens with fresh supplies. He told the trio to meet him at the hidden stair.',
            fx(1, 1, 0, 1),
          ),
          choice(
            'fallen-v5-b',
            'Use the old road',
            'Keep the clue and enter without guild protection.',
            'The trio kept the clue and left through the guild kitchen. Serin’s map led to the hidden stair, where hunters from {faction} were already waiting.',
            fx(0, 0, 2, 0),
          ),
        ],
      },
    ],
    6: [
      {
        title: 'The Stair in the God’s Spine',
        hook: '{enemyOne} hunts along the ribs above the {hiddenRoute}, while {enemyTwo} tears at a shrine door below.',
        stakes:
          'The shrinekeeper behind that door knows the road to the heart, and {faction} is one chamber away.',
        decision: 'Choose the squad order and reach the shrinekeeper.',
      },
    ],
    7: [
      {
        title: 'The Shrinekeeper’s Debt',
        hook: 'The wounded shrinekeeper recognises {lead} from this memory: {leadMemory}',
        stakes:
          'She knows the road to the heart, but blood loss will kill her before she can guide anyone.',
        decision: 'Will {lead} spend supplies treating her or carry her while the squad moves?',
        choices: [
          choice(
            'fallen-v7-a',
            'Treat her wounds',
            'Spend supplies and earn a guide who can walk beside the party.',
            '{lead} treated the shrinekeeper while the squad kept watch. She drew a safe road on gravecloth and led them to a wall carved with three hunters.',
            fx(0, -1, 0, 2),
          ),
          choice(
            'fallen-v7-b',
            'Carry her onward',
            'Save time, but make the road harder for the whole squad.',
            '{lead} carried the shrinekeeper through the dark. She pointed out a shorter road, but the strain left the party tired when they reached the carved wall.',
            fx(0, 0, 1, 1),
          ),
        ],
      },
    ],
    8: [
      {
        title: 'Names Beneath the Plaster',
        hook: 'The shrinekeeper asks {lead} to wash ash from a wall carved with the names of three hunters who killed a god.',
        stakes:
          'The fourth name lies under a royal seal, and agents of {faction} are entering the chamber.',
        decision: 'Will the trio break the seal or hide the names again?',
        choices: [
          choice(
            'fallen-v8-a',
            'Break the royal seal',
            'Reveal the missing name and wake the old ward.',
            'The trio broke the seal and found a stone key beside the missing name. The ward woke, and Serin arrived while the wall was still shaking.',
            fx(0, 0, 2, 0),
          ),
          choice(
            'fallen-v8-b',
            'Hide the names again',
            'Protect the dead hunters’ secret and carry away a careful copy.',
            'The trio copied the four names and covered them with ash. Serin arrived before the agents of {faction} and read the warning from their page.',
            fx(1, 0, 0, 1),
          ),
        ],
      },
    ],
    9: [
      {
        title: 'Poison on Serin’s Spear',
        hook: 'Serin reaches {lead} with black poison spreading from a cut in his hand.',
        stakes:
          'He knows the road to the enemy camp, but the poison will reach his heart before the next chamber.',
        decision: 'Will the trio use its cure on Serin or take his map and leave?',
        choices: [
          choice(
            'fallen-v9-a',
            'Give Serin the cure',
            'Spend supplies and gain Serin as an ally for the descent.',
            'The cure stopped the poison. Serin joined the trio and led them toward the village above the enemy camp.',
            fx(0, -1, -1, 2),
          ),
          choice(
            'fallen-v9-b',
            'Take his map',
            'Keep the cure and leave Serin to find his own way out.',
            'The trio took Serin’s map and left him near the surface road. Scouts from {faction} were already clearing the village above their camp.',
            fx(1, 0, 2, -1),
          ),
        ],
      },
    ],
    10: [
      {
        title: 'The Broken Rope Bridge',
        hook: '{lead} finds Mara Fen’s last group of children trapped beyond a rope bridge cut by {faction}.',
        stakes:
          'Repairing it costs time and rope; crossing the ravine below leaves the enemy camp unguarded.',
        decision: 'Will the trio repair the bridge or guide the children through the ravine?',
        choices: [
          choice(
            'fallen-v10-a',
            'Repair the bridge',
            'Spend provisions and move every child before the attack.',
            'The trio repaired the bridge and moved every child. Mara led the families toward safety while the squad turned toward the enemy camp.',
            fx(1, -2, 1, 2),
          ),
          choice(
            'fallen-v10-b',
            'Use the ravine',
            'Save the rope and risk meeting enemy scouts below.',
            'The trio guided the children through the ravine and reached the enemy camp from below. Mara stayed behind to hide their tracks.',
            fx(0, 0, 2, 1),
          ),
        ],
      },
    ],
    11: [
      {
        title: 'Fire at the Heart Camp',
        hook: '{enemyOne} drives prisoners toward the ritual fire while {enemyTwo} carries the heart-key away from the flames.',
        stakes:
          'The squad must break the camp before the prisoners are burned and the only key disappears.',
        decision: 'Choose the squad order and take the camp.',
      },
    ],
    12: [
      {
        title: 'A Voice Behind the Door',
        hook: 'The recovered key whispers to {lead} in the voice of the fallen god.',
        stakes:
          'The voice can open the heart door now, but only if {lead} promises to carry one piece of the god outside.',
        decision: 'Will {lead} make the promise or silence the key?',
        choices: [
          choice(
            'fallen-v12-a',
            'Make the promise',
            'Open the door now and owe the fallen god a living debt.',
            '{lead} promised to carry one seed from the heart. The key opened and showed a memory of the fourth hunter hiding a message inside it.',
            fx(1, 0, 2, -1),
          ),
          choice(
            'fallen-v12-b',
            'Silence the key',
            'Refuse the debt and force the door by mortal hands.',
            '{lead} wrapped the key in gravecloth until the voice stopped. The squad forced it open and found the fourth hunter’s message inside.',
            fx(0, -1, 0, 2),
          ),
        ],
      },
    ],
    13: [
      {
        title: 'The Fourth Hunter’s Letter',
        hook: '{lead} finds a letter sealed inside the heart-key and addressed to the next three awakened hunters.',
        stakes:
          'It names a traitor in the guild, but reading it aloud will reveal the squad’s position to {faction}.',
        decision: 'Will the trio read the letter now or carry it unopened to Ilyan?',
        choices: [
          choice(
            'fallen-v13-a',
            'Read the letter now',
            'Learn the traitor’s name and warn every enemy in the grave.',
            'The trio read the letter and learned who sold the first hunters to the god. Hunters from {faction} heard the words and chained Serin at the final gate.',
            fx(1, 0, 2, 0),
          ),
          choice(
            'fallen-v13-b',
            'Carry it to Ilyan',
            'Protect the message and trust the examiner to open it later.',
            'The trio kept the letter sealed and sent it toward Ilyan. Hunters from {faction} seized the courier and chained Serin at the final gate.',
            fx(0, -1, 1, 1),
          ),
        ],
      },
    ],
    14: [
      {
        title: 'The Prisoner Exchange',
        hook: '{lead} finds Serin and the shrinekeeper held on opposite sides of a closing gate by {faction}.',
        stakes:
          'The squad can reach only one side before the stone falls; the other prisoner must find a different escape.',
        decision: 'Will the trio reach Serin or the shrinekeeper first?',
        choices: [
          choice(
            'fallen-v14-a',
            'Reach Serin first',
            'Free the fighter and leave the guide a harder escape.',
            'The trio freed Serin before the gate fell. The shrinekeeper escaped through an old prayer shaft and sent pilgrims to the final door.',
            fx(1, 0, 1, 1),
          ),
          choice(
            'fallen-v14-b',
            'Reach the shrinekeeper first',
            'Save the guide and leave Serin to break his own chain.',
            'The trio pulled the shrinekeeper clear. Serin broke his chain against the falling gate and sent word that he would follow after the pilgrims.',
            fx(0, -1, 1, 2),
          ),
        ],
      },
    ],
    15: [
      {
        title: 'The Door That Eats Relics',
        hook: 'The final door opens one stone mouth and asks {lead} for a relic carrying a human promise.',
        stakes:
          'The pilgrims cannot hold the road forever, and the door will accept only one item before it closes.',
        decision: 'Will the trio surrender a relic or ask the pilgrims to break the door?',
        choices: [
          choice(
            'fallen-v15-a',
            'Surrender a relic',
            'Lose provisions, open the door quietly, and keep the pilgrims safe.',
            'The trio fed a relic to the stone mouth. The pilgrims withdrew safely while the final chamber opened without warning its guardian.',
            fx(0, -2, -1, 1),
          ),
          choice(
            'fallen-v15-b',
            'Break the door together',
            'Keep the relic and let the pilgrims share the danger.',
            'The pilgrims raised their shrine shields and broke the door with the trio. The crash woke the guardian, but everyone reached the final chamber.',
            fx(2, 0, 2, 2),
          ),
        ],
      },
    ],
    20: [
      {
        title: 'Destroy the Heart',
        hook: '{enemyOne} shields the living heart while {enemyTwo} drives the witnesses from the guild hall.',
        stakes:
          'If the guardians survive, {faction} will take the heart and wake the prisoner on its own terms.',
        decision: 'Set the final formation and reach the heart.',
        choices: [
          battle(
            'fallen-v20-b',
            'Fight for the heart',
            'The trio defeated the final guardians and destroyed the heart before the gathered guilds. The Godgrave collapsed, and something below the broken moon opened its eyes.',
            'The final guardians broke the formation and carried the heart away. The Godgrave still stands, and the trio has sworn to hunt it before the prisoner wakes.',
            'Neither side won before the heart split. The Godgrave collapsed, but the prisoner escaped with only part of its strength.',
          ),
        ],
      },
    ],
  },
  'underworld-tide': {
    4: [
      {
        title: 'The Seal at Low Tide',
        hook: 'Captain Cael stops {lead} beside a royal boat and asks where the trio found the seal.',
        stakes:
          'His boat can cross the first drowned channel, but {faction} has promised a cure for his white-eyed brother.',
        decision: 'Will the trio board Cael’s boat or hide the seal and walk?',
        choices: [
          choice(
            'tide-v4-a',
            'Board Cael’s boat',
            'Gain fast passage and let the royal court see the seal.',
            'Cael saw the royal seal and carried the trio across the channel. A watcher from {faction} followed them to the Tide Guild hearing.',
            fx(1, 0, 2, 1),
          ),
          choice(
            'tide-v4-b',
            'Walk the drowned road',
            'Hide the seal and reach the guild without royal help.',
            'The trio hid the seal and crossed the drowned road on foot. Cael accused them of theft at the Tide Guild and forced a public hearing.',
            fx(0, 0, 1, -1),
          ),
        ],
      },
    ],
    5: [
      {
        title: 'The Family Who Remembered',
        hook: 'Before the hearing begins, an old fisher tells {lead} that the seal was taken from his missing daughter.',
        stakes:
          'His testimony can open the guild’s locked landing, but the royal court will call his family traitors.',
        decision: 'Will the trio ask him to testify or keep his name out of the hearing?',
        choices: [
          choice(
            'tide-v5-a',
            'Ask him to testify',
            'Gain lawful passage and expose the family to the court.',
            'The fisher named the king’s bargain before the guild. Rhea issued three tide tokens and ordered the trio to meet her at the first landing.',
            fx(1, 1, 1, 1),
          ),
          choice(
            'tide-v5-b',
            'Protect his name',
            'Keep the family safe and take the drowned road without a guide.',
            'The trio kept the fisher out of the hearing and left with the seal. Cael sent a map to the first landing, where hunters from {faction} were waiting.',
            fx(0, 0, 2, 1),
          ),
        ],
      },
    ],
    6: [
      {
        title: 'The Landing Below Dawn',
        hook: '{enemyOne} hunts across the flooded {hiddenRoute}, while {enemyTwo} drags the bell-rope toward deep water.',
        stakes: 'If the rope sinks, the ferryman’s boat cannot reach the road below.',
        decision: 'Choose the squad order and save the bell-rope.',
      },
    ],
    7: [
      {
        title: 'The Ferryman’s Empty Seat',
        hook: 'The ferryman leaves one place empty and repeats a memory stolen from {lead}: {leadMemory}',
        stakes:
          'He will guide the squad only after someone tells the truth about why that memory still hurts.',
        decision: 'Will {lead} speak before the squad or pay the ferryman to stay silent?',
        choices: [
          choice(
            'tide-v7-a',
            'Speak before the squad',
            'Share the memory and gain the ferryman’s trust.',
            '{lead} told the whole story. The ferryman returned the memory and showed the trio a safe channel to his ledger.',
            fx(0, 0, 0, 3),
          ),
          choice(
            'tide-v7-b',
            'Pay for silence',
            'Spend supplies and keep the memory private.',
            '{lead} paid the ferryman to keep silent. He showed the trio a shorter channel, but the secret left the party uneasy.',
            fx(0, -1, 1, -1),
          ),
        ],
      },
    ],
    8: [
      {
        title: 'Coins of the Forgotten',
        hook: 'The ferryman shows {lead} a chest of coins stamped with faces that nobody on shore remembers.',
        stakes:
          'One coin bears the living king’s face, and agents of {faction} are boarding the boat.',
        decision: 'Will the trio take the king’s coin or throw the chest into the tide?',
        choices: [
          choice(
            'tide-v8-a',
            'Take the king’s coin',
            'Carry proof of the bargain and let its ward find the squad.',
            'The trio took the king’s coin and heard every stolen name inside it. Captain Cael boarded the boat while the royal ward was still ringing.',
            fx(0, 0, 2, 0),
          ),
          choice(
            'tide-v8-b',
            'Sink the chest',
            'Return the coins to the tide and remember the names by heart.',
            'The trio spoke the stolen names once, then sank the chest. Captain Cael boarded in time to hear the last name and the king’s part in the bargain.',
            fx(1, 0, 0, 1),
          ),
        ],
      },
    ],
    9: [
      {
        title: 'Cael’s Drowned Brother',
        hook: 'Cael calls {lead} to the rail when his white-eyed brother appears among the drowned beside the boat.',
        stakes:
          'The brother knows the road to the chapel, but the tide will take him when the bell rings again.',
        decision: 'Will the trio pull him aboard or ask him to guide them from the water?',
        choices: [
          choice(
            'tide-v9-a',
            'Pull him aboard',
            'Spend supplies treating him and gain Cael’s loyalty.',
            'The trio pulled Cael’s brother aboard and bound his wounds. He led them toward Nessa’s family above the drowned chapel.',
            fx(0, -1, 0, 3),
          ),
          choice(
            'tide-v9-b',
            'Follow him through the water',
            'Keep moving and risk losing the brother when the tide turns.',
            'The drowned brother guided the boat through a hidden channel, then vanished at the bell. Scouts from {faction} were already moving Nessa’s family.',
            fx(1, 0, 2, -1),
          ),
        ],
      },
    ],
    10: [
      {
        title: 'The House That Forgot',
        hook: '{lead} finds Nessa outside a barred house; her family has forgotten her name.',
        stakes:
          'Restoring one memory costs time before the chapel attack; leaving now may break the family for good.',
        decision: 'Will the trio restore the family’s memory or lead Nessa away?',
        choices: [
          choice(
            'tide-v10-a',
            'Restore one memory',
            'Spend provisions on the rite and reunite the family.',
            'The trio restored the memory of Nessa’s return. Her family fled toward shore while the squad turned toward the drowned chapel.',
            fx(1, -2, 1, 3),
          ),
          choice(
            'tide-v10-b',
            'Lead Nessa away',
            'Reach the chapel first and leave the family confused but safe.',
            'The trio led Nessa away before the bell rang. They reached the drowned chapel unseen, but her family still did not know whom they had lost.',
            fx(0, 0, 1, -1),
          ),
        ],
      },
    ],
    11: [
      {
        title: 'Fire in the Drowned Chapel',
        hook: '{enemyOne} drives returned hunters toward black fire while {enemyTwo} drags the second bell-rope away.',
        stakes:
          'The squad must save the hunters before the fire takes their last memories and the rope disappears.',
        decision: 'Choose the squad order and take the chapel.',
      },
    ],
    12: [
      {
        title: 'A Crown in the Crypt',
        hook: 'Below the chapel, the dead king’s crown speaks to {lead} through a row of empty tombs.',
        stakes:
          'It will open the final road if {lead} promises to carry the king’s name back to shore.',
        decision: 'Will {lead} make the promise or break the crown’s voice?',
        choices: [
          choice(
            'tide-v12-a',
            'Carry the king’s name',
            'Open the road now and owe the dead king a public hearing.',
            '{lead} promised to speak the king’s name on shore. The crypt opened and showed the first bargain made beneath the bell.',
            fx(1, 0, 2, -1),
          ),
          choice(
            'tide-v12-b',
            'Break the crown’s voice',
            'Refuse the debt and force open the flooded road.',
            '{lead} struck the tomb until the crown fell silent. The squad forced the road open and found the first bargain carved beneath it.',
            fx(0, -1, 0, 2),
          ),
        ],
      },
    ],
    13: [
      {
        title: 'The First Ferryman’s Oar',
        hook: '{lead} finds the first ferryman’s oath carved into an oar beneath the crypt.',
        stakes:
          'The oath names the king as the first thief, but speaking it will call every drowned hunter nearby.',
        decision: 'Will the trio speak the oath or carry the oar in silence?',
        choices: [
          choice(
            'tide-v13-a',
            'Speak the oath',
            'Learn the full bargain and draw the drowned toward the squad.',
            'The trio spoke the oath and heard how the king stole the first memories. Hunters from {faction} followed the voices and chained Cael beside the bell.',
            fx(1, 0, 2, 0),
          ),
          choice(
            'tide-v13-b',
            'Carry the oar in silence',
            'Protect the evidence and leave the final words unread.',
            'The trio carried the oar toward Rhea without speaking. Hunters from {faction} seized her messenger and chained Cael beside the bell.',
            fx(0, -1, 1, 1),
          ),
        ],
      },
    ],
    14: [
      {
        title: 'Chains of Salt',
        hook: '{lead} finds Cael chained to the bell while hunters from {faction} offer the key in exchange for the royal seal.',
        stakes: 'The next tide will bury this chamber, and Cael cannot survive it in chains.',
        decision: 'Will the trio trade the seal or break the chain before the water rises?',
        choices: [
          choice(
            'tide-v14-a',
            'Trade the royal seal',
            'Free Cael quickly and let the faction claim royal proof.',
            'The trio traded the seal and freed Cael. Rhea copied its mark before {faction} escaped, then called the returned hunters to the final stair.',
            fx(0, 0, 1, 2),
          ),
          choice(
            'tide-v14-b',
            'Break the salt chain',
            'Keep the seal and spend supplies freeing Cael by force.',
            'The trio broke the salt chain and pulled Cael free. He sent a tide message to Rhea, who called the returned hunters to the final stair.',
            fx(1, -1, 1, 2),
          ),
        ],
      },
    ],
    15: [
      {
        title: 'The Door of Stolen Names',
        hook: 'The final door asks {lead} to name one person the tide has made the squad forget.',
        stakes:
          'The returned hunters cannot hold the stair until dawn, and the door will accept only one true name.',
        decision: 'Will the trio surrender a name or ask the returned hunters to break the door?',
        choices: [
          choice(
            'tide-v15-a',
            'Surrender a name',
            'Open the door quietly and lose one piece of the squad’s past.',
            'The trio gave the door a true name. The returned hunters withdrew safely while the bell chamber opened without warning its guardian.',
            fx(0, 0, -1, -1),
          ),
          choice(
            'tide-v15-b',
            'Break the door together',
            'Keep every name and let the returned hunters share the danger.',
            'The returned hunters struck the door with boat hooks until it broke. The crash woke the guardian, but everyone reached the bell chamber.',
            fx(2, -1, 2, 2),
          ),
        ],
      },
    ],
    20: [
      {
        title: 'Break the Crown at Dawn',
        hook: '{enemyOne} shields the severed crown while {enemyTwo} drives the waiting families from the shore.',
        stakes:
          'If the guardians survive, {faction} will restore the king’s secret bargain and keep every stolen memory.',
        decision: 'Set the final formation and reach the crown.',
        choices: [
          battle(
            'tide-v20-b',
            'Fight for the crown',
            'The trio defeated the final guardians and broke the crown before the coast. Stolen names returned across Morcant, and an army opened its eyes beneath the sea.',
            'The final guardians broke the formation and carried the crown below. The stolen memories remain lost, and the trio has sworn to follow before the next tide.',
            'Neither side won before the sea returned. The crown cracked, restoring some memories while part of the drowned army woke below.',
          ),
        ],
      },
    ],
  },
};

const rejectedPlayerLanguage =
  /Book of Deeds entry left|Turn \d+ (?:operation|personal|discovery|rival|social) decision|becomes a fact that later chapters can recall|live campaign facts|\+\-|\bresolved\b/i;

for (const arc of Object.values(QUEST_ARCS)) {
  if (arc.chapters.length !== 17) throw new Error(`${arc.id} must contain Turns 4 through 20.`);
  arc.chapters.forEach((chapter, index) => {
    if (chapter.turn !== index + 4) throw new Error(`${arc.id} has a broken chapter order.`);
    const prose = [
      chapter.title,
      chapter.hook,
      chapter.stakes,
      chapter.decision,
      ...chapter.choices.flatMap((candidate) => [
        candidate.label,
        candidate.description,
        candidate.consequence,
      ]),
    ].join(' ');
    if (rejectedPlayerLanguage.test(prose)) {
      throw new Error(`${arc.id} Turn ${chapter.turn} contains rejected player language.`);
    }
    if (
      /\{[^}]+\}/.test(
        prose
          .replaceAll('{faction}', '')
          .replaceAll('{lead}', '')
          .replaceAll('{partner}', '')
          .replaceAll('{leadMemory}', '')
          .replaceAll('{calling}', '')
          .replaceAll('{enemyOne}', '')
          .replaceAll('{enemyTwo}', '')
          .replaceAll('{crisisSite}', '')
          .replaceAll('{hiddenRoute}', '')
          .replaceAll('{city}', ''),
      )
    ) {
      throw new Error(`${arc.id} Turn ${chapter.turn} contains an unsupported story slot.`);
    }
    if (
      chapter.category === 'operation' ? chapter.choices.length !== 1 : chapter.choices.length !== 2
    ) {
      throw new Error(`${arc.id} Turn ${chapter.turn} has the wrong number of choices.`);
    }
  });
}

for (const [worldId, chapters] of Object.entries(QUEST_CHAPTER_VARIANTS)) {
  for (const [turnText, variants] of Object.entries(chapters)) {
    const turn = Number(turnText);
    const base = QUEST_ARCS[worldId as QuestWorldId].chapters.find(
      (chapter) => chapter.turn === turn,
    );
    if (base === undefined) throw new Error(`${worldId} has variants for unknown Turn ${turn}.`);
    for (const variant of variants ?? []) {
      const choices = variant.choices ?? base.choices;
      const prose = [
        variant.title,
        variant.hook,
        variant.stakes,
        variant.decision,
        ...choices.flatMap((candidate) => [
          candidate.label,
          candidate.description,
          candidate.consequence,
        ]),
      ].join(' ');
      if (rejectedPlayerLanguage.test(prose)) {
        throw new Error(`${worldId} Turn ${turn} variant contains rejected player language.`);
      }
      const unsupported = prose
        .replaceAll('{faction}', '')
        .replaceAll('{lead}', '')
        .replaceAll('{partner}', '')
        .replaceAll('{leadMemory}', '')
        .replaceAll('{calling}', '')
        .replaceAll('{enemyOne}', '')
        .replaceAll('{enemyTwo}', '')
        .replaceAll('{crisisSite}', '')
        .replaceAll('{hiddenRoute}', '')
        .replaceAll('{city}', '');
      if (/\{[^}]+\}/.test(unsupported)) {
        throw new Error(`${worldId} Turn ${turn} variant contains an unsupported story slot.`);
      }
      if (base.category === 'operation' ? choices.length !== 1 : choices.length !== 2) {
        throw new Error(`${worldId} Turn ${turn} variant has the wrong number of choices.`);
      }
    }
  }
}

export function questWorldId(cityId: string): QuestWorldId {
  return cityId.includes('underworld-tide') ? 'underworld-tide' : 'fallen-heavens';
}

export function questActForTurn(turn: number): 1 | 2 | 3 | 4 {
  return Math.min(4, Math.max(1, Math.ceil(turn / 5))) as 1 | 2 | 3 | 4;
}
