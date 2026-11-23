import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession } from '#/lib/adminSession.fixtures.ts';
import { graphqlHost } from '#/lib/graphql.ts';
import { openObserveBundleFiles, openObserveScripts } from '#/lib/openobserve-bundles.ts';
import { router } from '#/router.ts';
import { routes } from '#/routes.ts';

const origin = 'http://localhost';

/**
 * Stand-in for the GraphQL server. The GraphQL client goes through global fetch, so one stub
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

  it('keeps Server-Timing for signed-in admins in production', async (t) => {
    t.mock.property(process, 'env', {
      ...process.env,
      NODE_ENV: 'production',
      TOKEN_SECRET: testSecret,
    });
    const health = (cookie?: string) =>
      router.fetch(
        new Request(new URL(routes.health.href(), origin), { headers: cookie ? { cookie } : {} })
      );
    assert.equal((await health()).headers.get('server-timing'), null);
    assert.equal((await health('__session=forged')).headers.get('server-timing'), null);
    assert.match((await health(testSession)).headers.get('server-timing') ?? '', /total;dur=/);
  });

  it('sends the security headers, and HSTS over HTTPS', async (t) => {
    const fetch = t.mock.method(globalThis, 'fetch', async () => Response.json({ data: {} }));
    const response = await router.fetch(new URL(routes.health.href(), origin));
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'SAMEORIGIN');
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.match(response.headers.get('content-security-policy') ?? '', /frame-ancestors 'self'/);
    assert.equal(response.headers.get('strict-transport-security'), null, 'not over HTTP');

    const secure = await router.fetch(new URL(routes.health.href(), 'https://localhost'));
    assert.equal(secure.headers.get('strict-transport-security'), 'max-age=31536000');

    // Proxied responses too, whose headers can't be changed in place
    const proxied = await router.fetch(new URL('/graphql', origin));
    assert.equal(proxied.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(fetch.mock.calls.length, 1);
  });

  it('no longer fetches whatever URL /oembed is given', async (t) => {
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }) });
    const response = await router.fetch(
      new URL('/oembed?provider=http://127.0.0.1:9/&url=x', origin)
    );
    assert.equal(response.status, 404);
  });

  it("renders the error page when an action fails, without the error's message", async (t) => {
    // The feed can't be built without its settings, so the action throws
    stubGraphQL(t, {
      'graphql:App': () => ({ data: {} }),
      'graphql:PodcastFeed': () => ({ data: {} }),
    });
    const response = await router.fetch(new URL(routes.podcastFeed.href(), origin));
    assert.equal(response.status, 500);
    assert.match(response.headers.get('content-type') ?? '', /text\/html/);
    const html = await response.text();
    assert.match(html, /Something went wrong\. Try again in a moment\./);
    assert.match(html, /<title>Error »/);
    assert.doesNotMatch(html, /TypeError|Cannot read/);
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

  it("renders the 404 page for a podcast, a show or stats that don't exist", async (t) => {
    stubGraphQL(t, {
      'graphql:App': () => ({ data: {} }),
      'graphql:Podcast': () => ({ data: { podcast: null } }),
      'graphql:Show': () => ({ data: { show: null } }),
    });
    for (const path of ['/podcast/nope', '/shows/nope', '/shows/stats/nope']) {
      const response = await router.fetch(new URL(path, origin));
      assert.equal(response.status, 404, path);
      assert.match(await response.text(), /Yikes! Not Found!/, path);
    }
  });

  it('answers 500, not an empty page or a 404, while GraphQL is unreachable', async (t) => {
    t.mock.method(globalThis, 'fetch', async () => {
      throw new TypeError('fetch failed');
    });
    const paths = [
      routes.home.href(),
      routes.posts.href(),
      routes.post.href({ slug: 'a-post' }),
      routes.artist.href({ slug: 'wilco' }),
      routes.venue.href({ slug: 'ryman' }),
      routes.videos.href(),
      routes.video.href({ slug: 'a-video' }),
      routes.shows.index.href(),
      routes.shows.history.href(),
      routes.shows.stats.href({ entity: 'artist' }),
      routes.shows.show.href({ id: 's1' }),
      routes.podcast.index.href(),
      routes.podcast.show.href({ id: 'p1' }),
      routes.podcastFeed.href(),
    ];
    for (const path of paths) {
      const response = await router.fetch(new URL(path, origin));
      assert.equal(response.status, 500, path);
      assert.match(await response.text(), /Something went wrong\. Try again in a moment\./, path);
    }
    // A page that asks GraphQL for nothing of its own renders without the site's settings
    assert.equal((await router.fetch(new URL(routes.sphere.href(), origin))).status, 200);
  });

  it("renders the 404 page for a page of results GraphQL says can't exist", async (t) => {
    stubGraphQL(t, {
      'graphql:App': () => ({ data: {} }),
      'graphql:Videos': () =>
        Response.json(
          {
            errors: [{ message: 'Invalid cursor', extensions: { code: 'BAD_USER_INPUT' } }],
            data: null,
          },
          { status: 400 }
        ),
    });
    const response = await router.fetch(new URL('/videos?after=nonsense', origin));
    assert.equal(response.status, 404);
    assert.match(await response.text(), /Yikes! Not Found!/);
  });

  it("renders the 404 page for a year that isn't one, without asking GraphQL for it", async (t) => {
    // A query for the page would answer 500, since only the App query is stubbed
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }) });
    for (const path of ['/videos/abc', '/videos/2024abc', '/shows/history/20x4']) {
      const response = await router.fetch(new URL(path, origin));
      assert.equal(response.status, 404, path);
      assert.match(await response.text(), /Yikes! Not Found!/, path);
    }
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

  it('gives a signed-in admin the public page a visitor gets', async (t) => {
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }), 'graphql:Home': () => ({ data: {} }) });
    process.env.TOKEN_SECRET = testSecret;
    const home = async (cookie?: string) => {
      const request = new Request(new URL('/', origin), { headers: cookie ? { cookie } : {} });
      return (await router.fetch(request)).text();
    };
    // The client entries a page hydrates, by name
    const entries = (html: string) =>
      Array.from(html.matchAll(/"exportName":"(\w+)"/g), ([, name]) => name);
    try {
      // Live refresh pointed an admin's browser at GraphQL's /sse, which GraphQL stopped serving.
      // Browsers reach GraphQL only through this server, so no page names its host.
      const admin = await home(testSession);
      assert.deepEqual(entries(admin), entries(await home()));
      assert.ok(!admin.includes(graphqlHost), `the page names GraphQL's host, ${graphqlHost}`);
    } finally {
      delete process.env.TOKEN_SECRET;
    }
  });

  it("lets a click reuse a prefetched page, but not a signed-in admin's", async (t) => {
    stubGraphQL(t, { 'graphql:App': () => ({ data: {} }) });
    process.env.TOKEN_SECRET = testSecret;
    const page = (path: string, cookie?: string) =>
      router.fetch(new Request(new URL(path, origin), { headers: cookie ? { cookie } : {} }));
    try {
      const visitor = await page(routes.sphere.href());
      assert.equal(visitor.headers.get('cache-control'), 'private, max-age=30');
      assert.match(visitor.headers.get('vary') ?? '', /\bCookie\b/);

      const admin = await page(routes.sphere.href(), testSession);
      assert.equal(admin.headers.get('cache-control'), null);

      const missing = await page('/no/such/page');
      assert.equal(missing.status, 404);
      assert.equal(missing.headers.get('cache-control'), null);
    } finally {
      delete process.env.TOKEN_SECRET;
    }
  });
});
