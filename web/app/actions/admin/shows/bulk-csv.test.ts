import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { parseBulkShowsCsv } from './bulk-csv.ts';

// Moved with the parser from the admin app's src/server/__tests__/bulkShowsCsv.test.ts

/** The fields of the first show that a test checks, without its date. */
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
    const date = new Date(result.shows[0].date);
    assert.deepEqual(
      [date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()],
      [2026, 0, 1, 20]
    );
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
    assert.equal(new Date(result.shows[0].date).getFullYear(), 1999);
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
