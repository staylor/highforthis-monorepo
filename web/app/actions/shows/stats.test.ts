import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { leaderCount, rankings, tiers } from './stats.tsx';

describe('the show stats', () => {
  it('ranks ties together, and counts past them to the next rank', () => {
    assert.deepEqual(rankings([12, 9, 9, 7, 7, 7, 2]), [1, 2, 2, 4, 4, 4, 7]);
    assert.deepEqual(rankings([]), []);
  });

  it('gives the leaderboard whole counts, up to how many it has room for', () => {
    // Everyone fits
    assert.equal(leaderCount([12, 9, 9, 7], 5), 4);
    // The 5s would go past the fifth place, so they start the lineup
    assert.equal(leaderCount([12, 9, 9, 7, 5, 5, 5, 2], 5), 4);
    // A count that ends at the last place fits
    assert.equal(leaderCount([12, 9, 9, 7, 5, 2, 1], 5), 5);
    // The podium keeps its three, however many share a count
    assert.equal(leaderCount([3, 3, 3, 3, 3, 3, 1], 5), 3);
  });

  it('bills the rest by count, most first', () => {
    const stat = (count: number, name: string) => ({
      count,
      entity: { id: name, name, slug: name.toLowerCase() },
    });
    const billed = tiers([stat(4, 'Wilco'), stat(4, 'Spoon'), stat(2, 'Low'), stat(1, 'Bedhead')]);
    assert.deepEqual(
      billed.map(({ count, stats }) => [count, stats.map(({ entity }) => entity.name)]),
      [
        [4, ['Wilco', 'Spoon']],
        [2, ['Low']],
        [1, ['Bedhead']],
      ]
    );
  });
});
