import { gql } from 'graphql-tag';

import ArtistForm from '~/components/Admin/Artist/Form';
import type { ArtistEditQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<ArtistEditQuery>({
    request,
    context,
    query: artistQuery,
    variables: { id: params.id },
  });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: artistMutation,
    variables: { id: params.id, input: { excludeFromSearch: false } },
  });
}

export default function ArtistEdit({ loaderData }: Route.ComponentProps) {
  const label = 'Edit Artist';
  return <ArtistForm data={loaderData} heading={label} buttonLabel={label} />;
}

const artistQuery = gql`
  query ArtistEdit($id: ObjID) {
    artist(id: $id) {
      ...ArtistForm_artist
    }
    shows(artist: { id: $id }, first: 200) {
      edges {
        node {
          artists {
            id
            name
          }
          attended
          date
          id
          venue {
            id
            name
          }
        }
      }
    }
  }
  ${ArtistForm.fragments.artist}
`;

const artistMutation = gql`
  mutation UpdateArtist($id: ObjID!, $input: UpdateArtistInput!) {
    updateArtist(id: $id, input: $input) {
      ...ArtistForm_artist
    }
  }
  ${ArtistForm.fragments.artist}
`;
