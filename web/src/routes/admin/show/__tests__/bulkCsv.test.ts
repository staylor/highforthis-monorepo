import { describe, expect, it } from 'vitest';

import { parseBulkShowsCsv } from '../bulkCsv';

describe('parseBulkShowsCsv', () => {
  it('parses a header and shorthand dates', () => {
    const result = parseBulkShowsCsv(
      'artists,venue,date,attended\n"Artist One; Artist Two","Venue, Inc.",1/1/26,yes'
    );

    expect(result.errors).toEqual([]);
    expect(result.shows).toHaveLength(1);
    expect(result.shows[0]).toMatchObject({
      artists: ['Artist One', 'Artist Two'],
      attended: true,
      venue: 'Venue, Inc.',
    });
    const date = new Date(result.shows[0].date);
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours()]).toEqual([
      2026, 0, 1, 20,
    ]);
  });

  it('accepts rows without a header and defaults attended to false', () => {
    const result = parseBulkShowsCsv('Artist One,The Venue,2026-08-15');

    expect(result.errors).toEqual([]);
    expect(result.shows[0]).toMatchObject({
      artists: ['Artist One'],
      attended: false,
      venue: 'The Venue',
    });
  });

  it('interprets shorthand years from 50 through 99 as the previous century', () => {
    const result = parseBulkShowsCsv('Artist One,The Venue,12/1/99,true');

    expect(result.errors).toEqual([]);
    expect(new Date(result.shows[0].date).getFullYear()).toBe(1999);
  });

  it('allows header columns in a different order', () => {
    const result = parseBulkShowsCsv('date,attended,venue,artist\n5/10/24,0,The Venue,Artist One');

    expect(result.errors).toEqual([]);
    expect(result.shows[0]).toMatchObject({
      artists: ['Artist One'],
      attended: false,
      venue: 'The Venue',
    });
  });

  it('reports each invalid field using the CSV line number', () => {
    const result = parseBulkShowsCsv(
      'artists,venue,date,attended\n,The Venue,not-a-date,maybe\nArtist Two,,2/30/26,true'
    );

    expect(result.shows).toEqual([]);
    expect(result.errors).toEqual([
      { line: 2, message: 'At least one artist is required.' },
      { line: 2, message: 'Date must be valid, such as 1/1/26 or 2026-01-01.' },
      { line: 2, message: 'Attended must be yes/no, true/false, or 1/0.' },
      { line: 3, message: 'Venue is required.' },
      { line: 3, message: 'Date must be valid, such as 1/1/26 or 2026-01-01.' },
    ]);
  });

  it('reports an unclosed quoted value', () => {
    const result = parseBulkShowsCsv('artists,venue,date\n"Artist One,The Venue,1/1/26');

    expect(result.shows).toEqual([]);
    expect(result.errors).toEqual([{ line: 2, message: 'Quoted field is not closed.' }]);
  });
});
