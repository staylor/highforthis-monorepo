import { describe, expect, it } from 'vitest';

import { matchListing } from '../match';
import type { Listing } from '../types';

function listing(overrides: Partial<Listing> = {}): Listing {
  return {
    source: 'aeg',
    sourceId: '1634214',
    localDate: '2026-11-30',
    localTime: '20:00',
    startsAt: new Date('2026-12-01T01:00:00Z'),
    timeZone: 'America/New_York',
    headliners: ['Dinosaur Jr'],
    support: ['Cowboy Hunters'],
    status: 'Buy Tickets',
    cancelled: false,
    url: null,
    ...overrides,
  };
}

function show(date: string, artists: string[], source?: { source: string; sourceId: string }) {
  return {
    date: new Date(date),
    source: source?.source ?? null,
    sourceId: source?.sourceId ?? null,
    artists: artists.map((name) => ({ artist: { name } })),
  };
}

describe('matchListing', () => {
  it('matches the show added from the listing', () => {
    const added = show('2026-12-01T01:00:00Z', ['Someone Else'], {
      source: 'aeg',
      sourceId: '1634214',
    });

    expect(matchListing(listing(), [added])).toEqual({ show: added, dateChanged: false });
  });

  it('flags a listing that moved to another day after it was added', () => {
    const added = show('2026-11-29T01:00:00Z', ['Dinosaur Jr'], {
      source: 'aeg',
      sourceId: '1634214',
    });

    expect(matchListing(listing(), [added])).toEqual({ show: added, dateChanged: true });
  });

  it('matches a hand-entered show on the same day by artist name', () => {
    // 8 PM Eastern, as the admin form saves shows
    const entered = show('2026-12-01T01:00:00Z', ['Dinosaur Jr.']);

    expect(matchListing(listing(), [entered]).show).toBe(entered);
  });

  // A show's time is stored as the venue's clock reads it, read as New York's
  it("compares days on New York's clocks, whatever the venue's time zone", () => {
    const sphere = (localDate: string) =>
      listing({ localDate, timeZone: 'America/Los_Angeles', headliners: ['Phish'], support: [] });
    // Phish at Sphere at 8 PM on New Year's Eve, and at 12:30 AM on New Year's Day
    const newYearsEve = show('2027-01-01T01:00:00Z', ['Phish']);
    const afterMidnight = show('2027-01-01T05:30:00Z', ['Phish']);

    expect(matchListing(sphere('2026-12-31'), [newYearsEve]).show).toBe(newYearsEve);
    expect(matchListing(sphere('2027-01-01'), [afterMidnight]).show).toBe(afterMidnight);
  });

  it("doesn't flag a show added from a listing at a venue outside New York", () => {
    const added = show('2027-04-09T00:00:00Z', ['Phish'], { source: 'aeg', sourceId: 'sphere' });
    const sphere = listing({
      sourceId: 'sphere',
      localDate: '2027-04-08',
      timeZone: 'America/Los_Angeles',
    });

    expect(matchListing(sphere, [added])).toEqual({ show: added, dateChanged: false });
  });

  it('ignores shows on other days, with other artists, or from other listings', () => {
    const shows = [
      show('2026-12-02T01:00:00Z', ['Dinosaur Jr']),
      show('2026-12-01T01:00:00Z', ['Beirut']),
      // the early show, added from its own listing, isn't the late show
      show('2026-11-30T23:00:00Z', ['Dinosaur Jr'], { source: 'aeg', sourceId: 'early' }),
    ];

    expect(matchListing(listing(), shows)).toEqual({ show: null, dateChanged: false });
  });

  it("doesn't match by artist before the date is announced", () => {
    const entered = show('2026-12-01T01:00:00Z', ['Dinosaur Jr']);

    expect(matchListing(listing({ localDate: null }), [entered]).show).toBeNull();
  });
});
