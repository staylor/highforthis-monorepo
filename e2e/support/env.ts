import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

export const root = fileURLToPath(new URL('../../', import.meta.url));

// The signed-in session the setup project saves for the other tests
export const authFile = fileURLToPath(new URL('../.auth/admin.json', import.meta.url));

// e2e/.env holds the test admin's credentials (see .env.example). Variables already set win.
const envFile = new URL('../.env', import.meta.url);
if (existsSync(envFile)) {
  process.loadEnvFile(envFile);
}

// Ports of their own, so the tests' servers don't clash with `pnpm dev`
export const ports = { web: 3200, admin: 3201, graphql: 3202 };
export const webUrl = `http://localhost:${ports.web}`;
export const adminUrl = `http://localhost:${ports.admin}`;
export const graphqlUrl = `http://localhost:${ports.graphql}`;

/** The test admin's email and password, from e2e/.env. */
export function credentials() {
  const { E2E_ADMIN_EMAIL: email, E2E_ADMIN_PASSWORD: password } = process.env;
  if (!email || !password) {
    throw new Error('No test admin credentials: run `pnpm e2e:admin` to create e2e/.env.');
  }
  return { email, password };
}

/**
 * The database the tests' GraphQL server uses: E2E_DATABASE_URL, or GraphQL's own. Undefined
 * when there's neither, as in CI's lint job, which loads the config without running the tests;
 * `pnpm e2e:admin` says what's missing before the tests start.
 */
export function databaseUrl() {
  const graphqlEnv = new URL('../../graphql/.env', import.meta.url);
  return (
    process.env.E2E_DATABASE_URL ||
    process.env.DATABASE_URL ||
    (existsSync(graphqlEnv) ? parseEnv(readFileSync(graphqlEnv, 'utf8')).DATABASE_URL : undefined)
  );
}
