import { describe, expect, it } from 'vitest';

import { feedSchedule, legacyShowDate, resolveSchedule } from '#/show-schedule';

describe('show schedules', () => {
  const fold = { localDate: '2026-11-01', localTime: '01:30', timeZone: 'America/New_York' };
  it('keeps repeated and skipped clocks without guessing an instant', () => {
    expect(resolveSchedule(fold)).toEqual({ ...fold, startsAt: null });
    expect(
      resolveSchedule({ ...fold, localDate: '2026-03-08', localTime: '02:30' }).startsAt
    ).toBeNull();
    for (const hour of [5, 6]) {
      const startsAt = Date.UTC(2026, 10, 1, hour, 30);
      expect(resolveSchedule({ ...fold, startsAt }).startsAt?.getTime()).toBe(startsAt);
    }
    expect(() => resolveSchedule({ ...fold, startsAt: Date.UTC(2026, 10, 1, 7, 30) })).toThrow(
      /disagrees/
    );
  });
  it('keeps a real Phoenix start distinct from its New York compatibility projection', () => {
    const schedule = resolveSchedule({
      localDate: '2026-03-08',
      localTime: '02:30',
      timeZone: 'America/Phoenix',
    });
    expect(schedule.startsAt?.toISOString()).toBe('2026-03-08T09:30:00.000Z');
    expect(legacyShowDate(schedule.localDate, schedule.localTime).toISOString()).toBe(
      '2026-03-08T07:30:00.000Z'
    );
  });
  it('keeps date-only records, unknown zones, and independently supplied instants', () => {
    expect(resolveSchedule({ localDate: '2024-02-29' })).toEqual({
      localDate: '2024-02-29',
      localTime: null,
      timeZone: null,
      startsAt: null,
    });
    expect(
      resolveSchedule({
        localDate: '1969-12-31',
        localTime: '19:00',
        startsAt: 0,
      }).startsAt?.getTime()
    ).toBe(0);
    expect(() => resolveSchedule({ ...fold, timeZone: '-05:00' })).toThrow(/IANA/);
    expect(() => resolveSchedule({ ...fold, localDate: '2026-02-29' })).toThrow(RangeError);
    expect(() => resolveSchedule({ ...fold, localTime: '24:00' })).toThrow(/clock time/);
  });
  it('keeps a zone under the name it was given, as the IANA database spells it', () => {
    const zoneOf = (timeZone: string) => resolveSchedule({ localDate: '2026-07-04', timeZone });
    for (const name of ['Europe/Kyiv', 'Asia/Kolkata', 'US/Eastern', 'EST', 'Etc/GMT+5']) {
      expect(zoneOf(name).timeZone).toBe(name);
    }
    expect(zoneOf('america/new_york').timeZone).toBe('America/New_York');
    // An alias is the same clock: 8 PM in Kyiv, three hours ahead of UTC in the summer
    expect(
      resolveSchedule({ localDate: '2026-07-04', localTime: '20:00', timeZone: 'Europe/Kyiv' })
        .startsAt
    ).toEqual(new Date('2026-07-04T17:00:00Z'));
    expect(() => zoneOf('Mars/Olympus_Mons')).toThrow(RangeError);
    for (const notAName of ['+05:00', '2026-07-04T20:00[America/New_York]', 'America/New_York ']) {
      expect(() => zoneOf(notAName)).toThrow(/IANA/);
    }
  });

  it('retains trustworthy provider fields when other fields disagree or are malformed', () => {
    expect(feedSchedule('2026-11-01', '01:30', 'Bad/Zone', '2026-11-01T06:30Z')).toMatchObject({
      timeZone: null,
      startsAt: new Date('2026-11-01T06:30Z'),
    });
    expect(feedSchedule('2026-11-01', '01:30', 'America/New_York', '2026-11-01T08:30Z')).toEqual({
      ...fold,
      startsAt: null,
    });
    expect(feedSchedule('2026-11-01', 'TBD')).toMatchObject({
      localDate: '2026-11-01',
      localTime: null,
      startsAt: null,
    });
  });
});
