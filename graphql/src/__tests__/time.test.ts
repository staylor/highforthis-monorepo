import { describe, expect, it } from 'vitest';

import { calendarDate, clockInstant } from '@highforthis/shared/time';

describe('compatible clock conversion', () => {
  it.each([
    ['2026-11-10', '20:00', 'America/New_York', '2026-11-11T01:00:00.000Z'],
    ['2026-03-08', '04:30', 'America/New_York', '2026-03-08T08:30:00.000Z'],
    ['2026-11-01', '02:30', 'America/New_York', '2026-11-01T07:30:00.000Z'],
    ['2026-03-08', '02:30', 'America/New_York', '2026-03-08T07:30:00.000Z'],
    ['2026-11-01', '01:30', 'America/New_York', '2026-11-01T05:30:00.000Z'],
    ['2026-07-04', '20:00', 'America/New_York', '2026-07-05T00:00:00.000Z'],
    ['2026-12-31', '19:00', 'America/Los_Angeles', '2027-01-01T03:00:00.000Z'],
  ])('converts %s %s in %s', (date, time, timeZone, instant) => {
    expect(new Date(clockInstant(`${date}T${time}`, timeZone)).toISOString()).toBe(instant);
  });
});

describe('calendarDate', () => {
  it('reads the calendar date in the given time zone', () => {
    const instant = Date.parse('2027-01-01T03:00:00Z');

    expect(calendarDate(instant, 'America/Los_Angeles').toString()).toBe('2026-12-31');
    expect(calendarDate(instant, 'America/New_York').toString()).toBe('2026-12-31');
    expect(calendarDate(instant, 'UTC').toString()).toBe('2027-01-01');
  });
});
