import { GraphQLError } from 'graphql';

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
    throw new GraphQLError('Invalid cursor', { extensions: { code: 'BAD_USER_INPUT' } });
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
  const { first = 10, after = null, last = 10, before = null, ..._rest } = connectionArgs;

  let limit = 10;
  let offset = 0;

  if (connectionArgs.first) {
    limit = first!;
  } else if (connectionArgs.last) {
    limit = last!;
  }

  if (after) {
    offset = cursorToOffset(after) + 1;
  } else if (before) {
    // The records before the cursor, which near the start are fewer than a page
    const end = cursorToOffset(before);
    offset = Math.max(0, end - limit);
    limit = end - offset;
  }

  const countArgs = findManyArgs.where ? { where: findManyArgs.where } : undefined;
  // Neither needs the other, so they share a round trip to the database
  const [count, items] = await Promise.all([
    delegate.count(countArgs),
    delegate.findMany({
      ...findManyArgs,
      skip: offset,
      take: limit,
    }),
  ]);

  const arrayLength = count;
  const sliceEnd = offset + items.length;
  const beforeOffset = before ? cursorToOffset(before) : items.length;
  const afterOffset = after ? cursorToOffset(after) : -1;
  let startOffset = Math.max(offset - 1, afterOffset, -1) + 1;
  let endOffset = Math.min(sliceEnd, beforeOffset, arrayLength);

  if (connectionArgs.last) {
    startOffset = Math.max(startOffset, endOffset - last!);
  } else {
    endOffset = startOffset + first!;
  }

  const edges = items.map((value, index) => ({
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
      hasPreviousPage: connectionArgs.last ? startOffset > lowerBound : false,
      hasNextPage: connectionArgs.first ? endOffset < upperBound : false,
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
