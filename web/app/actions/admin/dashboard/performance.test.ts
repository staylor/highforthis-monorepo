import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { formatDuration, formatShare, loadPerformance, rate, summarize } from './performance.ts';

describe('rate', () => {
  it("rates each vital against Google's thresholds, counting the boundary as the better side", () => {
    assert.equal(rate('lcp', 2500), 'good');
    assert.equal(rate('lcp', 2501), 'needsImprovement');
    assert.equal(rate('lcp', 4000), 'needsImprovement');
    assert.equal(rate('lcp', 4001), 'poor');
    assert.equal(rate('inp', 200), 'good');
    assert.equal(rate('inp', 501), 'poor');
    assert.equal(rate('cls', 0.1), 'good');
    assert.equal(rate('cls', 0.2), 'needsImprovement');
    assert.equal(rate('cls', 0.3), 'poor');
    assert.equal(rate('ttfb', 800), 'good');
    assert.equal(rate('ttfb', 1801), 'poor');
  });
});

describe('summarize', () => {
  it('turns RUM nanoseconds and span microseconds into milliseconds', () => {
    const performance = summarize(
      {
        lcp: 1_240_000_000,
        lcp_samples: 12,
        inp: 24_000_000,
        inp_samples: 10,
        cls: 0.05,
        cls_samples: 79,
        ttfb: 484_300_000,
        ttfb_samples: 12,
      },
      { pages: 2304, p50: 67, p95: 238 },
      { requests: 5595, errors: 2 },
      { calls: 7550, p95: 120_403 }
    );
    assert.deepEqual(performance, {
      days: 7,
      vitals: {
        lcp: { value: 1240, samples: 12 },
        inp: { value: 24, samples: 10 },
        cls: { value: 0.05, samples: 79 },
        ttfb: { value: 484.3, samples: 12 },
      },
      pages: { p50: 67, p95: 238, count: 2304 },
      errors: { count: 2, requests: 5595 },
      graphql: { p95: 120.403, calls: 7550 },
    });
  });

  it('has no values where nothing measured them', () => {
    // OpenObserve answers an empty range with nulls, or no row at all
    const performance = summarize({ lcp: null, lcp_samples: 0, cls: 0, cls_samples: 0 });
    assert.deepEqual(performance.vitals.lcp, { value: null, samples: 0 });
    assert.deepEqual(performance.vitals.cls, { value: null, samples: 0 });
    assert.deepEqual(performance.vitals.inp, { value: null, samples: 0 });
    assert.deepEqual(performance.pages, { p50: null, p95: null, count: 0 });
    assert.deepEqual(performance.errors, { count: 0, requests: 0 });
    assert.deepEqual(performance.graphql, { p95: null, calls: 0 });
  });

  it('keeps a layout shift of 0 that was measured', () => {
    assert.deepEqual(summarize({ cls: 0, cls_samples: 4 }).vitals.cls, { value: 0, samples: 4 });
  });
});

describe('formatDuration', () => {
  it('shows milliseconds under a second and seconds from there', () => {
    assert.equal(formatDuration(23.6), '24 ms');
    assert.equal(formatDuration(999), '999 ms');
    assert.equal(formatDuration(1240), '1.24 s');
  });
});

describe('formatShare', () => {
  it('shows a percentage without rounding a few errors down to nothing', () => {
    assert.equal(formatShare(0, 5595), '0%');
    assert.equal(formatShare(2, 5595), '0.04%');
    assert.equal(formatShare(1, 1_000_000), '<0.01%');
    assert.equal(formatShare(3, 4), '75%');
  });
});

describe('loadPerformance', () => {
  const config = {
    OPENOBSERVE_URL: 'http://o2:5080',
    OPENOBSERVE_USER: 'test@example.com',
    OPENOBSERVE_PASSWORD: 'test-pass',
  };

  it('reports when OpenObserve is not configured', async () => {
    assert.deepEqual(await loadPerformance(new Date(), {}), { status: 'unconfigured' });
  });

  it('searches RUM and the request logs as logs, and the GraphQL calls as traces', async (t) => {
    const now = new Date('2026-11-20T17:00:00Z');
    const searches: { type: string | null; sql: string; start: number; end: number }[] = [];
    t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
      const { query } = JSON.parse(String(init?.body));
      searches.push({
        type: new URL(String(input)).searchParams.get('type'),
        sql: query.sql,
        start: query.start_time,
        end: query.end_time,
      });
      if (query.sql.includes('_rumdata')) {
        return Response.json({ hits: [{ lcp: 2_000_000_000, lcp_samples: 3 }] });
      }
      if (query.sql.includes('responsetime')) {
        return Response.json({ hits: [{ pages: 40, p50: 50, p95: 300 }] });
      }
      if (query.sql.includes('res_statuscode >= 500')) {
        return Response.json({ hits: [{ requests: 100, errors: 1 }] });
      }
      return Response.json({ hits: [{ calls: 80, p95: 90_000 }] });
    });

    const result = await loadPerformance(now, config);
    assert.equal(result.status, 'ok');
    const { performance } = result as Extract<typeof result, { status: 'ok' }>;
    assert.deepEqual(performance.vitals.lcp, { value: 2000, samples: 3 });
    assert.deepEqual(performance.pages, { p50: 50, p95: 300, count: 40 });
    assert.deepEqual(performance.errors, { count: 1, requests: 100 });
    assert.deepEqual(performance.graphql, { p95: 90, calls: 80 });

    assert.deepEqual(
      searches.map(({ type, sql }) => [type, sql.includes('url_path')]),
      [
        ['logs', false],
        ['logs', false],
        ['logs', false],
        ['traces', true],
      ]
    );
    // The last seven days, in microseconds
    assert.ok(searches.every(({ end }) => end === now.getTime() * 1000));
    assert.ok(searches.every(({ start }) => start === (now.getTime() - 7 * 86_400_000) * 1000));
  });

  it("reports an error when OpenObserve can't answer", async (t) => {
    t.mock.method(globalThis, 'fetch', async () => new Response('down', { status: 502 }));
    t.mock.method(console, 'error', () => {});
    assert.deepEqual(await loadPerformance(new Date(), config), { status: 'error' });
  });
});
