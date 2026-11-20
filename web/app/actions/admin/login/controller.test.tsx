import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession, testToken } from '#/lib/adminSession.fixtures.ts';
import { rememberClientAddress } from '#/lib/client.ts';
import { router } from '#/router.ts';

const origin = 'http://localhost';

type Sent = { path: string; body: any };

/** Stands in for GraphQL's /auth endpoints and its App query, recording what it was sent. */
function stubGraphQL(t: TestContext, answer: unknown, status = 200) {
  const sent: Sent[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/graphql') {
      return Response.json({ data: { siteSettings: { siteTitle: 'High for This' } } });
    }
    sent.push({ path: url.pathname, body: init?.body ? JSON.parse(String(init.body)) : null });
    return Response.json(answer, { status });
  });
  return sent;
}

const signIn = (fields: Record<string, string>, address?: string) => {
  const request = new Request(new URL('/login', origin), {
    method: 'POST',
    body: new URLSearchParams(fields),
    headers: { origin },
  });
  if (address) {
    rememberClientAddress(request, address);
  }
  return router.fetch(request);
};

describe('signing in', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('shows the passkey button and the password form, without the nav', async (t) => {
    stubGraphQL(t, {});
    const html = await (await router.fetch(new URL('/login', origin))).text();
    assert.match(html, /<title>Log In » Admin » High for This<\/title>/);
    assert.match(html, /<h1[^>]*>High for This<\/h1>/);
    assert.match(html, /Sign in with a passkey/);
    assert.match(html, /<form method="post" action="\/login">/);
    assert.match(html, /<input[^>]*type="email"[^>]*name="email"/);
    assert.match(html, /<input[^>]*type="password"[^>]*name="password"/);
    assert.doesNotMatch(html, /<nav/);
    assert.doesNotMatch(html, /role="alert"/);
  });

  it('says why you were sent to sign in, or why signing in failed', async (t) => {
    stubGraphQL(t, {});
    const unauthorized = await (await router.fetch(new URL('/login/unauthorized', origin))).text();
    assert.match(unauthorized, /role="alert"[^>]*>You must login to access this area\./);
    const failed = await (await router.fetch(new URL('/login/failed', origin))).text();
    assert.match(failed, /role="alert"[^>]*>Couldn’t sign you in\./);
    const throttled = await (await router.fetch(new URL('/login/throttled', origin))).text();
    assert.match(throttled, /role="alert"[^>]*>Too many sign-in attempts\./);
  });

  it('leaves out the password form when password login is off', async (t) => {
    t.mock.property(process, 'env', { ...process.env, PASSWORD_LOGIN_ENABLED: 'false' });
    stubGraphQL(t, {});
    const html = await (await router.fetch(new URL('/login', origin))).text();
    assert.match(html, /Sign in with a passkey/);
    assert.doesNotMatch(html, /name="password"/);
  });

  it('sends someone already signed in on to the admin', async () => {
    const response = await router.fetch(
      new Request(new URL('/login', origin), { headers: { cookie: testSession } })
    );
    assert.equal(response.headers.get('location'), '/admin');
  });

  it('signs in with an email and password, keeping the token in the session', async (t) => {
    const sent = stubGraphQL(t, { token: testToken });
    const response = await signIn({
      intent: 'password',
      email: 'admin@example.com',
      password: 'test-pass',
    });
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/admin');
    assert.equal(
      response.headers.get('set-cookie'),
      `${testSession}; HttpOnly; Max-Age=43200; Path=/; SameSite=Lax`
    );
    assert.deepEqual(sent, [
      { path: '/auth', body: { email: 'admin@example.com', password: 'test-pass' } },
    ]);
  });

  it("signs in with a passkey's answer", async (t) => {
    const sent = stubGraphQL(t, { token: testToken });
    const response = await signIn({
      intent: 'passkey',
      challengeId: 'c1',
      response: JSON.stringify({ id: 'credential' }),
    });
    assert.equal(response.headers.get('location'), '/admin');
    assert.ok(response.headers.get('set-cookie')?.startsWith(testSession));
    assert.deepEqual(sent, [
      {
        path: '/auth/passkeys/authenticate/verify',
        body: { challengeId: 'c1', response: { id: 'credential' } },
      },
    ]);
  });

  it('says it failed when GraphQL turns the sign-in down, or the form is incomplete', async (t) => {
    const sent = stubGraphQL(t, { error: 'User not found matching email/password combination' });
    const forms: Record<string, string>[] = [
      { intent: 'password', email: 'admin@example.com', password: 'wrong' },
      { intent: 'password', email: 'admin@example.com' },
      { intent: 'passkey', challengeId: 'c1', response: 'not json' },
    ];
    for (const fields of forms) {
      const response = await signIn(fields);
      assert.equal(response.headers.get('location'), '/login/failed');
      assert.equal(response.headers.get('set-cookie'), null);
    }
    // Only the complete form reached GraphQL
    assert.equal(sent.length, 1);
  });

  it('says to wait when GraphQL has seen too many failures for the email', async (t) => {
    stubGraphQL(t, { error: 'Too many failed sign-ins. Try again later.' }, 429);
    const response = await signIn({ intent: 'password', email: 'a@example.com', password: 'x' });
    assert.equal(response.headers.get('location'), '/login/throttled');
    assert.equal(response.headers.get('set-cookie'), null);
  });

  it('gives each address 10 tries, then turns it away without asking GraphQL', async (t) => {
    const sent = stubGraphQL(t, { error: 'Wrong email or password' }, 401);
    const form = { intent: 'password', email: 'admin@example.com', password: 'wrong' };
    for (let i = 0; i < 10; i++) {
      const response = await signIn(form, '198.51.100.4');
      assert.equal(response.headers.get('location'), '/login/failed');
    }
    const refused = await signIn(form, '198.51.100.4');
    assert.equal(refused.headers.get('location'), '/login/throttled');
    assert.equal(sent.length, 10);
    const other = await signIn(form, '198.51.100.5');
    assert.equal(other.headers.get('location'), '/login/failed', 'another address');
  });

  it('turns down a sign-in posted from another site', async (t) => {
    const sent = stubGraphQL(t, { token: testToken });
    const response = await router.fetch(
      new Request(new URL('/login', origin), {
        method: 'POST',
        body: new URLSearchParams({ email: 'admin@example.com', password: 'test-pass' }),
        headers: { origin: 'https://evil.example' },
      })
    );
    assert.equal(response.status, 400);
    assert.equal(sent.length, 0);
  });

  it('signs out by ending the token in GraphQL and removing the session', async (t) => {
    const tokens: (string | null)[] = [];
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      assert.equal(new URL(input instanceof Request ? input.url : input).pathname, '/auth/signout');
      tokens.push(new Headers(init?.headers).get('authorization'));
      return new Response(null, { status: 204 });
    });
    const response = await router.fetch(
      new Request(new URL('/admin/logout', origin), {
        method: 'POST',
        headers: { cookie: testSession, origin },
      })
    );
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/login');
    assert.equal(
      response.headers.get('set-cookie'),
      '__session=; HttpOnly; Max-Age=0; Path=/; SameSite=Lax'
    );
    assert.deepEqual(tokens, [`Bearer ${testToken}`]);
  });

  it('signs out even when GraphQL is down', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });
    const response = await router.fetch(
      new Request(new URL('/admin/logout', origin), {
        method: 'POST',
        headers: { cookie: testSession, origin },
      })
    );
    assert.match(response.headers.get('set-cookie') ?? '', /^__session=; .*Max-Age=0/);
  });

  it("doesn't sign out from a link or another site's form", async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', async () => new Response(null));
    const link = await router.fetch(
      new Request(new URL('/admin/logout', origin), { headers: { cookie: testSession } })
    );
    assert.equal(link.headers.get('set-cookie'), null);
    const forged = await router.fetch(
      new Request(new URL('/admin/logout', origin), {
        method: 'POST',
        headers: { cookie: testSession, origin: 'https://evil.example' },
      })
    );
    assert.equal(forged.status, 400);
    assert.equal(forged.headers.get('set-cookie'), null);
    assert.equal(
      fetch.mock.calls.filter((call) => String(call.arguments[0]).includes('/auth/signout')).length,
      0
    );
  });
});
