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

const storage = 'https://storage.googleapis.com/wonderboymusic';

const venues = {
  count: 2,
  edges: [
    {
      node: {
        id: 'v1',
        name: 'Ryman Auditorium',
        slug: 'ryman-auditorium',
        website: 'https://ryman.com',
        capacity: '2362',
        address: '116 5th Ave N, Nashville, TN',
        excludeFromSearch: false,
        permanentlyClosed: false,
        featuredMedia: [
          {
            __typename: 'ImageUpload',
            id: 'm1',
            destination: '2024/05',
            type: 'image',
            crops: [
              { fileName: 'ryman-300.jpg', width: 300 },
              { fileName: 'ryman-150.jpg', width: 150 },
            ],
          },
        ],
      },
    },
    {
      node: {
        id: 'v2',
        name: 'CBGB',
        slug: 'cbgb',
        website: null,
        capacity: null,
        address: null,
        excludeFromSearch: true,
        permanentlyClosed: true,
        featuredMedia: [],
      },
    },
  ],
  pageInfo: { hasNextPage: false },
};

// GraphQL answers with __typename, which Apollo needs to fill the form's fragments
const venue = {
  __typename: 'Venue',
  id: 'v1',
  name: 'Ryman Auditorium',
  slug: 'ryman-auditorium',
  description: 'The Mother Church',
  website: 'https://ryman.com',
  listingsUrl: 'https://www.ticketmaster.com/ryman',
  capacity: '2362',
  streetAddress: '116 5th Ave N',
  city: 'Nashville',
  state: 'TN',
  postalCode: '37219',
  coordinates: { __typename: 'VenueCoordinates', latitude: 36.1612, longitude: -86.7785 },
  excludeFromSearch: false,
  permanentlyClosed: false,
  featuredMedia: [],
};

const shows = [
  {
    node: {
      __typename: 'Show',
      id: 's1',
      date: Date.UTC(2024, 4, 10, 12),
      title: null,
      artists: [
        { __typename: 'Artist', id: 'a1', name: 'Wilco' },
        { __typename: 'Artist', id: 'a2', name: 'Spoon' },
      ],
    },
  },
  {
    node: {
      __typename: 'Show',
      id: 's2',
      date: Date.UTC(2023, 9, 1, 12),
      title: 'Opry Birthday Bash',
      artists: [{ __typename: 'Artist', id: 'a3', name: 'Various' }],
    },
  },
];

describe('admin venues', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('lists venues with thumbnails, details and both boxes', async (t) => {
    const operations = stubGraphQL(t, { VenuesAdmin: { venues } });
    const html = await (await get('/admin/venue?search=r')).text();
    // The smallest crop
    assert.ok(html.includes(`src="${storage}/2024/05/ryman-150.jpg"`));
    assert.match(html, /<a href="\/admin\/venue\/v1">Ryman Auditorium<\/a>/);
    assert.match(html, /116 5th Ave N, Nashville, TN/);
    assert.match(html, />2362</);
    assert.match(html, /<input type="checkbox" aria-label="Exclude from search: Ryman Auditorium"/);
    assert.match(html, /<input type="checkbox" checked aria-label="Permanently Closed: CBGB"/);
    assert.deepEqual(operations.find((op) => op.operationName === 'VenuesAdmin')?.variables, {
      first: 20,
      search: 'r',
    });
  });

  it('saves either box from the list and answers 204', async (t) => {
    const operations = stubGraphQL(t, { UpdateVenueFlag: { updateVenue: { id: 'v1' } } });
    let response = await post(
      '/admin/venue',
      'intent=permanentlyClosed&id=v1&permanentlyClosed=true'
    );
    assert.equal(response.status, 204);
    response = await post('/admin/venue', 'intent=excludeFromSearch&id=v1&excludeFromSearch=false');
    assert.equal(response.status, 204);
    assert.deepEqual(operations, [
      {
        operationName: 'UpdateVenueFlag',
        variables: { id: 'v1', input: { permanentlyClosed: true } },
      },
      {
        operationName: 'UpdateVenueFlag',
        variables: { id: 'v1', input: { excludeFromSearch: false } },
      },
    ]);
  });

  it("answers 500 when a box didn't save, and ignores unknown intents", async (t) => {
    const operations = stubGraphQL(t);
    let response = await post(
      '/admin/venue',
      'intent=permanentlyClosed&id=v1&permanentlyClosed=true'
    );
    assert.equal(response.status, 500);
    response = await post('/admin/venue', 'intent=name&id=v1&name=Gone');
    assert.equal(response.status, 303);
    assert.equal(operations.length, 1);
  });

  it('deletes the checked venues and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeleteVenue: { removeVenue: true } });
    const response = await post('/admin/venue', 'intent=delete&ids=v1&ids=v2');
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'http://localhost/admin/venue?deleted=2');
    assert.deepEqual(operations, [
      { operationName: 'DeleteVenue', variables: { ids: ['v1', 'v2'] } },
    ]);
  });

  it('adds a venue, keeping the capacity and postal code strings', async (t) => {
    const operations = stubGraphQL(t, { CreateVenue: { createVenue: { ...venue, id: 'v9' } } });
    const form = await (await get('/admin/venue/add')).text();
    assert.match(form, /<input type="url" name="listingsUrl"/);
    assert.match(form, /name="coordinates\[latitude\]"/);
    assert.doesNotMatch(form, /name="slug"/);

    const response = await post(
      '/admin/venue/add',
      'name=1015+Folsom&capacity=2000&postalCode=94103&coordinates%5Blatitude%5D=37.77&coordinates%5Blongitude%5D=-122.4'
    );
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/venue/v9?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'CreateVenue',
      variables: {
        input: {
          name: '1015 Folsom',
          capacity: '2000',
          postalCode: '94103',
          coordinates: { latitude: 37.77, longitude: -122.4 },
        },
      },
    });
  });

  it('shows a venue with its address, coordinates, listings link and shows', async (t) => {
    stubGraphQL(t, { VenueEdit: { venue, shows: { __typename: 'ShowConnection', edges: shows } } });
    const html = await (await get('/admin/venue/v1')).text();
    assert.match(html, /<a href="\/venue\/ryman-auditorium" target="_blank"/);
    // Web serves the listings page too, so the link doesn't need a full load
    assert.match(html, /<a href="\/admin\/show\/listings\/v1" class=/);
    assert.match(
      html,
      /<input type="url" name="listingsUrl" value="https:\/\/www.ticketmaster.com\/ryman"/
    );
    assert.match(html, /<textarea name="streetAddress"[^>]*>116 5th Ave N<\/textarea>/);
    assert.match(html, /<input type="text" name="coordinates\[latitude\]" value="36.1612"/);
    assert.match(html, /<input type="text" name="coordinates\[longitude\]" value="-86.7785"/);
    assert.match(html, /<input type="checkbox" name="permanentlyClosed" value="true" id=/);
    assert.match(html, />05\/10\/2024 Wilco \/ Spoon<\/a>/);
    assert.match(html, />10\/01\/2023 Opry Birthday Bash<\/a>/);
  });

  it('saves an edit, clearing the boxes and listings page left empty', async (t) => {
    const operations = stubGraphQL(t, { UpdateVenue: { updateVenue: venue } });
    const response = await post('/admin/venue/v1', 'name=Ryman&listingsUrl=&capacity=2362');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/venue/v1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdateVenue',
      variables: {
        id: 'v1',
        input: {
          excludeFromSearch: false,
          listingsUrl: null,
          permanentlyClosed: false,
          name: 'Ryman',
          capacity: '2362',
        },
      },
    });
  });

  it("answers 404 for a venue that doesn't exist", async (t) => {
    stubGraphQL(t, { VenueEdit: { venue: null, shows: null } });
    const response = await get('/admin/venue/nowhere');
    assert.equal(response.status, 404);
  });
});
