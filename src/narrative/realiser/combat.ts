import type { BattleReport, CombatEvent } from '../../engine/reports/combat';

const actionNames: Record<string, string> = {
  'shield-strike': 'Shield Strike',
  'vector-cut': 'Vector Cut',
  'lattice-bolt': 'Lattice Bolt',
  'aegis-break': 'Aegis Break',
  'arc-finish': 'Arc Finish',
  'binding-shot': 'Binding Shot',
  'restorative-sigil': 'Restorative Sigil',
  'rending-claw': 'Rending Claw',
  'breach-charge': 'Breach Charge',
  'shard-bolt': 'Shard Bolt',
  'rending-hex': 'Rending Hex',
};

export function actionName(actionId: string): string {
  return actionNames[actionId] ?? actionId.replaceAll('-', ' ');
}

export function renderCombatEvent(report: BattleReport, event: CombatEvent): string {
  const actor = report.combatantNames[event.actorId] ?? event.actorId;
  const targetId = event.targetIds[0];
  const target =
    targetId === undefined ? 'the field' : (report.combatantNames[targetId] ?? targetId);
  if (event.eventType === 'attack') {
    if ((event.finalAmount ?? 0) === 0) {
      return `${actor} used ${actionName(event.actionId)}, but missed ${target}.`;
    }
    const triggers = event.ruleTriggers?.includes('rear-intercept')
      ? ' after Mira intercepted'
      : '';
    return `${actor} used ${actionName(event.actionId)}${triggers}: ${event.rawAmount} raw became ${event.finalAmount} damage; ${target} fell to ${event.hpAfter} HP.`;
  }
  if (event.eventType === 'heal') {
    return `${actor} used ${actionName(event.actionId)} on ${target}, restoring ${event.finalAmount} HP to ${event.hpAfter}.`;
  }
  if (event.eventType === 'defeat') return `${target} could no longer fight.`;
  if (event.eventType === 'status') {
    const change = event.statusChanges?.[0];
    return change === undefined
      ? `${target}'s status changed.`
      : `${target}'s ${actionName(change.statusId)} duration changed from ${change.durationBefore} to ${change.durationAfter}.`;
  }
  return `${actor} resolved ${actionName(event.actionId)}.`;
}
