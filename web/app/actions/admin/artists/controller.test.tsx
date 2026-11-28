import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import {
  acceptTestSession,
  get,
  invalid,
  post,
  storage,
  stubGraphQL,
} from '#/actions/admin/test-support.ts';

const artists = {
  count: 2,
  edges: [
    {
      node: {
        id: 'a1',
        name: 'Wilco',
        slug: 'wilco',
        website: 'https://wilcoworld.net',
        excludeFromSearch: false,
        appleMusic: {
          id: 'am1',
          url: 'https://music.apple.com/wilco',
          artwork: { url: 'https://art.example/{w}x{h}.jpg' },
        },
      },
    },
    {
      node: {
        id: 'a2',
        name: 'Spoon',
        slug: 'spoon',
        website: null,
        excludeFromSearch: true,
        appleMusic: null,
      },
    },
  ],
  pageInfo: { hasNextPage: false },
};

const artist = {
  id: 'a1',
  name: 'Wilco',
  slug: 'wilco',
  description: 'From Chicago',
  website: 'https://wilcoworld.net',
  excludeFromSearch: true,
  appleMusic: { id: 'am1', artwork: { url: 'https://art/{w}.jpg' } },
  featuredMedia: [
    {
      id: 'm1',
      destination: '2024/05',
      fileName: 'wilco.jpg',
      type: 'image',
      crops: [
        { fileName: 'wilco-150.jpg', width: 150 },
        { fileName: 'wilco-300.jpg', width: 300 },
      ],
    },
  ],
};

const shows = Array.from({ length: 12 }, (_, i) => ({
  node: {
    id: `s${i}`,
    schedule: { localDate: `2024-05-${10 + i}` },
    attended: true,
    venue: { id: 'v1', name: 'Ryman' },
  },
}));

describe('admin artists', () => {
  acceptTestSession();

  it('lists artists with artwork, links, "exclude from search" boxes and websites', async (t) => {
    const operations = stubGraphQL(t, { ArtistsAdmin: { artists } });
    const html = await (await get('/admin/artist?search=w')).text();
    assert.match(html, /<img src="https:\/\/art.example\/44x44.jpg" alt="Wilco"/);
    assert.match(html, /<a href="\/admin\/artist\/a1">Wilco<\/a>/);
    assert.match(html, /<a href="\/admin\/artist\/a2">Spoon<\/a>/);
    assert.match(html, /<input type="checkbox" checked aria-label="Exclude from search: Spoon"/);
    assert.match(html, /<input type="checkbox" aria-label="Exclude from search: Wilco"/);
    assert.match(html, /href="https:\/\/wilcoworld.net"/);
    assert.deepEqual(operations.find((op) => op.operationName === 'ArtistsAdmin')?.variables, {
      first: 20,
      search: 'w',
    });
  });

  it('saves a row\'s "exclude from search" box and answers 204', async (t) => {
    const operations = stubGraphQL(t, { UpdateArtistExclude: { updateArtist: { id: 'a1' } } });
    let response = await post(
      '/admin/artist',
      'intent=excludeFromSearch&id=a1&excludeFromSearch=true'
    );
    assert.equal(response.status, 204);
    response = await post(
      '/admin/artist',
      'intent=excludeFromSearch&id=a1&excludeFromSearch=false'
    );
    assert.equal(response.status, 204);
    assert.deepEqual(operations, [
      {
        operationName: 'UpdateArtistExclude',
        variables: { id: 'a1', input: { excludeFromSearch: true } },
      },
      {
        operationName: 'UpdateArtistExclude',
        variables: { id: 'a1', input: { excludeFromSearch: false } },
      },
    ]);
  });

  it("answers 500 when the box didn't save, so it goes back", async (t) => {
    stubGraphQL(t);
    const response = await post(
      '/admin/artist',
      'intent=excludeFromSearch&id=a1&excludeFromSearch=true'
    );
    assert.equal(response.status, 500);
  });

  it('deletes the checked artists and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeleteArtist: { removeArtist: true } });
    const response = await post('/admin/artist', 'intent=delete&ids=a1');
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), 'http://localhost/admin/artist?deleted=1');
    assert.deepEqual(operations, [{ operationName: 'DeleteArtist', variables: { ids: ['a1'] } }]);
  });

  it('adds an artist, keeping a name like "311" a string', async (t) => {
    const operations = stubGraphQL(t, { CreateArtist: { createArtist: { ...artist, id: 'a9' } } });
    const form = await (await get('/admin/artist/add')).text();
    assert.match(form, /<input type="text" name="name"/);
    assert.doesNotMatch(form, /name="slug"/);
    assert.match(form, /Set Featured Media/);

    const response = await post('/admin/artist/add', 'name=311&description=&website=');
    assert.equal(response.status, 303);
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/artist/a9?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'CreateArtist',
      variables: { input: { name: '311', description: null, website: null } },
    });
  });

  it('shows an artist with their artwork, featured media and shows', async (t) => {
    stubGraphQL(t, {
      ArtistEdit: { artist, shows: { edges: shows } },
    });
    const html = await (await get('/admin/artist/a1?message=updated')).text();
    assert.match(html, /<img src="https:\/\/art\/300.jpg" alt="Wilco"/);
    assert.match(html, /<a href="\/artist\/wilco" target="_blank"/);
    assert.match(html, /<input type="text" name="slug" value="wilco"/);
    assert.match(html, /<textarea name="description"[^>]*>From Chicago<\/textarea>/);
    assert.match(html, /<input type="hidden" name="featuredMedia" value="m1"/);
    assert.ok(html.includes(`<img alt="" src="${storage}/2024/05/wilco-300.jpg"`));
    assert.match(html, /<input type="checkbox" name="excludeFromSearch" value="true" checked/);
    // Shows link to their edit pages, which web serves, so they don't need a full load
    assert.match(html, /<a href="\/admin\/show\/s0"[^>]*>05\/10\/2024 Ryman<\/a>/);
    assert.match(html, /<summary[^>]*>Show More<\/summary>/);
    assert.match(html, /Artist updated\./);
  });

  it('leaves the shows box out when an artist has none', async (t) => {
    stubGraphQL(t, { ArtistEdit: { artist, shows: { edges: [] } } });
    const html = await (await get('/admin/artist/a1')).text();
    assert.match(html, /<h1[^>]*>Edit Artist<\/h1>/);
    assert.doesNotMatch(html, /Add Show/);
  });

  it('saves an edit, clearing "exclude from search" when the box is unchecked', async (t) => {
    const operations = stubGraphQL(t, { UpdateArtist: { updateArtist: artist } });
    const response = await post(
      '/admin/artist/a1',
      'name=311&slug=311&description=Hi&website=&featuredMedia=m2'
    );
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/artist/a1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdateArtist',
      variables: {
        id: 'a1',
        input: {
          excludeFromSearch: false,
          name: '311',
          slug: '311',
          description: 'Hi',
          website: null,
          featuredMedia: 'm2',
        },
      },
    });
  });

  it('shows an edit that failed as it was entered, boxes included', async (t) => {
    stubGraphQL(t, {
      ArtistEdit: { artist, shows: { edges: shows } },
      UpdateArtist: invalid('Invalid input (slug: Invalid input: expected string, received null)'),
    });
    // The saved artist is excluded from search, and this edit unchecks the box
    const response = await post('/admin/artist/a1', 'name=Wilco&slug=&description=New&website=');
    assert.equal(response.status, 422);
    const html = await response.text();
    assert.match(html, /role="alert"[^>]*><p>Couldn't save\./);
    assert.match(html, /slug: Invalid input: expected string, received null/);
    assert.match(html, /<input type="text" name="slug" value="" required/);
    assert.match(html, /<textarea name="description"[^>]*>New<\/textarea>/);
    assert.match(html, /<input type="checkbox" name="excludeFromSearch" value="true" id=/);
    // The rest of the page is the artist's, as it is saved
    assert.match(html, /Edit Artist/);
    assert.match(html, /<a href="\/admin\/show\/s0"/);
  });

  it('shows an add that failed as it was entered', async (t) => {
    stubGraphQL(t, { CreateArtist: invalid('Invalid input (name: Too small)') });
    const response = await post('/admin/artist/add', 'name=&description=From+Chicago&website=');
    assert.equal(response.status, 422);
    const html = await response.text();
    assert.match(html, /Add Artist/);
    assert.match(html, /<textarea name="description"[^>]*>From Chicago<\/textarea>/);
  });

  it("answers 404 for an artist that doesn't exist", async (t) => {
    stubGraphQL(t, { ArtistEdit: { artist: null, shows: null } });
    const response = await get('/admin/artist/nobody');
    assert.equal(response.status, 404);
  });
});

describe('admin media picker', () => {
  acceptTestSession();

  const uploads = {
    edges: [
      {
        node: {
          id: 'm1',
          title: 'Wilco live',
          destination: '2024/05',
          fileName: 'w.jpg',
          crops: [
            { fileName: 'w-150.jpg', width: 150 },
            { fileName: 'w-300.jpg', width: 300 },
          ],
        },
      },
      {
        node: {
          id: 'm2',
          title: null,
          destination: '2024/06',
          fileName: 'x.jpg',
          crops: [],
        },
      },
    ],
    pageInfo: { endCursor: 'next', hasNextPage: true },
  };

  it('answers a page of uploads with their thumbnails, and pages on with ?cursor', async (t) => {
    const operations = stubGraphQL(t, { MediaPicker: { uploads } });
    const response = await get('/admin/media-picker/image?cursor=abc');
    assert.equal(response.headers.get('cache-control'), 'private, no-store');
    assert.deepEqual(await response.json(), {
      items: [
        {
          id: 'm1',
          title: 'Wilco live',
          thumb: `${storage}/2024/05/w-150.jpg`,
          preview: `${storage}/2024/05/w-300.jpg`,
          audio: null,
          // What the post editor's image block keeps
          image: {
            id: 'm1',
            destination: '2024/05',
            crops: [
              { fileName: 'w-150.jpg', width: 150 },
              { fileName: 'w-300.jpg', width: 300 },
            ],
          },
        },
        {
          id: 'm2',
          title: '',
          thumb: null,
          preview: null,
          audio: null,
          image: { id: 'm2', destination: '2024/06', crops: [] },
        },
      ],
      endCursor: 'next',
      hasNextPage: true,
    });
    assert.deepEqual(operations[0].variables, { first: 50, type: 'image', cursor: 'abc' });
  });

  it('answers audio with its cover art and the file to play', async (t) => {
    const operations = stubGraphQL(t, {
      MediaPicker: {
        uploads: {
          edges: [
            {
              node: {
                id: 'a1',
                title: 'Episode 1',
                destination: '2024/07',
                fileName: 'episode-1.mp3',
                images: [{ fileName: 'episode-1-150.jpg', width: 150 }],
              },
            },
          ],
          pageInfo: { endCursor: 'end', hasNextPage: false },
        },
      },
    });
    const response = await get('/admin/media-picker/audio');
    assert.deepEqual(await response.json(), {
      items: [
        {
          id: 'a1',
          title: 'Episode 1',
          thumb: `${storage}/2024/07/episode-1-150.jpg`,
          preview: null,
          audio: `${storage}/2024/07/episode-1.mp3`,
          image: null,
        },
      ],
      endCursor: 'end',
      hasNextPage: false,
    });
    assert.deepEqual(operations[0].variables, { first: 50, type: 'audio' });
  });

  it("answers videos for the post editor's video block", async (t) => {
    const operations = stubGraphQL(t, {
      VideoPicker: {
        videos: {
          edges: [
            {
              node: {
                id: 'v1',
                dataId: 'yt1',
                slug: 'live',
                title: 'Live',
                thumbnails: [
                  {
                    url: 'https://i.ytimg.com/120.jpg',
                    width: 120,
                    height: 90,
                  },
                  {
                    url: 'https://i.ytimg.com/640.jpg',
                    width: 640,
                    height: 480,
                  },
                ],
              },
            },
          ],
          pageInfo: { endCursor: 'more', hasNextPage: true },
        },
      },
    });
    const response = await get('/admin/media-picker/video?cursor=abc');
    assert.deepEqual(await response.json(), {
      items: [
        {
          id: 'v1',
          title: 'Live',
          thumb: 'https://i.ytimg.com/120.jpg',
          preview: null,
          video: {
            id: 'v1',
            dataId: 'yt1',
            slug: 'live',
            title: 'Live',
            thumbnails: [
              { url: 'https://i.ytimg.com/120.jpg', width: 120, height: 90 },
              { url: 'https://i.ytimg.com/640.jpg', width: 640, height: 480 },
            ],
          },
        },
      ],
      endCursor: 'more',
      hasNextPage: true,
    });
    assert.deepEqual(operations[0].variables, { first: 50, cursor: 'abc' });
  });

  it('answers 404 for a type it has no picker for', async (t) => {
    const operations = stubGraphQL(t);
    const response = await get('/admin/media-picker/podcast');
    assert.equal(response.status, 404);
    assert.deepEqual(operations, []);
  });

  it('sends someone who is signed out to the login page', async (t) => {
    stubGraphQL(t);
    const response = await get('/admin/media-picker/image', '');
    assert.equal(response.status, 302);
  });
});
