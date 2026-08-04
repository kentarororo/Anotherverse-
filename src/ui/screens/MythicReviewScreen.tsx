import { useEffect, useMemo, useState } from 'react';
import {
  generateMythicReviewDraft,
  MYTHIC_REVIEW_SEEDS,
  type MythicRole,
} from '../../content/mythic-review';

interface ReviewJudgment {
  world: boolean;
  characters: boolean;
  skills: boolean;
  scenarios: boolean;
}

const EMPTY_JUDGMENT: ReviewJudgment = {
  world: false,
  characters: false,
  skills: false,
  scenarios: false,
};

const ROLE_LABELS: Record<MythicRole, string> = {
  vanguard: 'Vanguard',
  striker: 'Striker',
  support: 'Support',
};

function storageKey(seed: string) {
  return `anotherverse.mythic-review.v1.${seed}`;
}

function loadJudgment(seed: string): ReviewJudgment {
  try {
    const raw = globalThis.localStorage.getItem(storageKey(seed));
    return raw === null ? EMPTY_JUDGMENT : (JSON.parse(raw) as ReviewJudgment);
  } catch {
    return EMPTY_JUDGMENT;
  }
}

function initialSeed() {
  const candidate = new URLSearchParams(globalThis.location.search).get('seed');
  return MYTHIC_REVIEW_SEEDS.find((seed) => seed === candidate) ?? MYTHIC_REVIEW_SEEDS[0];
}

export function MythicReviewScreen() {
  const [seed, setSeed] = useState<string>(initialSeed);
  const draft = useMemo(() => generateMythicReviewDraft(seed), [seed]);
  const [judgment, setJudgment] = useState<ReviewJudgment>(() => loadJudgment(seed));
  const accepted = Object.values(judgment).filter(Boolean).length;

  useEffect(() => {
    globalThis.localStorage.setItem(storageKey(seed), JSON.stringify(judgment));
  }, [judgment, seed]);

  const judge = (field: keyof ReviewJudgment, checked: boolean) => {
    setJudgment((current) => ({ ...current, [field]: checked }));
  };

  const selectSeed = (candidate: string) => {
    const url = new URL(globalThis.location.href);
    url.searchParams.set('seed', candidate);
    globalThis.history.replaceState(null, '', url);
    setJudgment(loadJudgment(candidate));
    setSeed(candidate);
  };

  return (
    <main className="mythic-review-screen">
      <header className="mythic-review-header">
        <div>
          <p className="eyebrow">Narrative prototype · controlled procedural generation</p>
          <h1>Mythic Narrative v2</h1>
          <p>
            An original mythology × progression-fantasy direction: immediate stakes, concrete
            wonders, readable rank growth, and character choices that alter later battles.
          </p>
        </div>
        <div className="mythic-review-score" aria-label="Review progress">
          <strong>{accepted}/4</strong>
          <span>areas approved for this seed</span>
        </div>
        <a className="button button-quiet" href={import.meta.env.BASE_URL}>
          Return to game
        </a>
      </header>

      <nav className="mythic-seed-picker" aria-label="Mythic review seeds">
        <span>Compare generated drafts</span>
        {MYTHIC_REVIEW_SEEDS.map((candidate, index) => (
          <button
            className={candidate === seed ? 'is-active' : ''}
            type="button"
            aria-label={`Review seed ${candidate}`}
            aria-pressed={candidate === seed}
            key={candidate}
            onClick={() => selectSeed(candidate)}
          >
            Draft {index + 1}
          </button>
        ))}
      </nav>

      <section className="mythic-world-card" aria-labelledby="mythic-world-title">
        <div className="mythic-section-heading">
          <div>
            <p className="eyebrow">Generated world · {seed}</p>
            <h2 id="mythic-world-title">{draft.world.name}</h2>
            <p className="mythic-subtitle">{draft.world.subtitle}</p>
          </div>
          <span className="mythic-ranks">{draft.world.rankNames.join(' → ')}</span>
        </div>
        <div className="mythic-opening">
          {draft.world.opening.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <dl className="mythic-laws">
          <div>
            <dt>Myth law</dt>
            <dd>{draft.world.mythLaw}</dd>
          </div>
          <div>
            <dt>Progression law</dt>
            <dd>{draft.world.progressionLaw}</dd>
          </div>
        </dl>
      </section>

      <section className="mythic-review-section" aria-labelledby="mythic-party-title">
        <div className="mythic-section-heading">
          <div>
            <p className="eyebrow">Fixed identities · world-specific bonds</p>
            <h2 id="mythic-party-title">The awakened trio</h2>
          </div>
          <p>Names never detach from biographies, motives, stats, or Paths.</p>
        </div>
        <div className="mythic-hero-grid">
          {draft.trio.map((hero) => (
            <article className={`mythic-hero-card role-${hero.role}`} key={hero.id}>
              <header>
                <span>{ROLE_LABELS[hero.role]}</span>
                <h3>{hero.name}</h3>
                <strong>{hero.pathName}</strong>
              </header>
              <div
                className="mythic-portrait-placeholder"
                aria-label={`${hero.name} art placeholder`}
              >
                <span>2D CHARACTER ART</span>
                <small>{hero.role} silhouette · idle / attack / hit</small>
              </div>
              <p className="mythic-hero-introduction">{hero.introduction}</p>
              <dl className="mythic-character-drives">
                <div>
                  <dt>Wants</dt>
                  <dd>{hero.desire}</dd>
                </div>
                <div>
                  <dt>But</dt>
                  <dd>{hero.flaw}</dd>
                </div>
              </dl>
              <blockquote>“{hero.voiceLine}”</blockquote>
              <dl className="mythic-stat-row">
                {Object.entries(hero.stats).map(([stat, value]) => (
                  <div key={stat}>
                    <dt>{stat.slice(0, 3).toUpperCase()}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <div className="mythic-technique-list">
                {hero.techniques.map((technique) => (
                  <article className="mythic-technique-card" key={technique.id}>
                    <div>
                      <h4>{technique.name}</h4>
                      <span>
                        {technique.cost} AP · {technique.cooldown} round cooldown
                      </span>
                    </div>
                    <p>{technique.visibleAction}</p>
                    <p>
                      <b>Use:</b> {technique.tacticalPurpose}
                    </p>
                    <code>{technique.mechanicRule}</code>
                  </article>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mythic-review-section" aria-labelledby="mythic-relics-title">
        <div className="mythic-section-heading">
          <div>
            <p className="eyebrow">Role-compatible rewards</p>
            <h2 id="mythic-relics-title">Starting relics</h2>
          </div>
          <p>Only descriptions and compatible epithets vary; each stat rule stays authoritative.</p>
        </div>
        <div className="mythic-relic-grid">
          {draft.relics.map((relic) => {
            const owner = draft.trio.find((hero) => hero.id === relic.ownerId)!;
            return (
              <article className="mythic-relic-card" key={`${relic.ownerId}-${relic.id}`}>
                <span>{owner.name} · equipped</span>
                <h3>{relic.name}</h3>
                <p>{relic.description}</p>
                <code>{relic.mechanic}</code>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mythic-review-section" aria-labelledby="mythic-chapters-title">
        <div className="mythic-section-heading">
          <div>
            <p className="eyebrow">Connected authored variants</p>
            <h2 id="mythic-chapters-title">Opening chapter arc</h2>
          </div>
          <p>
            Three complete scenes share the same myth law, stakes, cast, and progression promise.
          </p>
        </div>
        <ol className="mythic-chapter-list">
          {draft.chapters.map((chapter, index) => (
            <li className="mythic-chapter-card" key={chapter.id}>
              <header>
                <span>
                  Chapter {index + 1} · {chapter.category}
                </span>
                <h3>{chapter.title}</h3>
              </header>
              <p>{chapter.paragraph}</p>
              <div className="mythic-choices">
                {chapter.choices.map((choice, choiceIndex) => (
                  <button type="button" disabled key={choice}>
                    <strong>{choice}</strong>
                    <span>{chapter.choiceDescriptions[choiceIndex]}</span>
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mythic-generation-contract" aria-labelledby="generation-contract-title">
        <div>
          <p className="eyebrow">Why this generator stays coherent</p>
          <h2 id="generation-contract-title">Protected seams, not word soup</h2>
        </div>
        <dl>
          <div>
            <dt>World</dt>
            <dd>One complete cosmology, rank ladder, price, and chapter arc.</dd>
          </div>
          <div>
            <dt>Heroes</dt>
            <dd>One complete authored identity per combat role—never a shuffled biography.</dd>
          </div>
          <div>
            <dt>Prose</dt>
            <dd>Whole paragraph variants with only hero and Path names safely bound.</dd>
          </div>
          <div>
            <dt>Mechanics</dt>
            <dd>Immutable stats, costs, cooldowns, effects, and promised consequences.</dd>
          </div>
          <div>
            <dt>Rewards</dt>
            <dd>Only role-compatible relic frames, descriptions, and epithets can combine.</dd>
          </div>
        </dl>
      </section>

      <fieldset className="mythic-review-judgment">
        <legend>Approve this seed only if it reads clearly</legend>
        <label>
          <input
            type="checkbox"
            checked={judgment.world}
            onChange={(event) => judge('world', event.target.checked)}
          />
          World hook and laws make sense
        </label>
        <label>
          <input
            type="checkbox"
            checked={judgment.characters}
            onChange={(event) => judge('characters', event.target.checked)}
          />
          Characters feel specific and human
        </label>
        <label>
          <input
            type="checkbox"
            checked={judgment.skills}
            onChange={(event) => judge('skills', event.target.checked)}
          />
          Skills are vivid and mechanically clear
        </label>
        <label>
          <input
            type="checkbox"
            checked={judgment.scenarios}
            onChange={(event) => judge('scenarios', event.target.checked)}
          />
          Chapters connect and choices matter
        </label>
        <small>Stored only in this browser for seed “{seed}”.</small>
      </fieldset>

      <footer className="mythic-review-footer">
        <span>Generation fingerprint</span>
        <code>{draft.fingerprint}</code>
      </footer>
    </main>
  );
}
