import { gql } from 'graphql-tag';

import ShowForm from '~/components/Admin/Show/Form';
import type { ShowEditQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/edit';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return query<ShowEditQuery>({ request, context, query: showQuery, variables: { id: params.id } });
}

export async function action({ request, context, params }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: showMutation,
    variables: { id: params.id, input: { attended: false } },
  });
}

export default function ShowEdit({ loaderData }: Route.ComponentProps) {
  return <ShowForm data={loaderData} heading="Edit Show" buttonLabel="Update Show" />;
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
