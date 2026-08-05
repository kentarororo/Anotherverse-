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
        <code>{draft.seed}</code>
      </header>

      <section className="campaign-premise" aria-labelledby="premise-title">
        <h2 id="premise-title">The opening chapter</h2>
        <div className="campaign-storybook">
          <p>{draft.premise}</p>
          <div className="campaign-main-quest">
            <span>Main quest</span>
            <h3>{draft.questTitle}</h3>
            <p>{draft.questObjective}</p>
            <small>{draft.questActs.join(' → ')}</small>
          </div>
          <p className="campaign-question">
            <strong>The question at the heart of this campaign:</strong> {draft.campaignQuestion}
          </p>
        </div>
      </section>

      <section className="creation-choice-heading" aria-labelledby="choose-hero-title">
        <p className="eyebrow">Your first decision</p>
        <h2 id="choose-hero-title">Choose your first hero</h2>
        <p>Choose the person whose story you want to begin.</p>
      </section>

      <section className="dossier-grid" aria-label="Choose one starting hero">
        {draft.characters.map((hero) => (
          <article
            className={`dossier role-${hero.role}${selectedLeadId === hero.id ? ' dossier-selected' : ''}`}
            key={hero.id}
          >
            <div className="dossier-heading">
              <div>
                <span>Awakened hunter</span>
                <h2>{hero.name}</h2>
              </div>
              <strong>{hero.callingName}</strong>
            </div>
            <div className="class-path-line">
              <strong>{hero.pathClassName}</strong>
              <span>{hero.pathClassSummary}</span>
              <small>Mythic Awakening: {hero.callingName}</small>
            </div>
            <section className="dossier-story" aria-label={`${hero.name} story`}>
              <p>{hero.story.portrait}</p>
              <blockquote>&ldquo;{hero.story.interiorVoice}&rdquo;</blockquote>
            </section>
            <dl>
              <div>
                <dt>Background</dt>
                <dd>
                  {hero.backgroundName} · {hero.origin}
                </dd>
              </div>
              <div>
                <dt>Defining choice</dt>
                <dd>{hero.formativeEvent}</dd>
              </div>
              <div>
                <dt>Wants</dt>
                <dd>{hero.drive}</dd>
              </div>
              <div>
                <dt>Fatal flaw</dt>
                <dd>{hero.story.fear}</dd>
              </div>
              <div>
                <dt>Bond</dt>
                <dd>{hero.bond}</dd>
              </div>
              <div>
                <dt>Signature</dt>
                <dd>{hero.signature}</dd>
              </div>
              <div>
                <dt>Reaction</dt>
                <dd>{hero.reaction}</dd>
              </div>
              <div>
                <dt>Limitation</dt>
                <dd>{hero.limitation}</dd>
              </div>
              <div>
                <dt>Techniques</dt>
                <dd>{hero.techniques.map((technique) => technique.name).join(' · ')}</dd>
              </div>
              <div>
                <dt>Personal hook</dt>
                <dd>{hero.personalHooks[0]}</dd>
              </div>
              <div>
                <dt>Awakening</dt>
                <dd>{hero.awakeningCondition}</dd>
              </div>
            </dl>
            <section className="dossier-techniques" aria-label={`${hero.name} technique stories`}>
              <h3>Techniques</h3>
              {hero.techniques.map((technique) => (
                <article className="technique-story-card" key={technique.id}>
                  <strong>{technique.name}</strong>
                  <p>{technique.storyDescription}</p>
                  <div className="technique-mechanics" aria-label={`${technique.name} rules`}>
                    <strong>{technique.mechanicLabel}</strong>
                    <span>Cost {technique.resourceCost}</span>
                    <span>Cooldown {technique.cooldownRounds}</span>
                    <span>{technique.condition}</span>
                  </div>
                </article>
              ))}
            </section>
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
          Regenerate Campaign
        </button>
        <button
          className="button button-primary"
          type="button"
          onClick={confirmCampaign}
          disabled={selectedLeadId === null}
        >
          {selectedLeadId === null ? 'Choose a hero first' : 'Start Campaign'}
        </button>
      </footer>
    </main>
  );
}
