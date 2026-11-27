import { describe, expect, it } from 'vitest';

import { siteYear, startOfSiteDay, startOfSiteYear } from '#/time';

describe("the site's years", () => {
  // 8 PM on New Year's Eve in New York is 1 AM on New Year's Day in UTC
  it("puts an instant in the year it's in, in New York", () => {
    expect(siteYear(new Date('2025-01-01T01:00:00Z'))).toBe(2024);
    expect(siteYear(new Date('2025-01-01T05:00:00Z'))).toBe(2025);
    expect(siteYear(new Date('2024-07-04T23:30:00Z'))).toBe(2024);
  });

  it('start at midnight on New Year’s Day in New York', () => {
    expect(startOfSiteYear(2024).toISOString()).toBe('2024-01-01T05:00:00.000Z');
    expect(siteYear(startOfSiteYear(2024))).toBe(2024);
    expect(siteYear(new Date(startOfSiteYear(2024).getTime() - 1))).toBe(2023);
  });

  // 9999 has four digits, and ends when 10000 starts, which a written date can't say
  it('start after 9999 too', () => {
    expect(startOfSiteYear(10000).toISOString()).toBe('+010000-01-01T05:00:00.000Z');
  });
});

describe("the site's days", () => {
  // 11 PM in New York is 4 AM the next day in UTC in the winter, and 3 AM in the summer
  it('start at midnight in New York', () => {
    expect(startOfSiteDay(new Date('2026-01-16T04:00:00Z')).toISOString()).toBe(
      '2026-01-15T05:00:00.000Z'
    );
    expect(startOfSiteDay(new Date('2026-07-04T03:00:00Z')).toISOString()).toBe(
      '2026-07-03T04:00:00.000Z'
    );
    expect(startOfSiteDay(new Date('2026-07-04T04:00:00Z')).toISOString()).toBe(
      '2026-07-04T04:00:00.000Z'
    );
  });

  // The clocks change at 2 AM, once the day has started
  it('start at midnight on the days the clocks change', () => {
    expect(startOfSiteDay(new Date('2026-03-08T12:00:00Z')).toISOString()).toBe(
      '2026-03-08T05:00:00.000Z'
    );
    expect(startOfSiteDay(new Date('2026-11-01T12:00:00Z')).toISOString()).toBe(
      '2026-11-01T04:00:00.000Z'
    );
  });
});
