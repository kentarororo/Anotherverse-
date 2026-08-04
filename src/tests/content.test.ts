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

  it('ties every generated hero background to an original class and unique Mythic Path', () => {
    const heroes = createGeneratedCampaignState('class-background-contract').draft.characters;
    expect(heroes).toHaveLength(3);
    for (const hero of heroes) {
      const pathClass = PATH_CLASSES[hero.role as keyof typeof PATH_CLASSES];
      expect(hero.pathClassId).toBe(pathClass.id);
      expect(hero.pathClassName).toBe(pathClass.name);
      expect(hero.signatureRuleId).toBe(pathClass.signatureRuleId);
      expect(hero.backgroundName).not.toBe(hero.callingName);
      expect(hero.formativeEvent.length).toBeGreaterThan(40);
      expect(hero.bond).toBe(hero.drive);
    }
  });

  it('enumerates Milestone 4 content through the production manifest', () => {
    const packs = Object.values(contentManifest.packs);
    expect(packs).toHaveLength(8);
    expect(contentManifest.milestone).toBe('M4');
    expect(contentManifest.packs.characters.moduleIds).toContain('lyra-vale');
    expect(contentManifest.packs.characters.moduleIds).toContain('tarin-sol');
    expect(contentManifest.packs.scenarios.moduleIds).toHaveLength(20);
    expect(contentManifest.packs.scenarios.moduleIds).toContain('social-4');
    expect(contentManifest.packs.enemies.moduleIds).toHaveLength(8);
    expect(contentManifest.packs.equipment.moduleIds).toEqual(['houndglass-edge', 'weaver-ward']);
    expect(contentManifest.packs.combatLanguage.moduleIds).toHaveLength(28);
    expect(contentManifest.packs.combatLanguage.moduleIds).toContain('resource-frame-4');
    expect(contentManifest.packs.story.moduleIds).toHaveLength(23);
    expect(contentManifest.packs.story.moduleIds).toContain('mythic-opening-turns-1-3');
    expect(contentManifest.packs.story.moduleIds).toContain('causal-scene-beats');
    expect(contentManifest.packs.story.moduleIds).toContain('social-4');
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
