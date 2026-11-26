import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/actions/admin/media/data.ts';
import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { listVariables, type ListArgs } from '#/lib/admin/list-variables.ts';
import type { PostEditQuery, PostsAdminQuery } from '#/types/graphql.ts';
import { linebreakNodeFragment, textNodeFragment } from '#/ui/post-content.tsx';
import { videoFragment } from '#/ui/videos.tsx';

// The post's body uses the public site's text and video fragments.

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
      root {
        direction
        format
        indent
        type
        version
        children {
          ... on ElementNodeType {
            direction
            format
            indent
            type
            version
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
          }
          ... on HeadingNode {
            tag
          }
          ... on ImageNode {
            size
            image {
              id
              destination
              crops {
                fileName
                width
              }
            }
          }
          ... on VideoNode {
            video {
              ...Video_video
            }
          }
          ... on CodeNode {
            language
          }
          ... on ListNode {
            listType
            start
            children {
              ... on ListItemNode {
                checked
                direction
                format
                indent
                type
                value
                version
                children {
                  ...TextNodes_linebreakNode
                  ...TextNodes_textNode
                }
              }
            }
          }
        }
      }
    }
    featuredMedia {
      ...FeaturedMedia_media
    }
  }
  ${linebreakNodeFragment}
  ${textNodeFragment}
  ${featuredMediaFragment}
  ${videoFragment}
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

export function createPost(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createPostMutation,
    createMutation: 'createPost',
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
    textFields,
  });
}
