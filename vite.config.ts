import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';
import { VALIDATED_STORY_AUTHORING } from './src/narrative/authoring/validated-story.ts';

// Loading the Vite config is the build-time gate for the user-editable story source.
void VALIDATED_STORY_AUTHORING;

export default defineConfig({
  base: '/Anotherverse-/',
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
  preview: {
    host: '127.0.0.1',
    port: 4173,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    exclude: ['tests/browser/**', 'node_modules/**', 'dist/**'],
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});
