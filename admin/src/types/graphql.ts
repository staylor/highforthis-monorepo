import type * as Types from '@highforthis/shared/types/graphql';

export * from '@highforthis/shared/types/graphql';
type FeaturedMedia_Media_AudioUpload_Fragment = { __typename?: 'AudioUpload', destination: string, fileName: string, id: string, type: string };

type FeaturedMedia_Media_FileUpload_Fragment = { __typename?: 'FileUpload', destination: string, fileName: string, id: string, type: string };

type FeaturedMedia_Media_ImageUpload_Fragment = { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> };

type FeaturedMedia_Media_VideoUpload_Fragment = { __typename?: 'VideoUpload', destination: string, fileName: string, id: string, type: string };

export type FeaturedMedia_MediaFragment =
  | FeaturedMedia_Media_AudioUpload_Fragment
  | FeaturedMedia_Media_FileUpload_Fragment
  | FeaturedMedia_Media_ImageUpload_Fragment
  | FeaturedMedia_Media_VideoUpload_Fragment
;

export type Video_VideoFragment = { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> };

export type AppQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AppQuery = { __typename?: 'Query', apiKeys?: { __typename?: 'APIKeys', googleMaps?: string | null } | null, podcastSettings: { __typename?: 'PodcastSettings', description?: string | null, feedLink?: string | null, id: string, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: string } | null }, shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }> } | null, siteSettings: { __typename?: 'SiteSettings', copyrightText?: string | null, id: string, language?: string | null, siteTitle?: string | null, siteUrl?: string | null, tagline?: string | null } };
