import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { testSecret, testSession } from '../../../lib/adminSession.fixtures.ts';
import { router } from '../../../router.ts';

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

const videos = {
  count: 1,
  edges: [
    {
      node: {
        id: 'v1',
        title: 'Wilco - Live at the Ryman',
        slug: 'wilco-live-at-the-ryman',
        year: 2024,
        publishedAt: Date.UTC(2024, 4, 10, 12),
      },
    },
  ],
  pageInfo: { hasNextPage: false },
  years: [2025, 2024, 2023],
};

// GraphQL answers with __typename, which Apollo needs to fill the form's fragment
const video = {
  __typename: 'Video',
  id: 'v1',
  title: 'Wilco - Live at the Ryman',
  slug: 'wilco-live-at-the-ryman',
  dataType: 'youtube#video',
  dataPlaylistId: 'PL2024',
  year: 2024,
  thumbnails: [
    { __typename: 'VideoThumbnail', width: 120, height: 90, url: 'https://i.ytimg.com/120.jpg' },
    { __typename: 'VideoThumbnail', width: 480, height: 360, url: 'https://i.ytimg.com/480.jpg' },
  ],
};

describe('admin videos', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = testSecret;
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('lists videos with the year filter, filtered by ?year and ?search', async (t) => {
    const operations = stubGraphQL(t, { VideosAdmin: { videos } });
    const html = await (await get('/admin/video?year=2024&search=wilco&page=1')).text();
    assert.match(html, /<a href="\/admin\/video\/v1">Wilco - Live at the Ryman<\/a>/);
    assert.match(html, /<a href="\/video\/wilco-live-at-the-ryman" data-rmx-document/);
    assert.match(html, /Published<br \/>5\/10\/2024/);
    // The filter keeps the search, and the search keeps the filter, but neither keeps the page
    assert.match(html, /<select name="year" aria-label="Select Year"/);
    assert.match(html, /<option value="2024" selected>2024<\/option>/);
    // The select is a client entry, which starts with a hydration marker
    assert.match(
      html,
      /<input type="hidden" name="search" value="wilco" \/>(<!--[^>]*-->)?<select name="year"/
    );
    assert.match(html, /<input type="hidden" name="year" value="2024" \/><input type="search"/);
    assert.doesNotMatch(html, /<input type="hidden" name="page"/);
    assert.deepEqual(operations.find((op) => op.operationName === 'VideosAdmin')?.variables, {
      first: 20,
      search: 'wilco',
      year: 2024,
    });
  });

  it('keeps the filter when it matches nothing, so it can be changed', async (t) => {
    stubGraphQL(t, {
      VideosAdmin: {
        videos: { count: 0, edges: [], pageInfo: { hasNextPage: false }, years: [2024] },
      },
    });
    const html = await (await get('/admin/video?year=2023')).text();
    assert.match(html, /<select name="year"/);
    assert.match(html, /No items found\./);
  });

  it('deletes the checked videos and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeleteVideo: { removeVideo: true } });
    const response = await post('/admin/video?year=2024', 'intent=delete&ids=v1');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/video?year=2024&deleted=1'
    );
    assert.deepEqual(operations, [{ operationName: 'DeleteVideo', variables: { ids: ['v1'] } }]);
  });

  it('shows a video with its thumbnail and playlist link', async (t) => {
    stubGraphQL(t, { VideoEdit: { video } });
    const html = await (await get('/admin/video/v1?message=updated')).text();
    assert.match(html, /<img src="https:\/\/i.ytimg.com\/480.jpg" alt="Wilco - Live at the Ryman"/);
    assert.match(html, /<input type="text" name="dataType" value="youtube#video"/);
    assert.match(
      html,
      /<a href="https:\/\/www.youtube.com\/playlist\?list=PL2024"[^>]*>View 2024 Playlist<\/a>/
    );
    assert.match(html, /Video updated\./);
    // No add page
    assert.doesNotMatch(html, /href="\/admin\/video\/add"/);
  });

  it('leaves the thumbnail out when a video has none', async (t) => {
    stubGraphQL(t, { VideoEdit: { video: { ...video, thumbnails: [] } } });
    const response = await get('/admin/video/v1');
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /i\.ytimg\.com/);
  });

  it('saves an edit, keeping a title like "1999" a string', async (t) => {
    const operations = stubGraphQL(t, { UpdateVideo: { updateVideo: video } });
    const response = await post('/admin/video/v1', 'title=1999&slug=1999&dataType=youtube%23video');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/video/v1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdateVideo',
      variables: { id: 'v1', input: { title: '1999', slug: '1999', dataType: 'youtube#video' } },
    });
  });

  it("answers 404 for a video that doesn't exist", async (t) => {
    stubGraphQL(t, { VideoEdit: { video: null } });
    const response = await get('/admin/video/nothing');
    assert.equal(response.status, 404);
  });
});
