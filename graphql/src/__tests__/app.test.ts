import { ApolloServer } from '@apollo/server';
import { ApolloServerPluginCacheControlDisabled } from '@apollo/server/plugin/disabled';
import bcrypt from 'bcryptjs';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createApp } from '#/app';
import { signToken } from '#/authentication';
import { passkeys, webAuthnChallenges } from '#/database/tables';
import type { AppContext, UserWithRoles } from '#/models';

// The admin's passkeys, whose query's steps each answer the query, and the answered sign-in
// challenges, which are saved with an upsert
const { db, passkeyQuery, challengeQuery, webAuthn } = vi.hoisted(() => ({
  db: {
    create: vi.fn(),
    delete: vi.fn(),
    deleteMany: vi.fn(),
    find: vi.fn(),
    findMany: vi.fn(),
    query: vi.fn(),
    update: vi.fn(),
  },
  passkeyQuery: { all: vi.fn(), orderBy: vi.fn(), select: vi.fn(), where: vi.fn() },
  challengeQuery: { upsert: vi.fn() },
  // What SimpleWebAuthn makes of an answer, which only a real authenticator could give it
  webAuthn: { verifyAuthenticationResponse: vi.fn(), verifyRegistrationResponse: vi.fn() },
}));

vi.mock('#/database/db', () => ({ default: db }));
vi.mock('@simplewebauthn/server', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@simplewebauthn/server')>()),
  ...webAuthn,
}));

const admin = {
  id: 'admin-1',
  email: 'admin@example.test',
  name: 'Admin',
  hash: bcrypt.hashSync('secret', 4),
  roles: [{ id: 'role-admin', name: 'admin', userId: 'admin-1' }],
} as UserWithRoles;
const editor = { ...admin, id: 'editor-1', roles: [] } as UserWithRoles;

// Each user's session is `session-<id>`, which the database stub answers with the user
function session(sessionId: string) {
  const user = [admin, editor].find(({ id }) => sessionId === `session-${id}`);
  return user
    ? { id: sessionId, userId: user.id, expiresAt: new Date(Date.now() + 60_000), user }
    : null;
}

let server: ApolloServer<AppContext>;
let app: ReturnType<typeof createApp>;

const request = (path: string, init?: RequestInit) =>
  app.fetch(new Request(`http://localhost${path}`, init));
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
    // The users the sign-in's ILIKE pattern finds, which matches an email whatever its case
    db.findMany.mockImplementation(async (_table, { where }: { where: { value: string } }) =>
      [admin, editor].filter((user) => user.email === where.value.toLowerCase())
    );
    db.find.mockImplementation(async (_table, sessionId: string) => session(sessionId));
    db.query.mockImplementation((table) =>
      table === webAuthnChallenges ? challengeQuery : passkeyQuery
    );
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

    describe('signing in', () => {
      const passkey = {
        id: 'passkey-1',
        userId: admin.id,
        publicKey: Buffer.from('public key'),
        counter: '0',
        transports: [],
        user: admin,
      };
      const expiredOrInvalid = { error: 'The passkey request expired or is invalid' };

      /** Starts a sign-in: its signed challenge, and the challenge the authenticator signs */
      async function start() {
        const response = await request('/auth/passkeys/authenticate/options', { method: 'POST' });
        expect(response.status).toBe(200);
        const { challengeId, options } = await response.json();
        return { challengeId: challengeId as string, challenge: options.challenge as string };
      }
      const answer = (challengeId: string) =>
        request(
          '/auth/passkeys/authenticate/verify',
          json({ challengeId, response: { id: passkey.id } })
        );

      beforeEach(() => {
        db.find.mockImplementation(async (table, id: string) =>
          table === passkeys ? (id === passkey.id ? passkey : null) : session(id)
        );
        webAuthn.verifyAuthenticationResponse.mockResolvedValue({
          verified: true,
          authenticationInfo: {
            newCounter: 1,
            credentialBackedUp: true,
            credentialDeviceType: 'multiDevice',
          },
        });
        challengeQuery.upsert.mockResolvedValue({ affectedRows: 1 });
      });

      // Saving each start let anyone fill the table and turn every sign-in away
      it('starts without saving anything, however many start', async () => {
        const started = await Promise.all(Array.from({ length: 3 }, start));

        expect(new Set(started.map(({ challenge }) => challenge)).size).toBe(3);
        expect(db.create).not.toHaveBeenCalled();
        expect(db.query).not.toHaveBeenCalled();
      });

      it('signs in with an answer to the challenge it signed, and saves the challenge', async () => {
        const { challengeId, challenge } = await start();

        const response = await answer(challengeId);

        expect(response.status).toBe(200);
        await expect(response.json()).resolves.toEqual({ token: expect.any(String) });
        expect(webAuthn.verifyAuthenticationResponse).toHaveBeenCalledWith(
          expect.objectContaining({ expectedChallenge: challenge })
        );
        expect(challengeQuery.upsert).toHaveBeenCalledWith(
          expect.objectContaining({ challenge, type: 'authentication' }),
          { conflictTarget: ['challenge'], update: {} }
        );
        expect(db.update).toHaveBeenCalledWith(
          passkeys,
          passkey.id,
          expect.objectContaining({ counter: '1' })
        );
      });

      // A replay, or the same answer sent twice at once: the challenge is saved only once
      it('turns away an answer to a challenge that was answered already', async () => {
        const { challengeId } = await start();
        challengeQuery.upsert.mockResolvedValue({ affectedRows: 0 });

        const response = await answer(challengeId);

        expect(response.status).toBe(401);
        await expect(response.json()).resolves.toEqual(expiredOrInvalid);
        expect(db.update).not.toHaveBeenCalled();
        // No session either
        expect(db.create).not.toHaveBeenCalled();
      });

      it("saves nothing for an answer that isn't the passkey's", async () => {
        const { challengeId } = await start();
        webAuthn.verifyAuthenticationResponse.mockResolvedValue({ verified: false });

        const response = await answer(challengeId);

        expect(response.status).toBe(401);
        expect(challengeQuery.upsert).not.toHaveBeenCalled();
      });

      it("turns away a challenge it didn't sign, or a session's token, as one", async () => {
        for (const challengeId of ['challenge-1', signToken(admin.id, `session-${admin.id}`)]) {
          const response = await answer(challengeId);

          expect(response.status).toBe(401);
          await expect(response.json()).resolves.toEqual(expiredOrInvalid);
        }
        expect(db.find).not.toHaveBeenCalledWith(passkeys, expect.anything(), expect.anything());
      });

      it('turns away an answer after five minutes', async () => {
        const { challengeId } = await start();
        vi.useFakeTimers({ toFake: ['Date'], now: Date.now() + 5 * 60 * 1000 });
        try {
          const response = await answer(challengeId);

          expect(response.status).toBe(401);
          await expect(response.json()).resolves.toEqual(expiredOrInvalid);
        } finally {
          vi.useRealTimers();
        }
        expect(webAuthn.verifyAuthenticationResponse).not.toHaveBeenCalled();
      });
    });

    describe('adding a passkey', () => {
      const challenge = {
        id: 'challenge-1',
        challenge: 'abc',
        type: 'registration',
        userId: admin.id,
        expiresAt: new Date(Date.now() + 60_000),
      };
      let saved: typeof challenge | (Omit<typeof challenge, 'userId'> & { userId: null });
      const answer = () =>
        request(
          '/auth/passkeys/register/verify',
          json({ challengeId: challenge.id, response: { id: 'credential-1' } }, signedIn(admin))
        );

      beforeEach(() => {
        saved = challenge;
        db.find.mockImplementation(async (table, id: string) =>
          table === webAuthnChallenges ? (id === saved.id ? saved : null) : session(id)
        );
        webAuthn.verifyRegistrationResponse.mockResolvedValue({ verified: false });
      });

      it('goes on to check the answer once it has used the challenge up', async () => {
        db.delete.mockResolvedValue(true);

        const response = await answer();

        expect(db.delete).toHaveBeenCalledWith(webAuthnChallenges, challenge.id);
        expect(webAuthn.verifyRegistrationResponse).toHaveBeenCalledWith(
          expect.objectContaining({ expectedChallenge: 'abc' })
        );
        await expect(response.json()).resolves.toEqual({ error: 'Passkey registration failed' });
      });

      // Two answers read the challenge before either deleted it, and only one may add a passkey
      it('turns away an answer to a challenge another request used up first', async () => {
        db.delete.mockResolvedValue(false);

        const response = await answer();

        expect(response.status).toBe(400);
        await expect(response.json()).resolves.toEqual({
          error: 'The passkey request expired or is invalid',
        });
        expect(webAuthn.verifyRegistrationResponse).not.toHaveBeenCalled();
      });

      // Removing it would let the sign-in's answer be used again
      it("never uses up a sign-in's answered challenge", async () => {
        saved = { ...challenge, type: 'authentication', userId: null };

        const response = await answer();

        expect(response.status).toBe(400);
        expect(db.delete).not.toHaveBeenCalled();
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
