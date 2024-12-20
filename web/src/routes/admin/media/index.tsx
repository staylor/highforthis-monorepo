import { gql } from 'graphql-tag';
import debounce from 'lodash.debounce';
import { useLocation } from 'react-router';

import ListTable, { Thumbnail, RowTitle, RowActions } from '~/components/Admin/ListTable';
import { useUpdateQuery } from '~/components/Admin/ListTable/utils';
import { Heading, HeaderAdd } from '~/components/Admin/styles';
import Input from '~/components/Form/Input';
import Message from '~/components/Form/Message';
import Select from '~/components/Form/Select';
import Link from '~/components/Link';
import type { Columns } from '~/types';
import type { MediaUpload, UploadsAdminQuery } from '~/types/graphql';
import { handleDelete } from '~/utils/action';
import query, { addPageOffset } from '~/utils/query';

import type { Route } from './+types/index';

export async function loader({ request, context }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const variables = addPageOffset(request);
  ['type', 'mimeType', 'search'].forEach((key) => {
    const value = url.searchParams.get(key);
    if (value) {
      variables[key] = value;
    }
  });
  return query<UploadsAdminQuery>({ request, context, query: uploadsQuery, variables });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleDelete({ request, context, mutation: uploadsMutation });
}

export default function Media({ loaderData }: Route.ComponentProps) {
  const { uploads } = loaderData;
  const location = useLocation();
  const { updateQuery, searchParams } = useUpdateQuery();
  const querySearch = updateQuery('search');
  const updateSearch = debounce(querySearch, 600);
  const columns: Columns = [
    {
      className: 'w-16',
      render: (media: MediaUpload) => {
        if (media.type === 'audio') {
          return <Thumbnail media={media} />;
        }

        if (media.type === 'image') {
          return <Thumbnail media={media} />;
        }

        return null;
      },
    },
    {
      className: 'w-[60%]',
      label: 'Title',
      render: (media: MediaUpload) => {
        const editUrl = `${location.pathname}/${media.id}`;
        return (
          <>
            <RowTitle url={editUrl} title={media.title} subtitle={media.originalName} />
            <RowActions
              actions={[
                { type: 'edit', url: editUrl },
                { type: 'delete', url: editUrl, ids: [media.id] },
              ]}
            />
          </>
        );
      },
    },
    {
      label: 'Type',
      render: (media: MediaUpload) => {
        const search = new URLSearchParams();
        search.set('type', media.type);
        return (
          <Link to={{ pathname: location.pathname, search: search.toString() }}>{media.type}</Link>
        );
      },
    },
    {
      label: 'MIME type',
      render: (media: MediaUpload) => {
        const search = new URLSearchParams();
        search.set('mimeType', media.mimeType);
        return (
          <Link to={{ pathname: location.pathname, search: search.toString() }}>
            {media.mimeType}
          </Link>
        );
      },
    },
  ];
  const filters = (
    <>
      <Select
        key="type"
        className="mx-2"
        placeholder="Select Media Type"
        value={searchParams.get('type') || ''}
        choices={uploads?.types?.map((type: string) => ({
          value: type,
          label: type.charAt(0).toUpperCase() + type.substring(1),
        }))}
        onChange={updateQuery('type')}
      />
      <Select
        key="mimeType"
        className="mx-2"
        placeholder="Select MIME Type"
        value={searchParams.get('mimeType') || ''}
        choices={uploads?.mimeTypes || []}
        onChange={updateQuery('mimeType')}
      />
    </>
  );
  return (
    <>
      <Heading>Media</Heading>
      <HeaderAdd label="Add Media" to={`${location.pathname}/upload`} />
      <Message param="deleted" text="Deleted %s uploads." />
      <div className="float-right">
        <Input
          value={searchParams.get('search') || ''}
          placeholder="Search Media"
          onChange={updateSearch}
        />
      </div>
      <ListTable columns={columns} filters={filters} data={uploads!} />
    </>
  );
}

const uploadsQuery = gql`
  query UploadsAdmin(
    $after: String
    $first: Int
    $mimeType: String
    $search: String
    $type: String
  ) {
    uploads(after: $after, first: $first, mimeType: $mimeType, search: $search, type: $type)
      @cache(key: "admin") {
      count
      edges {
        node {
          destination
          id
          mimeType
          originalName
          title
          type
          ... on ImageUpload {
            crops {
              fileName
              width
            }
          }
          ... on AudioUpload {
            images {
              fileName
              width
            }
          }
        }
      }
      mimeTypes
      pageInfo {
        hasNextPage
      }
      types
    }
  }
`;

const uploadsMutation = gql`
  mutation DeleteMedia($ids: [ObjID]!) {
    removeMediaUpload(ids: $ids)
  }
`;
