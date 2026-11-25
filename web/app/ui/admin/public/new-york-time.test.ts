import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { fromNewYorkTime, toNewYorkTime } from './new-york-time.ts';

// New York's clocks, whatever time zone these tests run in
describe('New York time', () => {
  it("shows an instant as New York's clocks do, in summer and in winter", () => {
    // 8:00 PM on May 10th in New York, which is 12:00 AM on the 11th in UTC
    assert.equal(toNewYorkTime(Date.UTC(2024, 4, 11, 0, 0)), '2024-05-10T20:00');
    // 8:00 PM on New Year's Eve, an hour later in UTC than in summer
    assert.equal(toNewYorkTime(Date.UTC(2025, 0, 1, 1, 0)), '2024-12-31T20:00');
  });

  it("reads a time as New York's", () => {
    assert.equal(fromNewYorkTime('2024-05-10T20:00'), Date.UTC(2024, 4, 11, 0, 0));
    assert.equal(fromNewYorkTime('2024-12-31T20:00'), Date.UTC(2025, 0, 1, 1, 0));
    assert.equal(fromNewYorkTime('2024-12-31T20:00:30'), Date.UTC(2025, 0, 1, 1, 0, 30));
  });

  it('finds a time on the days the clocks change', () => {
    // 1:30 AM happens twice when the clocks go back, and the first is in daylight time
    assert.equal(fromNewYorkTime('2026-11-01T01:30'), Date.UTC(2026, 10, 1, 5, 30));
    // 2:30 AM never happens when they go forward, so it's the instant before the change
    assert.equal(toNewYorkTime(fromNewYorkTime('2026-03-08T02:30')), '2026-03-08T01:30');
  });

  it("doesn't read what isn't a date and time", () => {
    assert.ok(Number.isNaN(fromNewYorkTime('')));
    assert.ok(Number.isNaN(fromNewYorkTime('2024-05-10')));
  });
});
