import { describe, expect, it } from 'vitest';

import { dayKey, zonedTime } from '../time';

describe('zonedTime', () => {
  it.each([
    ['2026-11-10', '20:00', 'America/New_York', '2026-11-11T01:00:00.000Z'],
    ['2026-07-04', '20:00', 'America/New_York', '2026-07-05T00:00:00.000Z'],
    ['2026-12-31', '19:00', 'America/Los_Angeles', '2027-01-01T03:00:00.000Z'],
  ])('converts %s %s in %s', (date, time, timeZone, instant) => {
    expect(zonedTime(date, time, timeZone).toISOString()).toBe(instant);
  });
});

describe('dayKey', () => {
  it('reads the calendar date in the given time zone', () => {
    const instant = new Date('2027-01-01T03:00:00Z');

    expect(dayKey(instant, 'America/Los_Angeles')).toBe('2026-12-31');
    expect(dayKey(instant, 'America/New_York')).toBe('2026-12-31');
    expect(dayKey(instant, 'UTC')).toBe('2027-01-01');
  });
});
