import { gql } from 'graphql-tag';

import ArtistForm from '~/components/Admin/Artist/Form';
import { handleSubmission } from '~/utils/action';

import type { Route } from './+types/add';

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: artistMutation,
    createMutation: 'createArtist',
    parseFormDataArgs: {
      // allows "311" to be sent as string
      skipKeys: ['name', 'slug'],
    },
  });
}

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
