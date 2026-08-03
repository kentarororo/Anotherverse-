import { useEffect, useMemo, useState } from 'react';
import {
  buildCorpusReviewEntries,
  corpusReviewStorageKey,
} from '../../engine/reports/corpus-review';

interface ReviewScore {
  natural: boolean;
  coherent: boolean;
}

type ReviewScores = Record<string, ReviewScore>;

function loadScores(storageKey: string): ReviewScores {
  try {
    const raw = globalThis.localStorage.getItem(storageKey);
    return raw === null ? {} : (JSON.parse(raw) as ReviewScores);
  } catch {
    return {};
  }
}

export function CorpusReviewScreen() {
  const entries = useMemo(() => buildCorpusReviewEntries(), []);
  const storageKey = useMemo(() => corpusReviewStorageKey(entries), [entries]);
  const [scores, setScores] = useState<ReviewScores>(() => loadScores(storageKey));
  const naturalCount = entries.filter((entry) => scores[entry.id]?.natural).length;
  const coherentCount = entries.filter((entry) => scores[entry.id]?.coherent).length;
  const reviewedCount = entries.filter(
    (entry) => scores[entry.id]?.natural !== undefined || scores[entry.id]?.coherent !== undefined,
  ).length;
  const passed = naturalCount >= 95 && coherentCount >= 85;

  useEffect(() => {
    globalThis.localStorage.setItem(storageKey, JSON.stringify(scores));
  }, [scores, storageKey]);

  const score = (entryId: string, field: keyof ReviewScore, checked: boolean) => {
    setScores((current) => ({
      ...current,
      [entryId]: {
        natural: current[entryId]?.natural ?? false,
        coherent: current[entryId]?.coherent ?? false,
        [field]: checked,
      },
    }));
  };

  return (
    <main className="corpus-review-screen">
      <header className="review-summary">
        <div>
          <p className="eyebrow">Milestone 4 · Human acceptance</p>
          <h1>100-paragraph read-aloud review</h1>
          <p>
            Read each fixed paragraph aloud with its two source facts. Judge grammar independently
            from contextual coherence; scores remain in this browser.
          </p>
        </div>
        <dl className="review-metrics">
          <div>
            <dt>Reviewed</dt>
            <dd>{reviewedCount}/100</dd>
          </div>
          <div>
            <dt>Natural</dt>
            <dd className={naturalCount >= 95 ? 'review-pass' : ''}>{naturalCount}/100 · 95</dd>
          </div>
          <div>
            <dt>Coherent</dt>
            <dd className={coherentCount >= 85 ? 'review-pass' : ''}>{coherentCount}/100 · 85</dd>
          </div>
          <div>
            <dt>Gate</dt>
            <dd className={passed ? 'review-pass' : ''}>{passed ? 'PASS' : 'IN REVIEW'}</dd>
          </div>
        </dl>
        <div className="review-actions">
          <a className="button button-quiet" href={import.meta.env.BASE_URL}>
            Return to game
          </a>
          <button
            className="button button-quiet"
            type="button"
            onClick={() => {
              if (globalThis.confirm('Clear every read-aloud score?')) setScores({});
            }}
          >
            Reset scores
          </button>
        </div>
      </header>

      <ol className="review-list">
        {entries.map((entry, index) => (
          <li className="review-entry" key={entry.id}>
            <div className="review-entry-heading">
              <div>
                <span>
                  Paragraph {index + 1} · {entry.category} · Turn {entry.turn}
                </span>
                <h2>{entry.title}</h2>
              </div>
              <code>{entry.seed}</code>
            </div>
            <p className="review-paragraph">{entry.paragraph}</p>
            <details>
              <summary>Two live source facts</summary>
              <ul>
                {entry.factContext.map((fact, factIndex) => (
                  <li key={entry.premiseFactIds[factIndex]}>{fact}</li>
                ))}
              </ul>
              <small>Fingerprint: {entry.semanticFingerprint}</small>
            </details>
            <fieldset>
              <legend>Read-aloud judgment</legend>
              <label>
                <input
                  type="checkbox"
                  aria-label={`Natural paragraph ${index + 1}`}
                  checked={scores[entry.id]?.natural ?? false}
                  onChange={(event) => score(entry.id, 'natural', event.target.checked)}
                />
                Grammatically natural
              </label>
              <label>
                <input
                  type="checkbox"
                  aria-label={`Coherent paragraph ${index + 1}`}
                  checked={scores[entry.id]?.coherent ?? false}
                  onChange={(event) => score(entry.id, 'coherent', event.target.checked)}
                />
                Contextually coherent
              </label>
            </fieldset>
          </li>
        ))}
      </ol>
    </main>
  );
}
