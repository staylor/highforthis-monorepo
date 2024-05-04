import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import ArtistForm from '@/components/Admin/Artist/Form';
import query from '@/utils/query';
import { handleSubmission } from '@/utils/action';
import type { ArtistEditQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({
    request,
    context,
    query: artistQuery,
    variables: { id: params.id },
  });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: artistMutation,
    variables: { id: params.id },
  });
};

export default function ArtistEdit() {
  const data = useLoaderData<ArtistEditQuery>();
  const label = 'Edit Artist';
  return <ArtistForm data={data} heading={label} buttonLabel={label} />;
}

const artistQuery = gql`
  query ArtistEdit($id: ObjID) {
    artist(id: $id) {
      ...ArtistForm_artist
    }
    shows(artistId: $id, first: 200) {
      edges {
        node {
          artist {
            id
            name
          }
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
