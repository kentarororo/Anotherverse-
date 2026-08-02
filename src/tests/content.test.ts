import { describe, expect, it } from 'vitest';
import { CONTENT_MANIFEST_HASH, ContentManifestSchema, contentManifest } from '../content/manifest';

describe('production content manifest', () => {
  it('uses the exact same validated manifest imported by the browser', () => {
    expect(ContentManifestSchema.parse(contentManifest)).toEqual(contentManifest);
    expect(CONTENT_MANIFEST_HASH).toMatch(/^fnv1a-[0-9a-f]{8}$/);
  });

  it('declares later content packs without inventing Milestone 0 content', () => {
    const packs = Object.values(contentManifest.packs);
    expect(packs).toHaveLength(7);
    expect(packs.every((pack) => pack.moduleIds.length === 0)).toBe(true);
  });
});
