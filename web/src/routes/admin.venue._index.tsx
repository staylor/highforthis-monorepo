import { useLoaderData } from '@remix-run/react';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { gql } from 'graphql-tag';

import { name, slug, excludeFromSearch, website } from '~/components/Admin/Entity/ListTable';
import ListTable, { Thumbnail } from '~/components/Admin/ListTable';
import Search from '~/components/Admin/ListTable/Search';
import PermanentlyClosed from '~/components/Admin/Venue/PermanentlyClosed';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Columns } from '~/types';
import type { VenueConnection, VenuesAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import mutate, { parseFormData } from '~/utils/mutate';
import query, { addPageOffset, addSearchParam } from '~/utils/query';

export const loader: LoaderFunction = ({ request, context, params }) => {
  const variables = addSearchParam(request, addPageOffset(params));
  return query({
    request,
    context,
    query: venuesQuery,
    variables,
  });
};

export const action: ActionFunction = async ({ request, context }) => {
  if (request.method === 'POST') {
    const { id, excludeFromSearch, permanentlyClosed, formAction } = await parseFormData(request);
    let input;
    if (formAction === 'excludeFromSearch') {
      input = { excludeFromSearch };
    } else if (formAction === 'permanentlyClosed') {
      input = { permanentlyClosed };
    }

    return mutate({
      context,
      mutation: updateMutation,
      variables: {
        id,
        input,
      },
    });
  }
  return handleDelete({ request, context, mutation: deleteMutation });
};

export default function Venues() {
  const data = useLoaderData<VenuesAdminQuery>();
  const venues = data.venues as VenueConnection;

  const columns: Columns = [
    {
      className: 'w-16',
      render: (data: any) => {
        if (data.featuredMedia?.[0] && data.featuredMedia[0].type === 'image') {
          return <Thumbnail media={data.featuredMedia[0]} />;
        }

        return null;
      },
    },
    name,
    slug,
    website,
    {
      label: 'Capacity',
      prop: 'capacity',
    },
    {
      label: 'Address',
      prop: 'address',
    },
    excludeFromSearch,
    {
      label: 'Permanently Closed',
      className: 'text-center',
      render: (data: any) => <PermanentlyClosed data={data} />,
    },
  ];

  return (
    <>
      <Heading>Venues</Heading>
      <HeaderAdd label="Add Venue" />
      <Message param="deleted" text="Deleted %s Venues." />
      <Search placeholder="Search Venues" />
      <ListTable columns={columns} data={venues} />
    </>
  );
}

const venuesQuery = gql`
  query VenuesAdmin($after: String, $first: Int, $search: String) {
    venues(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          address
          capacity
          excludeFromSearch
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
          permanentlyClosed
          slug
          website
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
`;

const updateMutation = gql`
  mutation UpdateVenueExclude($id: ObjID!, $input: UpdateVenueInput!) {
    updateVenue(id: $id, input: $input) {
      id
    }
  }
`;

const deleteMutation = gql`
  mutation DeleteVenue($ids: [ObjID]!) {
    removeVenue(ids: $ids)
  }
`;
