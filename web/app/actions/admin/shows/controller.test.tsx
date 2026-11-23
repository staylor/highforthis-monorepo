import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession } from '#/lib/adminSession.fixtures.ts';
import { router } from '#/router.ts';

const origin = 'http://localhost';

type Operation = { operationName: string; variables: Record<string, any> };

/**
 * Stands in for GraphQL: accepts the session, answers each operation by name, and records the
 * operations it was sent.
 */
function stubGraphQL(t: TestContext, answers: Record<string, unknown> = {}) {
  const operations: Operation[] = [];
  t.mock.method(globalThis, 'fetch', async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : input);
    if (url.pathname === '/auth/session') {
      return new Response(null, { status: 200 });
    }
    const { operationName, variables } = JSON.parse(String(init?.body));
    operations.push({ operationName, variables });
    return Response.json({ data: answers[operationName] ?? {} });
  });
  return operations;
}

const get = (path: string, cookie = testSession) =>
  router.fetch(new Request(new URL(path, origin), { headers: cookie ? { cookie } : {} }));

const post = (path: string, body: string) =>
  router.fetch(
    new Request(new URL(path, origin), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: { cookie: testSession, origin },
    })
  );

// 8:00 PM on May 10, 2024 wherever the tests run, since the list shows the server's time
const showTime = new Date(2024, 4, 10, 20, 0).getTime();

const ryman = { id: 'v1', name: 'Ryman', slug: 'ryman' };

const shows = {
  count: 2,
  edges: [
    {
      node: {
        id: 's1',
        title: null,
        url: null,
        date: showTime,
        attended: true,
        artists: [{ id: 'a1', name: 'Wilco', slug: 'wilco' }],
        venue: ryman,
      },
    },
    {
      node: {
        id: 's2',
        title: 'Opry Birthday Bash',
        url: null,
        date: showTime,
        attended: false,
        artists: [
          { id: 'a1', name: 'Wilco', slug: 'wilco' },
          { id: 'a2', name: 'Spoon', slug: 'spoon' },
        ],
        venue: ryman,
      },
    },
  ],
  pageInfo: { hasNextPage: false },
};

const show = {
  id: 's1',
  title: 'Night One',
  url: null,
  notes: 'Great',
  date: showTime,
  attended: true,
  artists: [{ id: 'a1', name: 'Wilco' }],
  venue: { id: 'v1', name: 'Ryman' },
};

const entities = {
  artists: {
    edges: [{ node: { id: 'a2', name: 'Spoon' } }, { node: { id: 'a1', name: 'Wilco' } }],
  },
  venues: {
    edges: [{ node: { id: 'v2', name: '9:30 Club' } }, { node: { id: 'v1', name: 'Ryman' } }],
  },
};

describe('admin shows', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('lists a show whose artists have all been deleted, so it can be fixed', async (t) => {
    const orphan = {
      id: 's3',
      title: null,
      url: null,
      date: showTime,
      attended: false,
      artists: [],
      venue: ryman,
    };
    stubGraphQL(t, {
      ShowsAdmin: {
        shows: { count: 1, edges: [{ node: orphan }], pageInfo: { hasNextPage: false } },
      },
    });
    const response = await get('/admin/show');
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<a href="\/admin\/show\/s3">\(no title\)<\/a>/);
    assert.match(html, /No artists/);
    assert.match(html, /<input type="checkbox" aria-label="Attended: Ryman"/);
  });

  it('lists shows with their artists, venues, "attended" boxes and dates', async (t) => {
    const operations = stubGraphQL(t, { ShowsAdmin: { shows } });
    const html = await (
      await get('/admin/show?imported=3&artistsCreated=1&venuesCreated=0')
    ).text();
    assert.match(html, /<a href="\/admin\/show\/s1">\(no title\)<\/a>/);
    assert.match(html, /<a href="\/admin\/show\/s2">Opry Birthday Bash<\/a>/);
    assert.match(html, /<a href="\/admin\/artist\/a1">Wilco \+ 1<\/a>/);
    // A show with one artist and no title is on its artist's page; others have their own
    assert.match(html, /<a href="\/artist\/wilco" data-rmx-document[^>]*>View<\/a>/);
    assert.match(html, /<a href="\/shows\/s2" data-rmx-document[^>]*>View<\/a>/);
    assert.match(html, /<a href="\/venue\/ryman" data-rmx-document[^>]*>View<\/a>/);
    // Only the show's own column deletes
    assert.equal(html.match(/name="intent" value="delete"/g)?.length, 2);
    assert.match(html, /<input type="checkbox" checked aria-label="Attended: Wilco"/);
    assert.match(html, /<input type="checkbox" aria-label="Attended: Opry Birthday Bash"/);
    assert.match(html, /05\/10\/2024 at 8:00pm/);
    assert.match(html, /Imported 3 shows\. Created 1 new artists and 0 new venues\./);
    assert.match(html, /<a href="\/admin\/show\/bulk"[^>]*>Bulk Add<\/a>/);
    assert.deepEqual(operations.find((op) => op.operationName === 'ShowsAdmin')?.variables, {
      first: 20,
      order: 'DESC',
    });
  });

  it('saves a row\'s "attended" box and answers 204, or 500 when it didn\'t save', async (t) => {
    const operations = stubGraphQL(t, { UpdateShowAttended: { updateShow: { id: 's1' } } });
    const response = await post('/admin/show', 'intent=attended&id=s1&attended=false');
    assert.equal(response.status, 204);
    assert.deepEqual(operations, [
      { operationName: 'UpdateShowAttended', variables: { id: 's1', input: { attended: false } } },
    ]);
  });

  it('deletes the checked shows and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeleteShow: { removeShow: true } });
    const response = await post('/admin/show', 'intent=delete&ids=s1&ids=s2');
    assert.equal(response.headers.get('location'), 'http://localhost/admin/show?deleted=2');
    assert.deepEqual(operations, [
      { operationName: 'DeleteShow', variables: { ids: ['s1', 's2'] } },
    ]);
  });

  it('starts a new show from the last one added', async (t) => {
    stubGraphQL(t, { ShowEntities: { show, ...entities } });
    const html = await (await get('/admin/show/add')).text();
    assert.match(html, /<h1[^>]*>Add Show<\/h1>/);
    assert.match(html, /<input type="text" name="title" value="Night One"/);
    assert.match(html, new RegExp(`<input type="hidden" name="date" value="${showTime}"`));
    assert.match(html, /<input type="hidden" name="artists\[0\]" value="a1"/);
    assert.match(html, /aria-label="Remove Wilco"/);
    // Sorted by name, with the venue the last show was at chosen
    assert.match(
      html,
      /<option value="v2">9:30 Club<\/option><option value="v1" selected>Ryman<\/option>/
    );
    assert.match(html, /<a href="\/admin\/venue\/add"[^>]*>Add Venue<\/a>/);
    assert.match(html, /<input type="checkbox" name="attended" value="true" checked/);
  });

  it('adds a show with its artists, venue and date, unattended unless checked', async (t) => {
    const operations = stubGraphQL(t, { CreateShow: { createShow: { id: 's9' } } });
    const response = await post(
      '/admin/show/add',
      `title=&date=${showTime}&artists%5B0%5D=a1&artists%5B1%5D=a2&venue=v1&url=&notes=`
    );
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/show/s9?message=updated'
    );
    assert.deepEqual(operations, [
      {
        operationName: 'CreateShow',
        variables: {
          input: { attended: false, date: showTime, artists: ['a1', 'a2'], venue: 'v1' },
        },
      },
    ]);
  });

  it('saves an edit, clearing the fields left empty', async (t) => {
    const operations = stubGraphQL(t, { UpdateShow: { updateShow: show } });
    const response = await post(
      '/admin/show/s1',
      `title=&date=${showTime}&artists%5B0%5D=a1&venue=v1&url=&notes=`
    );
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/show/s1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdateShow',
      variables: {
        id: 's1',
        input: {
          attended: false,
          notes: null,
          title: null,
          url: null,
          date: showTime,
          artists: ['a1'],
          venue: 'v1',
        },
      },
    });
  });

  it("answers 404 for a show that doesn't exist", async (t) => {
    stubGraphQL(t, { ShowEdit: { show: null, ...entities } });
    const response = await get('/admin/show/nothing');
    assert.equal(response.status, 404);
  });

  it("shows the bulk add page, which the edit route doesn't take", async (t) => {
    const operations = stubGraphQL(t);
    const html = await (await get('/admin/show/bulk')).text();
    assert.match(html, /<h1[^>]*>Bulk Add Shows<\/h1>/);
    assert.match(html, /<textarea id="bulk-shows" name="csv"/);
    // Only the layout's site data, so the edit route didn't look up a show called "bulk"
    assert.ok(!operations.some((op) => op.operationName === 'ShowEdit'));
  });

  it('comes back to the bulk add page with the CSV and a message per line', async (t) => {
    const operations = stubGraphQL(t);
    const response = await post(
      '/admin/show/bulk',
      'csv=artists%2Cvenue%2Cdate%0A%2CThe+Venue%2C1%2F1%2F26'
    );
    assert.equal(response.status, 422);
    const html = await response.text();
    assert.match(html, /Line 2: At least one artist is required\./);
    assert.match(html, /<textarea[^>]*>artists,venue,date\n,The Venue,1\/1\/26<\/textarea>/);
    assert.ok(!operations.some((op) => op.operationName === 'BulkCreateShows'));
  });

  it('imports the shows and goes to the list, which says how many', async (t) => {
    const operations = stubGraphQL(t, {
      BulkCreateShows: {
        bulkCreateShows: { artistsCreated: 1, showsCreated: 1, venuesCreated: 0 },
      },
    });
    const response = await post('/admin/show/bulk', 'csv=Wilco%2CRyman%2C2024-05-10%2Ctrue');
    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get('location'),
      '/admin/show?artistsCreated=1&imported=1&venuesCreated=0'
    );
    const [{ variables }] = operations;
    assert.equal(variables.input.length, 1);
    assert.deepEqual(variables.input[0].artists, ['Wilco']);
    assert.equal(variables.input[0].venue, 'Ryman');
    assert.equal(variables.input[0].attended, true);
  });
});
