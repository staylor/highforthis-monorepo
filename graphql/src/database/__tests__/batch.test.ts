import { describe, expect, it, vi } from 'vitest';

import { batchBy } from '../batch';

const row = (id: string) => ({ id });

describe('batchBy', () => {
  it('loads the values asked for in one tick with one query', async () => {
    const load = vi.fn(async (ids: string[]) => ids.filter((id) => id !== 'gone').map(row));
    const byId = batchBy('id', load);

    const found = await Promise.all([byId('a'), byId('b'), byId('a'), byId('gone')]);

    expect(found).toEqual([row('a'), row('b'), row('a'), null]);
    expect(load).toHaveBeenCalledExactlyOnceWith(['a', 'b', 'gone']);
  });

  it('matches the rows by the column it was given', async () => {
    const byArtist = batchBy('artistId', async (artistIds: string[]) =>
      artistIds.map((artistId) => ({ id: `data-${artistId}`, artistId }))
    );

    await expect(byArtist('artist-1')).resolves.toEqual({
      id: 'data-artist-1',
      artistId: 'artist-1',
    });
  });

  it('starts a new query for the values of a later tick', async () => {
    const load = vi.fn(async (ids: string[]) => ids.map(row));
    const byId = batchBy('id', load);

    await byId('a');
    await byId('b');

    expect(load.mock.calls).toEqual([[['a']], [['b']]]);
  });

  it('rejects every value of a query that fails', async () => {
    const byId = batchBy('id', async (): Promise<{ id: string }[]> => {
      throw new Error('database unavailable');
    });

    const results = await Promise.allSettled([byId('a'), byId('b')]);

    expect(results.map((result) => result.status)).toEqual(['rejected', 'rejected']);
  });
});
