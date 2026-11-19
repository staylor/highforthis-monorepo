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

type MediaForm_Media_AudioUpload_Fragment = { __typename?: 'AudioUpload', description?: string | null, duration?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number } | null> | null };

type MediaForm_Media_FileUpload_Fragment = { __typename?: 'FileUpload', description?: string | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string };

type MediaForm_Media_ImageUpload_Fragment = { __typename?: 'ImageUpload', altText?: string | null, caption?: string | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number }> };

type MediaForm_Media_VideoUpload_Fragment = { __typename?: 'VideoUpload', description?: string | null, duration?: number | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string };

export type MediaForm_MediaFragment =
  | MediaForm_Media_AudioUpload_Fragment
  | MediaForm_Media_FileUpload_Fragment
  | MediaForm_Media_ImageUpload_Fragment
  | MediaForm_Media_VideoUpload_Fragment
;

export type TextNodes_LinebreakNodeFragment = { __typename?: 'LinebreakNode', type?: string | null, version?: number | null };

export type TextNodes_TextNodeFragment = { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: Types.TextModeType | null, style?: string | null, text?: string | null, textFormat?: number | null, textStyle?: string | null, type?: string | null, version?: number | null };

export type PostForm_PostFragment = { __typename?: 'Post', date?: number | null, id: string, slug: string, status?: Types.PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: string, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
        | { __typename?: 'CodeNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, language?: string | null, children?: Array<
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
        | { __typename?: 'ImageNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, size?: string | null, image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
        | { __typename?: 'LinebreakNode' }
        | { __typename?: 'ListItemNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null }
        | { __typename?: 'ListNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, listType?: Types.ListType | null, start?: number | null, children?: Array<
            | { __typename?: 'CodeNode' }
            | { __typename?: 'ElementNode' }
            | { __typename?: 'HeadingNode' }
            | { __typename?: 'ImageNode' }
            | { __typename?: 'LinebreakNode' }
            | { __typename?: 'ListItemNode', checked?: boolean | null, direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, value?: number | null, version?: number | null, children?: Array<
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
    | { __typename?: 'AudioUpload', destination: string, fileName: string, id: string, type: string }
    | { __typename?: 'FileUpload', destination: string, fileName: string, id: string, type: string }
    | { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
    | { __typename?: 'VideoUpload', destination: string, fileName: string, id: string, type: string }
  > | null };

export type ShowForm_ShowFragment = { __typename?: 'Show', attended?: boolean | null, date: number, id: string, notes?: string | null, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string }>, venue: { __typename?: 'Venue', id: string, name: string } };

export type ShowForm_EntitiesFragment = { __typename?: 'Query', artists?: { __typename?: 'ArtistConnection', edges: Array<{ __typename?: 'ArtistEdge', node: { __typename?: 'Artist', id: string, name: string } }> } | null, venues?: { __typename?: 'VenueConnection', edges: Array<{ __typename?: 'VenueEdge', node: { __typename?: 'Venue', id: string, name: string } }> } | null };

export type Video_VideoFragment = { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> };

export type AppQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type AppQuery = { __typename?: 'Query', apiKeys?: { __typename?: 'APIKeys', googleMaps?: string | null } | null, podcastSettings: { __typename?: 'PodcastSettings', description?: string | null, feedLink?: string | null, id: string, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: string } | null }, shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: string, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }> } | null, siteSettings: { __typename?: 'SiteSettings', copyrightText?: string | null, id: string, language?: string | null, siteTitle?: string | null, siteUrl?: string | null, tagline?: string | null } };

export type VenueListingsAdminQueryVariables = Types.Exact<{
  venueId: Types.Scalars['String']['input'];
  withListings: Types.Scalars['Boolean']['input'];
}>;


export type VenueListingsAdminQuery = { __typename?: 'Query', venues?: { __typename?: 'VenueConnection', edges: Array<{ __typename?: 'VenueEdge', node: { __typename?: 'Venue', id: string, listingsUrl?: string | null, name: string } }> } | null, venueListings?: { __typename?: 'VenueListings', error?: string | null, source?: string | null, listings: Array<{ __typename?: 'Listing', cancelled: boolean, dateChanged: boolean, headliners: Array<string>, localDate?: string | null, localTime?: string | null, newArtists: Array<string>, sourceId: string, status?: string | null, support: Array<string>, url?: string | null, show?: { __typename?: 'Show', id: string } | null }> } };

export type ImportListingsMutationVariables = Types.Exact<{
  venueId: Types.Scalars['String']['input'];
  input: Array<Types.ImportListingInput> | Types.ImportListingInput;
}>;


export type ImportListingsMutation = { __typename?: 'Mutation', importListings: { __typename?: 'ImportListingsResult', artistsCreated: number, showsCreated: number } };

export type UploadsAdminQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  mimeType?: Types.InputMaybe<Types.Scalars['String']['input']>;
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  type?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type UploadsAdminQuery = { __typename?: 'Query', uploads?: { __typename?: 'MediaUploadConnection', count: number, mimeTypes?: Array<string> | null, types?: Array<string> | null, edges: Array<{ __typename?: 'MediaUploadEdge', node:
        | { __typename?: 'AudioUpload', destination: string, id: string, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number } | null> | null }
        | { __typename?: 'FileUpload', destination: string, id: string, mimeType: string, originalName: string, title?: string | null, type: string }
        | { __typename?: 'ImageUpload', destination: string, id: string, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
        | { __typename?: 'VideoUpload', destination: string, id: string, mimeType: string, originalName: string, title?: string | null, type: string }
       }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeleteMediaMutationVariables = Types.Exact<{
  ids: Array<Types.InputMaybe<Types.Scalars['String']['input']>> | Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type DeleteMediaMutation = { __typename?: 'Mutation', removeMediaUpload?: boolean | null };

export type MediaAdminQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type MediaAdminQuery = { __typename?: 'Query', media?:
    | { __typename?: 'AudioUpload', description?: string | null, duration?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number } | null> | null }
    | { __typename?: 'FileUpload', description?: string | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string }
    | { __typename?: 'ImageUpload', altText?: string | null, caption?: string | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number }> }
    | { __typename?: 'VideoUpload', description?: string | null, duration?: number | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string }
   | null };

export type UpdateMediaMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.UpdateMediaUploadInput;
}>;


export type UpdateMediaMutation = { __typename?: 'Mutation', updateMediaUpload?:
    | { __typename?: 'AudioUpload', description?: string | null, duration?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number } | null> | null }
    | { __typename?: 'FileUpload', description?: string | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string }
    | { __typename?: 'ImageUpload', altText?: string | null, caption?: string | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number }> }
    | { __typename?: 'VideoUpload', description?: string | null, duration?: number | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: string, mimeType: string, originalName: string, title?: string | null, type: string }
   | null };

export type AlbumCoversAdminQueryVariables = Types.Exact<{
  term: Types.Scalars['String']['input'];
}>;


export type AlbumCoversAdminQuery = { __typename?: 'Query', appleMusicAlbums: { __typename?: 'AppleMusicAlbumResults', error?: string | null, albums: Array<{ __typename?: 'AppleMusicAlbum', id: string, name: string, artistName: string, releaseDate?: string | null, cover: string, artwork: { __typename?: 'AppleMusicArtwork', width?: number | null, height?: number | null } }> } };

export type AddAlbumCoversMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type AddAlbumCoversMutation = { __typename?: 'Mutation', addAlbumCovers: Array<
    | { __typename?: 'AudioUpload', id: string }
    | { __typename?: 'FileUpload', id: string }
    | { __typename?: 'ImageUpload', id: string }
    | { __typename?: 'VideoUpload', id: string }
  > };

export type MediaModalQueryVariables = Types.Exact<{
  cursor?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  type?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type MediaModalQuery = { __typename?: 'Query', uploads?: { __typename?: 'MediaUploadConnection', edges: Array<{ __typename?: 'MediaUploadEdge', node:
        | { __typename?: 'AudioUpload', destination: string, fileName: string, id: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number } | null> | null }
        | { __typename?: 'FileUpload', destination: string, fileName: string, id: string, title?: string | null, type: string }
        | { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
        | { __typename?: 'VideoUpload', destination: string, fileName: string, id: string, title?: string | null, type: string }
       }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage?: boolean | null } } | null };

export type VideoModalQueryVariables = Types.Exact<{
  cursor?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
}>;


export type VideoModalQuery = { __typename?: 'Query', videos?: { __typename?: 'VideoConnection', edges: Array<{ __typename?: 'VideoEdge', node: { __typename?: 'Video', dataId: string, id: string, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage?: boolean | null } } | null };

export type PostsAdminQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type PostsAdminQuery = { __typename?: 'Query', posts?: { __typename?: 'PostConnection', count: number, edges: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', date?: number | null, id: string, slug: string, status?: Types.PostStatus | null, title: string } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeletePostMutationVariables = Types.Exact<{
  ids: Array<Types.InputMaybe<Types.Scalars['String']['input']>> | Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type DeletePostMutation = { __typename?: 'Mutation', removePost?: boolean | null };

export type PostEditQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type PostEditQuery = { __typename?: 'Query', post?: { __typename?: 'Post', date?: number | null, id: string, slug: string, status?: Types.PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: string, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
          | { __typename?: 'CodeNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, language?: string | null, children?: Array<
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
          | { __typename?: 'ImageNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, size?: string | null, image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
          | { __typename?: 'LinebreakNode' }
          | { __typename?: 'ListItemNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null }
          | { __typename?: 'ListNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, listType?: Types.ListType | null, start?: number | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode' }
              | { __typename?: 'ListItemNode', checked?: boolean | null, direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, value?: number | null, version?: number | null, children?: Array<
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
      | { __typename?: 'AudioUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'FileUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
      | { __typename?: 'VideoUpload', destination: string, fileName: string, id: string, type: string }
    > | null } | null };

export type CreatePostMutationVariables = Types.Exact<{
  input: Types.CreatePostInput;
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost?: { __typename?: 'Post', date?: number | null, id: string, slug: string, status?: Types.PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: string, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
          | { __typename?: 'CodeNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, language?: string | null, children?: Array<
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
          | { __typename?: 'ImageNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, size?: string | null, image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
          | { __typename?: 'LinebreakNode' }
          | { __typename?: 'ListItemNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null }
          | { __typename?: 'ListNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, listType?: Types.ListType | null, start?: number | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode' }
              | { __typename?: 'ListItemNode', checked?: boolean | null, direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, value?: number | null, version?: number | null, children?: Array<
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
      | { __typename?: 'AudioUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'FileUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
      | { __typename?: 'VideoUpload', destination: string, fileName: string, id: string, type: string }
    > | null } | null };

export type UpdatePostMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.UpdatePostInput;
}>;


export type UpdatePostMutation = { __typename?: 'Mutation', updatePost?: { __typename?: 'Post', date?: number | null, id: string, slug: string, status?: Types.PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: string, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<
          | { __typename?: 'CodeNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, language?: string | null, children?: Array<
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
          | { __typename?: 'ImageNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, size?: string | null, image?: { __typename?: 'ImageUpload', destination: string, id: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null }
          | { __typename?: 'LinebreakNode' }
          | { __typename?: 'ListItemNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null }
          | { __typename?: 'ListNode', direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, listType?: Types.ListType | null, start?: number | null, children?: Array<
              | { __typename?: 'CodeNode' }
              | { __typename?: 'ElementNode' }
              | { __typename?: 'HeadingNode' }
              | { __typename?: 'ImageNode' }
              | { __typename?: 'LinebreakNode' }
              | { __typename?: 'ListItemNode', checked?: boolean | null, direction?: Types.ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, value?: number | null, version?: number | null, children?: Array<
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
      | { __typename?: 'AudioUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'FileUpload', destination: string, fileName: string, id: string, type: string }
      | { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> }
      | { __typename?: 'VideoUpload', destination: string, fileName: string, id: string, type: string }
    > | null } | null };

export type SiteSettingsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type SiteSettingsQuery = { __typename?: 'Query', siteSettings: { __typename?: 'SiteSettings', copyrightText?: string | null, emailAddress?: string | null, id: string, language?: string | null, siteTitle?: string | null, siteUrl?: string | null, tagline?: string | null } };

export type UpdateSiteSettingsMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.SiteSettingsInput;
}>;


export type UpdateSiteSettingsMutation = { __typename?: 'Mutation', updateSiteSettings?: { __typename?: 'SiteSettings', id: string } | null };

export type MediaSettingsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type MediaSettingsQuery = { __typename?: 'Query', mediaSettings: { __typename?: 'MediaSettings', id: string, crops: Array<{ __typename?: 'MediaCropSetting', height?: number | null, name: string, width?: number | null }> } };

export type UpdateMediaSettingsMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.MediaSettingsInput;
}>;


export type UpdateMediaSettingsMutation = { __typename?: 'Mutation', updateMediaSettings?: { __typename?: 'MediaSettings', id: string } | null };

export type PodcastSettingsQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type PodcastSettingsQuery = { __typename?: 'Query', podcastSettings: { __typename?: 'PodcastSettings', category?: string | null, copyrightText?: string | null, description?: string | null, explicit?: string | null, feedLink?: string | null, generator?: string | null, id: string, itunesEmail?: string | null, itunesName?: string | null, language?: string | null, managingEditor?: string | null, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } };

export type UpdatePodcastSettingsMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.PodcastSettingsInput;
}>;


export type UpdatePodcastSettingsMutation = { __typename?: 'Mutation', updatePodcastSettings?: { __typename?: 'PodcastSettings', id: string } | null };

export type ShowsAdminQueryVariables = Types.Exact<{
  after?: Types.InputMaybe<Types.Scalars['String']['input']>;
  artist?: Types.InputMaybe<Types.EntityArg>;
  date?: Types.InputMaybe<Types.Scalars['Float']['input']>;
  first?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  order?: Types.InputMaybe<Types.ShowOrder>;
  search?: Types.InputMaybe<Types.Scalars['String']['input']>;
  venue?: Types.InputMaybe<Types.EntityArg>;
}>;


export type ShowsAdminQuery = { __typename?: 'Query', shows?: { __typename?: 'ShowConnection', count?: number | null, edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', attended?: boolean | null, date: number, id: string, title?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string, slug: string }>, venue: { __typename?: 'Venue', id: string, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type UpdateShowAttendedMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.UpdateShowInput;
}>;


export type UpdateShowAttendedMutation = { __typename?: 'Mutation', updateShow?: { __typename?: 'Show', id: string } | null };

export type DeleteShowMutationVariables = Types.Exact<{
  ids: Array<Types.InputMaybe<Types.Scalars['String']['input']>> | Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type DeleteShowMutation = { __typename?: 'Mutation', removeShow?: boolean | null };

export type ShowEntitiesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type ShowEntitiesQuery = { __typename?: 'Query', show?: { __typename?: 'Show', attended?: boolean | null, date: number, id: string, notes?: string | null, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string }>, venue: { __typename?: 'Venue', id: string, name: string } } | null, artists?: { __typename?: 'ArtistConnection', edges: Array<{ __typename?: 'ArtistEdge', node: { __typename?: 'Artist', id: string, name: string } }> } | null, venues?: { __typename?: 'VenueConnection', edges: Array<{ __typename?: 'VenueEdge', node: { __typename?: 'Venue', id: string, name: string } }> } | null };

export type CreateShowMutationVariables = Types.Exact<{
  input: Types.CreateShowInput;
}>;


export type CreateShowMutation = { __typename?: 'Mutation', createShow?: { __typename?: 'Show', id: string } | null };

export type ShowEditQueryVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
}>;


export type ShowEditQuery = { __typename?: 'Query', show?: { __typename?: 'Show', attended?: boolean | null, date: number, id: string, notes?: string | null, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string }>, venue: { __typename?: 'Venue', id: string, name: string } } | null, artists?: { __typename?: 'ArtistConnection', edges: Array<{ __typename?: 'ArtistEdge', node: { __typename?: 'Artist', id: string, name: string } }> } | null, venues?: { __typename?: 'VenueConnection', edges: Array<{ __typename?: 'VenueEdge', node: { __typename?: 'Venue', id: string, name: string } }> } | null };

export type UpdateShowMutationVariables = Types.Exact<{
  id: Types.Scalars['String']['input'];
  input: Types.UpdateShowInput;
}>;


export type UpdateShowMutation = { __typename?: 'Mutation', updateShow?: { __typename?: 'Show', attended?: boolean | null, date: number, id: string, notes?: string | null, title?: string | null, url?: string | null, artists: Array<{ __typename?: 'Artist', id: string, name: string }>, venue: { __typename?: 'Venue', id: string, name: string } } | null };

export type BulkCreateShowsMutationVariables = Types.Exact<{
  input: Array<Types.BulkCreateShowInput> | Types.BulkCreateShowInput;
}>;


export type BulkCreateShowsMutation = { __typename?: 'Mutation', bulkCreateShows: { __typename?: 'BulkCreateShowsResult', artistsCreated: number, showsCreated: number, venuesCreated: number } };
