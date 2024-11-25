import ExcludeFromSearch from './ExcludeFromSearch';
import Name from './Name';

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
