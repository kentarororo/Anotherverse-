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
        <p>{draft.premise}</p>
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
            <p className="dossier-origin">{hero.origin}</p>
            <dl>
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
                <dt>Drive</dt>
                <dd>{hero.drive}</dd>
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
