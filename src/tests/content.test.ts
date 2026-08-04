import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH, ContentManifestSchema, contentManifest } from '../content/manifest';
import { temporaryEnemies } from '../content/milestone-one';

describe('production content manifest', () => {
  it('uses the exact same validated manifest imported by the browser', () => {
    expect(ContentManifestSchema.parse(contentManifest)).toEqual(contentManifest);
    expect(CONTENT_MANIFEST_HASH).toMatch(/^fnv1a-[0-9a-f]{8}$/);
  });

  it('enumerates Milestone 4 content through the production manifest', () => {
    const packs = Object.values(contentManifest.packs);
    expect(packs).toHaveLength(8);
    expect(contentManifest.milestone).toBe('M4');
    expect(contentManifest.packs.characters.moduleIds).toContain('iron-echo');
    expect(contentManifest.packs.characters.moduleIds).toContain('spirit-switchboard');
    expect(contentManifest.packs.scenarios.moduleIds).toHaveLength(20);
    expect(contentManifest.packs.scenarios.moduleIds).toContain('social-4');
    expect(contentManifest.packs.enemies.moduleIds).toHaveLength(8);
    expect(contentManifest.packs.equipment.moduleIds).toEqual(['houndglass-edge', 'weaver-ward']);
    expect(contentManifest.packs.combatLanguage.moduleIds).toHaveLength(28);
    expect(contentManifest.packs.combatLanguage.moduleIds).toContain('resource-frame-4');
    expect(contentManifest.packs.story.moduleIds).toHaveLength(33);
    expect(contentManifest.packs.story.moduleIds).toContain('vanta-cross');
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
