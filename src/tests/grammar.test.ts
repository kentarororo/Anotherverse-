import { describe, expect, it } from 'vitest';
import {
  agreeVerb,
  assertNoUnresolvedSlots,
  completeSentence,
  possessiveName,
  withIndefiniteArticle,
} from '../narrative/realiser/grammar';

describe('typed grammar realiser', () => {
  const mira = {
    name: 'Mira',
    subjectPronoun: 'she',
    objectPronoun: 'her',
    possessive: 'her',
    plural: false,
    proper: true,
  };

  it('handles articles, agreement, possessives, plurals, and punctuation', () => {
    expect(withIndefiniteArticle('archive')).toBe('an archive');
    expect(withIndefiniteArticle('relic')).toBe('a relic');
    expect(agreeVerb(mira, 'recognise')).toBe('recognises');
    expect(agreeVerb(mira, 'carry')).toBe('carries');
    expect(agreeVerb({ ...mira, subjectPronoun: 'they', plural: true }, 'recognise')).toBe(
      'recognise',
    );
    expect(possessiveName(mira)).toBe('Mira’s');
    expect(completeSentence('the relic responds')).toBe('The relic responds.');
  });

  it('rejects unresolved template slots', () => {
    expect(() => assertNoUnresolvedSlots('{hero} responds.')).toThrow('Unresolved narrative slot');
    expect(() => assertNoUnresolvedSlots('Mira responds.')).not.toThrow();
  });
});
