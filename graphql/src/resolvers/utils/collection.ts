import type { ModelInterface } from '../../models/types';

function base64(i: string) {
  return Buffer.from(i, 'utf8').toString('base64');
}

function unbase64(i: string) {
  return Buffer.from(i, 'base64').toString('utf8');
}

const PREFIX = 'arrayconnection:';

export function cursorToOffset(cursor: string) {
  return parseInt(unbase64(cursor).substring(PREFIX.length), 10);
}

export function offsetToCursor(offset: number) {
  return base64(PREFIX + offset);
}

export async function parseConnection(instance: ModelInterface, connectionArgs: any) {
  const { first = 10, after = null, last = 10, before = null, sort, ...rest } = connectionArgs;
  const args = { offset: 0, limit: 10, sort, ...rest };
  if (connectionArgs.first) {
    args.limit = first;
  } else if (connectionArgs.last) {
    args.limit = last;
  }

  if (after) {
    args.offset = cursorToOffset(after) + 1;
  } else if (before) {
    args.offset = cursorToOffset(before) - args.limit;
  }

  const count = await instance.count({ ...rest });

  return instance.all(args).then((items: any[]) => {
    const arrayLength = count;
    const sliceEnd = args.offset + items.length;
    const beforeOffset = before ? cursorToOffset(before) : items.length;
    const afterOffset = after ? cursorToOffset(after) : -1;
    let startOffset = Math.max(args.offset - 1, afterOffset, -1) + 1;
    let endOffset = Math.min(sliceEnd, beforeOffset, arrayLength);

    if (connectionArgs.last) {
      startOffset = Math.max(startOffset, endOffset - last);
    } else {
      endOffset = startOffset + first;
    }

    const edges = items.map((value: any, index: number) => ({
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
        hasPreviousPage: last ? startOffset > lowerBound : false,
        hasNextPage: first ? endOffset < upperBound : false,
      },
    };
  });
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
