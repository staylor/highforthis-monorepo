import { gql } from 'graphql-tag';

import { name, slug, excludeFromSearch, website } from '~/components/Admin/Entity/ListTable';
import ListTable from '~/components/Admin/ListTable';
import Search from '~/components/Admin/ListTable/Search';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Artwork from '~/components/Artist/Artwork';
import Message from '~/components/Form/Message';
import type { Columns } from '~/types';
import type { ArtistsAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import mutate, { parseFormData } from '~/utils/mutate';
import query, { addPageOffset, addSearchParam } from '~/utils/query';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  const variables = addSearchParam(request, addPageOffset(request));

  return query<ArtistsAdminQuery>({
    request,
    context,
    query: artistsQuery,
    variables,
  });
}

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method === 'POST') {
    const { id, excludeFromSearch } = await parseFormData(request);
    return mutate({
      context,
      mutation: updateMutation,
      variables: {
        id,
        input: {
          excludeFromSearch,
        },
      },
    });
  }
  return handleDelete({ request, context, mutation: deleteMutation });
}

export default function Artists({ loaderData }: Route.ComponentProps) {
  const columns: Columns = [
    {
      className: 'w-16',
      render: (data: any) => {
        if (data.appleMusic?.artwork) {
          return <Artwork name={data.name} data={data.appleMusic} imageSize={44} />;
        }

        return null;
      },
    },
    name,
    slug,
    excludeFromSearch,
    website,
  ];

  return (
    <>
      <Heading>Artists</Heading>
      <HeaderAdd label="Add Artist" />
      <Message param="deleted" text="Deleted %s Artists." />
      <Search placeholder="Search Artists" />
      <ListTable columns={columns} data={loaderData.artists!} />
    </>
  );
}

const artistsQuery = gql`
  query ArtistsAdmin($after: String, $first: Int, $search: String) {
    artists(after: $after, first: $first, search: $search) @cache(key: "admin") {
      count
      edges {
        node {
          appleMusic {
            artwork {
              url
            }
            id
            url
          }
          excludeFromSearch
          id
          name
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
  mutation UpdateArtistExclude($id: ObjID!, $input: UpdateArtistInput!) {
    updateArtist(id: $id, input: $input) {
      id
    }
  }
`;

const deleteMutation = gql`
  mutation DeleteArtist($ids: [ObjID]!) {
    removeArtist(ids: $ids)
  }
`;
