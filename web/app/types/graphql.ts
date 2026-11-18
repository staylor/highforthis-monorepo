import type * as Types from '@highforthis/shared/types/graphql';

export * from '@highforthis/shared/types/graphql';
export type ArtistQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  slug: Types.Scalars['String']['input'];
}>;


export type ArtistQuery = { __typename?: 'Query', artist?: { __typename?: 'Artist', id: string, name: string, website?: string | null, appleMusic?: { __typename?: 'AppleMusicData', id?: string | null, url?: string | null, artwork?: { __typename?: 'AppleMusicArtwork', url?: string | null } | null } | null } | null, attended?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', city?: string | null, id: string, name: string, slug: string, state?: string | null } } }> } | null, shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type VenueQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  slug: Types.Scalars['String']['input'];
}>;


export type VenueQuery = { __typename?: 'Query', attended?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', city?: string | null, id: string, name: string, slug: string, state?: string | null } } }> } | null, shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null, venue?: { __typename?: 'Venue', address?: string | null, capacity?: string | null, id: string, name: string, permanentlyClosed?: boolean | null, website?: string | null, coordinates?: { __typename?: 'VenueCoordinates', latitude?: number | null, longitude?: number | null } | null, featuredMedia?: Array<
      | { __typename?: 'AudioUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'FileUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
      | { __typename?: 'VideoUpload', destination: string, fileName: string, id: string, type: string }
    > | null } | null };

export type HomeQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  cacheKey?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  year?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type HomeQuery = { __typename?: 'Query', posts?: { __typename?: 'PostConnection', edges: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', id: string, slug: string, summary?: string | null, title: string, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode', image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
              | { __typename?: 'LinebreakNode' }
              | { __typename?: 'ListItemNode' }
              | { __typename?: 'ListNode' }
              | { __typename?: 'QuoteNode' }
              | { __typename?: 'TextNode' }
              | { __typename?: 'VideoNode' }
             | null> | null } | null } | null, featuredMedia?: Array<
          | { __typename?: 'AudioUpload', destination: string, id: string }
          | { __typename?: 'FileUpload', destination: string, id: string }
          | { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
          | { __typename?: 'VideoUpload', destination: string, id: string }
        > | null } }> } | null, videos?: { __typename?: 'VideoConnection', count: number, edges: Array<{ __typename?: 'VideoEdge', cursor: string, node: { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null } } | null };

export type PodcastsQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type PodcastsQuery = { __typename?: 'Query', podcasts?: { __typename?: 'PodcastConnection', edges: Array<{ __typename?: 'PodcastEdge', node: { __typename?: 'Podcast', description: string, id: string, title: string } }> } | null };

export type PodcastQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type PodcastQuery = { __typename?: 'Query', podcast?: { __typename?: 'Podcast', description: string, id: string, title: string, audio?: { __typename?: 'AudioUpload', destination: string, duration?: number | null, fileName: string, id: string } | null } | null };

export type PodcastFeedQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type PodcastFeedQuery = { __typename?: 'Query', podcasts?: { __typename?: 'PodcastConnection', edges: Array<{ __typename?: 'PodcastEdge', node: { __typename?: 'Podcast', date?: number | null, description: string, id: string, title: string, audio?: { __typename?: 'AudioUpload', destination: string, duration?: number | null, fileName: string, fileSize: number, id: string } | null } }> } | null, podcastSettings: { __typename?: 'PodcastSettings', category?: string | null, copyrightText?: string | null, description?: string | null, explicit?: string | null, feedLink?: string | null, generator?: string | null, id: string, itunesEmail?: string | null, itunesName?: string | null, language?: string | null, managingEditor?: string | null, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: string } | null } };

export type PostsQueryVariables = Types.Exact<{
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type PostsQuery = { __typename?: 'Query', posts?: { __typename?: 'PostConnection', edges: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', id: string, slug: string, summary?: string | null, title: string, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode', image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
              | { __typename?: 'LinebreakNode' }
              | { __typename?: 'ListItemNode' }
              | { __typename?: 'ListNode' }
              | { __typename?: 'QuoteNode' }
              | { __typename?: 'TextNode' }
              | { __typename?: 'VideoNode' }
             | null> | null } | null } | null, featuredMedia?: Array<
          | { __typename?: 'AudioUpload', destination: string, id: string }
          | { __typename?: 'FileUpload', destination: string, id: string }
          | { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
          | { __typename?: 'VideoUpload', destination: string, id: string }
        > | null } }> } | null };

export type PostQueryVariables = Types.Exact<{
  slug?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type PostQuery = { __typename?: 'Query', post?: { __typename?: 'Post', id: string, slug: string, summary?: string | null, title: string, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
          | { __typename?: 'CodeNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null }
              | { __typename?: 'ListItemNode' }
              | { __typename?: 'ListNode' }
              | { __typename?: 'QuoteNode' }
              | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: Types.TextModeType | null, style?: string | null, text?: string | null, textFormat?: number | null, textStyle?: string | null, type?: string | null, version?: number | null }
              | { __typename?: 'VideoNode' }
             | null> | null }
          | { __typename?: 'ElementNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null }
              | { __typename?: 'ListItemNode' }
              | { __typename?: 'ListNode' }
              | { __typename?: 'QuoteNode' }
              | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: Types.TextModeType | null, style?: string | null, text?: string | null, textFormat?: number | null, textStyle?: string | null, type?: string | null, version?: number | null }
              | { __typename?: 'VideoNode' }
             | null> | null }
          | { __typename?: 'HeadingNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, tag?: Types.HeadingTag | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null }
              | { __typename?: 'ListItemNode' }
              | { __typename?: 'ListNode' }
              | { __typename?: 'QuoteNode' }
              | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: Types.TextModeType | null, style?: string | null, text?: string | null, textFormat?: number | null, textStyle?: string | null, type?: string | null, version?: number | null }
              | { __typename?: 'VideoNode' }
             | null> | null }
          | { __typename?: 'ImageNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
          | { __typename?: 'LinebreakNode' }
          | { __typename?: 'ListItemNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null }
          | { __typename?: 'ListNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, listType?: Types.ListType | null, start?: number | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode' }
              | { __typename?: 'ListItemNode', children?: Array<
                  | { __typename?: 'CodeNode' }
                  | { __typename?: 'ElementNode' }
                  | { __typename?: 'HeadingNode' }
                  | { __typename?: 'ImageNode' }
                  | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null }
                  | { __typename?: 'ListItemNode' }
                  | { __typename?: 'ListNode' }
                  | { __typename?: 'QuoteNode' }
                  | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: Types.TextModeType | null, style?: string | null, text?: string | null, textFormat?: number | null, textStyle?: string | null, type?: string | null, version?: number | null }
                  | { __typename?: 'VideoNode' }
                 | null> | null }
              | { __typename?: 'ListNode' }
              | { __typename?: 'QuoteNode' }
              | { __typename?: 'TextNode' }
              | { __typename?: 'VideoNode' }
             | null> | null }
          | { __typename?: 'QuoteNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null }
              | { __typename?: 'ListItemNode' }
              | { __typename?: 'ListNode' }
              | { __typename?: 'QuoteNode' }
              | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: Types.TextModeType | null, style?: string | null, text?: string | null, textFormat?: number | null, textStyle?: string | null, type?: string | null, version?: number | null }
              | { __typename?: 'VideoNode' }
             | null> | null }
          | { __typename?: 'TextNode' }
          | { __typename?: 'VideoNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, video?: { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null }
         | null> | null } | null } | null, featuredMedia?: Array<
      | { __typename?: 'AudioUpload', destination: string, id: string }
      | { __typename?: 'FileUpload', destination: string, id: string }
      | { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
      | { __typename?: 'VideoUpload', destination: string, id: string }
    > | null } | null };

export type AppQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AppQuery = { __typename?: 'Query', apiKeys?: { __typename?: 'APIKeys', googleMaps?: string | null } | null, podcastSettings: { __typename?: 'PodcastSettings', description?: string | null, feedLink?: string | null, id: string, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: string } | null }, shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }> } | null, siteSettings: { __typename?: 'SiteSettings', copyrightText?: string | null, id: string, language?: string | null, siteTitle?: string | null, siteUrl?: string | null, tagline?: string | null } };

export type ShowsQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type ShowsQuery = { __typename?: 'Query', shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type ShowsHistoryQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  year?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type ShowsHistoryQuery = { __typename?: 'Query', shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type ShowStatsQueryVariables = Types.Exact<{
  entity: Types.ShowEntityType;
}>;


export type ShowStatsQuery = { __typename?: 'Query', showStats: Array<{ __typename?: 'ShowStat', count: number, entity:
      | { __typename?: 'Artist', id: string, name: string, slug: string }
      | { __typename?: 'Venue', id: string, name: string, slug: string }
     }> };

export type ShowQueryVariables = Types.Exact<{
  id?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type ShowQuery = { __typename?: 'Query', show?: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string, appleMusic?: { __typename?: 'AppleMusicData', id?: string | null, artwork?: { __typename?: 'AppleMusicArtwork', url?: string | null } | null } | null }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } | null };

export type VideosQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  before?: Types.InputMaybe<Types.Scalars['String']['input']>;
  cacheKey?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  last?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  year?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type VideosQuery = { __typename?: 'Query', videos?: { __typename?: 'VideoConnection', count: number, edges: Array<{ __typename?: 'VideoEdge', cursor: string, node: { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null } } | null };

export type VideoQueryVariables = Types.Exact<{
  slug?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type VideoQuery = { __typename?: 'Query', video?: { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null };

export type PostArtwork_PostFragment = { __typename?: 'Post', editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', children?: Array<
        | { __typename?: 'CodeNode' }
        | { __typename?: 'ElementNode' }
        | { __typename?: 'HeadingNode' }
        | { __typename?: 'ImageNode', image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
        | { __typename?: 'LinebreakNode' }
        | { __typename?: 'ListItemNode' }
        | { __typename?: 'ListNode' }
        | { __typename?: 'QuoteNode' }
        | { __typename?: 'TextNode' }
        | { __typename?: 'VideoNode' }
       | null> | null } | null } | null, featuredMedia?: Array<
    | { __typename?: 'AudioUpload', destination: string, id: string }
    | { __typename?: 'FileUpload', destination: string, id: string }
    | { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
    | { __typename?: 'VideoUpload', destination: string, id: string }
  > | null };

export type TextNodes_LinebreakNodeFragment = { __typename?: 'LinebreakNode', type?: string | null, version?: number | null };

export type TextNodes_TextNodeFragment = { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: Types.TextModeType | null, style?: string | null, text?: string | null, textFormat?: number | null, textStyle?: string | null, type?: string | null, version?: number | null };

export type ShowsGrid_ShowsFragment = { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } };

export type Attended_ShowsFragment = { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', city?: string | null, id: string, name: string, slug: string, state?: string | null } } }> };

export type Video_VideoFragment = { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> };

export type Videos_VideosFragment = { __typename?: 'Query', videos?: { __typename?: 'VideoConnection', count: number, edges: Array<{ __typename?: 'VideoEdge', cursor: string, node: { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null } } | null };
