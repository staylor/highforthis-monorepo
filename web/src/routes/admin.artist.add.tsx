import { gql } from 'graphql-tag';
import type { ActionFunction } from '@remix-run/server-runtime';

import ArtistForm from '@/components/Admin/Artist/Form';
import { handleSubmission } from '@/utils/action';

export const action: ActionFunction = ({ request, context }) => {
  return handleSubmission({
    request,
    context,
    mutation: artistMutation,
    createMutation: 'createArtist',
  });
};

export default function ArtistAdd() {
  const label = 'Add Artist';
  return <ArtistForm heading={label} buttonLabel={label} />;
}

const artistMutation = gql`
  mutation CreateArtist($input: CreateArtistInput!) {
    createArtist(input: $input) {
      ...ArtistForm_artist
    }
  }
  ${ArtistForm.fragments.artist}
`;
