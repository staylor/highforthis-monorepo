import { gql } from 'graphql-tag';

import {
  deleteSelected,
  parseForm,
  submitForm,
  type FormArgs,
  type GraphQLClient,
  type RedirectResult,
} from '../../../lib/admin/forms.ts';
import { addPageOffset, addSearchParam } from '../../../lib/admin/list-variables.ts';
import type {
  BulkCreateShowsMutation,
  ShowEditQuery,
  ShowEntitiesQuery,
  ShowsAdminQuery,
  UpdateShowAttendedMutation,
} from '../../../types/graphql.ts';

import { parseBulkShowsCsv } from './bulk-csv.ts';

const showFormFragment = gql`
  fragment ShowForm_show on Show {
    artists {
      id
      name
    }
    attended
    date
    id
    notes
    title
    url
    venue {
      id
      name
    }
  }
`;

const showFormEntitiesFragment = gql`
  fragment ShowForm_entities on Query {
    artists(filtered: true, first: 500) @cache(key: "admin") {
      edges {
        node {
          id
          name
        }
      }
    }
    venues(filtered: true, first: 500) @cache(key: "admin") {
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
    shows(after: $after, first: $first, order: $order, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          artists {
            id
            name
            slug
          }
          attended
          date
          id
          title
          url
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
    show(lastAdded: true) {
      ...ShowForm_show
    }
    ...ShowForm_entities
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
    show(id: $id) {
      ...ShowForm_show
    }
    ...ShowForm_entities
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
  const { id, attended } = parseForm(formData);
  const result = await client.mutate<UpdateShowAttendedMutation>(attendedMutation, {
    id,
    input: { attended: attended === true },
  });
  return Boolean(result.updateShow);
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
  });
}

export function loadShow({ gql: client, id }: { gql: GraphQLClient; id: string }) {
  return client.query<ShowEditQuery>(showQuery, { id });
}

export function updateShow({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateShowMutation,
    // The form leaves out empty fields and unchecked boxes, so these defaults clear them
    variables: { id, input: { attended: false, notes: null, title: null, url: null } },
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

  const result = await client.mutate<Partial<BulkCreateShowsMutation>>(bulkCreateShowsMutation, {
    input: parsed.shows,
  });
  const imported = result.bulkCreateShows;

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
