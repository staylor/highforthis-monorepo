import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { openObserveConfig } from './openobserve.ts';
import { dailyViews, loadPageViews, topPages } from './page-views.ts';

describe('dailyViews', () => {
  const now = new Date('2026-11-18T17:00:00Z');

  it('has one entry per day, oldest first, with empty days at 0', () => {
    const days = dailyViews([], now, 3);
    assert.deepEqual(days, [
      { date: '2026-11-16', views: 0 },
      { date: '2026-11-17', views: 0 },
      { date: '2026-11-18', views: 0 },
    ]);
  });

  it('groups UTC hours into New York days', () => {
    const days = dailyViews(
      [
        // 10pm on the 17th in New York
        { hour: '2026-11-18T03:00:00', views: 2 },
        // midnight on the 18th in New York
        { hour: '2026-11-18T05:00:00', views: 3 },
        { hour: '2026-11-18T16:00:00Z', views: 1 },
      ],
      now,
      2
    );
    assert.deepEqual(days, [
      { date: '2026-11-17', views: 2 },
      { date: '2026-11-18', views: 4 },
    ]);
  });

  it('ignores hours outside the range', () => {
    assert.deepEqual(dailyViews([{ hour: '2026-10-01T12:00:00', views: 9 }], now, 2), [
      { date: '2026-11-17', views: 0 },
      { date: '2026-11-18', views: 0 },
    ]);
  });
});

describe('topPages', () => {
  it('merges URLs by path and sorts by views', () => {
    assert.deepEqual(
      topPages([
        { url: 'https://highforthis.com/shows?page=2', views: 2 },
        { url: 'https://highforthis.com/', views: 5 },
        { url: 'https://highforthis.com/shows/', views: 4 },
        { url: 'not a url', views: 100 },
        { url: 'https://highforthis.com/videos', views: 1 },
      ]),
      [
        { path: '/shows', views: 6 },
        { path: '/', views: 5 },
        { path: '/videos', views: 1 },
      ]
    );
  });

  it('keeps the busiest pages up to the limit', () => {
    const urls = ['a', 'b', 'c'].map((path, index) => ({
      url: `https://highforthis.com/${path}`,
      views: index + 1,
    }));
    assert.deepEqual(
      topPages(urls, 2).map(({ path }) => path),
      ['/c', '/b']
    );
  });
});

describe('openObserveConfig', () => {
  it('needs a URL, user and password', () => {
    assert.equal(openObserveConfig({ OPENOBSERVE_URL: 'http://o2:5080' }), null);
  });

  it('builds the Basic header and defaults the organization', () => {
    assert.deepEqual(
      openObserveConfig({
        OPENOBSERVE_URL: 'http://o2:5080/',
        OPENOBSERVE_USER: 'test@example.com',
        OPENOBSERVE_PASSWORD: 'test-pass',
      }),
      {
        url: 'http://o2:5080',
        organization: 'default',
        authorization: 'Basic dGVzdEBleGFtcGxlLmNvbTp0ZXN0LXBhc3M=',
      }
    );
  });
});

describe('loadPageViews', () => {
  const config = {
    OPENOBSERVE_URL: 'http://o2:5080',
    OPENOBSERVE_USER: 'test@example.com',
    OPENOBSERVE_PASSWORD: 'test-pass',
  };

  it('reports when OpenObserve is not configured', async () => {
    assert.deepEqual(await loadPageViews(new Date(), {}), { status: 'unconfigured' });
  });

  it('counts views, sessions, days and top pages from three searches', async (t) => {
    const now = new Date('2026-11-18T17:00:00Z');
    const searches: { url: string; sql: string; authorization: string | null }[] = [];
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const { query } = JSON.parse(String(init?.body));
      searches.push({
        url: String(input),
        sql: query.sql,
        authorization: new Headers(init?.headers).get('Authorization'),
      });
      if (query.sql.includes('histogram')) {
        return Response.json({ hits: [{ hour: '2026-11-18T16:00:00', views: 3 }] });
      }
      if (query.sql.includes('session_id')) {
        return Response.json({ hits: [{ views: 3, sessions: 2 }] });
      }
      return Response.json({ hits: [{ url: 'https://highforthis.com/shows', views: 3 }] });
    });

    const result = await loadPageViews(now, config);
    assert.equal(result.status, 'ok');
    const { pageViews } = result as Extract<typeof result, { status: 'ok' }>;
    assert.equal(pageViews.views, 3);
    assert.equal(pageViews.sessions, 2);
    assert.equal(pageViews.days.length, 30);
    assert.deepEqual(pageViews.days.at(-1), { date: '2026-11-18', views: 3 });
    assert.deepEqual(pageViews.topPages, [{ path: '/shows', views: 3 }]);
    assert.equal(searches.length, 3);
    assert.ok(searches.every(({ url }) => url === 'http://o2:5080/api/default/_search?type=logs'));
    assert.ok(searches.every(({ authorization }) => authorization?.startsWith('Basic ')));
  });

  it("reports an error when OpenObserve can't answer", async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response('down', { status: 502 }));
    t.mock.method(console, 'error', () => {});
    assert.deepEqual(await loadPageViews(new Date(), config), { status: 'error' });
  });
});
