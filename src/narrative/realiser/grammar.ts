export interface GrammarEntity {
  name: string;
  subjectPronoun: string;
  objectPronoun: string;
  possessive: string;
  plural: boolean;
  proper: boolean;
}

export function withIndefiniteArticle(noun: string): string {
  return `${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}`;
}

export function agreeVerb(entity: GrammarEntity, base: string): string {
  if (entity.plural || entity.subjectPronoun.toLowerCase() === 'they') return base;
  if (base.endsWith('y') && !/[aeiou]y$/i.test(base)) return `${base.slice(0, -1)}ies`;
  if (/(s|x|z|ch|sh)$/i.test(base)) return `${base}es`;
  return `${base}s`;
}

export function possessiveName(entity: GrammarEntity): string {
  return entity.proper
    ? `${entity.name}${entity.name.endsWith('s') ? '’' : '’s'}`
    : entity.possessive;
}

export function completeSentence(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length === 0) throw new Error('Cannot realise an empty sentence.');
  const capitalised = `${trimmed[0]!.toUpperCase()}${trimmed.slice(1)}`;
  return /[.!?]$/.test(capitalised) ? capitalised : `${capitalised}.`;
}

export function assertNoUnresolvedSlots(value: string): void {
  if (/\{[^}]+\}/.test(value)) throw new Error(`Unresolved narrative slot in: ${value}`);
}
