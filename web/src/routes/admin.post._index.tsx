import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import query, { addPageOffset } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Post, PostConnection, PostsAdminQuery } from '@/types/graphql';
import type { Columns } from '@/types';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({
    request,
    context,
    query: postsQuery,
    variables: addPageOffset(params),
  });
};

export const action: ActionFunction = ({ request, context }) => {
  return handleDelete({ request, context, mutation: postsMutation });
};

export default function Posts() {
  const path = usePath();
  const data = useLoaderData<PostsAdminQuery>();
  const posts = data.posts as PostConnection;
  const columns: Columns = [
    {
      label: 'Title',
      render: (post: Post) => {
        const editUrl = `${path}/${post.id}`;
        return (
          <>
            <RowTitle
              url={editUrl}
              title={`${post.title}${post.status === 'DRAFT' ? ' - Draft' : ''}`}
            />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'view', url: `/post/${post.slug}` },
                { type: 'delete', url: editUrl, ids: [post.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Slug',
      prop: 'slug',
    },
    {
      label: 'Date',
      prop: 'date',
      type: 'date',
    },
  ];
  return (
    <>
      <Heading>Posts</Heading>
      <HeaderAdd label="Post" />
      <Message param="deleted" text="Deleted %s posts." />
      <ListTable columns={columns} data={posts} />
    </>
  );
}

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

const postsMutation = gql`
  mutation DeletePost($ids: [ObjID]!) {
    removePost(ids: $ids)
  }
`;
