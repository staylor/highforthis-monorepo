import { describe, expect, it } from 'vitest';

import { siteYear, startOfSiteYear } from '#/time';

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
