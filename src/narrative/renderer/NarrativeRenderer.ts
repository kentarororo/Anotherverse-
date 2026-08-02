import type { AftermathReport, BattleReport, CombatEvent } from '../../engine/reports/combat';

export interface NarrativeRenderer {
  renderCombatEvent(event: CombatEvent): string;
  renderBattleSummary(report: BattleReport): string;
  renderAftermath(report: AftermathReport): string;
}
