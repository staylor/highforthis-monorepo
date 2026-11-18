import { gql } from 'graphql-tag';

import { showFormEntitiesFragment, showFormFragment } from '#/components/Admin/Show/Form.graphql';
import type {
  BulkCreateShowsMutation,
  ShowEditQuery,
  ShowEntitiesQuery,
  ShowsAdminQuery,
  UpdateShowAttendedMutation,
} from '#/types/graphql';
import { addPageOffset, addSearchParam } from '#/utils/listVariables';

import { parseBulkShowsCsv } from './bulkShowsCsv';
import { deleteSelected, parseForm, submitForm, type FormArgs, type RedirectResult } from './forms';
import type { GraphQLClient } from './graphql';

const showsQuery = gql`
  query ShowsAdmin(
    $after: String
    $artist: EntityArg
    $date: Float
    $first: Int
    $order: ShowOrder
    $search: String
    $venue: EntityArg
  ) {
    shows(
      after: $after
      artist: $artist
      date: $date
      first: $first
      order: $order
      search: $search
      venue: $venue
    ) @cache(key: "admin") {
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
  gql,
  searchParams,
}: {
  gql: GraphQLClient;
  searchParams: URLSearchParams;
}) {
  const variables = addSearchParam(searchParams, addPageOffset(searchParams, { order: 'DESC' }));
  return gql.query<ShowsAdminQuery>(showsQuery, variables);
}

// The list's "attended" checkbox
export function setShowAttended({ gql, formData }: { gql: GraphQLClient; formData: FormData }) {
  const { id, attended } = parseForm(formData);
  return gql.mutate<UpdateShowAttendedMutation>(attendedMutation, { id, input: { attended } });
}

export function deleteShows(args: FormArgs) {
  return deleteSelected({ ...args, mutation: deleteShowMutation });
}

// The add form starts from the last show added, along with the artists and venues to pick from
export function loadNewShow({ gql }: { gql: GraphQLClient }) {
  return gql.query<ShowEntitiesQuery>(newShowQuery);
}

export function createShow(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: createShowMutation,
    createMutation: 'createShow',
    // an unchecked box isn't submitted
    variables: { input: { attended: false } },
  });
}

export function loadShow({ gql, id }: { gql: GraphQLClient; id: string }) {
  return gql.query<ShowEditQuery>(showQuery, { id });
}

export function updateShow({ id, ...args }: FormArgs & { id: string }) {
  return submitForm({
    ...args,
    mutation: updateShowMutation,
    // the form leaves out empty fields and unchecked boxes, so these defaults clear them
    variables: { id, input: { attended: false, notes: null, title: null, url: null } },
  });
}

interface BulkImportErrors {
  csv: string;
  errors: { line: number; message: string }[];
}

// Imports the shows pasted into the bulk form as CSV. On errors the form comes back with the
// CSV and a message per line; otherwise the shows list says how many were created.
export async function importShows({
  gql,
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

  const result = await gql.mutate<Partial<BulkCreateShowsMutation>>(bulkCreateShowsMutation, {
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
