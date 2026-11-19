import { ApolloServer } from '@apollo/server';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '#/app';
import { issueToken } from '#/authentication';
import type { AppContext, UserWithRoles } from '#/models';

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn(), update: vi.fn() },
  webAuthnChallenge: { count: vi.fn() },
}));

vi.mock('#/database', () => ({ default: db }));

const admin = {
  id: 'admin-1',
  email: 'admin@example.test',
  name: 'Admin',
  hash: bcrypt.hashSync('secret', 4),
  tokenVersion: 3,
  roles: [{ id: 'role-admin', name: 'admin', userId: 'admin-1' }],
} as UserWithRoles;

let server: ApolloServer<AppContext>;
let app: ReturnType<typeof createApp>;

const request = (path: string, init?: RequestInit) =>
  app.fetch(new Request(`http://localhost${path}`, init));
const bearer = (token: string) => ({ headers: { Authorization: `Bearer ${token}` } });
const signIn = (email: string, password: string) =>
  request('/auth', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
    headers: { 'Content-Type': 'application/json' },
  });

describe('authentication', () => {
  beforeAll(async () => {
    server = new ApolloServer<AppContext>({ typeDefs: 'type Query { ok: Boolean }' });
    await server.start();
    app = createApp(server);
  });

  beforeEach(() => {
    vi.resetAllMocks();
    db.user.findUnique.mockImplementation(
      async ({ where }: { where: { id?: string; email?: string } }) =>
        where.id === admin.id || where.email === admin.email ? admin : null
    );
  });

  afterAll(() => server.stop());

  describe('tokens', () => {
    it("are good while the user's token version is the one they were issued with", async () => {
      expect((await request('/auth/session', bearer(issueToken(admin)))).status).toBe(200);
      const older = issueToken({ ...admin, tokenVersion: 2 });
      expect((await request('/auth/session', bearer(older))).status).toBe(401);
    });

    it('from before token versions count as version 0', async () => {
      const { default: jsonwebtoken } = await import('jsonwebtoken');
      const legacy = jsonwebtoken.sign({ userId: admin.id }, 'test', { expiresIn: '12h' });

      expect((await request('/auth/session', bearer(legacy))).status).toBe(401);
      db.user.findUnique.mockResolvedValue({ ...admin, tokenVersion: 0 });
      expect((await request('/auth/session', bearer(legacy))).status).toBe(200);
    });
  });

  describe('POST /auth/signout', () => {
    it("moves the user's token version on, ending their tokens", async () => {
      const response = await request('/auth/signout', {
        method: 'POST',
        ...bearer(issueToken(admin)),
      });

      expect(response.status).toBe(204);
      expect(db.user.update).toHaveBeenCalledWith({
        where: { id: admin.id },
        data: { tokenVersion: { increment: 1 } },
      });
    });

    it('refuses a signed-out request', async () => {
      expect((await request('/auth/signout', { method: 'POST' })).status).toBe(401);
      expect(db.user.update).not.toHaveBeenCalled();
    });
  });

  describe('POST /auth', () => {
    it('answers an unknown email as it does a wrong password, after checking a password', async () => {
      const compare = vi.spyOn(bcrypt, 'compare');

      const response = await signIn('nobody@example.test', 'secret');

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Wrong email or password' });
      expect(compare).toHaveBeenCalledTimes(1);
      compare.mockRestore();
    });

    it('answers 400 without an email and password', async () => {
      const response = await request('/auth', {
        method: 'POST',
        body: JSON.stringify({ email: '' }),
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: 'Email and password are required' });
    });

    it('turns an email away after 5 failures, even with the right password', async () => {
      const email = 'locked@example.test';
      db.user.findUnique.mockResolvedValue({ ...admin, email });
      for (let i = 0; i < 5; i++) {
        expect((await signIn(email, 'wrong')).status).toBe(401);
      }

      const response = await signIn(email.toUpperCase(), 'secret');

      expect(response.status).toBe(429);
      expect(Number(response.headers.get('retry-after'))).toBeGreaterThan(0);
    });

    it('starts counting again after a success', async () => {
      for (let i = 0; i < 4; i++) {
        await signIn(admin.email, 'wrong');
      }
      expect((await signIn(admin.email, 'secret')).status).toBe(200);
      expect((await signIn(admin.email, 'wrong')).status).toBe(401);
    });
  });

  describe('POST /auth/passkeys/authenticate/options', () => {
    it('turns sign-ins away while too many are in progress', async () => {
      db.webAuthnChallenge.count.mockResolvedValue(5000);

      const response = await request('/auth/passkeys/authenticate/options', { method: 'POST' });

      expect(response.status).toBe(429);
    });
  });
});
