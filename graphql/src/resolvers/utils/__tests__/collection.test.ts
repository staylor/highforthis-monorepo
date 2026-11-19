import { describe, expect, it, vi } from 'vitest';

import { parseConnection } from '../collection';

const delegate = (count: number, items: unknown[]) => ({
  count: vi.fn(async () => count),
  findMany: vi.fn(async () => items),
});

describe('parseConnection', () => {
  it('asks for the count and the page at once', async () => {
    const records = delegate(3, [{ id: 'a' }, { id: 'b' }]);

    const connection = parseConnection(records, { first: 2 }, { where: { status: 'PUBLISH' } });

    expect(records.count).toHaveBeenCalledWith({ where: { status: 'PUBLISH' } });
    expect(records.findMany).toHaveBeenCalledWith({
      where: { status: 'PUBLISH' },
      skip: 0,
      take: 2,
    });
    await expect(connection).resolves.toMatchObject({
      count: 3,
      edges: [{ node: { id: 'a' } }, { node: { id: 'b' } }],
      pageInfo: { hasNextPage: true, hasPreviousPage: false },
    });
  });

  it('pages on from a cursor', async () => {
    const records = delegate(3, [{ id: 'c' }]);
    const { edges } = await parseConnection(records, { first: 2 });

    const next = await parseConnection(records, { first: 2, after: edges[0].cursor });

    expect(records.findMany).toHaveBeenLastCalledWith({ skip: 1, take: 2 });
    expect(next.pageInfo.hasNextPage).toBe(false);
  });
});
