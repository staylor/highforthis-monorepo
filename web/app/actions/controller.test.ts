import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession } from '../lib/adminSession.fixtures.ts';
import { openObserveBundleFiles, openObserveScripts } from '../lib/openobserve-bundles.ts';
import { router } from '../router.ts';
import { routes } from '../routes.ts';

const origin = 'http://localhost';

/**
 * Stand-in for the GraphQL server. Apollo's HttpLink goes through global fetch, so one stub
 * covers every query.
 */
function stubGraphQL(t: TestContext, handlers: Record<string, (body: any) => unknown>) {
  const realFetch = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.origin === origin) {
      return realFetch(input, init);
    }
    const body = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    const key = url.pathname === '/graphql' ? `graphql:${body?.operationName}` : url.pathname;
    const handler = handlers[key];
    if (!handler) {
      return Response.json({ errors: [{ message: `unstubbed ${key}` }] }, { status: 500 });
    }
    const result = handler(body);
    return result instanceof Response ? result : Response.json(result);
  });
}

/** Waits out a query the request may have started without awaiting it. */
const settle = () => new Promise((resolve) => setTimeout(resolve, 10));

describe('root controller', () => {
  it('GET /health responds without touching GraphQL', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ data: {} }));
    const response = await router.fetch(new URL(routes.health.href(), origin));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
    await settle();
    assert.equal(fetch.mock.calls.length, 0);
  });

  it('serves browser modules without touching GraphQL', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ data: {} }));
    const response = await router.fetch(
      new URL(routes.assets.href({ path: 'app/routes.ts' }), origin)
    );
    assert.equal(response.status, 200);
    await response.text();
    await settle();
    assert.equal(fetch.mock.calls.length, 0);
  });

  it('reports where the time went in Server-Timing', async () => {
    const response = await router.fetch(new URL(routes.health.href(), origin));
    assert.equal(response.status, 200);
    const timing = response.headers.get('server-timing') ?? '';
    for (const name of ['compression', 'static', 'render', 'route', 'total']) {
      assert.match(timing, new RegExp(`\\b${name};dur=\\d+\\.\\d{2}\\b`), name);
    }
  });

  it('rejects WordPress probes before routing', async () => {
    const response = await router.fetch(new URL('/wp-login.php', origin));
    assert.equal(response.status, 403);
  });

  it('renders the 404 page for unknown paths', async (t) => {
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }) });
    const response = await router.fetch(new URL('/no/such/page', origin));
    assert.equal(response.status, 404);
    assert.match(await response.text(), /Yikes! Not Found!/);
  });
});

describe('OpenObserve SDK bundles', () => {
  it('serves each bundle as JavaScript that can be cached for good', async () => {
    for (const script of Object.values(openObserveScripts)) {
      const response = await router.fetch(new URL(script, origin));
      assert.equal(response.status, 200, script);
      assert.match(response.headers.get('content-type') ?? '', /^text\/javascript/);
      assert.equal(response.headers.get('cache-control'), 'public, max-age=31536000, immutable');
    }
  });

  it('serves the session replay chunk beside the RUM bundle', async () => {
    const rumBase = openObserveScripts.rum.slice(0, openObserveScripts.rum.lastIndexOf('/'));
    const recorder = [...openObserveBundleFiles.keys()].find((path) =>
      path.startsWith(`${rumBase}/chunks/recorder-`)
    );
    assert.ok(recorder, 'the RUM bundle has a recorder chunk');
    const response = await router.fetch(new URL(recorder, origin));
    assert.equal(response.status, 200);
  });

  it('serves nothing else from the packages', async (t) => {
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }) });
    const rumBase = openObserveScripts.rum.slice(0, openObserveScripts.rum.lastIndexOf('/'));
    for (const path of [`${rumBase}/package.json`, `${rumBase}/../browser-rum/package.json`]) {
      const response = await router.fetch(new URL(path, origin));
      assert.equal(response.status, 404, path);
    }
  });
});

describe('admin', () => {
  it('forwards passkey sign-in to GraphQL, and signs out', async (t) => {
    const forwarded: string[] = [];
    const realFetch = globalThis.fetch;
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : input);
      if (url.origin === origin) {
        return realFetch(input, init);
      }
      forwarded.push(url.pathname);
      return Response.json({ challengeId: 'c1' });
    });
    const options = await router.fetch(
      new Request(new URL('/auth/passkeys/authenticate/options', origin), { method: 'POST' })
    );
    assert.deepEqual(await options.json(), { challengeId: 'c1' });
    assert.deepEqual(forwarded, ['/auth/passkeys/authenticate/options']);

    // The admin's pages are rendered here: signed out, they send you to sign in
    const dashboard = await router.fetch(new URL('/admin', origin));
    assert.equal(dashboard.headers.get('location'), '/login/unauthorized');
  });

  it('turns on live refresh only for a signed-in admin', async (t) => {
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }), 'graphql:Home': () => ({ data: {} }) });
    process.env.TOKEN_SECRET = testSecret;
    const home = (cookie?: string) =>
      router.fetch(new Request(new URL('/', origin), { headers: cookie ? { cookie } : {} }));
    try {
      assert.match(await (await home(testSession)).text(), /"exportName":"Revalidate"/);
      assert.doesNotMatch(await (await home()).text(), /"exportName":"Revalidate"/);
    } finally {
      delete process.env.TOKEN_SECRET;
    }
  });
});
