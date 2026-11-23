// Creates the local admin user the end-to-end tests sign in as, or resets its password. Its
// credentials live in e2e/.env (gitignored), which this copies from e2e/.env.example when it's
// missing; an empty password is generated and saved there.
import { randomBytes } from 'node:crypto';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { stdout } from 'node:process';
import { fileURLToPath } from 'node:url';
import { parseEnv } from 'node:util';

import bcrypt from 'bcryptjs';

import { createDatabase } from '#/database/postgres';
import { newId, userRoles, users } from '#/database/tables';

const SALT_ROUNDS = 10;
const envFile = fileURLToPath(new URL('../../../e2e/.env', import.meta.url));
const exampleFile = fileURLToPath(new URL('../../../e2e/.env.example', import.meta.url));

let envText = readFileSync(existsSync(envFile) ? envFile : exampleFile, 'utf8');
// Variables already set win over the file, as they do for the tests
const env = { ...parseEnv(envText), ...process.env };

const email = env.E2E_ADMIN_EMAIL?.trim() || 'e2e-admin@highforthis.test';
// A .test address can't belong to anyone, so this never resets a real account's password
if (!email.endsWith('.test')) {
  throw new Error(`E2E_ADMIN_EMAIL must be a .test address, not ${email}.`);
}
const password = env.E2E_ADMIN_PASSWORD || randomBytes(24).toString('base64url');

const connectionString = env.E2E_DATABASE_URL || env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to graphql/.env or set E2E_DATABASE_URL.');
}
const { hostname } = new URL(connectionString);
if (!['', 'localhost', '127.0.0.1', '[::1]'].includes(hostname)) {
  throw new Error(`Refusing to add a test admin to a database on ${hostname}; use a local one.`);
}

// Saves the values in e2e/.env, replacing the lines that set them
for (const [key, value] of Object.entries({
  E2E_ADMIN_EMAIL: email,
  E2E_ADMIN_PASSWORD: password,
})) {
  const line = new RegExp(`^${key}=.*$`, 'm');
  envText = line.test(envText)
    ? envText.replace(line, `${key}=${value}`)
    : `${envText.trimEnd()}\n${key}=${value}\n`;
}
writeFileSync(envFile, envText, { mode: 0o600 });

const db = createDatabase(connectionString);

try {
  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await db
    .query(users)
    .upsert(
      { id: newId(), email, hash, name: 'E2E Admin' },
      { conflictTarget: ['email'], update: { hash } }
    );
  const user = await db.findOne(users, { where: { email } });
  await db
    .query(userRoles)
    .upsert(
      { id: newId(), userId: user!.id, name: 'admin' },
      { conflictTarget: ['userId', 'name'], update: {} }
    );
  stdout.write(`Test admin ${email} is ready; its password is in e2e/.env.\n`);
} finally {
  await db.close();
}
