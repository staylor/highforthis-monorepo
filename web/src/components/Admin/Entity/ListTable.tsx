import { Thumbnail } from '../ListTable';

import Name from './Name';
import ExcludeFromSearch from './ExcludeFromSearch';

export const featuredMedia = {
  className: 'w-16',
  render: (data: any) => {
    if (data.featuredMedia?.[0] && data.featuredMedia[0].type === 'image') {
      return <Thumbnail media={data.featuredMedia[0]} />;
    }

    return null;
  },
};

export const name = {
  label: 'Name',
  render: (data: any) => <Name data={data} />,
};

export const slug = {
  label: 'Slug',
  prop: 'slug',
};

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
