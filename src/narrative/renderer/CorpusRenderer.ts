import type { AftermathReport, BattleReport, CombatEvent } from '../../engine/reports/combat';
import type { NarrativeRenderer } from './NarrativeRenderer';

export class CorpusRenderer implements NarrativeRenderer {
  public renderCombatEvent(event: CombatEvent): string {
    const targets = event.targetIds.join(', ') || 'no target';
    const amount = event.finalAmount === undefined ? '' : ` for ${event.finalAmount}`;
    return `${event.actorId} used ${event.actionId} on ${targets}${amount}.`;
  }

  public renderBattleSummary(report: BattleReport): string {
    return `The encounter ended in ${report.outcome} after ${report.rounds} rounds.`;
  }

  public renderAftermath(report: AftermathReport): string {
    return `Turn ${report.turn} recorded ${report.factIdsWritten.length} new world facts.`;
  }
}
