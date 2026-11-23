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

  it('pages back to the start when fewer than a page come before the cursor', async () => {
    const records = delegate(20, [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]);
    const { edges } = await parseConnection(records, { first: 4 });
    records.findMany.mockResolvedValueOnce([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    const previous = await parseConnection(records, { last: 10, before: edges[3].cursor });

    expect(records.findMany).toHaveBeenLastCalledWith({ skip: 0, take: 3 });
    expect(previous.edges.map(({ node }) => node)).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }]);
    expect(previous.edges[0].cursor).toBe(edges[0].cursor);
    expect(previous.pageInfo.hasPreviousPage).toBe(false);
  });

  it('pages back a whole page from further in', async () => {
    const records = delegate(30, []);
    const cursor = Buffer.from('arrayconnection:20').toString('base64');

    await parseConnection(records, { last: 10, before: cursor });

    expect(records.findMany).toHaveBeenLastCalledWith({ skip: 10, take: 10 });
  });

  it.each([
    'nonsense',
    Buffer.from('arrayconnection:-5').toString('base64'),
    Buffer.from('arrayconnection:').toString('base64'),
  ])('turns away the cursor %j, which no connection gave out', async (cursor) => {
    const records = delegate(3, []);

    await expect(parseConnection(records, { first: 2, after: cursor })).rejects.toMatchObject({
      message: 'Invalid cursor',
      extensions: { code: 'BAD_USER_INPUT' },
    });
    expect(records.findMany).not.toHaveBeenCalled();
  });
});
