import { useEffect } from 'react';
import { useAppStore } from '../../app/store';
import { explainCurrentHeroPolicies } from '../../engine/combat/policy';
import type { DevelopmentUnlock } from '../../engine/model/progression';

export function ManagementDrawer() {
  const drawer = useAppStore((state) => state.drawer);
  const game = useAppStore((state) => state.game);
  const closeDrawer = useAppStore((state) => state.closeDrawer);
  const equipItem = useAppStore((state) => state.equipItem);
  const learnTechnique = useAppStore((state) => state.learnTechnique);

  useEffect(() => {
    if (drawer === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [drawer, closeDrawer]);

  if (drawer === null) return null;
  const hero = game.generatedDefinitions.characters.find((candidate) => candidate.id === drawer.id);
  const member = hero === undefined ? undefined : game.partyState[hero.id];
  const developmentUnlocks = Object.values(
    game.generatedDefinitions.techniques,
  ) as DevelopmentUnlock[];

  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={closeDrawer}>
      <aside
        className="management-drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`${drawer.type} details`}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header>
          <div>
            <p className="eyebrow">Management</p>
            <h2>{drawer.type.toUpperCase()}</h2>
          </div>
          <button className="button button-quiet" type="button" onClick={closeDrawer} autoFocus>
            Close
          </button>
        </header>

        {drawer.type === 'character' && hero !== undefined && member !== undefined && (
          <div className="drawer-content">
            <h3>
              {hero.name} — {hero.pathClassName} / {hero.callingName}
            </h3>
            <section className="character-story" aria-label={`${hero.name} story`}>
              <p>{hero.story.portrait}</p>
              <blockquote>&ldquo;{hero.story.interiorVoice}&rdquo;</blockquote>
              <dl className="story-motives">
                <div>
                  <dt>Background</dt>
                  <dd>{hero.backgroundName}</dd>
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
                  <dt>Contradiction</dt>
                  <dd>{hero.contradiction}</dd>
                </div>
                <div>
                  <dt>Bond</dt>
                  <dd>{hero.bond}</dd>
                </div>
              </dl>
            </section>
            <dl className="detail-list">
              <div>
                <dt>Level / XP</dt>
                <dd>
                  {member.level} / {member.experience}
                </dd>
              </div>
              <div>
                <dt>Path rank</dt>
                <dd>{member.callingRank}</dd>
              </div>
              <div>
                <dt>Training points</dt>
                <dd>{member.trainingPoints}</dd>
              </div>
              <div>
                <dt>Awakening</dt>
                <dd>{hero.awakeningCondition}</dd>
              </div>
              <div>
                <dt>Weapon</dt>
                <dd>
                  {member.equipment.weapon === null
                    ? 'None'
                    : game.generatedDefinitions.items[member.equipment.weapon]?.name}
                </dd>
              </div>
              <div>
                <dt>Support</dt>
                <dd>
                  {member.equipment.support === null
                    ? 'None'
                    : game.generatedDefinitions.items[member.equipment.support]?.name}
                </dd>
              </div>
            </dl>
            <h3>Path in the story</h3>
            <div className="calling-story-grid">
              {[
                ['Signature', hero.story.signature, hero.signature],
                ['Reaction', hero.story.reaction, hero.reaction],
                ['Limitation', hero.story.limitation, hero.limitation],
              ].map(([label, story, mechanic]) => (
                <article className="calling-story-card" key={label}>
                  <strong>{label}</strong>
                  <p>{story}</p>
                  <small>{mechanic}</small>
                </article>
              ))}
            </div>
            <h3>Equipped techniques</h3>
            {hero.techniques.map((technique) => (
              <article className="drawer-item technique-story-card" key={technique.id}>
                <div>
                  <strong>{technique.name}</strong>
                  <p>{technique.storyDescription}</p>
                  <div className="technique-mechanics" aria-label={`${technique.name} rules`}>
                    <strong>{technique.mechanicLabel}</strong>
                    <span>Cost {technique.resourceCost}</span>
                    <span>Cooldown {technique.cooldownRounds}</span>
                    <span>{technique.condition}</span>
                  </div>
                </div>
              </article>
            ))}
            <h3>Path development</h3>
            {developmentUnlocks
              .filter((unlock) => unlock.id.startsWith(hero.callingId))
              .map((unlock) => {
                const learned = member.learnedTechniqueIds.includes(unlock.id);
                return (
                  <article className="drawer-item development-unlock" key={unlock.id}>
                    <div>
                      <strong>{unlock.name}</strong>
                      <p>{unlock.storyDescription}</p>
                      <small className="unlock-condition">{unlock.unlockCondition}</small>
                    </div>
                    <button
                      className="button"
                      type="button"
                      disabled={learned || member.trainingPoints < 1}
                      onClick={() => learnTechnique(hero.id, unlock.id)}
                    >
                      {learned ? 'Unlocked' : 'Unlock · 1 point'}
                    </button>
                  </article>
                );
              })}
          </div>
        )}

        {drawer.type === 'equipment' && (
          <div className="drawer-content">
            <p>Rewards change canonical combat stats and are autosaved when equipped.</p>
            {game.inventoryIds.length === 0 && (
              <div className="drawer-empty">No equipment recovered yet.</div>
            )}
            {game.inventoryIds.map((itemId) => {
              const item = game.generatedDefinitions.items[itemId];
              if (item === undefined) return null;
              return (
                <article className="inventory-item" key={item.id}>
                  <div>
                    <span>{item.slot}</span>
                    <h3>{item.name}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="equip-actions">
                    {game.generatedDefinitions.characters.map((character) => (
                      <button
                        className="button"
                        type="button"
                        onClick={() => equipItem(character.id, item.id)}
                        key={character.id}
                      >
                        Equip · {character.name}
                      </button>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {drawer.type === 'bestiary' && (
          <div className="drawer-content">
            {Object.values(game.bestiary).map((entry) => {
              const enemy = game.generatedDefinitions.enemies[entry.enemyId];
              return (
                <article className="inventory-item" key={entry.enemyId}>
                  <div>
                    <span>Knowledge {entry.knowledge}/3</span>
                    <h3>{enemy?.name ?? entry.enemyId}</h3>
                    <p>{enemy?.signature}</p>
                    {enemy?.ecology !== undefined && <p>{enemy.ecology}</p>}
                    {entry.knowledge >= 2 && enemy?.counterplay !== undefined && (
                      <p>
                        <strong>Counterplay:</strong> {enemy.counterplay}
                      </p>
                    )}
                    {entry.knowledge < 2 && <p>Counterplay requires a completed encounter.</p>}
                    {entry.knowledge >= 3 && enemy?.rewardIdentity !== undefined && (
                      <p>
                        <strong>Known reward:</strong> {enemy.rewardIdentity}
                      </p>
                    )}
                    <small>Known: {entry.revealedTags.join(', ')}</small>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {drawer.type === 'world' && (
          <div className="drawer-content">
            <h3>Trio standing</h3>
            <article className="drawer-item">
              <div>
                <strong>{game.rank} Path Rank</strong>
                <p>
                  Renown {game.reputation >= 0 ? '+' : ''}
                  {game.reputation} · guilds and rivals react to this standing
                </p>
              </div>
            </article>
            <h3>Relationships</h3>
            {game.relationships.map((relationship) => (
              <article className="drawer-item" key={relationship.pairId}>
                <div>
                  <strong>
                    {relationship.characterIds
                      .map(
                        (id) =>
                          game.generatedDefinitions.characters.find((hero) => hero.id === id)?.name,
                      )
                      .join(' / ')}
                  </strong>
                  <p>
                    Bond {relationship.value >= 0 ? '+' : ''}
                    {relationship.value} · {relationship.factIds.length} shared memories
                  </p>
                </div>
              </article>
            ))}
            <h3>Open story threads</h3>
            {game.storyThreads.map((thread) => (
              <article className="drawer-item" key={thread.id}>
                <div>
                  <strong>{thread.arcId}</strong>
                  <p>
                    Stage {thread.stage} · Urgency {thread.urgency} · {thread.status}
                  </p>
                </div>
              </article>
            ))}
            <h3>Recent world facts</h3>
            {[...game.worldFacts]
              .reverse()
              .slice(0, 12)
              .map((fact) => (
                <article className="drawer-item" key={fact.id}>
                  <div>
                    <strong>{fact.relation}</strong>
                    <p>{String(fact.value ?? fact.objectId ?? fact.subjectId)}</p>
                  </div>
                </article>
              ))}
          </div>
        )}

        {drawer.type === 'logs' && (
          <div className="drawer-content">
            <h3>Archived turn reports</h3>
            {game.aftermathReports.length === 0 && (
              <div className="drawer-empty">No turns have been resolved yet.</div>
            )}
            {[...game.aftermathReports].reverse().map((aftermath) => {
              const battle = game.battleReports.find(
                (report) => report.id === aftermath.battleReportId,
              );
              return (
                <article className="drawer-item" key={aftermath.id}>
                  <div>
                    <strong>
                      Turn {aftermath.turn}
                      {battle === undefined ? ' · Situation' : ` · Battle ${battle.outcome}`}
                    </strong>
                    <p>{aftermath.summary}</p>
                    <small>
                      {battle === undefined
                        ? `${aftermath.factIdsWritten.length} fact recorded`
                        : `${battle.rounds} rounds · ${battle.events.length} structured events`}
                    </small>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {drawer.type === 'debug' && (
          <div className="drawer-content debug-tree">
            <pre>
              {JSON.stringify(
                {
                  seed: game.campaignSeed,
                  streams: game.rngStreams,
                  currentScenario: game.currentScenario,
                  director: game.directorDebug,
                  worldFacts: game.worldFacts,
                  storyThreads: game.storyThreads,
                  recentScenarioFingerprints: game.scenarioFingerprints.slice(-20),
                  combatActionWeights: explainCurrentHeroPolicies(game),
                  manifest: game.contentManifestHash,
                  contentValidation: {
                    status: 'validated',
                    characters: game.generatedDefinitions.characters.length,
                    enemies: Object.keys(game.generatedDefinitions.enemies).length,
                    items: Object.keys(game.generatedDefinitions.items).length,
                    developmentUnlocks: Object.keys(game.generatedDefinitions.techniques).length,
                  },
                },
                null,
                2,
              )}
            </pre>
          </div>
        )}
      </aside>
    </div>
  );
}
