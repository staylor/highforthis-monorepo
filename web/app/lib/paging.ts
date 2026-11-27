/** What paging needs of a connection: its records' cursors and IDs, and whether there are more */
interface Paged {
  edges: readonly { cursor: string; node: { id: string } }[];
  pageInfo?: { hasNextPage?: boolean | null } | null;
}

/**
 * A connection with every one of its records: the page given, then each page after it, which
 * `next` asks for from the cursor of the last record so far. It's for a list that has nowhere to
 * show a next page, which would otherwise end where GraphQL's page did without saying so.
 */
export async function withEveryPage<TConnection extends Paged>(
  page: TConnection,
  next: (after: string) => Promise<Pick<TConnection, 'edges' | 'pageInfo'> | null | undefined>
): Promise<TConnection> {
  const edges: TConnection['edges'][number][] = [];
  const listed = new Set<string>();
  const requested = new Set<string>();
  let current: Pick<TConnection, 'edges' | 'pageInfo'> | null | undefined = page;
  let { pageInfo } = page;
  while (current) {
    for (const edge of current.edges) {
      if (!listed.has(edge.node.id)) {
        listed.add(edge.node.id);
        edges.push(edge);
      }
    }
    // Insertions can move a whole page of familiar IDs to new cursors.
    pageInfo = current.pageInfo;
    const after = current.edges.at(-1)?.cursor;
    if (!pageInfo?.hasNextPage || !after || requested.has(after)) break;
    requested.add(after);
    current = await next(after);
  }
  return { ...page, edges, pageInfo };
}

/** Every record of a connection, from its first page, which `load` asks for without a cursor */
export async function everyPage<TConnection extends Paged>(
  load: (after?: string) => Promise<TConnection | null | undefined>
): Promise<TConnection | null | undefined> {
  const first = await load();
  return first && withEveryPage(first, load);
}
