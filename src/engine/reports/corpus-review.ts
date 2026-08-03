import { CONTENT_MANIFEST_HASH } from '../../content/manifest';
import { createEmptyGameState } from '../model/state';
import { applyGameCommand } from '../simulation/apply-command';

export const CORPUS_REVIEW_SEEDS = [
  'read-aloud-lumen',
  'read-aloud-vanta',
  'read-aloud-halcyon',
  'read-aloud-cinder',
  'read-aloud-crosscheck',
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
  semanticFingerprint: string;
}

export function buildCorpusReviewEntries(): CorpusReviewEntry[] {
  const entries: CorpusReviewEntry[] = [];

  for (const seed of CORPUS_REVIEW_SEEDS) {
    let state = applyGameCommand(createEmptyGameState(CONTENT_MANIFEST_HASH), {
      type: 'START_CAMPAIGN',
      seed,
      selectedDraftIndex: 0,
    });

    for (let turn = 1; turn <= 20; turn += 1) {
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
        factContext: scenario.premiseFactIds.map((factId) => {
          const fact = state.worldFacts.find((candidate) => candidate.id === factId);
          if (fact === undefined) return `Missing fact: ${factId}`;
          return `${fact.relation}: ${String(fact.value ?? fact.objectId ?? fact.subjectId)}`;
        }),
        semanticFingerprint: scenario.semanticFingerprint,
      });

      if (state.pendingPlan.situationChoiceId === null) {
        state = applyGameCommand(state, {
          type: 'CHOOSE_SITUATION',
          choiceId: scenario.choices[0]!.id,
        });
      }
      state = applyGameCommand(state, { type: 'COMMIT_TURN' });
    }
  }

  return entries;
}
