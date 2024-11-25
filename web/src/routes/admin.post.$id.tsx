import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import PostForm from '~/components/Admin/Post/Form';
import type { Post, PostQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: postQuery, variables: { id: params.id } });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: postMutation,
    variables: { id: params.id },
  });
};

export default function PostEdit() {
  const data = useLoaderData<PostQuery>();
  const post = data.post as Post;
  return <PostForm data={post} heading="Edit Post" buttonLabel="Update Post" />;
}

const postQuery = gql`
  query PostEdit($id: ObjID!) {
    post(id: $id) {
      ...PostForm_post
    }
  }
  ${PostForm.fragments.post}
`;

const postMutation = gql`
  mutation UpdatePost($id: ObjID!, $input: UpdatePostInput!) {
    updatePost(id: $id, input: $input) {
      ...PostForm_post
    }
  }
  ${PostForm.fragments.post}
`;
