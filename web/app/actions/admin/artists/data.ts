import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/actions/admin/media/data.ts';
import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
} from '#/lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '#/lib/admin/list-variables.ts';
import { attempt } from '#/lib/graphql.ts';
import { withEveryPage } from '#/lib/paging.ts';
import type {
  ArtistEditQuery,
  ArtistShowsAdminQuery,
  ArtistsAdminQuery,
  UpdateArtistExcludeMutation,
} from '#/types/graphql.ts';

const artistFormFragment = gql`
  fragment ArtistForm_artist on Artist {
    id
    description
    excludeFromSearch
    name
    slug
    website
    appleMusic {
      id
      artwork {
        url
      }
    }
    featuredMedia {
      ...FeaturedMedia_media
    }
  }
  ${featuredMediaFragment}
`;

const artistsQuery = gql`
  query ArtistsAdmin($after: String, $first: Int, $search: String) {
    artists(after: $after, first: $first, search: $search) {
      count
      edges {
        node {
          id
          excludeFromSearch
          name
          slug
          website
          appleMusic {
            id
            url
            artwork {
              url
            }
          }
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

// The artist's shows, beside the form, a page at a time
const artistShowsFragment = gql`
  fragment ArtistForm_shows on ShowConnection {
    edges {
      cursor
      node {
        id
        attended
        date
        venue {
          id
          name
        }
      }
    }
    pageInfo {
      hasNextPage
    }
  }
`;

const artistShowsQuery = gql`
  query ArtistShowsAdmin($id: String, $after: String) {
    shows(after: $after, artist: { id: $id }, first: 200) {
      ...ArtistForm_shows
    }
  }
  ${artistShowsFragment}
`;

const artistQuery = gql`
  query ArtistEdit($id: String) {
    artist(id: $id) {
      ...ArtistForm_artist
    }
    shows(artist: { id: $id }, first: 200) {
      ...ArtistForm_shows
    }
  }
  ${artistFormFragment}
  ${artistShowsFragment}
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

const textFields = ['name', 'slug', 'description', 'website'];

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
  const { data } = await attempt(
    client.mutate<UpdateArtistExcludeMutation>(excludeArtistMutation, {
      id: formData.get('id'),
      input: { excludeFromSearch: formData.get('excludeFromSearch') === 'true' },
    })
  );
  return Boolean(data?.updateArtist);
}

export function deleteArtists(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteArtistMutation });
}

export async function loadArtist({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  const data = await client.query<ArtistEditQuery>(artistQuery, { id });
  // Every show, so the list beside the form doesn't stop at the first page
  const shows =
    data.artist && data.shows
      ? await withEveryPage(
          data.shows,
          async (after) =>
            (await client.query<ArtistShowsAdminQuery>(artistShowsQuery, { after, id })).shows
        )
      : data.shows;
  return { ...data, shows };
}

export function createArtist(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createArtistMutation,
    createMutation: 'createArtist',
    textFields,
  });
}

export function updateArtist({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateArtistMutation,
    textFields,
    // An unchecked box isn't submitted, so this default clears it
    variables: { id, input: { excludeFromSearch: false } },
  });
}
