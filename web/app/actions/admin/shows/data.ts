import { gql } from 'graphql-tag';

import {
  deleteSelected,
  submitForm,
  type FormArgs,
  type GraphQLClient,
  type RedirectResult,
} from '#/lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '#/lib/admin/list-variables.ts';
import { attempt } from '#/lib/graphql.ts';
import type {
  BulkCreateShowsMutation,
  ShowEditQuery,
  ShowEntitiesQuery,
  ShowsAdminQuery,
  UpdateShowAttendedMutation,
} from '#/types/graphql.ts';

import { parseBulkShowsCsv } from './bulk-csv.ts';

const showFormFragment = gql`
  fragment ShowForm_show on Show {
    id
    attended
    date
    notes
    title
    url
    artists {
      id
      name
    }
    venue {
      id
      name
    }
  }
`;

const showFormEntitiesFragment = gql`
  fragment ShowForm_entities on Query {
    artists(filtered: true, first: 500) {
      edges {
        node {
          id
          name
        }
      }
    }
    venues(filtered: true, first: 500) {
      edges {
        node {
          id
          name
        }
      }
    }
  }
`;

const showsQuery = gql`
  query ShowsAdmin($after: String, $first: Int, $order: ShowOrder, $search: String) {
    shows(after: $after, first: $first, order: $order, search: $search) {
      count
      edges {
        node {
          id
          attended
          date
          title
          url
          artists {
            id
            name
            slug
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

export function loadShows({
  gql: client,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams, { order: 'DESC' }));
  return client.query<ShowsAdminQuery>(showsQuery, variables);
}

/** The list's "attended" box. Resolves to whether it saved. */
export async function setShowAttended({
  gql: client,
  formData,
}: {
  gql: GraphQLClient;
  formData: FormData;
}) {
  const { data } = await attempt(
    client.mutate<UpdateShowAttendedMutation>(attendedMutation, {
      id: formData.get('id'),
      input: { attended: formData.get('attended') === 'true' },
    })
  );
  return Boolean(data?.updateShow);
}

export function deleteShows(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteShowMutation });
}

/** The add form starts from the last show added, with the artists and venues to pick from. */
export function loadNewShow({ gql: client }: { gql: GraphQLClient }) {
  return client.query<ShowEntitiesQuery>(newShowQuery);
}

export function createShow(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createShowMutation,
    createMutation: 'createShow',
    // An unchecked box isn't submitted
    variables: { input: { attended: false } },
    textFields,
  });
}

export function loadShow({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<ShowEditQuery>(showQuery, { id });
}

export function updateShow({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateShowMutation,
    // An unchecked box isn't submitted
    variables: { id, input: { attended: false } },
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
  return { redirectTo: `/admin/show?${search.toString()}` };
}
