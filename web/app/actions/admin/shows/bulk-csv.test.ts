import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { parseBulkShowsCsv } from './bulk-csv.ts';

const firstShow = (result: ReturnType<typeof parseBulkShowsCsv>) => {
  const { artists, attended, venue } = result.shows[0];
  return { artists, attended, venue };
};

describe('parseBulkShowsCsv', () => {
  it('parses a header and shorthand dates', () => {
    const result = parseBulkShowsCsv(
      'artists,venue,date,attended\n"Artist One; Artist Two","Venue, Inc.",1/1/26,yes'
    );

    assert.deepEqual(result.errors, []);
    assert.equal(result.shows.length, 1);
    assert.deepEqual(firstShow(result), {
      artists: ['Artist One', 'Artist Two'],
      attended: true,
      venue: 'Venue, Inc.',
    });
    assert.deepEqual(result.shows[0].schedule, { localDate: '2026-01-01', localTime: null });
  });

  it('accepts rows without a header and defaults attended to false', () => {
    const result = parseBulkShowsCsv('Artist One,The Venue,2026-08-15');

    assert.deepEqual(result.errors, []);
    assert.deepEqual(firstShow(result), {
      artists: ['Artist One'],
      attended: false,
      venue: 'The Venue',
    });
  });

  it('interprets shorthand years from 50 through 99 as the previous century', () => {
    const result = parseBulkShowsCsv('Artist One,The Venue,12/1/99,true');

    assert.deepEqual(result.errors, []);
    assert.equal(result.shows[0].schedule.localDate, '1999-12-01');
  });

  it('allows header columns in a different order', () => {
    const result = parseBulkShowsCsv('date,attended,venue,artist\n5/10/24,0,The Venue,Artist One');

    assert.deepEqual(result.errors, []);
    assert.deepEqual(firstShow(result), {
      artists: ['Artist One'],
      attended: false,
      venue: 'The Venue',
    });
  });

  it('keeps the advertised date and preserves an explicit offset including milliseconds', () => {
    const result = parseBulkShowsCsv('A,V,2026-12-31T23:30:04.123-08:00\nB,V,2026-03-08T02:30');
    assert.deepEqual(result.errors, []);
    assert.deepEqual(
      result.shows.map(({ schedule }) => schedule),
      [
        {
          localDate: '2026-12-31',
          localTime: '23:30:04.123',
          startsAt: Date.UTC(2027, 0, 1, 7, 30, 4, 123),
        },
        { localDate: '2026-03-08', localTime: '02:30' },
      ]
    );
  });

  // Its date and time were kept as the venue's: 8 PM in New York on New Year's Day became 1 AM on
  // the 2nd
  it("turns away a time in UTC, which doesn't say what the venue's clocks read", () => {
    const result = parseBulkShowsCsv(
      'A,V,2026-01-02T01:00:00Z\nB,V,2026-01-02T01:00+00:00\nC,V,2026-01-02T01:00-00:00\nD,V,2026-01-01T20:00-05:00'
    );

    const message =
      "Date can't be a time in UTC. Give the venue's time, with its offset if you know it: 2026-01-01T20:00-05:00.";
    assert.deepEqual(result.errors, [
      { line: 1, message },
      { line: 2, message },
      { line: 3, message },
    ]);
    assert.deepEqual(
      result.shows.map(({ artists, schedule }) => ({ artists, schedule })),
      [
        {
          artists: ['D'],
          schedule: {
            localDate: '2026-01-01',
            localTime: '20:00',
            startsAt: Date.UTC(2026, 0, 2, 1),
          },
        },
      ]
    );
  });

  it('reports each invalid field using the CSV line number', () => {
    const result = parseBulkShowsCsv(
      'artists,venue,date,attended\n,The Venue,not-a-date,maybe\nArtist Two,,2/30/26,true'
    );

    assert.deepEqual(result.shows, []);
    assert.deepEqual(result.errors, [
      { line: 2, message: 'At least one artist is required.' },
      { line: 2, message: 'Date must be valid, such as 1/1/26 or 2026-01-01.' },
      { line: 2, message: 'Attended must be yes/no, true/false, or 1/0.' },
      { line: 3, message: 'Venue is required.' },
      { line: 3, message: 'Date must be valid, such as 1/1/26 or 2026-01-01.' },
    ]);
  });

  it('reports an unclosed quoted value', () => {
    const result = parseBulkShowsCsv('artists,venue,date\n"Artist One,The Venue,1/1/26');

    assert.deepEqual(result.shows, []);
    assert.deepEqual(result.errors, [{ line: 2, message: 'Quoted field is not closed.' }]);
  });
});
