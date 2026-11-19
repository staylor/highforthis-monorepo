import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '#/app';
import { issueToken } from '#/authentication';
import type { AppContext, UserWithRoles } from '#/models';

const db = vi.hoisted(() => ({
  user: { findUnique: vi.fn() },
  passkey: { findMany: vi.fn(), delete: vi.fn() },
}));

vi.mock('#/database', () => ({ default: db }));

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
const signedIn = (user: UserWithRoles) => ({ Authorization: `Bearer ${issueToken(user.id)}` });
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
    db.user.findUnique.mockImplementation(
      async ({ where }: { where: { id?: string; email?: string } }) =>
        [admin, editor].find((user) => user.id === where.id || user.email === where.email) ?? null
    );
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

    it('answers an error for the wrong password', async () => {
      const response = await request('/auth', json({ email: admin.email, password: 'wrong' }));

      expect(response.status).toBe(200);
      await expect(response.json()).resolves.toEqual({
        error: 'User not found matching email/password combination',
      });
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
      db.passkey.findMany.mockResolvedValue([{ id: 'passkey-1', name: 'Laptop' }]);

      const response = await request('/auth/passkeys', { headers: signedIn(admin) });

      await expect(response.json()).resolves.toEqual({
        passkeys: [{ id: 'passkey-1', name: 'Laptop' }],
      });
      expect(db.passkey.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { userId: admin.id } })
      );
    });

    it('refuses a signed-out request', async () => {
      expect((await request('/auth/passkeys')).status).toBe(401);
    });

    it('deletes the passkey named in the URL', async () => {
      db.passkey.findMany.mockResolvedValue([{ id: 'a/b' }, { id: 'passkey-2' }]);

      const response = await request('/auth/passkeys/a%2Fb', {
        method: 'DELETE',
        headers: signedIn(admin),
      });

      expect(response.status).toBe(204);
      expect(db.passkey.delete).toHaveBeenCalledWith({ where: { id: 'a/b' } });
    });

    it('answers 404 for a passkey that is not the admin’s', async () => {
      db.passkey.findMany.mockResolvedValue([{ id: 'passkey-2' }]);

      const response = await request('/auth/passkeys/passkey-1', {
        method: 'DELETE',
        headers: signedIn(admin),
      });

      expect(response.status).toBe(404);
      expect(db.passkey.delete).not.toHaveBeenCalled();
    });

    it('reads the verification body as JSON', async () => {
      const response = await request(
        '/auth/passkeys/authenticate/verify',
        json({ challengeId: '', response: {} })
      );

      expect(response.status).toBe(401);
      await expect(response.json()).resolves.toEqual({
        error: expect.stringContaining('challengeId'),
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
