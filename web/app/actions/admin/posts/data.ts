import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '@highforthis/shared/admin/forms';
import { addPageOffset, addSearchParam } from '@highforthis/shared/admin/listVariables';

import type { PostEditQuery, PostsAdminQuery } from '../../../types/graphql.ts';
import { textNodeFragments } from '../../../ui/post-content.tsx';
import { videoFragment } from '../../../ui/videos.tsx';
import { featuredMediaFragment } from '../media/data.ts';

// The posts section's data, moved from the admin app's src/server/posts.ts with the same GraphQL
// operations. The post's body uses the public site's text and video fragments, which ask for the
// same fields the admin app's did.

const postFormFragment = gql`
  fragment PostForm_post on Post {
    artists {
      id
      name
    }
    date
    editorState {
      root {
        children {
          ... on ElementNodeType {
            direction
            format
            indent
            type
            version
          }
          ... on HeadingNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
            tag
          }
          ... on ImageNode {
            image {
              crops {
                fileName
                width
              }
              destination
              id
            }
            size
          }
          ... on VideoNode {
            video {
              ...Video_video
            }
          }
          ... on ElementNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
          }
          ... on QuoteNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
          }
          ... on CodeNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
            language
          }
          ... on ListNode {
            children {
              ... on ListItemNode {
                checked
                children {
                  ...TextNodes_linebreakNode
                  ...TextNodes_textNode
                }
                direction
                format
                indent
                type
                value
                version
              }
            }
            listType
            start
          }
        }
        direction
        format
        indent
        type
        version
      }
    }
    featuredMedia {
      ...FeaturedMedia_media
    }
    id
    slug
    status
    summary
    title
  }
  ${textNodeFragments}
  ${featuredMediaFragment}
  ${videoFragment}
`;

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

// Keeps a title like "2024" a string, as with the other sections, and lets a summary be cleared
const skipKeys = ['title', 'summary'];

export function loadPosts({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return client.query<PostsAdminQuery>(postsQuery, variables);
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
    skipKeys,
  });
}

export function updatePost({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({ ...args, mutation: updatePostMutation, variables: { id }, skipKeys });
}
