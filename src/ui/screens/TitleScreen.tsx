import { useState } from 'react';
import { createCampaignSeed } from '../../app/seed';
import { useAppStore } from '../../app/store';

export function TitleScreen() {
  const saveStatus = useAppStore((state) => state.saveStatus);
  const startCampaign = useAppStore((state) => state.startCampaign);
  const continueCampaign = useAppStore((state) => state.continueCampaign);
  const clearInvalidSave = useAppStore((state) => state.clearInvalidSave);
  const settingsOpen = useAppStore((state) => state.settingsOpen);
  const setSettingsOpen = useAppStore((state) => state.setSettingsOpen);
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
        <div className="eyebrow">Three heroes. One command.</div>
        <h1 id="game-title">ANOTHERVERSE</h1>
        <p className="title-deck">
          Build a licensed squad, prepare for unstable breaches, and let every decision become part
          of the campaign record.
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
          <button
            className="button button-quiet"
            type="button"
            onClick={() => setSettingsOpen(true)}
          >
            Settings
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

      <aside className="title-aside" aria-label="Prototype status">
        <div className="signal-line">
          <span /> BREACH NETWORK / STANDBY
        </div>
        <p>Command foundation online</p>
        <dl>
          <div>
            <dt>Simulation</dt>
            <dd>Deterministic</dd>
          </div>
          <div>
            <dt>Squad limit</dt>
            <dd>3</dd>
          </div>
          <div>
            <dt>Save slot</dt>
            <dd>Local</dd>
          </div>
        </dl>
      </aside>

      {settingsOpen && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="settings-title"
          >
            <p className="eyebrow">Prototype settings</p>
            <h2 id="settings-title">Settings</h2>
            <p>Audio, text speed, and motion settings arrive with the playable combat slice.</p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => setSettingsOpen(false)}
              autoFocus
            >
              Close
            </button>
          </section>
        </div>
      )}
    </main>
  );
}
