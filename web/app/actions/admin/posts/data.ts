import { gql } from 'graphql-tag';

import {
  clockInstant,
  clockAt,
  SITE_TIME_ZONE,
  plainDate,
  plainTime,
} from '@highforthis/shared/time';

import { featuredMediaFragment } from '#/actions/admin/media/data.ts';
import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { listVariables, type ListArgs } from '#/lib/admin/list-variables.ts';
import type { PostEditQuery, PostsAdminQuery } from '#/types/graphql.ts';

const postFormFragment = gql`
  fragment PostForm_post on Post {
    id
    date
    slug
    status
    summary
    title
    artists {
      id
      name
    }
    editorState {
      forEditing
    }
    featuredMedia {
      ...FeaturedMedia_media
    }
  }
  ${featuredMediaFragment}
`;

const postsQuery = gql`
  query PostsAdmin($after: String, $first: Int, $search: String) {
    posts(after: $after, first: $first, search: $search) {
      count
      edges {
        node {
          id
          date
          slug
          status
          title
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const deletePostMutation = gql`
  mutation DeletePost($ids: [String]!) {
    removePost(ids: $ids)
  }
`;

const postQuery = gql`
  query PostEdit($id: String!) {
    post(id: $id) {
      ...PostForm_post
    }
  }
  ${postFormFragment}
`;

const createPostMutation = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostForm_post
    }
  }
  ${postFormFragment}
`;

const updatePostMutation = gql`
  mutation UpdatePost($id: String!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      ...PostForm_post
    }
  }
  ${postFormFragment}
`;

// The artists are tags, each an artist's name
const textFields = ['title', 'summary', 'artists'];

export function loadPosts({ gql: client, searchParams }: ListArgs) {
  return client.query<PostsAdminQuery>(postsQuery, listVariables(searchParams));
}

export function deletePosts(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deletePostMutation });
}

export function loadPost({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<PostEditQuery>(postQuery, { id });
}

// An untouched minute retains any saved seconds and the exact occurrence of a repeated hour.
function publicationDate(input: Record<string, any>) {
  const value = input.dateLocal;
  delete input.dateLocal;
  if (!value) return;
  try {
    const parts = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})$/.exec(value);
    if (!parts) throw new RangeError();
    plainDate(parts[1]);
    plainTime(parts[2]);
    if (
      typeof input.date === 'number' &&
      clockAt(input.date).toString({ smallestUnit: 'minute' }) === value
    )
      return;
    const timestamp = clockInstant(value, SITE_TIME_ZONE);
    if (clockAt(timestamp).toString({ smallestUnit: 'minute' }) !== value) throw new RangeError();
    input.date = timestamp;
  } catch {
    return 'Enter a valid publication time in New York.';
  }
}

export function createPost(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createPostMutation,
    createMutation: 'createPost',
    prepare: publicationDate,
    textFields,
  });
}

export function updatePost({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updatePostMutation,
    // A post whose tags were all removed submits none, and tags left out are kept, so this
    // default clears them
    variables: { id, input: { artists: [] } },
    prepare: publicationDate,
    textFields,
  });
}
