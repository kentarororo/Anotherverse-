import { CONTENT_MANIFEST_HASH } from '../../content/manifest';
import { createEmptyGameState } from '../model/state';
import { applyGameCommand } from '../simulation/apply-command';

export const CORPUS_REVIEW_SEEDS = [
  'read-aloud-lumen',
  'read-aloud-vanta',
  'read-aloud-halcyon',
  'read-aloud-cinder',
  'read-aloud-crosscheck',
  'read-aloud-oracle',
  'read-aloud-tempest',
  'read-aloud-pilgrim',
  'read-aloud-huntress',
  'read-aloud-reckoning',
] as const;

export interface CorpusReviewEntry {
  id: string;
  seed: string;
  turn: number;
  category: string;
  title: string;
  paragraph: string;
  premiseFactIds: string[];
  factContext: string[];
  castNames: string[];
  sentenceCount: number;
  semanticFingerprint: string;
}

export const LEGACY_CORPUS_REVIEW_STORAGE_KEY = 'anotherverse.corpus-review.v1';
export const CORPUS_REVIEW_SCORE_SCHEMA = 2 as const;

function hashReviewContent(value: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function corpusReviewStorageKey(entries: readonly CorpusReviewEntry[]): string {
  const reviewedContent = entries.map((entry) => ({
    id: entry.id,
    paragraph: entry.paragraph,
    premiseFactIds: entry.premiseFactIds,
    semanticFingerprint: entry.semanticFingerprint,
  }));
  return `anotherverse.corpus-review.v${CORPUS_REVIEW_SCORE_SCHEMA}.${hashReviewContent(JSON.stringify(reviewedContent))}`;
}

function factContext(state: ReturnType<typeof createEmptyGameState>, factId: string): string {
  const fact = state.worldFacts.find((candidate) => candidate.id === factId);
  if (fact === undefined) return `Missing fact: ${factId}`;
  const value = String(fact.value ?? fact.objectId ?? fact.subjectId).replace(/[.!?]+$/, '');
  if (fact.relation === 'comes-from') {
    const hero = state.generatedDefinitions.characters.find(
      (candidate) => candidate.id === fact.subjectId,
    );
    return `${hero?.name ?? fact.subjectId} origin: ${value}`;
  }
  if (fact.relation === 'is-campaign-realm') return `Campaign realm: ${value}`;
  if (fact.relation === 'pursues-motive') {
    const faction = state.campaignBible?.activeFactions.find(
      (candidate) => candidate.id === fact.subjectId,
    );
    return `${faction?.name ?? fact.subjectId} motive: ${value}`;
  }
  const category = fact.tags.find((tag) =>
    ['operation', 'personal', 'discovery', 'rival', 'social'].includes(tag),
  );
  return `Turn ${fact.createdTurn} ${category ?? fact.kind} outcome: ${value}`;
}

export function buildCorpusReviewEntries(): CorpusReviewEntry[] {
  const entries: CorpusReviewEntry[] = [];

  for (const [seedIndex, seed] of CORPUS_REVIEW_SEEDS.entries()) {
    let state = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed,
      selectedDraftIndex: 0,
    });

    for (let turn = 1; turn <= 6; turn += 1) {
      const scenario = state.currentScenario;
      if (scenario === null)
        throw new Error(`Review seed ${seed} has no scenario at Turn ${turn}.`);
      entries.push({
        id: `${seed}-turn-${turn}`,
        seed,
        turn,
        category: scenario.category,
        title: scenario.title,
        paragraph: scenario.premise,
        premiseFactIds: scenario.premiseFactIds,
        factContext: scenario.premiseFactIds.map((factId) => factContext(state, factId)),
        castNames: scenario.castIds.map(
          (castId) =>
            state.generatedDefinitions.characters.find((hero) => hero.id === castId)?.name ??
            castId,
        ),
        sentenceCount: scenario.premise.split(/(?<=[.!?])\s+/).length,
        semanticFingerprint: scenario.semanticFingerprint,
      });

      if (state.pendingPlan.situationChoiceId === null) {
        const choice = scenario.choices[(seedIndex + turn) % scenario.choices.length]!;
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: choice.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
  }

  return entries;
}
