import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { authFile, databaseUrl, graphqlUrl, ports, root, webUrl } from './support/env.ts';

// Web forwards /upload, /auth/passkeys and the API to GraphQL, as in production. It runs in
// production mode.

const reuseExistingServer = !process.env.CI;
const database = databaseUrl();

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  use: {
    baseURL: webUrl,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    // Signs in once and saves the session for the other tests
    { name: 'setup', testMatch: /\.setup\.ts$/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: authFile },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      name: 'graphql',
      command: 'pnpm exec tsx src/index.ts',
      cwd: path.join(root, 'graphql'),
      url: `${graphqlUrl}/health`,
      env: {
        // Development needs no API keys or TOKEN_SECRET; graphql/.env isn't loaded
        NODE_ENV: 'development',
        NODE_OPTIONS: '--disable-warning=DEP0040',
        ...(database ? { DATABASE_URL: database } : {}),
        GRAPHQL_PORT: String(ports.graphql),
        PASSWORD_LOGIN_ENABLED: 'true',
        // Passkeys belong to the site the tests sign in to
        WEBAUTHN_ORIGIN: webUrl,
        WEBAUTHN_RP_ID: 'localhost',
      },
      reuseExistingServer,
    },
    {
      name: 'web',
      command: 'node --import remix/node-tsx server.ts',
      cwd: path.join(root, 'web'),
      url: `${webUrl}/health`,
      env: {
        NODE_ENV: 'production',
        PORT: String(ports.web),
        GQL_HOST: graphqlUrl,
        PASSWORD_LOGIN_ENABLED: 'true',
      },
      reuseExistingServer,
    },
  ],
});
