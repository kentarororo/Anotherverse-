import type { CanonicalGameState } from '../../engine/model/state';
import type { WorldFact } from '../../engine/model/world';

function entityName(state: CanonicalGameState, id: string): string {
  if (id === 'licensed-squad' || id === 'hunter-trio') return 'The trio';
  const hero = state.generatedDefinitions.characters.find((candidate) => candidate.id === id);
  if (hero !== undefined) return hero.name;
  const enemy = state.generatedDefinitions.enemies[id];
  if (enemy !== undefined) return enemy.name;
  const item = state.generatedDefinitions.items[id];
  if (item !== undefined) return item.name;
  const bible = state.campaignBible;
  if (bible !== null) {
    if (bible.city.id === id) return bible.city.name;
    if (bible.civicOrder.id === id) return bible.civicOrder.name;
    if (bible.guildModel.id === id) return bible.guildModel.name;
    const faction = bible.activeFactions.find((candidate) => candidate.id === id);
    if (faction !== undefined) return faction.name;
  }
  return id.replaceAll('-', ' ');
}

export function renderWorldFact(state: CanonicalGameState, fact: WorldFact): string {
  const subject = entityName(state, fact.subjectId);
  const value = String(fact.value ?? fact.objectId ?? 'recorded');
  const turn = fact.createdTurn === 0 ? 'Campaign start' : `Turn ${fact.createdTurn}`;

  if (fact.relation.startsWith('chose-')) return `${turn}: ${subject} chose “${value}”.`;
  if (fact.relation === 'comes-from') return `${turn}: ${subject}'s origin is ${value}`;
  if (fact.relation === 'is-squad-city') return `${turn}: the trio’s legend began in ${value}.`;
  if (fact.relation === 'pursues-motive') return `${turn}: ${subject} seeks to ${value}`;
  return `${turn}: ${subject} ${fact.relation.replaceAll('-', ' ')} — ${value}.`;
}
