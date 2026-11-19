import { gql } from 'graphql-tag';

import {
  deleteSelected,
  parseForm,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '../../../lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '../../../lib/admin/list-variables.ts';
import type {
  ArtistEditQuery,
  ArtistsAdminQuery,
  UpdateArtistExcludeMutation,
} from '../../../types/graphql.ts';
import { featuredMediaFragment } from '../media/data.ts';

const artistFormFragment = gql`
  fragment ArtistForm_artist on Artist {
    appleMusic {
      artwork {
        url
      }
      id
    }
    description
    excludeFromSearch
    featuredMedia {
      ...FeaturedMedia_media
    }
    id
    name
    slug
    website
  }
  ${featuredMediaFragment}
`;

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

// Keeps names like "311" strings, when saving a new artist and an edited one
const skipKeys = ['name', 'slug'];

export function loadArtists({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams));
  return client.query<ArtistsAdminQuery>(artistsQuery, variables);
}

/** The list's "exclude from search" box. Resolves to whether it saved. */
export async function setArtistExcludeFromSearch({
  gql: client,
  formData,
}: {
  gql: GraphQLClient;
  formData: FormData;
}) {
  const { id, excludeFromSearch } = parseForm(formData);
  const result = await client.mutate<UpdateArtistExcludeMutation>(excludeArtistMutation, {
    id,
    input: { excludeFromSearch: excludeFromSearch === true },
  });
  return Boolean(result.updateArtist);
}

export function deleteArtists(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteArtistMutation });
}

export function loadArtist({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<ArtistEditQuery>(artistQuery, { id });
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
    skipKeys,
    // An unchecked box isn't submitted, so this default clears it
    variables: { id, input: { excludeFromSearch: false } },
  });
}
