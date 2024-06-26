import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import ShowForm from '@/components/Admin/Show/Form';
import { handleSubmission } from '@/utils/action';
import query from '@/utils/query';
import type { ShowEntitiesQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context }) => {
  return query({ request, context, query: showQuery });
};

export const action: ActionFunction = ({ request, context }) => {
  return handleSubmission({
    request,
    context,
    mutation: showMutation,
    createMutation: 'createShow',
    variables: { input: { attended: false } },
  });
};

export default function ShowAdd() {
  const data = useLoaderData<ShowEntitiesQuery>();
  return <ShowForm data={data} heading="Add Show" buttonLabel="Add Show" />;
}

const showQuery = gql`
  query ShowEntities {
    ...ShowForm_entities
  }
  ${ShowForm.fragments.entities}
`;

const showMutation = gql`
  mutation CreateShow($input: CreateShowInput!) {
    createShow(input: $input) {
      id
    }
  }
`;
