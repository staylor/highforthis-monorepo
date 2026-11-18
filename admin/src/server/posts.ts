import { gql } from 'graphql-tag';

import { postFormFragment } from '#/components/Admin/Post/Form.graphql';
import type { PostEditQuery, PostsAdminQuery } from '#/types/graphql';
import { addPageOffset, addSearchParam } from '#/utils/listVariables';

import { deleteSelected, submitForm, type FormArgs } from './forms';
import type { GraphQLClient } from './graphql';

const postsQuery = gql`
  query PostsAdmin($after: String, $first: Int, $search: String) {
    posts(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          date
          id
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

export function loadPosts({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return gql.query<PostsAdminQuery>(postsQuery, variables);
}

export function deletePosts(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deletePostMutation });
}

export function loadPost({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<PostEditQuery>(postQuery, { id });
}

export function createPost(args: FormArgs) {
  return submitForm({ ...args, mutation: createPostMutation, createMutation: 'createPost' });
}

export function updatePost({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updatePostMutation, variables: { id } });
}
