function base64(i: string) {
  return Buffer.from(i, 'utf8').toString('base64');
}

function unbase64(i: string) {
  return Buffer.from(i, 'base64').toString('utf8');
}

const PREFIX = 'arrayconnection:';

function cursorToOffset(cursor: string) {
  return parseInt(unbase64(cursor).substring(PREFIX.length), 10);
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

interface PaginatedDelegate {
  findMany: (args: FindManyArgs & { skip: number; take: number }) => Promise<unknown[]>;
  count: (args?: { where: Record<string, unknown> }) => Promise<number>;
}

export async function parseConnection(
  delegate: PaginatedDelegate,
  connectionArgs: ConnectionArgs,
  findManyArgs: FindManyArgs = {}
) {
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
    offset = cursorToOffset(before) - limit;
  }

  const countArgs = findManyArgs.where ? { where: findManyArgs.where } : undefined;
  const count = await delegate.count(countArgs);
  const items = await delegate.findMany({
    ...findManyArgs,
    skip: offset,
    take: limit,
  });

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

export const emptyConnection = () => ({
  count: 0,
  edges: [],
  pageInfo: {
    startCursor: null,
    endCursor: null,
    hasPreviousPage: false,
    hasNextPage: false,
  },
});
