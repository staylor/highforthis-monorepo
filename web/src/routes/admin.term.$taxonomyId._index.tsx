import { gql } from 'graphql-tag';
import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';

import { Heading, HeaderAdd } from '@/components/Admin/styles';
import ListTable, { RowTitle, RowActions, Thumbnail, usePath } from '@/components/Admin/ListTable';
import Message from '@/components/Form/Message';
import query, { addPageOffset } from '@/utils/query';
import { handleDelete } from '@/utils/action';
import type { Term, TermConnection, TermsAdminQuery } from '@/types/graphql';
import type { Columns } from '@/types';

export const loader: LoaderFunction = ({ request, context, params }) => {
  return query({
    request,
    context,
    query: termsQuery,
    variables: addPageOffset(params, { taxonomyId: params.taxonomyId }),
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  return handleDelete({ request, context, mutation: termsMutation });
};

export default function Terms() {
  const path = usePath();
  const data = useLoaderData<TermsAdminQuery>();
  const terms = data.terms as TermConnection;

  let columns: Columns = [
    {
      className: 'w-16',
      render: (term: Term) => {
        if (term.featuredMedia && term.featuredMedia[0] && term.featuredMedia[0].type === 'image') {
          return <Thumbnail media={term.featuredMedia[0]} />;
        }

        return null;
      },
    },
    {
      label: 'Name',
      render: (term: Term) => {
        const urlPath = `${path}/${term.id}`;

        return (
          <>
            <RowTitle url={urlPath} title={term.name} />
            <RowActions
              actions={[
                { type: 'edit', url: urlPath },
                { type: 'delete', url: urlPath, ids: [term.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Slug',
      prop: 'slug',
    },
  ];

  if (['artist', 'venue'].includes(terms.taxonomy.slug)) {
    columns.push({
      label: 'Website',
      prop: 'website',
    });
  }

  if (['venue'].includes(terms.taxonomy.slug)) {
    columns.push(
      {
        label: 'Capacity',
        prop: 'capacity',
      },
      {
        label: 'Address',
        prop: 'address',
      }
    );
  }

  return (
    <>
      <Heading>{terms.taxonomy.plural}</Heading>
      <HeaderAdd label={`Add ${terms.taxonomy.name}`} />
      <Message param="deleted" text={`Deleted %s ${terms.taxonomy.plural}}.`} />
      <ListTable columns={columns} data={terms} />
    </>
  );
}

const termsQuery = gql`
  query TermsAdmin(
    $after: String
    $first: Int
    $search: String
    $taxonomy: String
    $taxonomyId: ObjID!
  ) {
    terms(
      after: $after
      first: $first
      search: $search
      taxonomy: $taxonomy
      taxonomyId: $taxonomyId
    ) @cache(key: "admin") {
      count
      edges {
        node {
          featuredMedia {
            ... on ImageUpload {
              crops {
                fileName
                width
              }
              destination
              id
              type
            }
          }
          id
          name
          slug
          taxonomy {
            id
          }
          website
          ... on Venue {
            address
            capacity
          }
        }
      }
      pageInfo {
        hasNextPage
      }
      taxonomy {
        id
        name
        plural
        slug
      }
    }
  }
`;

const termsMutation = gql`
  mutation DeleteTerm($ids: [ObjID]!) {
    removeTerm(ids: $ids)
  }
`;
