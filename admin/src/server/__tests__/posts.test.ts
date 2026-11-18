// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { createPost, deletePosts, loadPost, loadPosts, updatePost } from '../posts';

import { calls, form, stubGraphQL } from './helpers';

describe('posts', () => {
  it('loads a page of posts, searched', async () => {
    const posts = { posts: { count: 0, edges: [], pageInfo: { hasNextPage: false } } };
    const gql = stubGraphQL({ query: posts });

    const data = await loadPosts({ gql, searchParams: new URLSearchParams('page=3&search=wilco') });

    expect(data).toBe(posts);
    expect(calls(gql.query)).toEqual([
      {
        operation: 'PostsAdmin',
        // the cursor of the 40th post
        variables: { first: 20, after: 'YXJyYXljb25uZWN0aW9uOjM5', search: 'wilco' },
      },
    ]);
  });

  it('loads the first page without a cursor', async () => {
    const gql = stubGraphQL();
    await loadPosts({ gql, searchParams: new URLSearchParams() });
    expect(calls(gql.query)).toEqual([{ operation: 'PostsAdmin', variables: { first: 20 } }]);
  });

  it('deletes the checked posts', async () => {
    const gql = stubGraphQL();
    const result = await deletePosts({
      gql,
      formData: form({ ids: ['p1'] }),
      url: new URL('http://localhost/admin/post'),
    });
    expect(calls(gql.mutate)).toEqual([{ operation: 'DeletePost', variables: { ids: ['p1'] } }]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/post?deleted=1' });
  });

  it('loads a post to edit', async () => {
    const gql = stubGraphQL({ query: { post: { id: 'p1' } } });
    await expect(loadPost({ gql, id: 'p1' })).resolves.toEqual({ post: { id: 'p1' } });
    expect(calls(gql.query)).toEqual([{ operation: 'PostEdit', variables: { id: 'p1' } }]);
  });

  it('creates a post and goes to its edit page', async () => {
    const gql = stubGraphQL({ mutate: { createPost: { id: 'p2' } } });
    const result = await createPost({
      gql,
      formData: form({ title: 'Hello', status: 'DRAFT', 'artists[]': ['Wilco'] }),
      url: new URL('http://localhost/admin/post/add'),
    });
    expect(calls(gql.mutate)).toEqual([
      {
        operation: 'CreatePost',
        variables: { input: { title: 'Hello', status: 'DRAFT', artists: ['Wilco'] } },
      },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/post/p2?message=updated' });
  });

  it('updates a post', async () => {
    const gql = stubGraphQL({ mutate: { updatePost: { id: 'p1' } } });
    const result = await updatePost({
      gql,
      id: 'p1',
      formData: form({ title: 'Hello again', summary: '' }),
      url: new URL('http://localhost/admin/post/p1'),
    });
    expect(calls(gql.mutate)).toEqual([
      { operation: 'UpdatePost', variables: { id: 'p1', input: { title: 'Hello again' } } },
    ]);
    expect(result).toEqual({ redirectTo: 'http://localhost/admin/post/p1?message=updated' });
  });
});
