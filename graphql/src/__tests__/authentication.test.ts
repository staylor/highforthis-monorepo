import { ApolloServer } from '@apollo/server';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '#/app';
import { signToken } from '#/authentication';
import { sessions } from '#/database/tables';
import type { AppContext, UserWithRoles } from '#/models';

const db = vi.hoisted(() => ({
  count: vi.fn(),
  create: vi.fn(),
  deleteMany: vi.fn(),
  find: vi.fn(),
  findOne: vi.fn(),
}));

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('#/database/tables', async (importOriginal) => ({
  ...(await importOriginal<typeof import('#/database/tables')>()),
  newId: () => 'session-2',
}));

const admin = {
  id: 'admin-1',
  email: 'admin@example.test',
  name: 'Admin',
  hash: bcrypt.hashSync('secret', 4),
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
    db.findOne.mockImplementation(async (_table, { where }: { where: { email: string } }) =>
      where.email === admin.email ? admin : null
    );
    // The admin's one live session
    db.find.mockImplementation(async (_table, id: string) =>
      id === 'session-1'
        ? {
            id: 'session-1',
            userId: admin.id,
            expiresAt: new Date(Date.now() + 60_000),
            user: admin,
          }
        : null
    );
  });

  afterAll(() => server.stop());

  describe('tokens', () => {
    it('are good while their session is', async () => {
      expect(
        (await request('/auth/session', bearer(signToken(admin.id, 'session-1')))).status
      ).toBe(200);
      const ended = signToken(admin.id, 'session-gone');
      expect((await request('/auth/session', bearer(ended))).status).toBe(401);
    });

    it("aren't good for another user's session, or once it has expired", async () => {
      expect(
        (await request('/auth/session', bearer(signToken('someone-else', 'session-1')))).status
      ).toBe(401);
      db.find.mockResolvedValue({
        id: 'session-1',
        userId: admin.id,
        expiresAt: new Date(Date.now() - 1),
        user: admin,
      });
      expect(
        (await request('/auth/session', bearer(signToken(admin.id, 'session-1')))).status
      ).toBe(401);
    });

    it('from before sessions were kept are refused', async () => {
      const { default: jsonwebtoken } = await import('jsonwebtoken');
      const legacy = jsonwebtoken.sign({ userId: admin.id }, 'test', { expiresIn: '12h' });

      expect((await request('/auth/session', bearer(legacy))).status).toBe(401);
    });
  });

  describe('POST /auth/signout', () => {
    it("deletes the token's session, leaving the user's others", async () => {
      const response = await request('/auth/signout', {
        method: 'POST',
        ...bearer(signToken(admin.id, 'session-1')),
      });

      expect(response.status).toBe(204);
      expect(db.deleteMany).toHaveBeenCalledWith(sessions, {
        where: { id: 'session-1', userId: admin.id },
      });
    });

    it('refuses a signed-out request', async () => {
      expect((await request('/auth/signout', { method: 'POST' })).status).toBe(401);
      expect(db.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('signing in', () => {
    it('saves a session for 12 hours and answers a token for it', async () => {
      const response = await signIn(admin.email, 'secret');
      const { token } = await response.json();

      expect(db.create).toHaveBeenCalledWith(sessions, {
        id: 'session-2',
        userId: admin.id,
        expiresAt: expect.any(Date),
      });
      const [[, session]] = db.create.mock.calls;
      expect(session.expiresAt.getTime() - Date.now()).toBeGreaterThan(11.9 * 60 * 60 * 1000);
      const { default: jsonwebtoken } = await import('jsonwebtoken');
      expect(jsonwebtoken.decode(token)).toEqual(
        expect.objectContaining({ userId: admin.id, sid: 'session-2' })
      );
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
      db.findOne.mockResolvedValue({ ...admin, email });
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
      db.count.mockResolvedValue(5000);

      const response = await request('/auth/passkeys/authenticate/options', { method: 'POST' });

      expect(response.status).toBe(429);
    });
  });
});
