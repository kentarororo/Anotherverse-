import { useAppStore } from '../../app/store';

export function CampaignCreationScreen() {
  const draft = useAppStore((state) => state.campaignDraft);
  const confirmCampaign = useAppStore((state) => state.confirmCampaign);
  const selectedLeadId = useAppStore((state) => state.selectedLeadId);
  const selectLead = useAppStore((state) => state.selectLead);
  const regenerateCampaign = useAppStore((state) => state.regenerateCampaign);
  const cancelCampaignDraft = useAppStore((state) => state.cancelCampaignDraft);
  if (draft === null) return null;

  return (
    <main className="creation-screen">
      <header className="creation-header">
        <div>
          <p className="eyebrow">A new legend</p>
          <h1>{draft.bible.city.name}</h1>
        </div>
      </header>

      <section
        className="campaign-premise campaign-premise-compact"
        aria-labelledby="premise-title"
      >
        <div>
          <p className="eyebrow">Opening chapter</p>
          <h2 id="premise-title">{draft.questTitle}</h2>
        </div>
        <div className="campaign-storybook">
          <p>{draft.premise}</p>
          <p className="campaign-question">{draft.questObjective}</p>
          <details className="campaign-details">
            <summary>Campaign details</summary>
            <p>{draft.campaignQuestion}</p>
            <small>{draft.questActs.join(' → ')}</small>
            <code>Seed: {draft.seed}</code>
          </details>
        </div>
      </section>

      <section className="creation-choice-heading" aria-labelledby="choose-hero-title">
        <h2 id="choose-hero-title">Choose your first hero</h2>
        <p>Their role will reveal itself through play.</p>
      </section>

      <section className="dossier-grid" aria-label="Choose one starting hero">
        {draft.characters.map((hero) => (
          <article
            className={`dossier dossier-compact${selectedLeadId === hero.id ? ' dossier-selected' : ''}`}
            key={hero.id}
          >
            <div className="dossier-heading">
              <div>
                <span>{hero.backgroundName}</span>
                <h2>{hero.name}</h2>
              </div>
              <strong>
                Mythic Awakening
                <br />
                {hero.callingName}
              </strong>
            </div>
            <div className="class-path-line">
              <strong>{hero.pathClassName}</strong>
              <span>{hero.pathClassSummary}</span>
            </div>
            <section className="dossier-story" aria-label={`${hero.name} story`}>
              <p>{hero.formativeEvent}</p>
              <blockquote>&ldquo;{hero.story.interiorVoice}&rdquo;</blockquote>
            </section>
            <dl className="hero-choice-stats" aria-label={`${hero.name} starting strengths`}>
              <div>
                <dt>Vitality</dt>
                <dd>{hero.stats.vitality}</dd>
              </div>
              <div>
                <dt>Power</dt>
                <dd>{hero.stats.power}</dd>
              </div>
              <div>
                <dt>Focus</dt>
                <dd>{hero.stats.focus}</dd>
              </div>
            </dl>
            <section className="dossier-techniques" aria-label={`${hero.name} techniques`}>
              <h3>Techniques</h3>
              {hero.techniques.map((technique) => (
                <article className="technique-story-card" key={technique.id}>
                  <strong>{technique.name}</strong>
                  <p>{technique.mechanicLabel}</p>
                  <div className="technique-mechanics" aria-label={`${technique.name} rules`}>
                    <span>Cost {technique.resourceCost}</span>
                    <span>{technique.cooldownRounds} round cooldown</span>
                  </div>
                </article>
              ))}
            </section>
            <details className="hero-details">
              <summary>Read more about {hero.name}</summary>
              <p>{hero.story.portrait}</p>
              <dl>
                <div>
                  <dt>Goal</dt>
                  <dd>{hero.drive}</dd>
                </div>
                <div>
                  <dt>Flaw</dt>
                  <dd>{hero.story.fear}</dd>
                </div>
                <div>
                  <dt>Awakening trial</dt>
                  <dd>{hero.awakeningCondition}</dd>
                </div>
              </dl>
            </details>
            <button
              className={`button hero-choice-button${selectedLeadId === hero.id ? ' button-primary' : ''}`}
              type="button"
              aria-pressed={selectedLeadId === hero.id}
              onClick={() => selectLead(hero.id)}
            >
              {`Begin as ${hero.name}`}
            </button>
          </article>
        ))}
      </section>

      <footer className="creation-actions">
        <button className="button button-quiet" type="button" onClick={cancelCampaignDraft}>
          Back
        </button>
        <button className="button" type="button" onClick={regenerateCampaign}>
          New legend
        </button>
        <button
          className="button button-primary"
          type="button"
          onClick={confirmCampaign}
          disabled={selectedLeadId === null}
        >
          {selectedLeadId === null ? 'Choose a hero first' : 'Begin Chapter One'}
        </button>
      </footer>
    </main>
  );
}
