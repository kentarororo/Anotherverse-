import type { BattleReport, CombatEvent } from '../../engine/reports/combat';

const actionNames: Record<string, string> = {
  'shield-strike': 'Shield Strike',
  'vector-cut': 'Hunter’s Cut',
  'lattice-bolt': 'Path Bolt',
  'aegis-break': 'Guard Break',
  'arc-finish': 'Execution Arc',
  'binding-shot': 'Fate Binding',
  'restorative-sigil': 'Mending Sigil',
  'rending-claw': 'Rending Claw',
  'breach-charge': 'Grave Charge',
  'shard-bolt': 'Omen Bolt',
  'rending-hex': 'Funeral Omen',
};

export const COMBAT_FRAMES_PER_EVENT_TYPE = 4;

interface FrameContext {
  actor: string;
  target: string;
  action: string;
  event: CombatEvent;
}

type EventFrame = (context: FrameContext) => string;

const hitFrames: EventFrame[] = [
  ({ actor, target, action, event }) =>
    `${actor} used ${action}: ${event.rawAmount} raw became ${event.finalAmount} damage, leaving ${target} at ${event.hpAfter} HP.`,
  ({ actor, target, action, event }) =>
    `${actor}'s ${action} dealt ${event.finalAmount} damage to ${target} after mitigation reduced ${event.rawAmount} raw; ${target} had ${event.hpAfter} HP remaining.`,
  ({ actor, target, action, event }) =>
    `${action} connected for ${actor}. ${target} took ${event.finalAmount} of ${event.rawAmount} raw damage and fell to ${event.hpAfter} HP.`,
  ({ actor, target, action, event }) =>
    `${actor} struck ${target} with ${action}; defence turned ${event.rawAmount} raw into ${event.finalAmount} damage, ending at ${event.hpAfter} HP.`,
];

const missFrames: EventFrame[] = [
  ({ actor, target, action }) => `${actor} used ${action}, but missed ${target}.`,
  ({ actor, target, action }) => `${target} avoided ${actor}'s ${action}; no damage was dealt.`,
  ({ actor, target, action }) => `${actor}'s ${action} failed to connect with ${target}.`,
  ({ actor, target, action }) => `${action} went wide, leaving ${target} unharmed by ${actor}.`,
];

const healFrames: EventFrame[] = [
  ({ actor, target, action, event }) =>
    `${actor} used ${action} on ${target}, restoring ${event.finalAmount} HP to ${event.hpAfter}.`,
  ({ actor, target, action, event }) =>
    `${action} restored ${event.finalAmount} HP for ${target}; ${actor} brought them to ${event.hpAfter} HP.`,
  ({ actor, target, action, event }) =>
    `${target} recovered ${event.finalAmount} HP from ${actor}'s ${action} and reached ${event.hpAfter} HP.`,
  ({ actor, target, action, event }) =>
    `${actor} steadied ${target} with ${action}: +${event.finalAmount} HP, now ${event.hpAfter} HP.`,
];

const defeatFrames: EventFrame[] = [
  ({ target }) => `${target} could no longer fight.`,
  ({ target }) => `${target} was defeated and left the action order.`,
  ({ target }) => `${target} reached 0 HP and was removed from the battle.`,
  ({ target }) => `${target}'s HP fell to 0; their part in the fight ended.`,
];

const statusFrames: EventFrame[] = [
  ({ target, event }) => statusSentence(target, event, 'duration changed from'),
  ({ target, event }) => statusSentence(target, event, 'duration moved from'),
  ({ target, event }) => statusSentence(target, event, 'timer shifted from'),
  ({ target, event }) => statusSentence(target, event, 'remaining duration went from'),
];

const guardFrames: EventFrame[] = [
  ({ actor, target, action, event }) =>
    `${actor} used ${action} to guard ${target}, preventing ${event.finalAmount ?? 0} damage.`,
  ({ actor, target, action, event }) =>
    `${action} let ${actor} shield ${target} from ${event.finalAmount ?? 0} damage.`,
  ({ actor, target, action, event }) =>
    `${target} gained ${event.finalAmount ?? 0} points of protection from ${actor}'s ${action}.`,
  ({ actor, target, action, event }) =>
    `${actor} established ${action}; ${target} avoided ${event.finalAmount ?? 0} incoming damage.`,
];

const interruptFrames: EventFrame[] = [
  ({ actor, target, action }) => `${actor} used ${action} and interrupted ${target}.`,
  ({ actor, target, action }) => `${target}'s action was stopped by ${actor}'s ${action}.`,
  ({ actor, target, action }) =>
    `${action} let ${actor} break ${target}'s action before resolution.`,
  ({ actor, target, action }) => `${actor} denied ${target} an action with ${action}.`,
];

const resourceFrames: EventFrame[] = [
  ({ actor, action, event }) =>
    `${actor} used ${action}; resource changed from ${event.resourceBefore} to ${event.resourceAfter}.`,
  ({ actor, action, event }) =>
    `${action} moved ${actor}'s resource from ${event.resourceBefore} to ${event.resourceAfter}.`,
  ({ actor, action, event }) =>
    `${actor}'s resource became ${event.resourceAfter}, from ${event.resourceBefore}, after ${action}.`,
  ({ actor, action, event }) =>
    `${actor} resolved ${action} and finished with ${event.resourceAfter} resource instead of ${event.resourceBefore}.`,
];

function statusSentence(target: string, event: CombatEvent, phrase: string): string {
  const change = event.statusChanges?.[0];
  if (change === undefined) return `${target}'s status changed.`;
  return `${target}'s ${actionName(change.statusId)} ${phrase} ${change.durationBefore} to ${change.durationAfter}.`;
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
