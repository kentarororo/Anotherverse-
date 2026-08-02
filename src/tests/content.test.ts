import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH, ContentManifestSchema, contentManifest } from '../content/manifest';

describe('production content manifest', () => {
  it('uses the exact same validated manifest imported by the browser', () => {
    expect(ContentManifestSchema.parse(contentManifest)).toEqual(contentManifest);
    expect(CONTENT_MANIFEST_HASH).toMatch(/^fnv1a-[0-9a-f]{8}$/);
  });

  it('enumerates the temporary Milestone 1 content through the production manifest', () => {
    const packs = Object.values(contentManifest.packs);
    expect(packs).toHaveLength(7);
    expect(contentManifest.milestone).toBe('M1');
    expect(contentManifest.packs.characters.moduleIds).toEqual([
      'mira-vale',
      'dax-ren',
      'sorrel-voss',
    ]);
    expect(contentManifest.packs.scenarios.moduleIds).toContain('m1-glassline-breach');
  });
});
