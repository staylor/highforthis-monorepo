import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession, testToken } from '../../../lib/adminSession.fixtures.ts';
import { router } from '../../../router.ts';

const origin = 'http://localhost';

type Sent = { method: string; path: string; authorization: string | null; body?: string };

/**
 * Stands in for GraphQL: accepts the session, answers the App query, and answers each passkey
 * endpoint by method and path, recording what it was sent.
 */
function stubGraphQL(t: TestContext, answers: Record<string, () => Response> = {}) {
  const sent: Sent[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/auth/session') {
      return new Response(null, { status: 200 });
    }
    if (url.pathname === '/graphql') {
      return Response.json({ data: {} });
    }
    const method = init?.method ?? 'GET';
    sent.push({
      method,
      path: url.pathname,
      authorization: new Headers(init?.headers).get('Authorization'),
      ...(init?.body ? { body: String(init.body) } : {}),
    });
    const answer = answers[`${method} ${url.pathname}`];
    return answer ? answer() : new Response('Not Found', { status: 404 });
  });
  return sent;
}

const request = (path: string, init: RequestInit = {}) =>
  router.fetch(
    new Request(new URL(path, origin), {
      ...init,
      headers: { cookie: testSession, origin, ...init.headers },
    })
  );

const passkeys = [
  {
    id: 'cred-1',
    name: 'Laptop',
    backedUp: true,
    deviceType: 'multiDevice',
    createdAt: '2026-01-02T10:00:00.000Z',
    lastUsedAt: '2026-03-04T10:00:00.000Z',
  },
  {
    id: 'cred-2',
    name: null,
    backedUp: false,
    deviceType: 'singleDevice',
    createdAt: '2026-02-03T10:00:00.000Z',
    lastUsedAt: null,
  },
];

describe('admin passkeys', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('lists the passkeys with when they were made and last used', async (t) => {
    const sent = stubGraphQL(t, {
      'GET /auth/passkeys': () => Response.json({ passkeys }),
    });
    const html = await (await request('/admin/passkeys')).text();
    assert.match(html, /<h1[^>]*>Passkeys<\/h1>/);
    assert.match(html, /Laptop/);
    assert.match(html, /Created 2026-01-02/);
    assert.match(html, /Last used 2026-03-04/);
    assert.match(html, /Synced passkey/);
    assert.match(html, /Unnamed passkey/);
    assert.match(html, /Not used yet/);
    assert.match(html, /<input type="hidden" name="credentialId" value="cred-2" \/>/);
    assert.match(html, /"exportName":"PasskeyRegister"/);
    assert.deepEqual(sent, [
      { method: 'GET', path: '/auth/passkeys', authorization: `Bearer ${testToken}` },
    ]);
  });

  it('says when there are none', async (t) => {
    stubGraphQL(t, { 'GET /auth/passkeys': () => Response.json({ passkeys: [] }) });
    const html = await (await request('/admin/passkeys')).text();
    assert.match(html, /No passkeys are registered yet\./);
  });

  it('removes a passkey and comes back to the list', async (t) => {
    const sent = stubGraphQL(t, {
      'DELETE /auth/passkeys/cred-1': () => new Response(null, { status: 204 }),
    });
    const response = await request('/admin/passkeys', {
      method: 'POST',
      body: new URLSearchParams({ credentialId: 'cred-1' }),
    });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/admin/passkeys');
    assert.deepEqual(sent, [
      { method: 'DELETE', path: '/auth/passkeys/cred-1', authorization: `Bearer ${testToken}` },
    ]);
  });

  it("passes GraphQL's registration options and checks on to the browser", async (t) => {
    const sent = stubGraphQL(t, {
      'POST /auth/passkeys/register/options': () =>
        Response.json({ challengeId: 'c1', options: { challenge: 'abc' } }),
      'POST /auth/passkeys/register/verify': () =>
        Response.json({ error: 'Passkey registration could not be verified' }, { status: 400 }),
    });
    const options = await request('/admin/passkeys/options', { method: 'POST' });
    assert.deepEqual(await options.json(), { challengeId: 'c1', options: { challenge: 'abc' } });
    assert.equal(options.headers.get('cache-control'), 'private, no-store');

    const body = JSON.stringify({ challengeId: 'c1', name: 'Phone', response: { id: 'x' } });
    const verify = await request('/admin/passkeys/verify', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    });
    assert.equal(verify.status, 400);
    assert.deepEqual(await verify.json(), { error: 'Passkey registration could not be verified' });
    assert.deepEqual(sent, [
      {
        method: 'POST',
        path: '/auth/passkeys/register/options',
        authorization: `Bearer ${testToken}`,
      },
      {
        method: 'POST',
        path: '/auth/passkeys/register/verify',
        authorization: `Bearer ${testToken}`,
        body,
      },
    ]);
  });

  it('turns down a registration started from another site', async (t) => {
    const sent = stubGraphQL(t);
    const response = await request('/admin/passkeys/options', {
      method: 'POST',
      headers: { origin: 'https://evil.example' },
    });
    assert.equal(response.status, 400);
    assert.equal(sent.length, 0);
  });
});
