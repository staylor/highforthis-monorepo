import { badInput } from './helpers';

function base64(i: string) {
  return Buffer.from(i, 'utf8').toString('base64');
}

function unbase64(i: string) {
  return Buffer.from(i, 'base64').toString('utf8');
}

const PREFIX = 'arrayconnection:';
const CURSOR = /^arrayconnection:(\d{1,9})$/;

function cursorToOffset(cursor: string) {
  const [, offset] = CURSOR.exec(unbase64(cursor)) ?? [];
  // Cursors come from a connection's edges, so any other is the request's mistake
  if (offset === undefined) {
    throw badInput('Invalid cursor');
  }
  return Number(offset);
}

function offsetToCursor(offset: number) {
  return base64(PREFIX + offset);
}

interface ConnectionArgs {
  first?: number | null;
  after?: string | null;
  last?: number | null;
  before?: string | null;
  [key: string]: unknown;
}

interface FindManyArgs {
  where?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Record<string, unknown>[];
  include?: Record<string, unknown>;
}

interface PaginatedDelegate<TNode> {
  findMany: (args: FindManyArgs & { skip: number; take: number }) => Promise<TNode[]>;
  count: (args?: { where: Record<string, unknown> }) => Promise<number>;
}

/** A page of records, as the `...Connection` types answer it */
export interface Connection<TNode> {
  count: number;
  edges: { cursor: string; node: TNode }[];
  pageInfo: {
    startCursor: string | null;
    endCursor: string | null;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
}

export async function parseConnection<TNode>(
  delegate: PaginatedDelegate<TNode>,
  connectionArgs: ConnectionArgs,
  findManyArgs: FindManyArgs = {}
): Promise<Connection<TNode>> {
  const { after = null, before = null } = connectionArgs;
  // A request that asks for neither the first nor the last so many gets the first 10, and is told
  // whether there are more. A page of 0 is no records, with the count.
  const last = connectionArgs.last ?? null;
  const first = connectionArgs.first ?? (last === null ? 10 : null);

  let limit = first ?? last ?? 10;
  let offset = 0;

  if (after) {
    offset = cursorToOffset(after) + 1;
  } else if (before) {
    // The records before the cursor, which near the start are fewer than a page
    const end = cursorToOffset(before);
    offset = Math.max(0, end - limit);
    limit = end - offset;
  }

  const countArgs = findManyArgs.where ? { where: findManyArgs.where } : undefined;
  const records = (skip: number, take: number) =>
    take > 0 ? delegate.findMany({ ...findManyArgs, skip, take }) : Promise.resolve([]);

  let count: number;
  let items: TNode[];
  if (first === null && !before) {
    // The last so many, with no cursor to count back from, are that many from the end, so they
    // wait for the count
    count = await delegate.count(countArgs);
    offset = Math.max(offset, count - limit);
    items = await records(offset, Math.min(limit, count - offset));
  } else {
    // Neither needs the other, so they share a round trip to the database
    [count, items] = await Promise.all([delegate.count(countArgs), records(offset, limit)]);
  }

  const arrayLength = count;
  const sliceEnd = offset + items.length;
  const beforeOffset = before ? cursorToOffset(before) : arrayLength;
  const afterOffset = after ? cursorToOffset(after) : -1;
  let startOffset = Math.max(offset - 1, afterOffset, -1) + 1;
  let endOffset = Math.min(sliceEnd, beforeOffset, arrayLength);

  if (last !== null) {
    startOffset = Math.max(startOffset, endOffset - last);
  } else {
    endOffset = startOffset + first!;
  }

  // The records between the two ends: all that were read, unless the request asked for the first
  // so many and the last of those
  const edges = items.slice(startOffset - offset, endOffset - offset).map((value, index) => ({
    cursor: offsetToCursor(startOffset + index),
    node: value,
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  const lowerBound = after ? afterOffset + 1 : 0;
  const upperBound = before ? beforeOffset : arrayLength;

  return {
    count,
    edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage: last !== null ? startOffset > lowerBound : false,
      hasNextPage: first !== null ? endOffset < upperBound : false,
    },
  };
}

export const emptyConnection = (): Connection<never> => ({
  count: 0,
  edges: [],
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasPreviousPage: false,
    hasNextPage: false,
  },
});
