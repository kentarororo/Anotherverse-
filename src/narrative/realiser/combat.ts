import type { BattleReport, CombatEvent } from '../../engine/reports/combat';

const actionNames: Record<string, string> = {
  'shield-strike': 'Shield Strike',
  'vector-cut': 'Hunter’s Cut',
  'lattice-bolt': 'Awakening Bolt',
  'aegis-break': 'Guard Break',
  'arc-finish': 'Execution Arc',
  'binding-shot': 'Fate Binding',
  'restorative-sigil': 'Mending Sigil',
  'rending-claw': 'Rending Claw',
  'breach-charge': 'Grave Charge',
  'shard-bolt': 'Omen Bolt',
  'rending-hex': 'Funeral Omen',
};

export const COMBAT_FRAMES_PER_EVENT_TYPE = 1;

interface FrameContext {
  actor: string;
  target: string;
  action: string;
  event: CombatEvent;
}

type EventFrame = (context: FrameContext) => string;

const hitFrames: EventFrame[] = [
  ({ actor, target, action, event }) =>
    `${actor}’s ${action} hit ${target} for ${event.finalAmount} damage. ${target} has ${event.hpAfter} HP left.`,
];

const missFrames: EventFrame[] = [
  ({ actor, target, action }) => `${actor} used ${action}, but missed ${target}.`,
];

const healFrames: EventFrame[] = [
  ({ actor, target, action, event }) =>
    `${actor} used ${action} on ${target}. ${target} recovered ${event.finalAmount} HP and now has ${event.hpAfter} HP.`,
];

const defeatFrames: EventFrame[] = [({ target }) => `${target} fell.`];

const statusFrames: EventFrame[] = [({ target, event }) => statusSentence(target, event)];

const guardFrames: EventFrame[] = [
  ({ actor, target, action, event }) =>
    `${actor} used ${action}. ${target} gained ${event.finalAmount ?? 0} Ward.`,
];

const interruptFrames: EventFrame[] = [
  ({ actor, target, action }) => `${actor} used ${action} and interrupted ${target}.`,
];

const resourceFrames: EventFrame[] = [
  ({ actor, action, event }) =>
    `${actor} used ${action}. AP: ${event.resourceBefore} → ${event.resourceAfter}.`,
];

function statusSentence(target: string, event: CombatEvent): string {
  const change = event.statusChanges?.[0];
  if (change === undefined) return `${target}'s status changed.`;
  if (change.durationAfter === 0) return `${actionName(change.statusId)} ended on ${target}.`;
  return `${target} has ${actionName(change.statusId)} for ${change.durationAfter} rounds.`;
}

function selectFrame(frames: EventFrame[], event: CombatEvent): EventFrame {
  return frames[(event.index + event.round) % frames.length]!;
}

export function actionName(actionId: string): string {
  return actionNames[actionId] ?? actionId.replaceAll('-', ' ');
}

export function renderCombatEvent(report: BattleReport, event: CombatEvent): string {
  const actor = report.combatantNames[event.actorId] ?? event.actorId;
  const targetId = event.targetIds[0];
  const target =
    targetId === undefined ? 'the field' : (report.combatantNames[targetId] ?? targetId);
  const action = report.actionNames[event.actionId] ?? actionName(event.actionId);
  const context = { actor, target, action, event };

  if (event.eventType === 'attack') {
    const frames = (event.finalAmount ?? 0) === 0 ? missFrames : hitFrames;
    const trigger = event.ruleTriggers?.includes('rear-intercept') ? `${target} intercepted. ` : '';
    return `${trigger}${selectFrame(frames, event)(context)}`;
  }

  const framesByType: Record<Exclude<CombatEvent['eventType'], 'attack'>, EventFrame[]> = {
    heal: healFrames,
    defeat: defeatFrames,
    status: statusFrames,
    guard: guardFrames,
    interrupt: interruptFrames,
    resource: resourceFrames,
  };
  const frames = framesByType[event.eventType];
  return selectFrame(frames, event)(context);
}
