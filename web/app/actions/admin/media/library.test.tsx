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

const get = (path: string) =>
  router.fetch(new Request(new URL(path, origin), { headers: { cookie: testSession } }));

const post = (path: string, body: string) =>
  router.fetch(
    new Request(new URL(path, origin), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: { cookie: testSession, origin },
    })
  );

const storage = 'https://storage.googleapis.com/wonderboymusic';

const uploads = {
  count: 2,
  edges: [
    {
      node: {
        id: 'm1',
        title: 'Wilco live',
        originalName: 'wilco.jpg',
        destination: '2024/05',
        mimeType: 'image/jpeg',
        type: 'image',
        crops: [
          { fileName: 'wilco-300.jpg', width: 300 },
          { fileName: 'wilco-150.jpg', width: 150 },
        ],
      },
    },
    {
      node: {
        id: 'a1',
        title: null,
        originalName: 'episode.mp3',
        destination: '2024/06',
        mimeType: 'audio/mpeg',
        type: 'audio',
        images: [],
      },
    },
  ],
  mimeTypes: ['audio/mpeg', 'image/jpeg'],
  types: ['audio', 'image'],
  pageInfo: { hasNextPage: false },
};

const image = {
  id: 'm1',
  type: 'image',
  title: 'Wilco live',
  originalName: 'wilco.jpg',
  destination: '2024/05',
  fileName: 'wilco.jpg',
  fileSize: 1234567,
  mimeType: 'image/jpeg',
  width: 3000,
  height: 2000,
  caption: 'At the Ryman',
  altText: 'Jeff Tweedy',
  crops: [{ fileName: 'wilco-300.jpg', width: 300, height: 200, fileSize: 45000 }],
};

describe('admin media library', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('lists uploads with thumbnails, file names, and type and MIME type filters', async (t) => {
    const operations = stubGraphQL(t, { UploadsAdmin: { uploads } });
    const html = await (await get('/admin/media?type=image&added=2')).text();
    // The smallest crop
    assert.ok(html.includes(`src="${storage}/2024/05/wilco-150.jpg"`));
    assert.match(
      html,
      /<a href="\/admin\/media\/m1">Wilco live<\/a><br \/><span[^>]*>wilco\.jpg<\/span>/
    );
    assert.match(html, /<a href="\/admin\/media\/a1">\(no title\)<\/a>/);
    assert.match(html, /<a href="\/admin\/media\?type=image">image<\/a>/);
    assert.match(html, /<a href="\/admin\/media\?mimeType=image%2Fjpeg">image\/jpeg<\/a>/);
    assert.match(html, /<option value="image" selected>Image<\/option>/);
    assert.match(html, /<select name="mimeType" aria-label="Select MIME Type"/);
    assert.match(html, /Added 2 album covers/);
    assert.match(html, /<a href="\/admin\/media\/upload"[^>]*>Add Media<\/a>/);
    assert.deepEqual(operations.find((op) => op.operationName === 'UploadsAdmin')?.variables, {
      first: 20,
      type: 'image',
    });
  });

  it('deletes the checked uploads and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeleteMedia: { removeMediaUpload: true } });
    const response = await post('/admin/media', 'intent=delete&ids=m1');
    assert.equal(response.headers.get('location'), 'http://localhost/admin/media?deleted=1');
    assert.deepEqual(operations, [{ operationName: 'DeleteMedia', variables: { ids: ['m1'] } }]);
  });

  it("shows the upload page, which the edit route doesn't take", async (t) => {
    const operations = stubGraphQL(t);
    const html = await (await get('/admin/media/upload')).text();
    assert.match(html, /<h1[^>]*>Upload Media<\/h1>/);
    assert.match(html, /Drop files Here/);
    assert.match(html, /<input type="file" multiple/);
    assert.ok(!operations.some((op) => op.operationName === 'MediaAdmin'));
  });

  it('asks for a search before showing album covers', async (t) => {
    const operations = stubGraphQL(t);
    const html = await (await get('/admin/media/album-covers')).text();
    assert.match(html, /Search Apple Music for an album or artist/);
    assert.ok(!operations.some((op) => op.operationName === 'AlbumCoversAdmin'));
  });

  it('shows the albums a search finds, to pick covers from', async (t) => {
    const operations = stubGraphQL(t, {
      AlbumCoversAdmin: {
        appleMusicAlbums: {
          error: null,
          albums: [
            {
              id: 'al1',
              name: 'Yankee Hotel Foxtrot',
              artistName: 'Wilco',
              releaseDate: '2002-04-23',
              cover: 'https://art.example/yhf.jpg',
              artwork: { width: 3000, height: 3000 },
            },
          ],
        },
      },
    });
    const html = await (await get('/admin/media/album-covers?search=wilco')).text();
    assert.match(html, /<input type="checkbox" name="selected" value="al1"/);
    assert.match(html, /<strong[^>]*>Yankee Hotel Foxtrot<\/strong>Wilco/);
    assert.match(html, /2002 · 3000 × 3000/);
    assert.match(html, /<button type="submit" disabled[^>]*>Add Covers<\/button>/);
    assert.deepEqual(operations.find((op) => op.operationName === 'AlbumCoversAdmin')?.variables, {
      term: 'wilco',
    });
  });

  it('adds the picked covers and goes to the media list', async (t) => {
    const operations = stubGraphQL(t, {
      AddAlbumCovers: { addAlbumCovers: [{ id: 'm8' }, { id: 'm9' }] },
    });
    const response = await post(
      '/admin/media/album-covers?search=wilco',
      'selected=al1&selected=al2'
    );
    assert.equal(response.status, 303);
    assert.equal(response.headers.get('location'), '/admin/media?added=2');
    assert.deepEqual(operations, [
      { operationName: 'AddAlbumCovers', variables: { ids: ['al1', 'al2'] } },
    ]);
  });

  it("says so when the covers couldn't be added", async (t) => {
    stubGraphQL(t);
    const response = await post('/admin/media/album-covers', 'selected=al1');
    assert.equal(response.status, 502);
    assert.match(await response.text(), /The covers could not be added\. Please try again\./);
  });

  it('shows an image with its caption, alt text and crops', async (t) => {
    stubGraphQL(t, { MediaAdmin: { media: image } });
    const html = await (await get('/admin/media/m1?message=updated')).text();
    assert.match(
      html,
      /<input type="text" name="title" value="Wilco live" placeholder="Enter a title"/
    );
    assert.match(html, /<strong>Original name:<\/strong> wilco\.jpg/);
    assert.ok(html.includes(`<img src="${storage}/2024/05/wilco-300.jpg"`));
    assert.match(html, /<textarea name="caption"[^>]*>At the Ryman<\/textarea>/);
    assert.match(html, /<input type="text" name="altText" value="Jeff Tweedy"/);
    assert.doesNotMatch(html, /name="description"/);
    assert.match(html, />3000 x 2000<\/a> - 1\.23 MB - Original/);
    assert.match(html, />300 x 200<\/a> - 45 kB/);
    assert.match(html, /Media updated\./);
  });

  it('shows a video with its duration and size', async (t) => {
    stubGraphQL(t, {
      MediaAdmin: {
        media: {
          id: 'v1',
          type: 'video',
          title: 'Clip',
          originalName: 'clip.mp4',
          destination: '2024/07',
          fileName: 'clip.mp4',
          fileSize: 9000000,
          mimeType: 'video/mp4',
          description: 'Encore',
          duration: 125.4,
          width: 1920,
          height: 1080,
        },
      },
    });
    const html = await (await get('/admin/media/v1')).text();
    assert.ok(html.includes(`<video`) && html.includes(`src="${storage}/2024/07/clip.mp4"`));
    assert.match(html, /<textarea name="description"[^>]*>Encore<\/textarea>/);
    assert.match(html, /<strong>Duration:<\/strong> 2 mins, 5 seconds/);
    assert.match(html, /<strong>Dimensions:<\/strong> 1920 x 1080/);
  });

  it('saves an edit, keeping a title like "2024" a string', async (t) => {
    const operations = stubGraphQL(t, { UpdateMedia: { updateMediaUpload: image } });
    const response = await post('/admin/media/m1', 'title=2024&caption=&altText=Jeff');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/media/m1?message=updated'
    );
    assert.deepEqual(operations, [
      {
        operationName: 'UpdateMedia',
        variables: { id: 'm1', input: { title: '2024', caption: null, altText: 'Jeff' } },
      },
    ]);
  });

  it("answers 404 for an upload that doesn't exist", async (t) => {
    stubGraphQL(t, { MediaAdmin: { media: null } });
    const response = await get('/admin/media/nothing');
    assert.equal(response.status, 404);
  });
});
