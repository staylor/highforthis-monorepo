import { gql } from 'graphql-tag';

import PostForm from '~/components/Admin/Post/Form';
import type { Post, PostQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<PostQuery>({ request, context, query: postQuery, variables: { id: params.id } });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: postMutation,
    variables: { id: params.id },
  });
}

export default function PostEdit({ loaderData }: Route.ComponentProps) {
  const { post } = loaderData;
  if (!post) {
    return null;
  }

  return <PostForm data={post as Post} heading="Edit Post" buttonLabel="Update Post" />;
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
