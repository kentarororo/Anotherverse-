import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH, ContentManifestSchema, contentManifest } from '../content/manifest';
import { temporaryEnemies } from '../content/milestone-one';
import { PATH_CLASSES } from '../content/path-classes';
import { createGeneratedCampaignState } from '../engine/generation/campaign';

describe('production content manifest', () => {
  it('uses the exact same validated manifest imported by the browser', () => {
    expect(ContentManifestSchema.parse(contentManifest)).toEqual(contentManifest);
    expect(CONTENT_MANIFEST_HASH).toMatch(/^fnv1a-[0-9a-f]{8}$/);
  });

  it('ties every generated hero background to an original class and unique Mythic Awakening', () => {
    const heroes = createGeneratedCampaignState('class-background-contract').draft.characters;
    expect(heroes).toHaveLength(3);
    for (const hero of heroes) {
      const pathClass = PATH_CLASSES[hero.role as keyof typeof PATH_CLASSES];
      expect(hero.pathClassId).toBe(pathClass.id);
      expect(hero.pathClassName).toBe(pathClass.name);
      expect(hero.signatureRuleId).toBe(pathClass.signatureRuleId);
      expect(hero.backgroundName).not.toBe(hero.callingName);
      expect(hero.formativeEvent.length).toBeGreaterThan(40);
      expect(hero.bond).not.toBe(hero.drive);
    }
  });

  it('enumerates Milestone 4 content through the production manifest', () => {
    const packs = Object.values(contentManifest.packs);
    expect(packs).toHaveLength(9);
    expect(contentManifest.milestone).toBe('M4');
    expect(contentManifest.packs.characters.moduleIds).toContain('lyra-vale');
    expect(contentManifest.packs.characters.moduleIds).toContain('tarin-sol');
    expect(contentManifest.packs.scenarios.moduleIds).toHaveLength(60);
    expect(contentManifest.packs.scenarios.moduleIds).toContain('quest-last-bell-turn-20');
    expect(contentManifest.packs.enemies.moduleIds).toHaveLength(10);
    expect(contentManifest.packs.equipment.moduleIds).toHaveLength(10);
    expect(contentManifest.packs.equipment.moduleIds).toContain('funeral-bell');
    expect(contentManifest.packs.materials.moduleIds).toHaveLength(10);
    expect(contentManifest.packs.materials.moduleIds).toContain('grave-hound-fang');
    expect(contentManifest.packs.combatLanguage.moduleIds).toHaveLength(7);
    expect(contentManifest.packs.combatLanguage.moduleIds).toContain('resource-frame-1');
    expect(contentManifest.packs.story.moduleIds).toHaveLength(6);
    expect(contentManifest.packs.story.moduleIds).toContain('mythic-opening-turns-1-3');
    expect(contentManifest.packs.story.moduleIds).toContain('causal-scene-beats');
    expect(contentManifest.packs.story.moduleIds).toContain('quest-fourth-god');
    expect(
      temporaryEnemies.every(
        (enemy) =>
          enemy.ecology !== undefined &&
          enemy.counterplay !== undefined &&
          enemy.rewardIdentity !== undefined &&
          (enemy.scenarioTags?.length ?? 0) >= 3,
      ),
    ).toBe(true);
  });
});
