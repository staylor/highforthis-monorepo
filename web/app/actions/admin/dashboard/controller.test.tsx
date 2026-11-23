import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession } from '#/lib/adminSession.fixtures.ts';
import { router } from '#/router.ts';

const origin = 'http://localhost';

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
    await router.fetch(new Request(new URL('/admin', origin), { headers: { cookie: testSession } }))
  ).text();

describe('admin dashboard', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
    for (const name of Object.keys(openObserve)) {
      delete process.env[name];
    }
  });

  it('says how to show its numbers until OpenObserve is set up', async (t) => {
    stubServers(t, () => Response.json({ hits: [] }));
    const html = await dashboard();
    assert.match(html, /<h1[^>]*>Dashboard<\/h1>/);
    assert.match(html, /role="alert"[^>]*>The dashboard's numbers come from OpenObserve\./);
    assert.doesNotMatch(html, />Performance<\/h2>/);
  });

  it("rates visitors' Web Vitals and shows the server's response times and errors", async (t) => {
    Object.assign(process.env, openObserve);
    stubServers(t, (sql) => {
      if (sql.includes('approx_percentile_cont(lcp')) {
        return Response.json({
          hits: [
            {
              lcp: 1_240_000_000,
              lcp_samples: 12,
              inp: 24_000_000,
              inp_samples: 10,
              cls: 0.3,
              cls_samples: 79,
              ttfb: 1_200_000_000,
              ttfb_samples: 12,
            },
          ],
        });
      }
      if (sql.includes('responsetime')) {
        return Response.json({ hits: [{ pages: 2304, p50: 67, p95: 238 }] });
      }
      if (sql.includes('res_statuscode >= 500')) {
        return Response.json({ hits: [{ requests: 5595, errors: 2 }] });
      }
      if (sql.includes("url_path = '/graphql'")) {
        return Response.json({ hits: [{ calls: 7550, p95: 120_403 }] });
      }
      return Response.json({ hits: [] });
    });
    const html = await dashboard();
    assert.match(html, />Performance<\/h2>/);
    assert.match(html, /Last 7 days\. Visitors' numbers are the 75th percentile of real visits/);
    const metric = (label: string, value: string, detail: string) =>
      new RegExp(`>${label}</div><div[^>]*>${value}</div><div[^>]*>(?:.(?!</div>))*${detail}`);
    assert.match(html, metric('Loading \\(LCP\\)', '1\\.24 s', 'Good</span><span>12 page loads'));
    assert.match(
      html,
      metric('Responsiveness \\(INP\\)', '24 ms', 'Good</span><span>10 interactions')
    );
    assert.match(html, metric('Visual stability \\(CLS\\)', '0\\.30', 'Poor</span><span>79 views'));
    assert.match(html, metric('First byte \\(TTFB\\)', '1\\.20 s', 'Needs improvement</span>'));
    assert.match(html, metric('Page response \\(p50\\)', '67 ms', '2,304 pages served'));
    assert.match(html, metric('Page response \\(p95\\)', '238 ms', '2,304 pages served'));
    assert.match(html, metric('Server errors', '0\\.04%', '2 of 5,595 responses'));
    assert.match(html, metric('GraphQL calls \\(p95\\)', '120 ms', '7,550 calls from the site'));
    assert.match(html, />Traffic<\/h2>/);
  });

  it('says when nothing has measured a number yet', async (t) => {
    Object.assign(process.env, openObserve);
    stubServers(t, () => Response.json({ hits: [] }));
    const html = await dashboard();
    assert.match(html, />Loading \(LCP\)<\/div><div[^>]*>—<\/div><div[^>]*><span>No data yet/);
    assert.match(html, />Server errors<\/div><div[^>]*>—<\/div><div[^>]*><span>No data yet/);
  });

  it('shows the views, sessions, chart and top pages', async (t) => {
    // Noon on November 18th in New York
    t.useFakeTimers({ now: new Date('2026-11-18T17:00:00Z') });
    Object.assign(process.env, openObserve);
    stubServers(t, (sql) => {
      if (sql.includes('histogram')) {
        return Response.json({ hits: [{ hour: '2026-11-18T16:00:00', views: 1200 }] });
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
    assert.match(html, /<span>Oct 20<\/span><span>Peak: 1200 views<\/span><span>Nov 18<\/span>/);
    assert.match(html, /<a[^>]*href="https:\/\/highforthis\.com\/shows"[^>]*>\/shows<\/a>/);
  });

  it("says so when OpenObserve can't answer", async (t) => {
    Object.assign(process.env, openObserve);
    stubServers(t, () => new Response('down', { status: 502 }));
    const html = await dashboard();
    assert.match(html, /role="alert"[^>]*>Couldn't load performance/);
    assert.match(html, /role="alert"[^>]*>Couldn't load page views/);
  });

  it('sends signed-out people to sign in', async () => {
    const response = await router.fetch(new URL('/admin', origin));
    assert.equal(response.headers.get('location'), '/login/unauthorized');
  });
});
