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

interface PaginatedDelegate<TNode> {
  findMany: (args: { skip: number; take: number }) => Promise<TNode[]>;
  count: () => Promise<number>;
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
  connectionArgs: ConnectionArgs
): Promise<Connection<TNode>> {
  const { after = null, before = null, last = null } = connectionArgs;
  const first = connectionArgs.first ?? (last === null ? 10 : null);
  const lower = after === null ? 0 : cursorToOffset(after) + 1;
  const upper = before === null ? Infinity : cursorToOffset(before);
  const records = (skip: number, take: number) =>
    take > 0 ? delegate.findMany({ skip, take }) : Promise.resolve([]);

  let count: number;
  let items: TNode[];
  let offset = lower;
  if (first === null) {
    // A cursor from an older page can be past the end after records are deleted.
    count = await delegate.count();
    const end = Math.min(upper, count);
    offset = Math.max(lower, end - last!);
    items = await records(offset, end - offset);
  } else {
    // The first rows between the cursors can load while the database counts.
    [count, items] = await Promise.all([
      delegate.count(),
      records(lower, Math.min(first, upper - lower)),
    ]);
    if (last !== null && items.length > last) {
      // A request with both sizes takes the last of the first rows.
      const drop = items.length - last;
      offset += drop;
      items = items.slice(drop);
    }
  }

  const edges = items.map((node, index) => ({ cursor: offsetToCursor(offset + index), node }));

  return {
    count,
    edges,
    pageInfo: {
      startCursor: edges[0]?.cursor ?? null,
      endCursor: edges.at(-1)?.cursor ?? null,
      hasPreviousPage: offset > lower,
      hasNextPage: first !== null && lower + first < Math.min(count, upper),
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
