import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import ShowForm from '~/components/Admin/Show/Form';
import type { ShowEntitiesQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/add';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<ShowEntitiesQuery>({ request, context, query: showQuery });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    request,
    context,
    mutation: showMutation,
    createMutation: 'createShow',
    variables: { input: { attended: false } },
  });
}

export default function ShowAdd({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  return <ShowForm data={loaderData} heading={t('show.add')} buttonLabel={t('show.add')} />;
}

const showQuery = gql`
  query ShowEntities {
    show(lastAdded: true) {
      ...ShowForm_show
    }
    ...ShowForm_entities
  }
  ${ShowForm.fragments.show}
  ${ShowForm.fragments.entities}
`;

const showMutation = gql`
  mutation CreateShow($input: CreateShowInput!) {
    createShow(input: $input) {
      id
    }
  }
`;
