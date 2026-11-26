import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import {
  acceptTestSession,
  get,
  invalid,
  post,
  stubGraphQL,
} from '#/actions/admin/test-support.ts';

// 8:00 PM on May 10, 2024 wherever the tests run, since the list shows the server's time
const postTime = new Date(2024, 4, 10, 20, 0).getTime();

const posts = {
  count: 2,
  edges: [
    {
      node: {
        id: 'p1',
        title: 'Best of 2024',
        slug: 'best-of-2024',
        status: 'PUBLISH',
        date: postTime,
      },
    },
    {
      node: {
        id: 'p2',
        title: 'Coming soon',
        slug: 'coming-soon',
        status: 'DRAFT',
        date: postTime,
      },
    },
  ],
  pageInfo: { hasNextPage: false },
};

const editorState = {
  root: {
    children: [],
    direction: 'ltr',
    format: '',
    indent: 0,
    type: 'root',
    version: 1,
  },
};

const savedPost = {
  id: 'p1',
  title: 'Best of 2024',
  slug: 'best-of-2024',
  status: 'DRAFT',
  summary: 'The year in music',
  date: postTime,
  artists: [{ id: 'a1', name: 'Wilco' }],
  featuredMedia: [],
  editorState,
};

/** The props the page gave a client entry, from the JSON the browser hydrates it with. */
function entryProps(html: string, exportName: string) {
  const at = html.indexOf(`"exportName":"${exportName}"`);
  if (at < 0) {
    return undefined;
  }
  const start = html.indexOf('"props":', at) + '"props":'.length;
  // The props object runs to its matching brace, skipping braces inside strings
  let depth = 0;
  let end = start;
  let inString = false;
  for (; end < html.length; end += 1) {
    const char = html[end];
    if (inString) {
      if (char === '\\') {
        end += 1;
      } else if (char === '"') {
        inString = false;
      }
    } else if (char === '"') {
      inString = true;
    } else if (char === '{') {
      depth += 1;
    } else if (char === '}' && --depth === 0) {
      end += 1;
      break;
    }
  }
  return JSON.parse(html.slice(start, end));
}

describe('admin posts', () => {
  acceptTestSession();

  it('lists posts, marking drafts, with links to view them', async (t) => {
    const operations = stubGraphQL(t, { PostsAdmin: { posts } });
    const html = await (await get('/admin/post?search=best')).text();
    assert.match(html, /<a href="\/admin\/post\/p1">Best of 2024<\/a>/);
    assert.match(html, /<a href="\/admin\/post\/p2">Coming soon - Draft<\/a>/);
    assert.match(html, /<a href="\/post\/best-of-2024" data-rmx-document[^>]*>View<\/a>/);
    assert.match(html, /05\/10\/2024 at 8:00pm/);
    assert.deepEqual(operations.find((op) => op.operationName === 'PostsAdmin')?.variables, {
      first: 20,
      search: 'best',
    });
  });

  it('deletes the checked posts and says how many', async (t) => {
    const operations = stubGraphQL(t, { DeletePost: { removePost: true } });
    const response = await post('/admin/post', 'intent=delete&ids=p1');
    assert.equal(response.headers.get('location'), 'http://localhost/admin/post?deleted=1');
    assert.deepEqual(operations, [{ operationName: 'DeletePost', variables: { ids: ['p1'] } }]);
  });

  it('starts a new post with an empty editor, no date and the details box', async (t) => {
    stubGraphQL(t);
    const html = await (await get('/admin/post/add')).text();
    assert.match(html, /<textarea name="title" rows="1" placeholder="Add a Title"/);
    assert.match(html, /<input type="hidden" name="date" value="" \/>/);
    assert.match(html, /<select name="status"/);
    assert.match(html, /<h3[^>]*>Details<\/h3>/);
    assert.match(html, /Set Featured Media/);
    assert.match(html, /<textarea name="summary"/);
    assert.equal(entryProps(html, 'PostEditor')?.editorState, '');
    assert.deepEqual(entryProps(html, 'TagsInput')?.tags, []);
    // Two buttons: in the details box on wide screens, and in a bar on narrow ones
    assert.equal(html.match(/<button type="submit"[^>]*>Add Post<\/button>/g)?.length, 2);
  });

  it('adds a post, keeping its title a string and its body JSON', async (t) => {
    const operations = stubGraphQL(t, { CreatePost: { createPost: { ...savedPost, id: 'p9' } } });
    const body = JSON.stringify({ root: { children: [], type: 'root', version: 1 } });
    const response = await post(
      '/admin/post/add',
      new URLSearchParams({
        title: '2024',
        editorState: body,
        date: String(postTime),
        status: 'DRAFT',
        summary: '',
      }).toString() + '&artists=Wilco&artists=Spoon&featuredMedia=m1'
    );
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/post/p9?message=updated'
    );
    const { variables } = operations.at(-1)!;
    assert.deepEqual(variables.input, {
      title: '2024',
      // The save gives each block a numeric format, as the schema expects
      editorState: { root: { children: [], type: 'root', version: 1, format: 0 } },
      date: postTime,
      status: 'DRAFT',
      summary: null,
      artists: ['Wilco', 'Spoon'],
      featuredMedia: 'm1',
    });
  });

  it('shows a post with its body, artists, date and status', async (t) => {
    stubGraphQL(t, { PostEdit: { post: savedPost } });
    const html = await (await get('/admin/post/p1?message=updated')).text();
    assert.match(html, /<textarea name="title"[^>]*>Best of 2024<\/textarea>/);
    assert.match(html, new RegExp(`<input type="hidden" name="date" value="${postTime}"`));
    assert.match(html, /<option value="DRAFT" selected>Draft<\/option>/);
    assert.match(html, /<a href="\/post\/best-of-2024" target="_blank"[^>]*>View Post<\/a>/);
    assert.match(html, /Post updated\./);
    assert.deepEqual(JSON.parse(entryProps(html, 'PostEditor')?.editorState), editorState);
    assert.deepEqual(entryProps(html, 'TagsInput')?.tags, ['Wilco']);
  });

  // A post without tags submits none, and GraphQL keeps the tags an edit leaves out
  it('saves an edit, clearing the tags when none are left', async (t) => {
    const operations = stubGraphQL(t, { UpdatePost: { updatePost: savedPost } });
    const response = await post('/admin/post/p1', 'title=Best+of+2024&status=PUBLISH');
    assert.equal(
      response.headers.get('location'),
      'http://localhost/admin/post/p1?message=updated'
    );
    assert.deepEqual(operations.at(-1), {
      operationName: 'UpdatePost',
      variables: { id: 'p1', input: { artists: [], title: 'Best of 2024', status: 'PUBLISH' } },
    });
  });

  it('keeps an artist tag that is all digits as text', async (t) => {
    const operations = stubGraphQL(t, { UpdatePost: { updatePost: savedPost } });
    await post('/admin/post/p1', 'title=Reunion&summary=&artists=311');
    assert.deepEqual(operations.at(-1)?.variables.input, {
      title: 'Reunion',
      summary: null,
      artists: '311',
    });
  });

  it('shows a new post that failed to save with its title, summary, date and tags', async (t) => {
    stubGraphQL(t, { CreatePost: invalid('Invalid input (title: Too small)') });
    const response = await post(
      '/admin/post/add',
      `title=&summary=In+short&status=DRAFT&date=${postTime}&artists=Wilco&artists=311`
    );
    assert.equal(response.status, 422);
    const html = await response.text();
    assert.match(html, /role="alert"[^>]*><p>Couldn't save\./);
    assert.match(html, /Invalid input \(title: Too small\)/);
    assert.match(html, /<textarea name="summary"[^>]*>In short<\/textarea>/);
    assert.match(html, /<option value="DRAFT" selected/);
    assert.match(html, new RegExp(`<input type="hidden" name="date" value="${postTime}"`));
    assert.match(html, /<input type="hidden" name="artists" value="Wilco"/);
    assert.match(html, /<input type="hidden" name="artists" value="311"/);
    // The browser doesn't send a post without a title
    assert.match(html, /<textarea name="title"[^>]* required/);
  });

  it("answers 404 for a post that doesn't exist", async (t) => {
    stubGraphQL(t, { PostEdit: { post: null } });
    const response = await get('/admin/post/nothing');
    assert.equal(response.status, 404);
  });
});
