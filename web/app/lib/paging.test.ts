import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import { everyPage, withEveryPage } from './paging.ts';

const edge = (id: string) => ({ cursor: `cursor-${id}`, node: { id } });
const ids = (connection: { edges: { node: { id: string } }[] } | null | undefined) =>
  connection?.edges.map(({ node }) => node.id);

describe('withEveryPage', () => {
  it('asks for each page after the last record, until there are no more', async () => {
    const asked: string[] = [];
    const pages: Record<
      string,
      { edges: ReturnType<typeof edge>[]; pageInfo: { hasNextPage: boolean } }
    > = {
      'cursor-b': { edges: [edge('c'), edge('d')], pageInfo: { hasNextPage: true } },
      'cursor-d': { edges: [edge('e')], pageInfo: { hasNextPage: false } },
    };

    const connection = await withEveryPage(
      { count: 5, edges: [edge('a'), edge('b')], pageInfo: { hasNextPage: true as boolean } },
      async (after) => {
        asked.push(after);
        return pages[after];
      }
    );

    assert.deepEqual(asked, ['cursor-b', 'cursor-d']);
    assert.deepEqual(ids(connection), ['a', 'b', 'c', 'd', 'e']);
    assert.equal(connection.count, 5);
    assert.deepEqual(connection.pageInfo, { hasNextPage: false });
  });

  it('asks for nothing more when the page is the last, or says nothing about more', async () => {
    let asked = 0;
    const next = async () => {
      asked += 1;
      return null;
    };

    await withEveryPage({ edges: [edge('a')], pageInfo: { hasNextPage: false } }, next);
    await withEveryPage({ edges: [edge('a')] }, next);

    assert.equal(asked, 0);
  });

  it('ends the list at a page with nothing on it', async () => {
    let asked = 0;

    const connection = await withEveryPage(
      { edges: [edge('a')], pageInfo: { hasNextPage: true } },
      async () => {
        asked += 1;
        return { edges: [], pageInfo: { hasNextPage: true } };
      }
    );

    assert.equal(asked, 1);
    assert.deepEqual(ids(connection), ['a']);
  });

  // An answer that isn't going on from the cursor would otherwise be asked for without end
  it('ends the list at a page that repeats the one before', async () => {
    let asked = 0;
    const page = { edges: [edge('a'), edge('b')], pageInfo: { hasNextPage: true } };

    const connection = await withEveryPage(page, async () => {
      asked += 1;
      return page;
    });

    assert.equal(asked, 1);
    assert.deepEqual(ids(connection), ['a', 'b']);
  });

  // A record added while the pages load moves the rest along by one
  it('lists a record once when the next page starts with it again', async () => {
    const connection = await withEveryPage(
      { edges: [edge('a'), edge('b')], pageInfo: { hasNextPage: true as boolean } },
      async () => ({ edges: [edge('b'), edge('c')], pageInfo: { hasNextPage: false } })
    );

    assert.deepEqual(ids(connection), ['a', 'b', 'c']);
  });
});

describe('everyPage', () => {
  it('starts from the first page, without a cursor', async () => {
    const asked: (string | undefined)[] = [];

    const connection = await everyPage(async (after?: string) => {
      asked.push(after);
      return after
        ? { edges: [edge('b')], pageInfo: { hasNextPage: false } }
        : { edges: [edge('a')], pageInfo: { hasNextPage: true } };
    });

    assert.deepEqual(asked, [undefined, 'cursor-a']);
    assert.deepEqual(ids(connection), ['a', 'b']);
  });

  it('answers nothing when there is no first page', async () => {
    assert.equal(await everyPage(async () => null), null);
  });
});
