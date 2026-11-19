import path from 'node:path';

import { defineConfig, devices } from '@playwright/test';

import { adminUrl, authFile, databaseUrl, graphqlUrl, ports, root, webUrl } from './support/env.ts';

// The admin is driven through the public site's server, which forwards /admin, /login, /modals,
// /upload and /auth/passkeys to it, as in production. Both run in production mode, the admin
// from a fresh build.

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
      },
      reuseExistingServer,
    },
    {
      name: 'admin',
      command: 'pnpm build:service --logLevel error && node server.js',
      cwd: path.join(root, 'admin'),
      url: `${adminUrl}/health`,
      env: {
        NODE_ENV: 'production',
        PORT: String(ports.admin),
        GQL_HOST: graphqlUrl,
        PASSWORD_LOGIN_ENABLED: 'true',
      },
      timeout: 180_000,
      reuseExistingServer,
    },
    {
      name: 'web',
      command: 'pnpm css && node --import remix/node-tsx server.ts',
      cwd: path.join(root, 'web'),
      url: `${webUrl}/health`,
      env: {
        NODE_ENV: 'production',
        PORT: String(ports.web),
        ADMIN_HOST: adminUrl,
        GQL_HOST: graphqlUrl,
      },
      reuseExistingServer,
    },
  ],
});
