import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [{ find: /^#\//, replacement: fileURLToPath(new URL('./src/', import.meta.url)) }],
  },
  test: {
    // src/env.ts validates these on import; tests never reach the database or external services
    env: {
      DATABASE_URL: 'postgresql://test@localhost:5432/test',
      GCS_BUCKET: 'test',
      GCS_CLIENT_EMAIL: 'test@example.com',
      GCS_PRIVATE_KEY: 'test',
      TOKEN_SECRET: 'test',
      YOUTUBE_API_KEY: 'test',
    },
  },
});
