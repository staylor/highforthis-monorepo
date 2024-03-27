import { gql } from 'graphql-tag';
import type { ActionFunction } from '@remix-run/server-runtime';

import PostForm from '@/components/Admin/Post/Form';
import { handleSubmission } from '@/utils/action';

export const action: ActionFunction = ({ request, context }) => {
  return handleSubmission({
    request,
    context,
    mutation: postMutation,
    createMutation: 'createPost',
  });
};

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
