import { useEffect, useState } from 'react';
import { useAppStore } from '../../app/store';
import { explainCurrentHeroPolicies } from '../../engine/combat/policy';
import type { DevelopmentUnlock } from '../../engine/model/progression';
import { previewMaterialFusion, type FusionMaterialIds } from '../../engine/progression/crafting';

export function ManagementDrawer() {
  const drawer = useAppStore((state) => state.drawer);
  const game = useAppStore((state) => state.game);
  const closeDrawer = useAppStore((state) => state.closeDrawer);
  const equipItem = useAppStore((state) => state.equipItem);
  const learnTechnique = useAppStore((state) => state.learnTechnique);
  const fuseMaterials = useAppStore((state) => state.fuseMaterials);
  const [selectedMaterialIds, setSelectedMaterialIds] = useState<string[]>([]);

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

  useEffect(() => {
    setSelectedMaterialIds([]);
  }, [drawer?.type]);

  if (drawer === null) return null;
  const hero = game.generatedDefinitions.characters.find((candidate) => candidate.id === drawer.id);
  const member = hero === undefined ? undefined : game.partyState[hero.id];
  const developmentUnlocks = Object.values(
    game.generatedDefinitions.techniques,
  ) as DevelopmentUnlock[];
  const fusionMaterials = Object.values(game.generatedDefinitions.materials);
  const selectedFusionMaterials =
    selectedMaterialIds.length === 3 ? (selectedMaterialIds as FusionMaterialIds) : null;
  const fusionPreview =
    selectedFusionMaterials === null
      ? null
      : previewMaterialFusion(selectedFusionMaterials, game.generatedDefinitions.materials);

  const addMaterial = (materialId: string) => {
    const owned = game.materials[materialId] ?? 0;
    const selected = selectedMaterialIds.filter((id) => id === materialId).length;
    if (selectedMaterialIds.length >= 3 || selected >= owned) return;
    setSelectedMaterialIds([...selectedMaterialIds, materialId]);
  };

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
                <dt>Awakening stage</dt>
                <dd>{member.callingRank}</dd>
              </div>
              <div>
                <dt>Training points</dt>
                <dd>{member.trainingPoints}</dd>
              </div>
              <div>
                <dt>Awakening Trial</dt>
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
            <h3>Class features</h3>
            <div className="calling-story-grid">
              {[
                ['Signature', hero.signature],
                ['Reaction', hero.reaction],
                ['Limitation', hero.limitation],
              ].map(([label, mechanic]) => (
                <article className="calling-story-card" key={label}>
                  <strong>{label}</strong>
                  <p>{mechanic}</p>
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
            <h3>Awakening techniques</h3>
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
            <p>Equipment changes a hero’s stats as soon as it is equipped.</p>
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
                    {game.generatedDefinitions.characters
                      .filter((character) => game.recruitedCharacterIds.includes(character.id))
                      .map((character) => (
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

        {drawer.type === 'forge' && (
          <div className="drawer-content forge-drawer">
            <p>
              Fuse any three monster materials. Their nature changes the odds; the exact relic is
              revealed only when the forge answers.
            </p>
            <div className="forge-resources" aria-label="Forge resources">
              <span>
                {Object.values(game.materials).reduce((sum, count) => sum + count, 0)} materials
              </span>
              <span>{game.coins} Coin</span>
              <span>{game.relicDust} Dust</span>
            </div>
            <h3>Monster materials</h3>
            <div className="material-grid">
              {fusionMaterials.map((material) => {
                const owned = game.materials[material.id] ?? 0;
                const selected = selectedMaterialIds.filter((id) => id === material.id).length;
                const source = game.generatedDefinitions.enemies[material.sourceEnemyId];
                return (
                  <button
                    className="material-card"
                    type="button"
                    disabled={owned <= selected || selectedMaterialIds.length >= 3}
                    onClick={() => addMaterial(material.id)}
                    key={material.id}
                  >
                    <span>
                      {owned} owned · {selected} in forge
                    </span>
                    <strong>{material.name}</strong>
                    <small>{source?.name ?? 'Unknown monster'}</small>
                    <p>{material.description}</p>
                  </button>
                );
              })}
            </div>
            <h3>Fusion bowl · {selectedMaterialIds.length} / 3</h3>
            <div className="fusion-bowl" aria-label="Selected forge materials">
              {selectedMaterialIds.length === 0 && <span>Choose three materials above.</span>}
              {selectedMaterialIds.map((materialId, index) => (
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMaterialIds(
                      selectedMaterialIds.filter((_, selectedIndex) => selectedIndex !== index),
                    )
                  }
                  key={`${materialId}-${index}`}
                >
                  {game.generatedDefinitions.materials[materialId]?.name} ×
                </button>
              ))}
            </div>
            {fusionPreview !== null && (
              <section className="fusion-preview" aria-label="Fusion preview">
                <span>Likely result</span>
                <h3>
                  {fusionPreview.slot === 'weapon' ? 'Weapon' : 'Support relic'} ·{' '}
                  {fusionPreview.affinity} counter
                </h3>
                <p>{fusionPreview.description}</p>
                <strong>
                  Likely +{fusionPreview.likelyBonuses.powerBonus} Power · +
                  {fusionPreview.likelyBonuses.guardBonus} Guard
                </strong>
                <div className="fusion-odds">
                  {fusionPreview.candidates.map((candidate) => (
                    <small key={`${candidate.slot}-${candidate.affinity}`}>
                      {candidate.slot} / {candidate.affinity}: {Math.round(candidate.chance * 100)}%
                    </small>
                  ))}
                </div>
              </section>
            )}
            <button
              className="button button-primary forge-action"
              type="button"
              disabled={selectedFusionMaterials === null}
              onClick={() => {
                if (selectedFusionMaterials === null) return;
                fuseMaterials(selectedFusionMaterials);
                setSelectedMaterialIds([]);
              }}
            >
              Fuse three materials
            </button>
            {game.fusionHistory.at(-1) !== undefined &&
              (() => {
                const record = game.fusionHistory.at(-1)!;
                const item = game.generatedDefinitions.items[record.itemId];
                return (
                  <article className="forge-result">
                    <span>Last fusion</span>
                    <strong>
                      {record.duplicate ? `${record.relicDustGranted} Dust recovered` : item?.name}
                    </strong>
                    {!record.duplicate && item !== undefined && <p>{item.description}</p>}
                  </article>
                );
              })()}
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
                    {entry.knowledge < 2 && <p>Face this enemy once to reveal its weakness.</p>}
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
            {game.currentScenario !== null && (
              <>
                <h3>Main quest</h3>
                <article className="drawer-item">
                  <div>
                    <strong>{game.currentScenario.quest.title}</strong>
                    <p>
                      Act {game.currentScenario.quest.act}: {game.currentScenario.quest.actTitle}
                    </p>
                    <small>Current goal: {game.currentScenario.quest.objective}</small>
                  </div>
                </article>
              </>
            )}
            <h3>Trio standing</h3>
            <article className="drawer-item">
              <div>
                <strong>{game.rank} Hunter Rank</strong>
                <p>
                  Renown {game.reputation >= 0 ? '+' : ''}
                  {game.reputation} · guilds and rivals react to this standing
                </p>
              </div>
            </article>
            <h3>Relationships</h3>
            {game.relationships
              .filter((relationship) =>
                relationship.characterIds.every((id) => game.recruitedCharacterIds.includes(id)),
              )
              .map((relationship) => (
                <article className="drawer-item" key={relationship.pairId}>
                  <div>
                    <strong>
                      {relationship.characterIds
                        .map(
                          (id) =>
                            game.generatedDefinitions.characters.find((hero) => hero.id === id)
                              ?.name,
                        )
                        .join(' / ')}
                    </strong>
                    <p>
                      Bond {relationship.value >= 0 ? '+' : ''}
                      {relationship.value} · {relationship.factIds.length} shared chapters
                    </p>
                  </div>
                </article>
              ))}
            <h3>Hero stories</h3>
            {game.storyThreads
              .filter((thread) =>
                thread.castIds.every((id) => game.recruitedCharacterIds.includes(id)),
              )
              .map((thread) => (
                <article className="drawer-item" key={thread.id}>
                  <div>
                    <strong>
                      {game.generatedDefinitions.characters.find((hero) =>
                        thread.castIds.includes(hero.id),
                      )?.name ?? 'Hero story'}
                    </strong>
                    <p>
                      Chapter {thread.stage + 1} ·{' '}
                      {thread.status === 'resolved' ? 'Complete' : 'Unfinished'}
                    </p>
                  </div>
                </article>
              ))}
            <h3>Quest journal</h3>
            {[...game.worldFacts]
              .filter((fact) => fact.createdTurn > 0)
              .reverse()
              .slice(0, 12)
              .map((fact) => (
                <article className="drawer-item" key={fact.id}>
                  <div>
                    <strong>Chapter {fact.createdTurn}</strong>
                    <p>{String(fact.value ?? fact.objectId ?? fact.subjectId)}</p>
                  </div>
                </article>
              ))}
          </div>
        )}

        {drawer.type === 'logs' && (
          <div className="drawer-content">
            <h3>Completed chapters</h3>
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
                        ? 'Quest choice'
                        : `${battle.rounds} rounds · ${battle.events.length} actions`}
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
