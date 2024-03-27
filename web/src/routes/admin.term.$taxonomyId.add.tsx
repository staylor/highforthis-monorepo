import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import TermForm from '@/components/Admin/Term/Form';
import { handleSubmission } from '@/utils/action';
import query from '@/utils/query';
import type { TermTaxonomyQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({ request, context, query: termQuery, variables: { id: params.taxonomyId } });
};

export const action: ActionFunction = ({ request, context }) => {
  return handleSubmission({
    request,
    context,
    mutation: termMutation,
    createMutation: 'createTerm',
  });
};

export default function TermAdd() {
  const data = useLoaderData<TermTaxonomyQuery>();
  const label = `Add ${data.taxonomy?.name}`;
  return <TermForm data={data} heading={label} buttonLabel={label} />;
}

const termQuery = gql`
  query TermTaxonomy($id: ObjID) {
    neighborhoods: terms(first: 250, taxonomy: "neighborhood") @cache(key: "admin") {
      ...TermForm_terms
    }
    taxonomy(id: $id) {
      id
      name
      plural
      slug
    }
  }
  ${TermForm.fragments.terms}
`;

const termMutation = gql`
  mutation CreateTerm($input: CreateTermInput!) {
    createTerm(input: $input) {
      ...TermForm_term
    }
  }
  ${TermForm.fragments.term}
`;
