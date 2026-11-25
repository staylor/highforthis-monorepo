import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '#/app';
import { signToken } from '#/authentication';
import { passkeys, webAuthnChallenges } from '#/database/tables';
import type { AppContext, UserWithRoles } from '#/models';

// The admin's passkeys, whose query's steps each answer the query
const { db, passkeyQuery } = vi.hoisted(() => ({
  db: {
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    query: vi.fn(),
  },
  passkeyQuery: { all: vi.fn(), orderBy: vi.fn(), select: vi.fn(), where: vi.fn() },
}));

vi.mock('#/database/db', () => ({ default: db }));

const admin = {
  id: 'admin-1',
  email: 'admin@example.test',
  name: 'Admin',
  hash: bcrypt.hashSync('secret', 4),
  roles: [{ id: 'role-admin', name: 'admin', userId: 'admin-1' }],
} as UserWithRoles;
const editor = { ...admin, id: 'editor-1', roles: [] } as UserWithRoles;

let server: ApolloServer<AppContext>;
let app: ReturnType<typeof createApp>;

const request = (path: string, init?: RequestInit) =>
  app.fetch(new Request(`http://localhost${path}`, init));
// Each user's session is `session-<id>`, which the database stub answers with the user
const signedIn = (user: UserWithRoles) => ({
  Authorization: `Bearer ${signToken(user.id, `session-${user.id}`)}`,
});
const json = (body: unknown, headers: Record<string, string> = {}) => ({
  method: 'POST',
  body: JSON.stringify(body),
  headers: { 'Content-Type': 'application/json', ...headers },
});

describe('createApp', () => {
  beforeAll(async () => {
    server = new ApolloServer<AppContext>({
      typeDefs: 'type Query { viewer: String }',
      resolvers: {
        Query: { viewer: (_: unknown, __: unknown, { authUser }: AppContext) => authUser?.id },
      },
      // as in server.ts
      plugins: [ApolloServerPluginCacheControlDisabled()],
    });
    await server.start();
    app = createApp(server);
  });

  beforeEach(() => {
    vi.resetAllMocks();
    db.findOne.mockImplementation(
      async (_table, { where }: { where: { email: string } }) =>
        [admin, editor].find((user) => user.email === where.email) ?? null
    );
    db.find.mockImplementation(async (_table, sessionId: string) => {
      const user = [admin, editor].find(({ id }) => sessionId === `session-${id}`);
      return user
        ? { id: sessionId, userId: user.id, expiresAt: new Date(Date.now() + 60_000), user }
        : null;
    });
    db.query.mockReturnValue(passkeyQuery);
    for (const step of [passkeyQuery.orderBy, passkeyQuery.select, passkeyQuery.where]) {
      step.mockReturnValue(passkeyQuery);
    }
  });

  afterAll(() => server.stop());

  describe('every request', () => {
    it('rejects WordPress probes', async () => {
      expect((await request('/wp-login.php')).status).toBe(403);
      expect((await request('/xmlrpc.php', { method: 'POST' })).status).toBe(403);
    });

    it('answers the favicon with no content', async () => {
      expect((await request('/favicon.ico')).status).toBe(204);
    });

    it('reports health', async () => {
      await expect((await request('/health')).json()).resolves.toEqual({ status: 'ok' });
    });
  });

  describe('/graphql', () => {
    it('runs a query with the signed-in user in context', async () => {
      const response = await request('/graphql', json({ query: '{ viewer }' }, signedIn(admin)));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({ data: { viewer: 'admin-1' } });
    });

    it('runs a query without a user', async () => {
      const response = await request('/graphql', json({ query: '{ viewer }' }));

      await expect(response.json()).resolves.toEqual({ data: { viewer: null } });
    });

    it('runs a GET query from the search params', async () => {
      const response = await request('/graphql?query=%7Bviewer%7D', {
        headers: { 'apollo-require-preflight': 'true', ...signedIn(admin) },
      });

      await expect(response.json()).resolves.toEqual({ data: { viewer: 'admin-1' } });
    });

    it('tells caches not to store answers, without the cache-control plugin', async () => {
      const get = await request('/graphql?query=%7Bviewer%7D', {
        headers: { 'apollo-require-preflight': 'true' },
      });
      const post = await request('/graphql', json({ query: '{ viewer }' }));

      expect(get.headers.get('cache-control')).toBe('no-store');
      expect(post.headers.get('cache-control')).toBe('no-store');
    });

    it('answers CORS preflights for any origin with the requested headers', async () => {
      const response = await request('/graphql', {
        method: 'OPTIONS',
        headers: {
          Origin: 'https://example.com',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'authorization,content-type',
        },
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('access-control-allow-origin')).toBe('*');
      expect(response.headers.get('access-control-allow-headers')).toBe(
        'authorization,content-type'
      );
    });

    it('adds CORS headers to responses', async () => {
      const response = await request(
        '/graphql',
        json({ query: '{ viewer }' }, { Origin: 'https://example.com' })
      );

      expect(response.headers.get('access-control-allow-origin')).toBe('*');
    });

    it('rejects malformed JSON', async () => {
      const response = await request('/graphql', {
        method: 'POST',
        body: '{"query":',
        headers: { 'Content-Type': 'application/json' },
      });

      expect(response.status).toBe(400);
    });

    it('rejects JSON that is not an object or an array', async () => {
      expect((await request('/graphql', json('{ viewer }'))).status).toBe(400);
    });

    it('rejects a body over 100 KB', async () => {
      const response = await request(
        '/graphql',
        json({ query: `{ viewer } #${'x'.repeat(102_400)}` })
      );

      expect(response.status).toBe(413);
    });
  });

  describe('POST /auth', () => {
    it('answers a token for the right password', async () => {
      const response = await request('/auth', json({ email: admin.email, password: 'secret' }));

      await expect(response.json()).resolves.toEqual({ token: expect.any(String) });
    });

    it('accepts a URL-encoded body', async () => {
      const response = await request('/auth', {
        method: 'POST',
        body: new URLSearchParams({ email: admin.email, password: 'secret' }),
      });

      await expect(response.json()).resolves.toEqual({ token: expect.any(String) });
    });

    it('answers 401 for the wrong password', async () => {
      const response = await request('/auth', json({ email: admin.email, password: 'wrong' }));

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Wrong email or password' });
    });
  });

  describe('GET /auth/session', () => {
    it('answers the signed-in admin', async () => {
      const response = await request('/auth/session', { headers: signedIn(admin) });

      await expect(response.json()).resolves.toEqual({
        user: { id: admin.id, email: admin.email, name: admin.name },
      });
    });

    it('refuses a user who is not an admin', async () => {
      expect((await request('/auth/session', { headers: signedIn(editor) })).status).toBe(401);
    });

    it('refuses an invalid token', async () => {
      const response = await request('/auth/session', {
        headers: { Authorization: 'Bearer nope' },
      });

      expect(response.status).toBe(401);
    });
  });

  describe('/auth/passkeys', () => {
    it('lists the admin’s passkeys', async () => {
      passkeyQuery.all.mockResolvedValue([{ id: 'passkey-1', name: 'Laptop' }]);

      const response = await request('/auth/passkeys', { headers: signedIn(admin) });

      await expect(response.json()).resolves.toEqual({
        passkeys: [{ id: 'passkey-1', name: 'Laptop' }],
      });
      expect(db.query).toHaveBeenCalledWith(passkeys);
      expect(passkeyQuery.where).toHaveBeenCalledWith({ userId: admin.id });
    });

    it('refuses a signed-out request', async () => {
      expect((await request('/auth/passkeys')).status).toBe(401);
    });

    it('deletes the passkey named in the URL', async () => {
      passkeyQuery.all.mockResolvedValue([{ id: 'a/b' }, { id: 'passkey-2' }]);

      const response = await request('/auth/passkeys/a%2Fb', {
        method: 'DELETE',
        headers: signedIn(admin),
      });

      expect(response.status).toBe(204);
      expect(db.delete).toHaveBeenCalledWith(passkeys, 'a/b');
    });

    it('answers 404 for a passkey that is not the admin’s', async () => {
      passkeyQuery.all.mockResolvedValue([{ id: 'passkey-2' }]);

      const response = await request('/auth/passkeys/passkey-1', {
        method: 'DELETE',
        headers: signedIn(admin),
      });

      expect(response.status).toBe(404);
      expect(db.delete).not.toHaveBeenCalled();
    });

    describe('answering a challenge', () => {
      const challenge = {
        id: 'challenge-1',
        challenge: 'abc',
        type: 'authentication',
        userId: null,
        expiresAt: new Date(Date.now() + 60_000),
      };
      const verify = () =>
        request(
          '/auth/passkeys/authenticate/verify',
          json({ challengeId: 'challenge-1', response: { id: 'passkey-1' } })
        );

      beforeEach(() => {
        db.find.mockImplementation(async (table) =>
          table === webAuthnChallenges ? challenge : null
        );
      });

      it('goes on to the passkey once it has used the challenge up', async () => {
        db.delete.mockResolvedValue(true);

        const response = await verify();

        expect(db.delete).toHaveBeenCalledWith(webAuthnChallenges, 'challenge-1');
        expect(db.find).toHaveBeenCalledWith(passkeys, 'passkey-1', expect.anything());
        await expect(response.json()).resolves.toEqual({ error: 'Passkey authentication failed' });
      });

      // Two answers read the challenge before either deleted it, and only one may sign in
      it('turns away an answer to a challenge another request used up first', async () => {
        db.delete.mockResolvedValue(false);

        const response = await verify();

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual({
          error: 'The passkey request expired or is invalid',
        });
        expect(db.find).not.toHaveBeenCalledWith(passkeys, expect.anything(), expect.anything());
      });
    });

    it('reads the verification body as JSON', async () => {
      const response = await request(
        '/auth/passkeys/authenticate/verify',
        json({ challengeId: '', response: {} })
      );

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: 'The passkey request is incomplete',
      });
    });
  });

  describe('POST /upload', () => {
    it('refuses a user who is not an admin', async () => {
      const body = new FormData();
      body.append('uploads', new File(['hi'], 'hi.txt', { type: 'text/plain' }));

      const response = await request('/upload', {
        method: 'POST',
        body,
        headers: signedIn(editor),
      });

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({ error: 'Authentication required' });
    });
  });
});
