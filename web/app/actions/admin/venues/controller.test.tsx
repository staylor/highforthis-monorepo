import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import {
  acceptTestSession,
  get,
  post,
  storage,
  stubGraphQL,
} from '#/actions/admin/test-support.ts';

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

const venue = {
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
  coordinates: { latitude: 36.1612, longitude: -86.7785 },
  excludeFromSearch: false,
  permanentlyClosed: false,
  featuredMedia: [],
};

const shows = [
  {
    node: {
      id: 's1',
      schedule: { localDate: '2024-05-10' },
      title: null,
      artists: [
        { id: 'a1', name: 'Wilco' },
        { id: 'a2', name: 'Spoon' },
      ],
    },
  },
  {
    node: {
      id: 's2',
      schedule: { localDate: '2023-10-01' },
      title: 'Opry Birthday Bash',
      artists: [{ id: 'a3', name: 'Various' }],
    },
  },
];

describe('admin venues', () => {
  acceptTestSession();

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
    stubGraphQL(t, { VenueEdit: { venue, shows: { edges: shows } } });
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

  it('saves an edit, clearing the boxes and the fields left empty', async (t) => {
    const operations = stubGraphQL(t, { UpdateVenue: { updateVenue: venue } });
    const response = await post(
      '/admin/venue/v1',
      'name=Ryman&slug=ryman&description=&website=&listingsUrl=&capacity=2362&streetAddress=' +
        '&city=Nashville&state=&postalCode=37219' +
        '&coordinates%5Blatitude%5D=36.16&coordinates%5Blongitude%5D=-86.78'
    );
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
          permanentlyClosed: false,
          name: 'Ryman',
          slug: 'ryman',
          description: null,
          website: null,
          listingsUrl: null,
          // Digits, but text
          capacity: '2362',
          streetAddress: null,
          city: 'Nashville',
          state: null,
          postalCode: '37219',
          coordinates: { latitude: 36.16, longitude: -86.78 },
        },
      },
    });
  });

  it('clears both coordinates when either is emptied, and leaves them alone when not sent', async (t) => {
    const operations = stubGraphQL(t, { UpdateVenue: { updateVenue: venue } });
    await post(
      '/admin/venue/v1',
      'name=Ryman&coordinates%5Blatitude%5D=&coordinates%5Blongitude%5D=-86.78'
    );
    assert.deepEqual(operations.at(-1)?.variables.input.coordinates, {
      latitude: null,
      longitude: null,
    });

    await post('/admin/venue/v1', 'name=Ryman');
    assert.equal('coordinates' in operations.at(-1)!.variables.input, false);
  });

  it("answers 404 for a venue that doesn't exist", async (t) => {
    stubGraphQL(t, { VenueEdit: { venue: null, shows: null } });
    const response = await get('/admin/venue/nowhere');
    assert.equal(response.status, 404);
  });
});
