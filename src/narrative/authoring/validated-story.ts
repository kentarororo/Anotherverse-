import { STORY_AUTHORING } from '../../content/story/index.ts';
import { validateStoryAuthoring } from '../../engine/model/story-authoring.ts';

/**
 * The only runtime entry point for authored story content. Importing this module validates the
 * editable source before any generator or director can consume it.
 */
export const VALIDATED_STORY_AUTHORING = validateStoryAuthoring(STORY_AUTHORING);
