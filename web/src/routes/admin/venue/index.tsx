import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router';

import { name, slug, excludeFromSearch, website } from '~/components/Admin/Entity/ListTable';
import ListTable, { Thumbnail } from '~/components/Admin/ListTable';
import Search from '~/components/Admin/ListTable/Search';
import PermanentlyClosed from '~/components/Admin/Venue/PermanentlyClosed';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Message from '~/components/Form/Message';
import type { Columns } from '~/types';
import type { VenuesAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import mutate, { parseFormData } from '~/utils/mutate';
import query, { addPageOffset, addSearchParam } from '~/utils/query';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  const variables = addSearchParam(request, addPageOffset(request));
  return query<VenuesAdminQuery>({
    request,
    context,
    query: venuesQuery,
    variables,
  });
}

export async function action({ request, context }: Route.ActionArgs) {
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
}

export default function Venues({ loaderData }: Route.ComponentProps) {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const count = Number(searchParams.get('deleted') || 0);
  const { venues } = loaderData;

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
    name(i18n),
    slug(i18n),
    website(i18n),
    {
      label: t('venues.capacity'),
      prop: 'capacity',
    },
    {
      label: t('venues.address'),
      prop: 'address',
    },
    excludeFromSearch(i18n),
    {
      label: t('venues.permanentlyClosed'),
      className: 'text-center',
      render: (data: any) => <PermanentlyClosed data={data} />,
    },
  ];

  return (
    <>
      <Heading>{t('venues.heading')}</Heading>
      <HeaderAdd label={t('venues.add')} />
      {count > 0 && <Message param="deleted" text={t('venues.deleted', { count })} />}
      <Search placeholder={t('venues.search')} />
      <ListTable columns={columns} data={venues!} />
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
