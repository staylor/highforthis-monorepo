import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { router } from '../../../router.ts';

const origin = 'http://localhost';

// Made by the admin app's React Router createCookieSessionStorage with the secret
// 'test-secret', holding the token 'test-token'.
const session =
  '__session=eyJ0b2tlbiI6InRlc3QtdG9rZW4ifQ%3D%3D.0jvC0SjKdfmXr5Rw%2F6679ia0w0xRgH4hIpEzB3aJ9Fc';

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

const get = (path: string) =>
  router.fetch(new Request(new URL(path, origin), { headers: { cookie: session } }));

const post = (path: string, body: string) =>
  router.fetch(
    new Request(new URL(path, origin), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: { cookie: session, origin },
    })
  );

const venues = {
  edges: [
    { node: { id: 'v1', name: 'Brooklyn Steel', listingsUrl: 'https://www.boweryboston.com/x' } },
    { node: { id: 'v2', name: 'Elsewhere', listingsUrl: null } },
  ],
};

const listing = (fields: Record<string, unknown>) => ({
  __typename: 'Listing',
  cancelled: false,
  dateChanged: false,
  headliners: [],
  localDate: '2026-08-15',
  localTime: '20:00:00',
  newArtists: [],
  show: null,
  sourceId: 'l1',
  status: 'On Sale',
  support: [],
  url: 'https://tickets.example/l1',
  ...fields,
});

const venueListings = {
  __typename: 'VenueListings',
  error: null,
  source: 'aeg',
  listings: [
    listing({
      sourceId: 'l1',
      headliners: ['Wilco'],
      support: ['Spoon'],
      newArtists: ['Spoon'],
    }),
    listing({
      sourceId: 'l2',
      headliners: ['Big Thief'],
      show: { __typename: 'Show', id: 's7' },
      dateChanged: true,
    }),
    listing({ sourceId: 'l3', headliners: ['Lorde'], cancelled: true }),
  ],
};

describe('admin venue listings', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('lists the venues with a listings page to choose from', async (t) => {
    const operations = stubGraphQL(t, { VenueListingsAdmin: { venues } });
    const html = await (await get('/admin/show/listings')).text();
    assert.match(html, /<h1[^>]*>Venue Listings<\/h1>/);
    assert.match(html, /<option value="\/admin\/show\/listings\/v1">Brooklyn Steel<\/option>/);
    assert.doesNotMatch(html, /Elsewhere/);
    assert.doesNotMatch(html, /<table/);
    assert.deepEqual(
      operations.find((op) => op.operationName === 'VenueListingsAdmin')?.variables,
      {
        venueId: '',
        withListings: false,
      }
    );
  });

  it('says so when no venue has a listings page', async (t) => {
    stubGraphQL(t, { VenueListingsAdmin: { venues: { edges: [] } } });
    const html = await (await get('/admin/show/listings')).text();
    assert.match(html, /No venues have a listings page yet\./);
  });

  it("shows a venue's listings, which ones can be added, and with whom", async (t) => {
    const operations = stubGraphQL(t, { VenueListingsAdmin: { venues, venueListings } });
    const html = await (await get('/admin/show/listings/v1?added=2&artistsCreated=1')).text();
    assert.match(html, /<option value="\/admin\/show\/listings\/v1" selected>Brooklyn Steel/);
    assert.match(html, /Bowery Presents \(AEG\) · 3 upcoming/);
    assert.match(html, /Added 2 shows\. Created 1 new artists\./);
    // The one that can be added has its box and artists, the new artist marked
    assert.match(
      html,
      /<input type="checkbox" name="selected" value="l1" aria-label="Select Sat, 8\/15\/26"/
    );
    assert.match(html, /<input type="text" name="artists-l1" value="Wilco"/);
    assert.match(html, /8:00 PM/);
    assert.match(html, /title="Already one of your artists"[^>]*>Wilco<\/span>/);
    assert.match(html, />\+ Spoon<\/button>/);
    // One that's already in the data links to it, and one that's cancelled says so
    assert.match(html, /value="l2" disabled/);
    assert.match(html, /<a href="\/admin\/show\/s7"[^>]*>✓ Added<\/a>/);
    assert.match(html, /The date changed after it was added/);
    assert.match(html, /value="l3" disabled/);
    assert.match(html, /<td[^>]*>Cancelled<\/td>/);
    assert.match(html, /<button type="submit" disabled[^>]*>Add Shows<\/button>/);
    assert.deepEqual(
      operations.find((op) => op.operationName === 'VenueListingsAdmin')?.variables,
      {
        venueId: 'v1',
        withListings: true,
      }
    );
  });

  it("says why a venue's listings couldn't be loaded", async (t) => {
    stubGraphQL(t, {
      VenueListingsAdmin: {
        venues,
        venueListings: {
          __typename: 'VenueListings',
          error: "nope isn't a URL.",
          source: null,
          listings: [],
        },
      },
    });
    const html = await (await get('/admin/show/listings/v1')).text();
    assert.match(html, /<div role="alert"[^>]*>nope isn't a URL\.<\/div>/);
  });

  it('adds the picked listings with their artists and says how many', async (t) => {
    const operations = stubGraphQL(t, {
      ImportListings: { importListings: { artistsCreated: 1, showsCreated: 2 } },
    });
    const response = await post(
      '/admin/show/listings/v1',
      'selected=l1&artists-l1=Wilco%3B+Spoon&selected=l4&artists-l4=Lorde&artists-l5=Ignored'
    );
    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get('location'),
      '/admin/show/listings/v1?added=2&artistsCreated=1'
    );
    assert.deepEqual(operations, [
      {
        operationName: 'ImportListings',
        variables: {
          venueId: 'v1',
          input: [
            { sourceId: 'l1', artists: ['Wilco', 'Spoon'] },
            { sourceId: 'l4', artists: ['Lorde'] },
          ],
        },
      },
    ]);
  });

  it("says so when the listings couldn't be added", async (t) => {
    stubGraphQL(t, { VenueListingsAdmin: { venues, venueListings } });
    const response = await post('/admin/show/listings/v1', 'selected=l1&artists-l1=Wilco');
    assert.equal(response.status, 502);
    assert.match(await response.text(), /The shows could not be added\. Please try again\./);
  });
});
