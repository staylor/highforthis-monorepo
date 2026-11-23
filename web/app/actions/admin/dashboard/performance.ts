import { logger } from '#/lib/logger.ts';

import { openObserveConfig, search } from './openobserve.ts';

// How the site has performed lately. Core Web Vitals come from visitors' browsers through RUM,
// and the server's response times and errors from its request logs and traces.

const DAYS = 7;

export type VitalName = 'lcp' | 'inp' | 'cls' | 'ttfb';
export type Rating = 'good' | 'needsImprovement' | 'poor';

// Where good ends and poor begins for each vital, in milliseconds (CLS has no unit), from
// https://web.dev/articles/vitals and https://web.dev/articles/ttfb
const thresholds: Record<VitalName, [good: number, poor: number]> = {
  lcp: [2500, 4000],
  inp: [200, 500],
  cls: [0.1, 0.25],
  ttfb: [800, 1800],
};

export function rate(name: VitalName, value: number): Rating {
  const [good, poor] = thresholds[name];
  if (value <= good) {
    return 'good';
  }
  return value <= poor ? 'needsImprovement' : 'poor';
}

export interface Vital {
  /** The 75th percentile, in milliseconds (CLS has no unit), or null with no samples */
  value: number | null;
  /** How many views measured it */
  samples: number;
}

export interface Performance {
  days: number;
  vitals: Record<VitalName, Vital>;
  /** Response times of the pages the server sent, in milliseconds */
  pages: { p50: number | null; p95: number | null; count: number };
  /** Responses with a 5xx status, out of all the server's responses */
  errors: { count: number; requests: number };
  /** The server's calls to the GraphQL API, in milliseconds */
  graphql: { p95: number | null; calls: number };
}

type PerformanceResult =
  | { status: 'ok'; performance: Performance }
  | { status: 'unconfigured' }
  | { status: 'error' };

// RUM sends several updates for one view, so each view counts once, with its largest values.
// Only first loads measure LCP and TTFB, and only views with an interaction measure INP, so each
// percentile is over the views that measured it. RUM's durations are in nanoseconds.
const VITALS_SQL = `SELECT
  approx_percentile_cont(lcp, 0.75) AS lcp, count(lcp) AS lcp_samples,
  approx_percentile_cont(inp, 0.75) AS inp, count(inp) AS inp_samples,
  approx_percentile_cont(cls, 0.75) AS cls, count(cls) AS cls_samples,
  approx_percentile_cont(ttfb, 0.75) AS ttfb, count(ttfb) AS ttfb_samples
FROM (
  SELECT view_id,
    max(view_largest_contentful_paint) AS lcp,
    max(view_interaction_to_next_paint) AS inp,
    max(view_cumulative_layout_shift) AS cls,
    max(view_first_byte) AS ttfb
  FROM "_rumdata" WHERE type = 'view' GROUP BY view_id
)`;

// The request log's pages are the HTML the server sent successfully, which leaves out assets,
// redirects and errors. pino-http's responsetime is in milliseconds.
const PAGES_SQL = `SELECT count(*) AS pages,
  approx_percentile_cont(responsetime, 0.5) AS p50,
  approx_percentile_cont(responsetime, 0.95) AS p95
FROM "default"
WHERE service_name = 'web' AND res_headers_content_type LIKE 'text/html%' AND res_statuscode < 300`;

const ERRORS_SQL = `SELECT count(*) AS requests, count(CASE WHEN res_statuscode >= 500 THEN 1 END) AS errors
FROM "default" WHERE service_name = 'web' AND res_statuscode > 0`;

// The fetch instrumentation's client spans (span_kind 3) time the web server's GraphQL calls.
// Span durations are in microseconds.
const GRAPHQL_SQL = `SELECT count(*) AS calls, approx_percentile_cont(duration, 0.95) AS p95
FROM "default" WHERE service_name = 'web' AND span_kind = '3' AND url_path = '/graphql'`;

const NS_PER_MS = 1_000_000;
const US_PER_MS = 1000;

type Row = Record<string, unknown>;

const count = (value: unknown) => (typeof value === 'number' && value > 0 ? value : 0);

// A percentile scaled to milliseconds, or null when nothing measured it
function percentile(value: unknown, samples: number, perMs = 1): number | null {
  return samples > 0 && typeof value === 'number' && Number.isFinite(value) ? value / perMs : null;
}

function vital(row: Row, name: VitalName, perMs: number): Vital {
  const samples = count(row[`${name}_samples`]);
  return { value: percentile(row[name], samples, perMs), samples };
}

export function summarize(vitals: Row = {}, pages: Row = {}, errors: Row = {}, graphql: Row = {}) {
  const pageCount = count(pages.pages);
  const calls = count(graphql.calls);
  return {
    days: DAYS,
    vitals: {
      lcp: vital(vitals, 'lcp', NS_PER_MS),
      inp: vital(vitals, 'inp', NS_PER_MS),
      cls: vital(vitals, 'cls', 1),
      ttfb: vital(vitals, 'ttfb', NS_PER_MS),
    },
    pages: {
      p50: percentile(pages.p50, pageCount),
      p95: percentile(pages.p95, pageCount),
      count: pageCount,
    },
    errors: { count: count(errors.errors), requests: count(errors.requests) },
    graphql: { p95: percentile(graphql.p95, calls, US_PER_MS), calls },
  } satisfies Performance;
}

export function formatDuration(ms: number) {
  return ms < 1000 ? `${Math.round(ms)} ms` : `${(ms / 1000).toFixed(2)} s`;
}

// A share as a percentage, which never rounds a few errors down to 0%
export function formatShare(part: number, whole: number) {
  const share = part / whole;
  if (part > 0 && share < 0.0001) {
    return '<0.01%';
  }
  return share.toLocaleString('en-US', { style: 'percent', maximumFractionDigits: 2 });
}

export async function loadPerformance(
  now = new Date(),
  env = process.env
): Promise<PerformanceResult> {
  const config = openObserveConfig(env);
  if (!config) {
    return { status: 'unconfigured' };
  }

  const range = { start: new Date(now.getTime() - DAYS * 24 * 60 * 60 * 1000), end: now };
  try {
    const [[vitals], [pages], [errors], [graphql]] = await Promise.all([
      search<Row>(config, VITALS_SQL, range),
      search<Row>(config, PAGES_SQL, range),
      search<Row>(config, ERRORS_SQL, range),
      search<Row>(config, GRAPHQL_SQL, { ...range, type: 'traces' }),
    ]);
    return { status: 'ok', performance: summarize(vitals, pages, errors, graphql) };
  } catch (error) {
    logger.error({ err: error }, 'Loading performance from OpenObserve failed');
    return { status: 'error' };
  }
}
