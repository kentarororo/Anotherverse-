import { useAppStore } from '../../app/store';

const formationSlots = ['FRONT', 'CENTRE', 'REAR'] as const;

export function CommandScreen() {
  const game = useAppStore((state) => state.game);
  const returnToTitle = useAppStore((state) => state.returnToTitle);

  return (
    <main className="command-screen">
      <header className="command-header">
        <div className="campaign-label">
          <span className="status-dot" /> {game.campaignBible?.city.name ?? 'Campaign'}
        </div>
        <dl className="campaign-metrics">
          <div>
            <dt>Turn</dt>
            <dd>{game.turn}</dd>
          </div>
          <div>
            <dt>Rank</dt>
            <dd>{game.rank}</dd>
          </div>
          <div>
            <dt>Threat</dt>
            <dd>{game.threat}</dd>
          </div>
          <div>
            <dt>Supplies</dt>
            <dd>{game.supplies}</dd>
          </div>
        </dl>
        <button className="button button-quiet header-menu" type="button" onClick={returnToTitle}>
          Save / Menu
        </button>
      </header>

      <div className="command-grid">
        <section className="panel trio-panel" aria-labelledby="trio-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Squad status</p>
              <h2 id="trio-title">The Trio</h2>
            </div>
            <span className="badge">0 / 3</span>
          </div>
          <div className="hero-list">
            {formationSlots.map((slot, index) => (
              <article className="hero-placeholder" key={slot}>
                <span className="hero-index">0{index + 1}</span>
                <div>
                  <strong>{slot}</strong>
                  <p>Hero generation begins in Milestone 2.</p>
                </div>
              </article>
            ))}
          </div>
          <div className="synergy-strip">
            <span>Squad synergy</span>
            <strong>Awaiting roster</strong>
          </div>
        </section>

        <section className="panel operation-panel" aria-labelledby="operation-title">
          <nav className="phase-tabs" aria-label="Turn phases">
            <span className="active">Brief</span>
            <span>Plan</span>
            <span>Battle</span>
            <span>Aftermath</span>
          </nav>
          <div className="operation-content">
            <p className="eyebrow">Operation 01 · Foundation check</p>
            <h2 id="operation-title">No active operation</h2>
            <p>
              The command contract, seeded streams, and report boundaries are online. The first
              deterministic encounter is the next milestone.
            </p>
            <div className="stage-empty" aria-label="Battle stage not yet active">
              <div className="radar-ring">
                <span />
              </div>
              <p>BATTLE STAGE / IDLE</p>
            </div>
          </div>
        </section>

        <section className="panel decision-panel" aria-labelledby="decision-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Decision / Forecast</p>
              <h2 id="decision-title">Awaiting contract</h2>
            </div>
          </div>
          <div className="forecast-list">
            <div>
              <span>Victory band</span>
              <strong>—</strong>
            </div>
            <div>
              <span>Incoming damage</span>
              <strong>—</strong>
            </div>
            <div>
              <span>Scouting confidence</span>
              <strong>None</strong>
            </div>
          </div>
          <div className="requirements">
            <p className="eyebrow">Required before commit</p>
            <ul>
              <li>Generate three heroes</li>
              <li>Build an encounter</li>
              <li>Lock a team plan</li>
            </ul>
          </div>
          <button className="button button-primary commit-button" type="button" disabled>
            Commit unavailable · M1
          </button>
        </section>
      </div>

      <section className="event-feed" aria-labelledby="event-feed-title">
        <div>
          <p className="eyebrow">Chronology</p>
          <h2 id="event-feed-title">Event Feed</h2>
        </div>
        <ol>
          <li>
            <time>T00</time>
            <span>
              Campaign created from seed <code>{game.campaignSeed}</code>.
            </span>
          </li>
          <li>
            <time>T00</time>
            <span>Seven named random streams initialised at position zero.</span>
          </li>
          <li>
            <time>T00</time>
            <span>Command network ready for the combat vertical slice.</span>
          </li>
        </ol>
      </section>
    </main>
  );
}
