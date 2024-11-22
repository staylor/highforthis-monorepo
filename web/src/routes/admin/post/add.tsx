import { gql } from 'graphql-tag';

import PostForm from '~/components/Admin/Post/Form';
import { handleSubmission } from '~/utils/action';

import type { Route } from './+types/add';

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: postMutation,
    createMutation: 'createPost',
  });
}

export default function PostAdd() {
  return <PostForm heading="Add Post" buttonLabel="Add Post" />;
}

const postMutation = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostForm_post
    }
  }
  ${PostForm.fragments.post}
`;
