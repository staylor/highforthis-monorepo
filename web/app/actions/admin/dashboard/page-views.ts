import { calendarDate, clockInstant, SITE_TIME_ZONE } from '@highforthis/shared/time';

import { logger } from '#/lib/logger.ts';

import { openObserveConfig, search } from './openobserve.ts';

// Page views come from the public site's browser RUM, which records a "view" event per page.
// The SDK sends several updates for one view, so views are counted by distinct view_id.

const DAYS = 30;
const VIEWS = `FROM "_rumdata" WHERE type = 'view'`;

export interface PageViews {
  days: { date: string; views: number }[];
  views: number;
  sessions: number;
  topPages: { path: string; views: number }[];
}

type PageViewsResult =
  | { status: 'ok'; pageViews: PageViews }
  | { status: 'unconfigured' }
  | { status: 'error' };

function lastDates(now: Date, days: number) {
  const today = calendarDate(now.getTime());
  return Array.from({ length: days }, (_, i) => today.subtract({ days: days - 1 - i }).toString());
}

export function dailyViews(
  hours: { hour: string; views: number }[],
  now: Date,
  days = DAYS
): PageViews['days'] {
  const totals = new Map<string, number>(lastDates(now, days).map((date) => [date, 0]));
  for (const { hour, views } of hours) {
    // OpenObserve's histogram buckets are UTC, without a zone suffix
    const timestamp = Date.parse(/(?:Z|[+-]\d{2}:?\d{2})$/i.test(hour) ? hour : `${hour}Z`);
    if (!Number.isFinite(timestamp)) continue;
    const key = calendarDate(timestamp).toString();
    if (totals.has(key)) {
      totals.set(key, (totals.get(key) ?? 0) + views);
    }
  }
  return [...totals].map(([date, views]) => ({ date, views }));
}

// Groups full URLs by path, ignoring query strings and trailing slashes.
export function topPages(
  urls: { url: string; views: number }[],
  limit = 10
): PageViews['topPages'] {
  const totals = new Map<string, number>();
  for (const { url, views } of urls) {
    let path: string;
    try {
      path = new URL(url).pathname.replace(/(.)\/$/, '$1');
    } catch {
      continue;
    }
    totals.set(path, (totals.get(path) ?? 0) + views);
  }
  return [...totals]
    .map(([path, views]) => ({ path, views }))
    .sort((a, b) => b.views - a.views || a.path.localeCompare(b.path))
    .slice(0, limit);
}

export async function loadPageViews(now = new Date(), env = process.env): Promise<PageViewsResult> {
  const config = openObserveConfig(env);
  if (!config) {
    return { status: 'unconfigured' };
  }

  const firstDay = calendarDate(now.getTime()).subtract({ days: DAYS - 1 });
  const range = { start: new Date(clockInstant(`${firstDay}T00:00`, SITE_TIME_ZONE)), end: now };
  try {
    const [hours, totals, urls] = await Promise.all([
      search<{ hour: string; views: number }>(
        config,
        `SELECT histogram(_timestamp, '1 hour') AS hour, count(DISTINCT view_id) AS views ${VIEWS} GROUP BY hour ORDER BY hour`,
        range
      ),
      search<{ views: number; sessions: number }>(
        config,
        `SELECT count(DISTINCT view_id) AS views, count(DISTINCT session_id) AS sessions ${VIEWS}`,
        range
      ),
      search<{ url: string; views: number }>(
        config,
        `SELECT view_url AS url, count(DISTINCT view_id) AS views ${VIEWS} GROUP BY url ORDER BY views DESC`,
        range
      ),
    ]);
    return {
      status: 'ok',
      pageViews: {
        days: dailyViews(hours, now),
        views: totals[0]?.views ?? 0,
        sessions: totals[0]?.sessions ?? 0,
        topPages: topPages(urls),
      },
    };
  } catch (error) {
    logger.error({ err: error }, 'Loading page views from OpenObserve failed');
    return { status: 'error' };
  }
}
