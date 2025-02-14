import type { i18n } from 'i18next';

import FeaturedMedia from '~/components/Admin/Form/FeaturedMedia';
import Checkbox from '~/components/Form/Checkbox';
import type { FieldUnion } from '~/types';
import type { ShowConnection } from '~/types/graphql';

import Shows from './Shows';

export const name = (field: string, i18n: i18n) => ({
  label: i18n.t('entity.name'),
  prop: 'name',
  render: (data: any) => data[field]?.name,
});

export const slug = (field: string, i18n: i18n) => ({
  label: i18n.t('entity.slug'),
  prop: 'slug',
  render: (data: any) => data[field]?.slug,
  condition: (data: any) => data[field]?.slug,
});

export const description = (field: string, i18n: i18n): FieldUnion => ({
  label: i18n.t('entity.description'),
  prop: 'description',
  type: 'textarea',
  render: (data: any) => data[field]?.description,
});

export const website = (field: string, i18n: i18n): FieldUnion => ({
  label: i18n.t('entity.website'),
  prop: 'website',
  render: (data: any) => data[field]?.website,
});

export const featuredMedia = (field: string, i18n: i18n): FieldUnion => ({
  label: i18n.t('entity.featuredMedia'),
  prop: 'featuredMedia',
  type: 'custom',
  render: (data: any) => <FeaturedMedia media={data[field]?.featuredMedia || []} />,
});

export const shows = (dataKey: 'artists' | 'venue', i18n: i18n): FieldUnion => ({
  label: i18n.t('entity.shows'),
  type: 'custom',
  render: ({ shows }: { shows: ShowConnection }) => <Shows shows={shows} dataKey={dataKey} />,
  condition: ({ shows }: { shows: ShowConnection }) => shows?.edges?.length > 0,
  position: 'meta',
});

export const excludeFromSearch = (field: string, i18n: i18n): FieldUnion => ({
  label: i18n.t('entity.excludeFromSearch'),
  type: 'custom',
  render: (data: any) => (
    <Checkbox name="excludeFromSearch" checked={data[field]?.excludeFromSearch} />
  ),
});
