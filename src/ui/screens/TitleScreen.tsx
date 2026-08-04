import { useEffect, useRef, useState } from 'react';
import { createCampaignSeed } from '../../app/seed';
import { useAppStore } from '../../app/store';

const TEXT_SCALE_KEY = 'anotherverse.preference.text-scale';
const REDUCED_MOTION_KEY = 'anotherverse.preference.reduced-motion';

function storedTextScale(): '100' | '125' {
  return globalThis.localStorage.getItem(TEXT_SCALE_KEY) === '125' ? '125' : '100';
}

function storedReducedMotion(): boolean {
  return globalThis.localStorage.getItem(REDUCED_MOTION_KEY) === 'true';
}

export function TitleScreen() {
  const saveStatus = useAppStore((state) => state.saveStatus);
  const startCampaign = useAppStore((state) => state.startCampaign);
  const continueCampaign = useAppStore((state) => state.continueCampaign);
  const clearInvalidSave = useAppStore((state) => state.clearInvalidSave);
  const [seed, setSeed] = useState(createCampaignSeed);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [textScale, setTextScale] = useState<'100' | '125'>(storedTextScale);
  const [reducedMotion, setReducedMotion] = useState(storedReducedMotion);
  const settingsButtonRef = useRef<HTMLButtonElement>(null);
  const settingsDialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    document.documentElement.dataset.textScale = textScale;
    globalThis.localStorage.setItem(TEXT_SCALE_KEY, textScale);
  }, [textScale]);

  useEffect(() => {
    document.documentElement.dataset.reduceMotion = String(reducedMotion);
    globalThis.localStorage.setItem(REDUCED_MOTION_KEY, String(reducedMotion));
  }, [reducedMotion]);

  useEffect(() => {
    const dialog = settingsDialogRef.current;
    if (dialog === null) return;
    if (settingsOpen && !dialog.open) dialog.showModal();
    if (!settingsOpen && dialog.open) dialog.close();
  }, [settingsOpen]);

  const closeSettings = () => {
    settingsDialogRef.current?.close();
  };

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
        ? (saveStatus.reason ??
          `Save schema ${saveStatus.foundVersion ?? 'unknown'} cannot be safely migrated to this build. Reset the prototype autosave to continue.`)
        : null;

  return (
    <main className="title-screen">
      <section className="title-panel" aria-labelledby="game-title">
        <h1 id="game-title">ANOTHERVERSE</h1>
        <p className="title-deck">
          Guide three awakened hunters into the ruins of forgotten gods. Choose their plan, watch
          the battle unfold, and carry every victory, wound, and promise into the next chapter.
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

        <button
          ref={settingsButtonRef}
          className="settings-link"
          type="button"
          onClick={() => setSettingsOpen(true)}
        >
          Settings
        </button>

        <dialog
          ref={settingsDialogRef}
          className="settings-dialog"
          aria-labelledby="settings-title"
          onCancel={() => setSettingsOpen(false)}
          onClose={() => {
            setSettingsOpen(false);
            queueMicrotask(() => settingsButtonRef.current?.focus());
          }}
        >
          <div className="settings-dialog-heading">
            <div>
              <p className="eyebrow">Display</p>
              <h2 id="settings-title">Settings</h2>
            </div>
            <button className="button button-quiet" type="button" onClick={closeSettings}>
              Done
            </button>
          </div>

          <fieldset className="settings-fieldset">
            <legend>Text size</legend>
            <label>
              <input
                type="radio"
                name="text-scale"
                value="100"
                checked={textScale === '100'}
                onChange={() => setTextScale('100')}
              />
              Standard
            </label>
            <label>
              <input
                type="radio"
                name="text-scale"
                value="125"
                checked={textScale === '125'}
                onChange={() => setTextScale('125')}
              />
              125% text
            </label>
          </fieldset>

          <label className="settings-toggle">
            <input
              type="checkbox"
              checked={reducedMotion}
              onChange={(event) => setReducedMotion(event.target.checked)}
            />
            Reduce interface motion
          </label>
          <p className="settings-note">These display settings are saved only in this browser.</p>
        </dialog>

        {saveError && (
          <div className="save-error" role="alert">
            <span>{saveError}</span>
            <button className="text-button" type="button" onClick={clearInvalidSave}>
              Reset autosave
            </button>
          </div>
        )}

        <footer className="version">Tactical Slice v0.10.0 · Save Schema 12</footer>
      </section>
    </main>
  );
}
