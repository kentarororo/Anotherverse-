import { z } from 'zod';

export const ContentPackReferenceSchema = z.object({
  id: z.string().min(1),
  version: z.number().int().positive(),
  moduleIds: z.array(z.string().min(1)),
});

export const ContentManifestSchema = z.object({
  schemaVersion: z.literal(1),
  milestone: z.literal('M0'),
  packs: z.object({
    campaign: ContentPackReferenceSchema,
    characters: ContentPackReferenceSchema,
    scenarios: ContentPackReferenceSchema,
    enemies: ContentPackReferenceSchema,
    techniques: ContentPackReferenceSchema,
    equipment: ContentPackReferenceSchema,
    combatLanguage: ContentPackReferenceSchema,
  }),
});

const emptyPack = (id: string) => ({ id, version: 1, moduleIds: [] });

export const contentManifest = ContentManifestSchema.parse({
  schemaVersion: 1,
  milestone: 'M0',
  packs: {
    campaign: emptyPack('campaign-foundation'),
    characters: emptyPack('characters-foundation'),
    scenarios: emptyPack('scenarios-foundation'),
    enemies: emptyPack('enemies-foundation'),
    techniques: emptyPack('techniques-foundation'),
    equipment: emptyPack('equipment-foundation'),
    combatLanguage: emptyPack('combat-language-foundation'),
  },
});

function hashManifest(serialisedManifest: string): string {
  let hash = 0x811c9dc5;
  for (let index = 0; index < serialisedManifest.length; index += 1) {
    hash ^= serialisedManifest.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a-${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

export const CONTENT_MANIFEST_HASH = hashManifest(JSON.stringify(contentManifest));
