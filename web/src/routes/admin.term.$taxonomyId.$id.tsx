import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import TermForm from '@/components/Admin/Term/Form';
import query from '@/utils/query';
import { handleSubmission } from '@/utils/action';
import type { TermEditQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: termQuery, variables: { id: params.id } });
};

export const action: ActionFunction = ({ request, context, params }) => {
  return handleSubmission({
    request,
    context,
    mutation: termMutation,
    variables: { id: params.id },
  });
};

export default function TermEdit() {
  const data = useLoaderData<TermEditQuery>();
  const label = `Edit ${data.term?.taxonomy.name}`;
  return <TermForm data={data} heading={label} buttonLabel={label} />;
}

const termQuery = gql`
  query TermEdit($id: ObjID) {
    neighborhoods: terms(first: 250, taxonomy: "neighborhood") @cache(key: "admin") {
      ...TermForm_terms
    }
    term(id: $id) {
      ...TermForm_term
    }
  }
  ${TermForm.fragments.term}
  ${TermForm.fragments.terms}
`;

const termMutation = gql`
  mutation UpdateTerm($id: ObjID!, $input: UpdateTermInput!) {
    updateTerm(id: $id, input: $input) {
      ...TermForm_term
    }
  }
  ${TermForm.fragments.term}
`;
