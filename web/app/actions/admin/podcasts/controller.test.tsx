import * as assert from 'remix/assert';
import { afterEach, beforeEach, describe, it, type TestContext } from 'remix/test';

import { router } from '../../../router.ts';

const origin = 'http://localhost';

// A session cookie signed with the secret 'test-secret', holding the token 'test-token'
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

const get = (path: string, cookie = session) =>
  router.fetch(new Request(new URL(path, origin), { headers: cookie ? { cookie } : {} }));

const post = (path: string, body: string) =>
  router.fetch(
    new Request(new URL(path, origin), {
      method: 'POST',
      body: new URLSearchParams(body),
      headers: { cookie: session, origin },
    })
  );

const storage = 'https://storage.googleapis.com/wonderboymusic';

const podcasts = {
  count: 1,
  edges: [{ node: { id: 'p1', title: 'Episode 1' } }],
  pageInfo: { hasNextPage: false },
};

// GraphQL answers with __typename, which Apollo needs to fill the form's fragments
const podcast = {
  __typename: 'Podcast',
  id: 'p1',
  title: 'Episode 1',
  description: 'The first one',
  image: {
    __typename: 'ImageUpload',
    id: 'm1',
    destination: '2024/07',
    fileName: 'cover.jpg',
    type: 'image',
    crops: [{ fileName: 'cover-300.jpg', width: 300 }],
  },
  audio: {
    __typename: 'AudioUpload',
    id: 'a1',
    destination: '2024/07',
    fileName: 'episode-1.mp3',
    type: 'audio',
  },
};

describe('admin podcasts', () => {
  beforeEach(() => {
    process.env.TOKEN_SECRET = 'test-secret';
  });
  afterEach(() => {
    delete process.env.TOKEN_SECRET;
  });

  it('lists podcasts with links to edit them, view them and delete them', async (t) => {
    const operations = stubGraphQL(t, { PodcastsAdmin: { podcasts } });
    const html = await (await get('/admin/podcast?search=ep')).text();
    assert.match(html, /<a href="\/admin\/podcast\/p1">Episode 1<\/a>/);
    // The public page isn't an admin page, so it loads in full
    assert.match(html, /<a href="\/podcast\/p1" data-rmx-document[^>]*>View<\/a>/);
    assert.match(html, /<input type="hidden" name="ids" value="p1"/);
    assert.deepEqual(operations.find((op) => op.operationName === 'PodcastsAdmin')?.variables, {
      first: 20,
      search: 'ep',
    });
  });

  it('deletes the checked podcasts and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeletePodcast: { removePodcast: true } });
    const response = await post('/admin/podcast', 'intent=delete&ids=p1');
    assert.equal(response.headers.get('location'), 'http://localhost/admin/podcast?deleted=1');
    assert.deepEqual(operations, [{ operationName: 'DeletePodcast', variables: { ids: ['p1'] } }]);
  });

  it('adds a podcast with its image and audio, keeping a title like "2024" a string', async (t) => {
    const operations = stubGraphQL(t, { CreatePodcast: { createPodcast: { id: 'p9' } } });
    const form = await (await get('/admin/podcast/add')).text();
    assert.match(form, /Set Image/);
    assert.match(form, /Set Audio/);

    const response = await post('/admin/podcast/add', 'title=2024&description=&image=m1&audio=a1');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/podcast/p9?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'CreatePodcast',
      variables: { input: { title: '2024', image: 'm1', audio: 'a1' } },
    });
  });

  it('shows a podcast with its image and a player for its audio', async (t) => {
    stubGraphQL(t, { PodcastEdit: { podcast } });
    const html = await (await get('/admin/podcast/p1?message=updated')).text();
    assert.match(html, /<input type="text" name="title" value="Episode 1"/);
    assert.match(html, /<textarea name="description"[^>]*>The first one<\/textarea>/);
    assert.match(html, /<input type="hidden" name="image" value="m1"/);
    assert.ok(html.includes(`src="${storage}/2024/07/cover-300.jpg"`));
    assert.match(html, /<input type="hidden" name="audio" value="a1"/);
    assert.ok(html.includes(`<audio controls src="${storage}/2024/07/episode-1.mp3"`));
    assert.match(html, /Podcast updated\./);
    assert.match(html, /<button type="submit"[^>]*>Update Podcast<\/button>/);
  });

  it('saves an edit', async (t) => {
    const operations = stubGraphQL(t, { UpdatePodcast: { updatePodcast: podcast } });
    const response = await post('/admin/podcast/p1', 'title=Episode+One&image=m2&audio=a1');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/podcast/p1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdatePodcast',
      variables: { id: 'p1', input: { title: 'Episode One', image: 'm2', audio: 'a1' } },
    });
  });

  it("answers 404 for a podcast that doesn't exist", async (t) => {
    stubGraphQL(t, { PodcastEdit: { podcast: null } });
    const response = await get('/admin/podcast/nothing');
    assert.equal(response.status, 404);
  });
});
