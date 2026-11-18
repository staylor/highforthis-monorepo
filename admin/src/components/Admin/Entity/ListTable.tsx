import type { i18n } from 'i18next';

import ExcludeFromSearch from './ExcludeFromSearch';
import Name from './Name';

export const name = (i18n: i18n) => ({
  label: i18n.t('entity.name'),
  render: (data: any) => <Name data={data} />,
});

export const slug = (i18n: i18n) => ({
  label: i18n.t('entity.slug'),
  prop: 'slug',
});

export const excludeFromSearch = (i18n: i18n) => ({
  label: i18n.t('entity.excludeFromSearch'),
  className: 'text-center',
  render: (data: any) => <ExcludeFromSearch data={data} />,
});

export const website = (i18n: i18n) => ({
  label: i18n.t('entity.website'),
  prop: 'website',
  render: (data: any) =>
    data?.website && (
      <a className="text-pink underline" href={data.website} target="_blank" rel="noreferrer">
        {data.website}
      </a>
    ),
});
