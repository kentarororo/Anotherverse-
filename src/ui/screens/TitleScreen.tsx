import { useState } from 'react';
import { createCampaignSeed } from '../../app/seed';
import { useAppStore } from '../../app/store';

export function TitleScreen() {
  const saveStatus = useAppStore((state) => state.saveStatus);
  const startCampaign = useAppStore((state) => state.startCampaign);
  const continueCampaign = useAppStore((state) => state.continueCampaign);
  const clearInvalidSave = useAppStore((state) => state.clearInvalidSave);
  const [seed, setSeed] = useState(createCampaignSeed);

  const handleNewCampaign = () => {
    if (
      saveStatus.status === 'ok' &&
      !globalThis.confirm('Start a new campaign and replace the current prototype autosave?')
    ) {
      return;
    }
    startCampaign(seed.trim() || createCampaignSeed());
  };

  const saveError =
    saveStatus.status === 'corrupt'
      ? saveStatus.reason
      : saveStatus.status === 'incompatible'
        ? `Save schema ${saveStatus.foundVersion ?? 'unknown'} is not compatible with this build.`
        : null;

  return (
    <main className="title-screen">
      <section className="title-panel" aria-labelledby="game-title">
        <h1 id="game-title">ANOTHERVERSE</h1>
        <p className="title-deck">
          Prepare a licensed squad for unstable breaches. Commit the plan, watch the operation
          resolve, and carry its consequences forward.
        </p>

        <div className="title-actions">
          <button className="button button-primary" type="button" onClick={handleNewCampaign}>
            New Campaign
          </button>
          <button
            className="button"
            type="button"
            onClick={continueCampaign}
            disabled={saveStatus.status !== 'ok'}
          >
            Continue
          </button>
        </div>

        <details className="advanced-seed">
          <summary>Advanced</summary>
          <label htmlFor="campaign-seed">Campaign seed</label>
          <div className="seed-row">
            <input
              id="campaign-seed"
              value={seed}
              onChange={(event) => setSeed(event.target.value)}
              spellCheck={false}
            />
            <button
              className="button button-quiet"
              type="button"
              onClick={() => setSeed(createCampaignSeed())}
            >
              Regenerate
            </button>
          </div>
        </details>

        {saveError && (
          <div className="save-error" role="alert">
            <span>{saveError}</span>
            <button className="text-button" type="button" onClick={clearInvalidSave}>
              Reset autosave
            </button>
          </div>
        )}

        <footer className="version">Prototype v0.1.0 · Milestone 1</footer>
      </section>
    </main>
  );
}
