import * as assert from 'remix/assert';
import { createRouter } from 'remix/router';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { Admin, requireAdmin, sameOrigin } from './admin.ts';
import { proxies } from './app.ts';

const origin = 'http://localhost';

// A session cookie signed with the secret 'test-secret', holding the token 'test-token'
const signedIn =
  '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ%3D%3D.0jvC0SjKdfmXr5Rw%2F6679ia0w0xRgH4hIpEzB3aJ9Fc';

/**
 * Answers GraphQL's /auth/session with each status in turn (the last one repeats), recording the
 * tokens it was asked about.
 */
function stubAuthSession(t: TestContext, ...statuses: number[]) {
  const tokens: (string | null)[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.pathname, '/auth/session');
    tokens.push(new Headers(init?.headers).get('authorization'));
    const status = statuses.length > 1 ? statuses.shift()! : statuses[0];
    return new Response(null, { status });
  });
  return tokens;
}

describe('requireAdmin', () => {
  const router = createRouter({ middleware: [requireAdmin()] });
  router.get('/admin/check', (context) => Response.json({ token: context.get(Admin).token }));

  const check = (cookie?: string) =>
    router.fetch(
      new Request(new URL('/admin/check', origin), { headers: cookie ? { cookie } : {} })
    );

  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('sends someone without a session to the login page', async (t) => {
    const tokens = stubAuthSession(t, 200);
    const response = await check();
    assert.equal(response.status, 302);
    assert.equal(response.headers.get('location'), '/login/unauthorized');
    assert.deepEqual(tokens, [], 'GraphQL is not asked');
  });

  it('lets an admin session GraphQL accepts through, with its token', async (t) => {
    const tokens = stubAuthSession(t, 200);
    const response = await check(signedIn);
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { token: 'test-token' });
    assert.deepEqual(tokens, ['Bearer test-token']);
  });

  it('removes a session GraphQL rejects and sends them to log in', async (t) => {
    stubAuthSession(t, 401, 403);
    for (const status of [401, 403]) {
      const response = await check(signedIn);
      assert.equal(response.status, 302, String(status));
      assert.equal(response.headers.get('location'), '/login/unauthorized');
      const cookie = response.headers.get('set-cookie') ?? '';
      assert.match(cookie, /^__session=;/);
      assert.match(cookie, /Max-Age=0/);
    }
  });

  it("answers 503 when GraphQL can't check the session", async (t) => {
    stubAuthSession(t, 500);
    const response = await check(signedIn);
    assert.equal(response.status, 503);
    assert.equal(response.headers.get('set-cookie'), null);
  });
});

describe('sameOrigin', () => {
  const router = createRouter({ middleware: [sameOrigin()] });
  router.get('/admin/form', () => new Response('page'));
  router.post('/admin/form', () => new Response('saved'));

  const post = (headers: Record<string, string>) =>
    router.fetch(new Request(new URL('/admin/form', origin), { method: 'POST', headers }));

  it('lets a form post from this site through', async () => {
    const response = await post({ origin });
    assert.equal(await response.text(), 'saved');
  });

  it("rejects a form post from another site, or from an origin that isn't one", async () => {
    for (const from of ['https://evil.example', 'null', 'not a url']) {
      const response = await post({ origin: from });
      assert.equal(response.status, 400, from);
    }
  });

  it('lets reads and posts without an Origin header through, as React Router did', async () => {
    assert.equal(await (await post({})).text(), 'saved');
    const page = await router.fetch(
      new Request(new URL('/admin/form', origin), { headers: { origin: 'https://evil.example' } })
    );
    assert.equal(await page.text(), 'page');
  });
});

describe('proxies', () => {
  const router = createRouter({ middleware: [proxies({ servedHere: ['/admin/user'] })] });
  router.get('/admin/user', () => new Response('from web'));
  router.get('/admin/user/add', () => new Response('from web'));

  it("serves the admin paths that moved here and forwards the rest, and the admin's data requests", async (t) => {
    const forwarded: string[] = [];
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
      forwarded.push(new URL(input instanceof Request ? input.url : input).pathname);
      return new Response('from admin');
    });
    const text = async (path: string) => (await router.fetch(new URL(path, origin))).text();

    assert.equal(await text('/admin/user'), 'from web');
    assert.equal(await text('/admin/user/add'), 'from web');
    assert.equal(await text('/admin/user.data'), 'from admin');
    assert.equal(await text('/admin/userland'), 'from admin');
    assert.equal(await text('/admin/post'), 'from admin');
    assert.deepEqual(forwarded, ['/admin/user.data', '/admin/userland', '/admin/post']);
  });

  it("forwards a moved section's pages that haven't moved yet, such as the venue listings", async (t) => {
    const showsRouter = createRouter({ middleware: [proxies({ servedHere: ['/admin/show'] })] });
    showsRouter.get('/admin/show', () => new Response('from web'));
    const forwarded: string[] = [];
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL) => {
      forwarded.push(new URL(input instanceof Request ? input.url : input).pathname);
      return new Response('from admin');
    });
    const text = async (path: string) => (await showsRouter.fetch(new URL(path, origin))).text();

    assert.equal(await text('/admin/show'), 'from web');
    assert.equal(await text('/admin/show/listings'), 'from admin');
    assert.equal(await text('/admin/show/listings/v1'), 'from admin');
    assert.deepEqual(forwarded, ['/admin/show/listings', '/admin/show/listings/v1']);
  });
});
