import { useAppStore } from '../../app/store';

function titleCase(value: string) {
  return value.replaceAll('-', ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function CampaignCreationScreen() {
  const draft = useAppStore((state) => state.campaignDraft);
  const confirmCampaign = useAppStore((state) => state.confirmCampaign);
  const regenerateCampaign = useAppStore((state) => state.regenerateCampaign);
  const cancelCampaignDraft = useAppStore((state) => state.cancelCampaignDraft);
  if (draft === null) return null;

  return (
    <main className="creation-screen">
      <header className="creation-header">
        <div>
          <p className="eyebrow">Campaign draft</p>
          <h1>{draft.bible.city.name}</h1>
        </div>
        <code>{draft.seed}</code>
      </header>

      <section className="campaign-premise" aria-labelledby="premise-title">
        <h2 id="premise-title">First licence</h2>
        <div className="campaign-storybook">
          <p>{draft.premise}</p>
          <p className="campaign-question">
            <strong>The question at the heart of this campaign:</strong> {draft.campaignQuestion}
          </p>
        </div>
      </section>

      <section className="dossier-grid" aria-label="Generated squad dossiers">
        {draft.characters.map((hero) => (
          <article className={`dossier role-${hero.role}`} key={hero.id}>
            <div className="dossier-heading">
              <div>
                <span>{titleCase(hero.role)}</span>
                <h2>{hero.name}</h2>
              </div>
              <strong>{hero.callingName}</strong>
            </div>
            <section className="dossier-story" aria-label={`${hero.name} story`}>
              <p>{hero.story.portrait}</p>
              <blockquote>&ldquo;{hero.story.interiorVoice}&rdquo;</blockquote>
            </section>
            <dl>
              <div>
                <dt>Wants</dt>
                <dd>{hero.drive}</dd>
              </div>
              <div>
                <dt>Fears</dt>
                <dd>{hero.story.fear}</dd>
              </div>
              <div>
                <dt>Signature</dt>
                <dd>
                  <p>{hero.story.signature}</p>
                  <small>{hero.signature}</small>
                </dd>
              </div>
              <div>
                <dt>Reaction</dt>
                <dd>
                  <p>{hero.story.reaction}</p>
                  <small>{hero.reaction}</small>
                </dd>
              </div>
              <div>
                <dt>Limitation</dt>
                <dd>
                  <p>{hero.story.limitation}</p>
                  <small>{hero.limitation}</small>
                </dd>
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
              <h3>Techniques in action</h3>
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
        <button className="button button-primary" type="button" onClick={confirmCampaign}>
          Start Campaign
        </button>
      </footer>
    </main>
  );
}
