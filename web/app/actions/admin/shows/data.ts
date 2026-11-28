import { gql } from 'graphql-tag';

import {
  deleteSelected,
  saveFlag,
  submitForm,
  type FlagArgs,
  type FormArgs,
  type GraphQLClient,
  type RedirectResult,
} from '#/lib/admin/forms.ts';
import { listVariables, type ListArgs } from '#/lib/admin/list-variables.ts';
import { attempt } from '#/lib/graphql.ts';
import { withEveryPage } from '#/lib/paging.ts';
import { routes } from '#/routes.ts';
import type {
  BulkCreateShowsMutation,
  ShowEditQuery,
  ShowEntitiesQuery,
  ShowFormArtistsQuery,
  ShowFormVenuesQuery,
  ShowsAdminQuery,
} from '#/types/graphql.ts';

import { parseBulkShowsCsv } from './bulk-csv.ts';

const showFormFragment = gql`
  fragment ShowForm_show on Show {
    id
    attended
    notes
    title
    url
    artists {
      id
      name
    }
    schedule {
      localDate
      localTime
      timeZone
    }
    venue {
      id
      name
    }
  }
`;

// The artists and venues to pick from, a page at a time
const showFormArtistsFragment = gql`
  fragment ShowForm_artists on ArtistConnection {
    edges {
      cursor
      node {
        id
        name
      }
    }
    pageInfo {
      hasNextPage
    }
  }
`;

const showFormVenuesFragment = gql`
  fragment ShowForm_venues on VenueConnection {
    edges {
      cursor
      node {
        id
        name
      }
    }
    pageInfo {
      hasNextPage
    }
  }
`;

const showFormEntitiesFragment = gql`
  fragment ShowForm_entities on Query {
    artists(filtered: true, first: 500) {
      ...ShowForm_artists
    }
    venues(filtered: true, first: 500) {
      ...ShowForm_venues
    }
  }
  ${showFormArtistsFragment}
  ${showFormVenuesFragment}
`;

const showFormArtistsQuery = gql`
  query ShowFormArtists($after: String) {
    artists(after: $after, filtered: true, first: 500) {
      ...ShowForm_artists
    }
  }
  ${showFormArtistsFragment}
`;

const showFormVenuesQuery = gql`
  query ShowFormVenues($after: String) {
    venues(after: $after, filtered: true, first: 500) {
      ...ShowForm_venues
    }
  }
  ${showFormVenuesFragment}
`;

const showsQuery = gql`
  query ShowsAdmin($after: String, $first: Int, $order: ShowOrder, $search: String) {
    shows(after: $after, first: $first, order: $order, search: $search) {
      count
      edges {
        node {
          id
          attended
          title
          url
          artists {
            id
            name
            slug
          }
          schedule {
            localDate
            localTime
          }
          venue {
            id
            name
            slug
          }
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const attendedMutation = gql`
  mutation UpdateShowAttended($id: String!, $input: UpdateShowInput!) {
    updateShow(id: $id, input: $input) {
      id
    }
  }
`;

const deleteShowMutation = gql`
  mutation DeleteShow($ids: [String]!) {
    removeShow(ids: $ids)
  }
`;

const newShowQuery = gql`
  query ShowEntities {
    ...ShowForm_entities
    show(lastAdded: true) {
      ...ShowForm_show
    }
  }
  ${showFormFragment}
  ${showFormEntitiesFragment}
`;

const createShowMutation = gql`
  mutation CreateShow($input: CreateShowInput!) {
    createShow(input: $input) {
      id
    }
  }
`;

const showQuery = gql`
  query ShowEdit($id: String!) {
    ...ShowForm_entities
    show(id: $id) {
      ...ShowForm_show
    }
  }
  ${showFormFragment}
  ${showFormEntitiesFragment}
`;

const updateShowMutation = gql`
  mutation UpdateShow($id: String!, $input: UpdateShowInput!) {
    updateShow(id: $id, input: $input) {
      ...ShowForm_show
    }
  }
  ${showFormFragment}
`;

const bulkCreateShowsMutation = gql`
  mutation BulkCreateShows($input: [BulkCreateShowInput!]!) {
    bulkCreateShows(input: $input) {
      artistsCreated
      showsCreated
      venuesCreated
    }
  }
`;

const textFields = ['title', 'notes', 'url'];

export function loadShows({ gql: client, searchParams }: ListArgs) {
  return client.query<ShowsAdminQuery>(showsQuery, listVariables(searchParams, { order: 'DESC' }));
}

/** The list's "attended" box. Resolves to whether it saved. */
export function saveShowFlag(args: FlagArgs) {
  return saveFlag({ ...args, mutation: attendedMutation });
}

export function deleteShows(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteShowMutation });
}

type Choices = Pick<ShowEntitiesQuery, 'artists' | 'venues'>;

/**
 * Every artist and venue to pick from. The form's query has the first page of each, and a picker
 * missing the rest would leave out whatever comes after it alphabetically.
 */
async function everyChoice(client: GraphQLClient, { artists, venues }: Choices): Promise<Choices> {
  const [allArtists, allVenues] = await Promise.all([
    artists &&
      withEveryPage(
        artists,
        async (after) =>
          (await client.query<ShowFormArtistsQuery>(showFormArtistsQuery, { after })).artists
      ),
    venues &&
      withEveryPage(
        venues,
        async (after) =>
          (await client.query<ShowFormVenuesQuery>(showFormVenuesQuery, { after })).venues
      ),
  ]);
  return { artists: allArtists, venues: allVenues };
}

/** The add form starts from the last show added, with the artists and venues to pick from. */
export async function loadNewShow({ gql: client }: { gql: GraphQLClient }) {
  const data = await client.query<ShowEntitiesQuery>(newShowQuery);
  return { ...data, ...(await everyChoice(client, data)) };
}

export function createShow(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createShowMutation,
    createMutation: 'createShow',
    // An unchecked box isn't submitted, and neither are the artists when none are picked, which
    // GraphQL turns down: a show needs an artist
    variables: { input: { attended: false, artists: [] } },
    textFields,
  });
}

export async function loadShow({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  const data = await client.query<ShowEditQuery>(showQuery, { id });
  return data.show ? { ...data, ...(await everyChoice(client, data)) } : data;
}

export function updateShow({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateShowMutation,
    // An unchecked box isn't submitted, and neither are the artists once every one is removed.
    // Leaving them out would keep the lineup and say the show was saved.
    variables: { id, input: { attended: false, artists: [] } },
    textFields,
  });
}

/** The CSV the bulk add page posted back, with a message for each line that's wrong. */
export interface BulkImportErrors {
  csv: string;
  errors: { line: number; message: string }[];
}

/**
 * Imports the shows pasted into the bulk add page. On errors the page comes back with the CSV and
 * a message per line; otherwise the shows list says how many were created.
 */
export async function importShows({
  gql: client,
  formData,
}: {
  gql: GraphQLClient;
  formData: FormData;
}): Promise<BulkImportErrors | RedirectResult> {
  const csv = formData.get('csv')?.toString() ?? '';
  const parsed = parseBulkShowsCsv(csv);

  if (parsed.errors.length > 0) {
    return { csv, errors: parsed.errors };
  }

  const { data } = await attempt(
    client.mutate<BulkCreateShowsMutation>(bulkCreateShowsMutation, { input: parsed.shows })
  );
  const imported = data?.bulkCreateShows;

  if (!imported) {
    return {
      csv,
      errors: [{ line: 1, message: 'The shows could not be imported. Please try again.' }],
    };
  }

  const search = new URLSearchParams({
    artistsCreated: imported.artistsCreated.toString(),
    imported: imported.showsCreated.toString(),
    venuesCreated: imported.venuesCreated.toString(),
  });
  return { redirectTo: `${routes.admin.shows.list.index.href()}?${search}` };
}
