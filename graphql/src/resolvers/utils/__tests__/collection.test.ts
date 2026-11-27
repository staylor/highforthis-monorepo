import { describe, expect, it, vi } from 'vitest';

import { parseConnection } from '../collection';

const delegate = (count: number, items: unknown[]) => ({
  count: vi.fn(async () => count),
  findMany: vi.fn(async () => items),
});

describe('parseConnection', () => {
  it('asks for the count and the page at once', async () => {
    const records = delegate(3, [{ id: 'a' }, { id: 'b' }]);

    const connection = parseConnection(records, { first: 2 });

    expect(records.count).toHaveBeenCalledOnce();
    expect(records.findMany).toHaveBeenCalledWith({
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
    { first: 2, before: 8, expected: [0, 1], previous: false, next: true },
    { first: 5, after: 2, before: 5, expected: [3, 4], previous: false, next: false },
    { last: 2, after: 1, before: 8, expected: [6, 7], previous: true, next: false },
    { first: 5, last: 2, before: 8, expected: [3, 4], previous: true, next: true },
    { last: 2, before: 20, expected: [8, 9], previous: true, next: false },
    { first: 4, after: 5, before: 3, expected: [], previous: false, next: false },
  ])(
    'respects both bounds for %j',
    async ({ first, last, after, before, expected, previous, next }) => {
      const rows = Array.from({ length: 10 }, (_, i) => i);
      const cursor = (offset?: number) =>
        offset === undefined
          ? undefined
          : Buffer.from(`arrayconnection:${offset}`).toString('base64');
      const page = await parseConnection(
        {
          count: async () => rows.length,
          findMany: async ({ skip, take }) => rows.slice(skip, skip + take),
        },
        { first, last, before: cursor(before), after: cursor(after) }
      );

      expect(page.edges).toEqual(expected.map((node) => ({ node, cursor: cursor(node) })));
      expect(page.pageInfo).toMatchObject({ hasPreviousPage: previous, hasNextPage: next });
    }
  );

  // The podcast's feed asked without a page size, got 10 of its 11 episodes, and was told that
  // was all of them
  it('says there are more after the first 10, when asked for no page size', async () => {
    const records = delegate(
      11,
      Array.from({ length: 10 }, (_, i) => ({ id: `podcast-${i}` }))
    );

    const connection = await parseConnection(records, {});

    expect(records.findMany).toHaveBeenCalledWith({ skip: 0, take: 10 });
    expect(connection.pageInfo.hasNextPage).toBeTruthy();
  });

  it('answers no records for a page of 0, with how many there are', async () => {
    const records = delegate(3, [{ id: 'a' }]);

    const connection = await parseConnection(records, { first: 0 });

    expect(records.findMany).not.toHaveBeenCalled();
    expect(connection).toMatchObject({ count: 3, edges: [], pageInfo: { hasNextPage: true } });
  });

  // It answered the first so many instead
  it('answers the last so many, counted back from the end, without a cursor', async () => {
    const records = delegate(
      30,
      Array.from({ length: 10 }, (_, i) => ({ id: `show-${20 + i}` }))
    );

    const connection = await parseConnection(records, { last: 10 });

    expect(records.findMany).toHaveBeenCalledWith({ skip: 20, take: 10 });
    expect(Buffer.from(connection.edges[0].cursor, 'base64').toString()).toBe('arrayconnection:20');
    expect(connection.pageInfo).toMatchObject({ hasPreviousPage: true, hasNextPage: false });
  });

  it('answers every record when there are fewer than the last so many', async () => {
    const records = delegate(3, [{ id: 'a' }, { id: 'b' }, { id: 'c' }]);

    const connection = await parseConnection(records, { last: 10 });

    expect(records.findMany).toHaveBeenCalledWith({ skip: 0, take: 3 });
    expect(connection.pageInfo.hasPreviousPage).toBe(false);
  });

  // It answered all of the first, numbered as if they were the last
  it('answers the last so many of the first so many, when asked for both', async () => {
    const rows = Array.from({ length: 10 }, (_, i) => ({ id: `show-${i}` }));
    const records = {
      count: vi.fn(async () => rows.length),
      findMany: vi.fn(async ({ skip, take }: { skip: number; take: number }) =>
        rows.slice(skip, skip + take)
      ),
    };
    const offsets = ({ edges }: Awaited<ReturnType<typeof parseConnection>>) =>
      edges.map(({ cursor }) => Buffer.from(cursor, 'base64').toString().split(':')[1]);

    const both = await parseConnection(records, { first: 5, last: 2 });

    expect(both.edges.map(({ node }) => node)).toEqual([{ id: 'show-3' }, { id: 'show-4' }]);
    expect(offsets(both)).toEqual(['3', '4']);
    expect(both.pageInfo).toMatchObject({ hasPreviousPage: true, hasNextPage: true });

    const after = await parseConnection(records, {
      first: 5,
      last: 2,
      after: Buffer.from('arrayconnection:2').toString('base64'),
    });

    expect(after.edges.map(({ node }) => node)).toEqual([{ id: 'show-6' }, { id: 'show-7' }]);
    expect(offsets(after)).toEqual(['6', '7']);
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
