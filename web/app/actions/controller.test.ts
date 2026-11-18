import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

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

describe('root controller', () => {
  it('GET /health responds without touching GraphQL', async () => {
    const response = await router.fetch(new URL(routes.health.href(), origin));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { status: 'ok' });
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
  it('forwards admin paths to the admin app', async (t) => {
    const forwarded: string[] = [];
    const realFetch = globalThis.fetch;
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = new URL(input instanceof Request ? input.url : input);
      if (url.origin === origin) {
        return realFetch(input, init);
      }
      forwarded.push(`${url.origin}${url.pathname}`);
      return new Response('from admin', { status: 200 });
    });
    for (const path of [
      '/admin',
      '/admin/post',
      '/admin.data',
      '/login',
      '/modals/video',
      '/upload',
    ]) {
      const response = await router.fetch(new URL(path, origin));
      assert.equal(await response.text(), 'from admin', path);
    }
    assert.deepEqual(forwarded, [
      'http://localhost:3001/admin',
      'http://localhost:3001/admin/post',
      'http://localhost:3001/admin.data',
      'http://localhost:3001/login',
      'http://localhost:3001/modals/video',
      'http://localhost:3001/upload',
    ]);
  });

  it('turns on live refresh only for a signed-in admin', async (t) => {
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }), 'graphql:Home': () => ({ data: {} }) });
    process.env.TOKEN_SECRET = 'test-secret';
    // Made by the admin app's React Router createCookieSessionStorage with that secret
    const signedIn =
      '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ%3D%3D.0jvC0SjKdfmXr5Rw%2F6679ia0w0xRgH4hIpEzB3aJ9Fc';
    const home = (cookie?: string) =>
      router.fetch(new Request(new URL('/', origin), { headers: cookie ? { cookie } : {} }));
    try {
      assert.match(await (await home(signedIn)).text(), /"exportName":"Revalidate"/);
      assert.doesNotMatch(await (await home()).text(), /"exportName":"Revalidate"/);
    } finally {
      delete process.env.TOKEN_SECRET;
    }
  });
});
