import { gql } from 'graphql-tag';

import { artistFormFragment } from '#/components/Admin/Artist/Form.graphql';
import type {
  ArtistEditQuery,
  ArtistsAdminQuery,
  UpdateArtistExcludeMutation,
} from '#/types/graphql';
import { addPageOffset, addSearchParam } from '#/utils/listVariables';

import { deleteSelected, parseForm, submitForm, type FormArgs } from './forms';
import type { GraphQLClient } from './graphql';

const artistsQuery = gql`
  query ArtistsAdmin($after: String, $first: Int, $search: String) {
    artists(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          appleMusic {
            artwork {
              url
            }
            id
            url
          }
          excludeFromSearch
          id
          name
          slug
          website
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const excludeArtistMutation = gql`
  mutation UpdateArtistExclude($id: String!, $input: UpdateArtistInput!) {
    updateArtist(id: $id, input: $input) {
      id
    }
  }
`;

const deleteArtistMutation = gql`
  mutation DeleteArtist($ids: [String]!) {
    removeArtist(ids: $ids)
  }
`;

const artistQuery = gql`
  query ArtistEdit($id: String) {
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
  ${artistFormFragment}
`;

const createArtistMutation = gql`
  mutation CreateArtist($input: CreateArtistInput!) {
    createArtist(input: $input) {
      ...ArtistForm_artist
    }
  }
  ${artistFormFragment}
`;

const updateArtistMutation = gql`
  mutation UpdateArtist($id: String!, $input: UpdateArtistInput!) {
    updateArtist(id: $id, input: $input) {
      ...ArtistForm_artist
    }
  }
  ${artistFormFragment}
`;

// keeps names like "311" strings
const skipKeys = ['name', 'slug'];

export function loadArtists({
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return gql.query<ArtistsAdminQuery>(artistsQuery, variables);
}

// The list's "exclude from search" checkbox
export function setArtistExcludeFromSearch({
  gql,
  formData,
}: {
  gql: GraphQLClient;
  formData: FormData;
}) {
  const { id, excludeFromSearch } = parseForm(formData);
  return gql.mutate<UpdateArtistExcludeMutation>(excludeArtistMutation, {
    id,
    input: { excludeFromSearch },
  });
}

export function deleteArtists(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteArtistMutation });
}

export function loadArtist({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<ArtistEditQuery>(artistQuery, { id });
}

export function createArtist(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createArtistMutation,
    createMutation: 'createArtist',
    skipKeys,
  });
}

export function updateArtist({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateArtistMutation,
    // an unchecked box isn't submitted, so this default clears it
    variables: { id, input: { excludeFromSearch: false } },
  });
}
