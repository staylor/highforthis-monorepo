import { zonedInstant } from '#/listings/time';

/**
 * The site's time zone. Its shows are in and around New York, and it dates them there, as the web
 * server and the scheduled jobs do, so a show on New Year's Eve is in the year that's ending.
 */
export const SITE_TIME_ZONE = 'America/New_York';

// Made once: making a formatter takes far longer than formatting a date with one
const yearFormat = new Intl.DateTimeFormat('en-US', { timeZone: SITE_TIME_ZONE, year: 'numeric' });

/** The year an instant is in, in the site's time zone */
export function siteYear(instant: Date): number {
  return Number(yearFormat.format(instant));
}

/**
 * When a year starts in the site's time zone. It's worked out from the year as a number: 9999 ends
 * when 10000 starts, and a date written with a five-digit year can't be read back.
 */
export function startOfSiteYear(year: number): Date {
  return zonedInstant(new Date(Date.UTC(year, 0, 1)), SITE_TIME_ZONE);
}
