import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import {
  acceptTestSession,
  get,
  post,
  storage,
  stubGraphQL,
} from '#/actions/admin/test-support.ts';

const podcasts = {
  count: 1,
  edges: [{ node: { id: 'p1', title: 'Episode 1' } }],
  pageInfo: { hasNextPage: false },
};

const podcast = {
  id: 'p1',
  title: 'Episode 1',
  description: 'The first one',
  image: {
    id: 'm1',
    destination: '2024/07',
    fileName: 'cover.jpg',
    type: 'image',
    crops: [{ fileName: 'cover-300.jpg', width: 300 }],
  },
  audio: {
    id: 'a1',
    destination: '2024/07',
    fileName: 'episode-1.mp3',
    type: 'audio',
  },
};

describe('admin podcasts', () => {
  acceptTestSession();

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
      // A podcast's description is never null
      variables: { input: { title: '2024', description: '', image: 'm1', audio: 'a1' } },
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

  it('saves an emptied description as an empty one, since a podcast always has one', async (t) => {
    const operations = stubGraphQL(t, { UpdatePodcast: { updatePodcast: podcast } });
    await post('/admin/podcast/p1', 'title=Episode+One&description=');
    assert.deepEqual(operations.at(-1)?.variables.input, {
      title: 'Episode One',
      description: '',
    });
  });

  it("answers 404 for a podcast that doesn't exist", async (t) => {
    stubGraphQL(t, { PodcastEdit: { podcast: null } });
    const response = await get('/admin/podcast/nothing');
    assert.equal(response.status, 404);
  });
});
