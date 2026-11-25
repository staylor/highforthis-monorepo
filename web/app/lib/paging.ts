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
  const edges: TConnection['edges'][number][] = [...page.edges];
  const listed = new Set(edges.map(({ node }) => node.id));
  let { pageInfo } = page;
  while (pageInfo?.hasNextPage) {
    const after = edges.at(-1)?.cursor;
    const following = after === undefined ? null : await next(after);
    // Each record once: one added while the pages load moves the rest along, which brings the
    // last record back at the start of the next page
    const added = (following?.edges ?? []).filter(({ node }) => {
      const isNew = !listed.has(node.id);
      listed.add(node.id);
      return isNew;
    });
    // A page with nothing new ends the list: its records were deleted in between, or it doesn't
    // go on from the cursor, and asking again would never end
    if (added.length === 0) {
      break;
    }
    edges.push(...added);
    pageInfo = following?.pageInfo;
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
