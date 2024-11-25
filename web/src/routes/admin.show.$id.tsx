import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import ShowForm from '~/components/Admin/Show/Form';
import type { ShowEditQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: showQuery, variables: { id: params.id } });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: showMutation,
    variables: { id: params.id, input: { attended: false } },
  });
};

export default function ShowEdit() {
  const data = useLoaderData<ShowEditQuery>();
  return <ShowForm data={data} heading="Edit Show" buttonLabel="Update Show" />;
}

const showQuery = gql`
  query ShowEdit($id: ObjID!) {
    show(id: $id) {
      ...ShowForm_show
    }
    ...ShowForm_entities
  }
  ${ShowForm.fragments.show}
  ${ShowForm.fragments.entities}
`;

const showMutation = gql`
  mutation UpdateShow($id: ObjID!, $input: UpdateShowInput!) {
    updateShow(id: $id, input: $input) {
      ...ShowForm_show
    }
  }
  ${ShowForm.fragments.show}
`;
