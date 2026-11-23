import { stdin, stdout } from 'node:process';
import { createInterface } from 'node:readline/promises';
import { Writable } from 'node:stream';

import bcrypt from 'bcryptjs';

import { createDatabase } from '#/database/postgres';
import { sessions, userRoleRows, users } from '#/database/tables';

const SALT_ROUNDS = 10;
const MINIMUM_PASSWORD_LENGTH = 12;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Add it to graphql/.env or export it first.');
}

let hideInput = false;
const promptOutput = new Writable({
  write(chunk, encoding, callback) {
    if (!hideInput) {
      stdout.write(chunk, encoding);
    }
    callback();
  },
});
const prompt = createInterface({ input: stdin, output: promptOutput, terminal: true });

async function readPassword(label: string): Promise<string> {
  stdout.write(label);
  hideInput = true;
  const password = await prompt.question('');
  hideInput = false;
  stdout.write('\n');
  return password;
}

const db = createDatabase(connectionString);

try {
  const emailArgument = process.argv[2]?.trim();
  const email = emailArgument || (await prompt.question('Admin email: ')).trim();
  if (!email) {
    throw new Error('Admin email is required.');
  }

  const user = await db.findOne(users, { where: { email }, with: { roles: userRoleRows } });
  if (!user?.roles.some((role) => role.name === 'admin')) {
    throw new Error(`No local admin user was found for ${email}.`);
  }

  const password = await readPassword('New password: ');
  if (password.length < MINIMUM_PASSWORD_LENGTH) {
    throw new Error(`Password must contain at least ${MINIMUM_PASSWORD_LENGTH} characters.`);
  }

  const confirmation = await readPassword('Confirm new password: ');
  if (password !== confirmation) {
    throw new Error('Passwords do not match.');
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  await db.update(users, user.id, { hash });
  // Signs them out everywhere
  await db.deleteMany(sessions, { where: { userId: user.id } });

  stdout.write(`Password reset for ${user.email}.\n`);
} finally {
  hideInput = false;
  prompt.close();
  await db.close();
}
