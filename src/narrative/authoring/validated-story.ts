import { LEGACY_MODERN_STORY_AUTHORING } from '../../content/story/index.ts';
import { validateStoryAuthoring } from '../../engine/model/story-authoring.ts';

/**
 * Test-only validation entry point for the archived modern-city corpus. Production campaign
 * generation does not import this module.
 */
export const VALIDATED_LEGACY_MODERN_STORY_AUTHORING = validateStoryAuthoring(
  LEGACY_MODERN_STORY_AUTHORING,
);
