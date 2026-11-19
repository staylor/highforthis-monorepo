import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { router } from '../../../router.ts';

const origin = 'http://localhost';

// A session cookie signed with the secret 'test-secret', holding the token 'test-token'
const session =
  '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ%3D%3D.0jvC0SjKdfmXr5Rw%2F6679ia0w0xRgH4hIpEzB3aJ9Fc';

const openObserve = {
  OPENOBSERVE_URL: 'http://o2:5080',
  OPENOBSERVE_USER: 'test@example.com',
  OPENOBSERVE_PASSWORD: 'test-pass',
};

/** Stands in for GraphQL, which accepts the session, and OpenObserve's search. */
function stubServers(t: TestContext, search: (sql: string) => Response) {
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/auth/session') {
      return new Response(null, { status: 200 });
    }
    if (url.pathname === '/graphql') {
      return Response.json({ data: { siteSettings: { siteUrl: 'https://highforthis.com/' } } });
    }
    return search(JSON.parse(String(init?.body)).query.sql);
  });
}

const dashboard = async () =>
  (
    await router.fetch(new Request(new URL('/admin', origin), { headers: { cookie: session } }))
  ).text();

describe('admin dashboard', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
    for (const name of Object.keys(openObserve)) {
      delete process.env[name];
    }
  });

  it('says how to show page views until OpenObserve is set up', async (t) => {
    stubServers(t, () => Response.json({ hits: [] }));
    const html = await dashboard();
    assert.match(html, /<h1[^>]*>Dashboard<\/h1>/);
    assert.match(html, /role="alert"[^>]*>Page views come from OpenObserve\./);
  });

  it('shows the views, sessions, chart and top pages', async (t) => {
    Object.assign(process.env, openObserve);
    stubServers(t, (sql) => {
      if (sql.includes('histogram')) {
        return Response.json({ hits: [{ hour: new Date().toISOString(), views: 1200 }] });
      }
      if (sql.includes('session_id')) {
        return Response.json({ hits: [{ views: 1200, sessions: 340 }] });
      }
      return Response.json({ hits: [{ url: 'https://highforthis.com/shows', views: 1200 }] });
    });
    const html = await dashboard();
    assert.match(html, /Last 30 days, from OpenObserve RUM/);
    assert.match(html, />1,200<\/div>/);
    assert.match(html, />340<\/div>/);
    assert.match(html, /<svg[^>]*aria-label="Page views per day over the last 30 days"/);
    assert.match(html, /Peak: 1200 views/);
    assert.match(html, /<a[^>]*href="https:\/\/highforthis\.com\/shows"[^>]*>\/shows<\/a>/);
  });

  it("says so when OpenObserve can't answer", async (t) => {
    Object.assign(process.env, openObserve);
    t.mock.method(console, 'error', () => {});
    stubServers(t, () => new Response('down', { status: 502 }));
    assert.match(await dashboard(), /role="alert"[^>]*>Couldn't load page views/);
  });

  it('sends signed-out people to sign in', async () => {
    const response = await router.fetch(new URL('/admin', origin));
    assert.equal(response.headers.get('location'), '/login/unauthorized');
  });
});
