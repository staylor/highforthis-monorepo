import { openObserveConfig } from '../openobserve.server';
import { dailyViews, loadPageViews, topPages } from '../pageViews.server';

describe('dailyViews', () => {
  const now = new Date('2026-11-18T17:00:00Z');

  it('has one entry per day, oldest first, with empty days at 0', () => {
    const days = dailyViews([], now, 3);
    expect(days).toEqual([
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
    expect(days).toEqual([
      { date: '2026-11-17', views: 2 },
      { date: '2026-11-18', views: 4 },
    ]);
  });

  it('ignores hours outside the range', () => {
    expect(dailyViews([{ hour: '2026-10-01T12:00:00', views: 9 }], now, 2)).toEqual([
      { date: '2026-11-17', views: 0 },
      { date: '2026-11-18', views: 0 },
    ]);
  });
});

describe('topPages', () => {
  it('merges URLs by path and sorts by views', () => {
    expect(
      topPages([
        { url: 'https://highforthis.com/shows?page=2', views: 2 },
        { url: 'https://highforthis.com/', views: 5 },
        { url: 'https://highforthis.com/shows/', views: 4 },
        { url: 'not a url', views: 100 },
        { url: 'https://highforthis.com/videos', views: 1 },
      ])
    ).toEqual([
      { path: '/shows', views: 6 },
      { path: '/', views: 5 },
      { path: '/videos', views: 1 },
    ]);
  });

  it('keeps the busiest pages up to the limit', () => {
    const urls = ['a', 'b', 'c'].map((path, index) => ({
      url: `https://highforthis.com/${path}`,
      views: index + 1,
    }));
    expect(topPages(urls, 2).map(({ path }) => path)).toEqual(['/c', '/b']);
  });
});

describe('openObserveConfig', () => {
  it('needs a URL, user and password', () => {
    expect(openObserveConfig({ OPENOBSERVE_URL: 'http://o2:5080' })).toBeNull();
  });

  it('builds the Basic header and defaults the organization', () => {
    expect(
      openObserveConfig({
        OPENOBSERVE_URL: 'http://o2:5080/',
        OPENOBSERVE_USER: 'test@example.com',
        OPENOBSERVE_PASSWORD: 'test-pass',
      })
    ).toEqual({
      url: 'http://o2:5080',
      organization: 'default',
      authorization: 'Basic dGVzdEBleGFtcGxlLmNvbTp0ZXN0LXBhc3M=',
    });
  });
});

describe('loadPageViews', () => {
  it('reports when OpenObserve is not configured', async () => {
    vi.stubEnv('OPENOBSERVE_URL', '');
    await expect(loadPageViews()).resolves.toEqual({ status: 'unconfigured' });
    vi.unstubAllEnvs();
  });
});
