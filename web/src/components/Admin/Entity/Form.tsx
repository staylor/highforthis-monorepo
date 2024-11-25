import Shows from './Shows';

import FeaturedMedia from '@/components/Admin/Form/FeaturedMedia';
import Checkbox from '@/components/Form/Checkbox';
import type { FieldUnion } from '@/types';
import type { ShowConnection } from '@/types/graphql';

export const name = (field: string) => ({
  label: 'Name',
  prop: 'name',
  render: (data: any) => data[field]?.name,
});

export const slug = (field: string) => ({
  label: 'Slug',
  prop: 'slug',
  render: (data: any) => data[field]?.slug,
  condition: (data: any) => data[field]?.slug,
});

export const description = (field: string): FieldUnion => ({
  label: 'Description',
  prop: 'description',
  type: 'textarea',
  render: (data: any) => data[field]?.description,
});

export const website = (field: string): FieldUnion => ({
  label: 'Website',
  prop: 'website',
  render: (data: any) => data[field]?.website,
});

export const featuredMedia = (field: string): FieldUnion => ({
  label: 'Featured Media',
  prop: 'featuredMedia',
  type: 'custom',
  render: (data: any) => <FeaturedMedia media={data[field]?.featuredMedia || []} />,
});

export const shows = (dataKey: 'artists' | 'venue'): FieldUnion => ({
  label: 'Shows',
  type: 'custom',
  render: ({ shows }: { shows: ShowConnection }) => <Shows shows={shows} dataKey={dataKey} />,
  condition: ({ shows }: { shows: ShowConnection }) => shows?.edges?.length > 0,
  position: 'meta',
});

export const excludeFromSearch = (field: string): FieldUnion => ({
  label: 'Exclude from search',
  type: 'custom',
  render: (data: any) => (
    <Checkbox name="excludeFromSearch" checked={data[field]?.excludeFromSearch} />
  ),
});
