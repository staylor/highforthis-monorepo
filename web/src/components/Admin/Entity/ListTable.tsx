import { useFetcher } from 'react-router-dom';

import Checkbox from '@/components/Form/Checkbox';

import { RowActions, RowTitle, Thumbnail, usePath } from '../ListTable';

export const featuredMedia = {
  className: 'w-16',
  render: (data: any) => {
    if (data.featuredMedia?.[0] && data.featuredMedia[0].type === 'image') {
      return <Thumbnail media={data.featuredMedia[0]} />;
    }

    return null;
  },
};

function Name({ data }: { data: any }) {
  const path = usePath();
  const urlPath = `${path}/${data.id}`;

  return (
    <>
      <RowTitle url={urlPath} title={data.name} />
      <RowActions
        actions={[
          { type: 'edit', url: urlPath },
          { type: 'delete', url: urlPath, ids: [data.id] },
        ]}
      />
    </>
  );
}

export const name = {
  label: 'Name',
  render: (data: any) => <Name data={data} />,
};

export const slug = {
  label: 'Slug',
  prop: 'slug',
};

function ExcludeFromSearch({ data }: any) {
  const fetcher = useFetcher();
  const { id, excludeFromSearch } = data;
  return (
    <Checkbox
      checked={Boolean(excludeFromSearch)}
      onChange={(e) => {
        fetcher.submit(
          {
            id,
            excludeFromSearch: e.target.checked,
          },
          {
            method: 'POST',
          }
        );
      }}
    />
  );
}

export const excludeFromSearch = {
  label: 'Exclude from search',
  className: 'text-center',
  render: (data: any) => <ExcludeFromSearch data={data} />,
};

export const website = {
  label: 'Website',
  prop: 'website',
  render: (data: any) =>
    data?.website && (
      <a className="text-pink underline" href={data.website} target="_blank" rel="noreferrer">
        {data.website}
      </a>
    ),
};
