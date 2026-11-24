/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type * as Types from './schema.ts';

export * from './schema.ts';
export type AppleMusicArtworkInput = {
  bgColor?: string | null | undefined;
  height?: number | null | undefined;
  textColor1?: string | null | undefined;
  textColor2?: string | null | undefined;
  textColor3?: string | null | undefined;
  textColor4?: string | null | undefined;
  url?: string | null | undefined;
  width?: number | null | undefined;
};

export type AppleMusicDataInput = {
  artwork?: AppleMusicArtworkInput | null | undefined;
  genreNames?: Array<string> | null | undefined;
  id?: string | null | undefined;
  url?: string | null | undefined;
};

export type BulkCreateShowInput = {
  artists: Array<string>;
  attended?: boolean | null | undefined;
  date: number;
  venue: string;
};

export type CreateArtistInput = {
  description?: string | null | undefined;
  excludeFromSearch?: boolean | null | undefined;
  featuredMedia?: Array<string | null | undefined> | null | undefined;
  name: string;
  slug?: string | null | undefined;
  website?: string | null | undefined;
};

export type CreatePodcastInput = {
  audio?: string | null | undefined;
  description?: string | null | undefined;
  image?: string | null | undefined;
  title: string;
};

export type CreatePostInput = {
  artists?: Array<string | null | undefined> | null | undefined;
  date?: number | null | undefined;
  editorState?: EditorStateInput | null | undefined;
  featuredMedia?: Array<string | null | undefined> | null | undefined;
  status?: PostStatus | null | undefined;
  summary?: string | null | undefined;
  title: string;
};

export type CreateShowInput = {
  artists: Array<string>;
  attended?: boolean | null | undefined;
  date: number;
  notes?: string | null | undefined;
  title?: string | null | undefined;
  url?: string | null | undefined;
  venue: string;
};

export type CreateUserInput = {
  bio?: string | null | undefined;
  email?: string | null | undefined;
  name?: string | null | undefined;
  password?: string | null | undefined;
  roles?: Array<string | null | undefined> | null | undefined;
};

export type CreateVenueInput = {
  capacity?: string | null | undefined;
  city?: string | null | undefined;
  coordinates?: VenueCoordinatesInput | null | undefined;
  description?: string | null | undefined;
  excludeFromSearch?: boolean | null | undefined;
  featuredMedia?: Array<string | null | undefined> | null | undefined;
  listingsUrl?: string | null | undefined;
  name: string;
  permanentlyClosed?: boolean | null | undefined;
  postalCode?: string | null | undefined;
  slug?: string | null | undefined;
  state?: string | null | undefined;
  streetAddress?: string | null | undefined;
  website?: string | null | undefined;
};

export type EditorNodeInput = {
  checked?: boolean | null | undefined;
  children?: Array<EditorNodeInput | null | undefined> | null | undefined;
  detail?: number | null | undefined;
  direction?: ElementDirection | null | undefined;
  format?: number | null | undefined;
  imageId?: string | null | undefined;
  indent?: number | null | undefined;
  language?: string | null | undefined;
  listType?: ListType | null | undefined;
  mode?: TextModeType | null | undefined;
  size?: string | null | undefined;
  start?: number | null | undefined;
  style?: string | null | undefined;
  tag?: string | null | undefined;
  text?: string | null | undefined;
  textFormat?: number | null | undefined;
  textStyle?: string | null | undefined;
  type?: string | null | undefined;
  value?: number | null | undefined;
  version?: number | null | undefined;
  videoId?: string | null | undefined;
};

export type EditorStateInput = {
  root?: RootNodeInput | null | undefined;
};

export const ElementDirection = {
  Ltr: 'ltr',
  Rtl: 'rtl'
} as const;

export type ElementDirection = typeof ElementDirection[keyof typeof ElementDirection];
export const HeadingTag = {
  H1: 'h1',
  H2: 'h2',
  H3: 'h3',
  H4: 'h4',
  H5: 'h5',
  H6: 'h6'
} as const;

export type HeadingTag = typeof HeadingTag[keyof typeof HeadingTag];
export type ImportListingInput = {
  artists: Array<string>;
  sourceId: string;
};

export const ListType = {
  Bullet: 'bullet',
  Check: 'check',
  Number: 'number'
} as const;

export type ListType = typeof ListType[keyof typeof ListType];
export type MediaCropSettingInput = {
  height?: number | null | undefined;
  name?: string | null | undefined;
  width?: number | null | undefined;
};

export type MediaSettingsInput = {
  crops?: Array<MediaCropSettingInput | null | undefined> | null | undefined;
};

export type PodcastSettingsInput = {
  category?: string | null | undefined;
  copyrightText?: string | null | undefined;
  description?: string | null | undefined;
  explicit?: string | null | undefined;
  feedLink?: string | null | undefined;
  generator?: string | null | undefined;
  image?: string | null | undefined;
  itunesEmail?: string | null | undefined;
  itunesName?: string | null | undefined;
  language?: string | null | undefined;
  managingEditor?: string | null | undefined;
  title?: string | null | undefined;
  websiteLink?: string | null | undefined;
};

export const PostStatus = {
  Draft: 'DRAFT',
  Publish: 'PUBLISH'
} as const;

export type PostStatus = typeof PostStatus[keyof typeof PostStatus];
export type RootNodeInput = {
  children?: Array<EditorNodeInput | null | undefined> | null | undefined;
  direction?: ElementDirection | null | undefined;
  format?: number | null | undefined;
  indent?: number | null | undefined;
  type?: string | null | undefined;
  version?: number | null | undefined;
};

export const ShowEntityType = {
  Artist: 'ARTIST',
  Venue: 'VENUE'
} as const;

export type ShowEntityType = typeof ShowEntityType[keyof typeof ShowEntityType];
export const ShowOrder = {
  Asc: 'ASC',
  Desc: 'DESC'
} as const;

export type ShowOrder = typeof ShowOrder[keyof typeof ShowOrder];
export type SiteSettingsInput = {
  copyrightText?: string | null | undefined;
  emailAddress?: string | null | undefined;
  language?: string | null | undefined;
  siteTitle?: string | null | undefined;
  siteUrl?: string | null | undefined;
  tagline?: string | null | undefined;
};

export const TextModeType = {
  Normal: 'normal',
  Segmented: 'segmented',
  Token: 'token'
} as const;

export type TextModeType = typeof TextModeType[keyof typeof TextModeType];
export type UpdateArtistInput = {
  appleMusic?: AppleMusicDataInput | null | undefined;
  description?: string | null | undefined;
  excludeFromSearch?: boolean | null | undefined;
  featuredMedia?: Array<string | null | undefined> | null | undefined;
  name?: string | null | undefined;
  slug?: string | null | undefined;
  website?: string | null | undefined;
};

export type UpdateMediaUploadInput = {
  altText?: string | null | undefined;
  caption?: string | null | undefined;
  description?: string | null | undefined;
  title?: string | null | undefined;
};

export type UpdatePodcastInput = {
  audio?: string | null | undefined;
  description?: string | null | undefined;
  image?: string | null | undefined;
  title: string;
};

export type UpdatePostInput = {
  artists?: Array<string | null | undefined> | null | undefined;
  date?: number | null | undefined;
  editorState?: EditorStateInput | null | undefined;
  featuredMedia?: Array<string | null | undefined> | null | undefined;
  status?: PostStatus | null | undefined;
  summary?: string | null | undefined;
  title?: string | null | undefined;
};

export type UpdateShowInput = {
  artists?: Array<string | null | undefined> | null | undefined;
  attended?: boolean | null | undefined;
  date?: number | null | undefined;
  notes?: string | null | undefined;
  title?: string | null | undefined;
  url?: string | null | undefined;
  venue?: string | null | undefined;
};

export type UpdateUserInput = {
  bio?: string | null | undefined;
  email?: string | null | undefined;
  name?: string | null | undefined;
  password?: string | null | undefined;
  roles?: Array<string | null | undefined> | null | undefined;
};

export type UpdateVenueInput = {
  capacity?: string | null | undefined;
  city?: string | null | undefined;
  coordinates?: VenueCoordinatesInput | null | undefined;
  description?: string | null | undefined;
  excludeFromSearch?: boolean | null | undefined;
  featuredMedia?: Array<string | null | undefined> | null | undefined;
  listingsUrl?: string | null | undefined;
  name?: string | null | undefined;
  permanentlyClosed?: boolean | null | undefined;
  postalCode?: string | null | undefined;
  slug?: string | null | undefined;
  state?: string | null | undefined;
  streetAddress?: string | null | undefined;
  website?: string | null | undefined;
};

export type UpdateVideoInput = {
  dataId?: string | null | undefined;
  dataPlaylistId?: string | null | undefined;
  dataType?: string | null | undefined;
  position?: number | null | undefined;
  publishedAt?: number | null | undefined;
  publishedISO?: string | null | undefined;
  slug?: string | null | undefined;
  title?: string | null | undefined;
  year?: number | null | undefined;
};

export type VenueCoordinatesInput = {
  latitude?: number | null | undefined;
  longitude?: number | null | undefined;
};

export type ArtistForm_ArtistFragment = { id: string, description: string | null, excludeFromSearch: boolean | null, name: string, slug: string, website: string | null, appleMusic: { id: string | null, artwork: { url: string | null } | null } | null, featuredMedia: Array<
    | { id: string, destination: string, fileName: string, type: string }
    | { id: string, destination: string, fileName: string, type: string }
    | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
    | { id: string, destination: string, fileName: string, type: string }
  > | null };

export type ArtistsAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  search?: string | null | undefined;
}>;


export type ArtistsAdminQuery = { artists: { count: number, edges: Array<{ node: { id: string, excludeFromSearch: boolean | null, name: string, slug: string, website: string | null, appleMusic: { id: string | null, url: string | null, artwork: { url: string | null } | null } | null } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type UpdateArtistExcludeMutationVariables = Exact<{
  id: string;
  input: Types.UpdateArtistInput;
}>;


export type UpdateArtistExcludeMutation = { updateArtist: { id: string } | null };

export type DeleteArtistMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteArtistMutation = { removeArtist: boolean | null };

export type ArtistEditQueryVariables = Exact<{
  id?: string | null | undefined;
}>;


export type ArtistEditQuery = { artist: { id: string, description: string | null, excludeFromSearch: boolean | null, name: string, slug: string, website: string | null, appleMusic: { id: string | null, artwork: { url: string | null } | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null, shows: { edges: Array<{ node: { id: string, attended: boolean | null, date: number, venue: { id: string, name: string } } }> } | null };

export type CreateArtistMutationVariables = Exact<{
  input: Types.CreateArtistInput;
}>;


export type CreateArtistMutation = { createArtist: { id: string, description: string | null, excludeFromSearch: boolean | null, name: string, slug: string, website: string | null, appleMusic: { id: string | null, artwork: { url: string | null } | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type UpdateArtistMutationVariables = Exact<{
  id: string;
  input: Types.UpdateArtistInput;
}>;


export type UpdateArtistMutation = { updateArtist: { id: string, description: string | null, excludeFromSearch: boolean | null, name: string, slug: string, website: string | null, appleMusic: { id: string | null, artwork: { url: string | null } | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

type FeaturedMedia_Media_AudioUpload_Fragment = { id: string, destination: string, fileName: string, type: string };

type FeaturedMedia_Media_FileUpload_Fragment = { id: string, destination: string, fileName: string, type: string };

type FeaturedMedia_Media_ImageUpload_Fragment = { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> };

type FeaturedMedia_Media_VideoUpload_Fragment = { id: string, destination: string, fileName: string, type: string };

export type FeaturedMedia_MediaFragment =
  | FeaturedMedia_Media_AudioUpload_Fragment
  | FeaturedMedia_Media_FileUpload_Fragment
  | FeaturedMedia_Media_ImageUpload_Fragment
  | FeaturedMedia_Media_VideoUpload_Fragment
;

export type MediaPickerQueryVariables = Exact<{
  cursor?: string | null | undefined;
  first?: number | null | undefined;
  type?: string | null | undefined;
}>;


export type MediaPickerQuery = { uploads: { edges: Array<{ node:
        | { id: string, destination: string, fileName: string, title: string | null, images: Array<{ fileName: string, width: number } | null> | null }
        | { id: string, destination: string, fileName: string, title: string | null }
        | { id: string, destination: string, fileName: string, title: string | null, crops: Array<{ fileName: string, width: number }> }
        | { id: string, destination: string, fileName: string, title: string | null }
       }>, pageInfo: { endCursor: string | null, hasNextPage: boolean | null } } | null };

export type VideoPickerQueryVariables = Exact<{
  cursor?: string | null | undefined;
  first?: number | null | undefined;
}>;


export type VideoPickerQuery = { videos: { edges: Array<{ node: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } }>, pageInfo: { endCursor: string | null, hasNextPage: boolean | null } } | null };

type MediaForm_Media_AudioUpload_Fragment = { description: string | null, duration: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string, images: Array<{ fileName: string, fileSize: number, height: number, width: number } | null> | null };

type MediaForm_Media_FileUpload_Fragment = { description: string | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string };

type MediaForm_Media_ImageUpload_Fragment = { altText: string | null, caption: string | null, height: number | null, width: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string, crops: Array<{ fileName: string, fileSize: number, height: number, width: number }> };

type MediaForm_Media_VideoUpload_Fragment = { description: string | null, duration: number | null, height: number | null, width: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string };

export type MediaForm_MediaFragment =
  | MediaForm_Media_AudioUpload_Fragment
  | MediaForm_Media_FileUpload_Fragment
  | MediaForm_Media_ImageUpload_Fragment
  | MediaForm_Media_VideoUpload_Fragment
;

export type UploadsAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  mimeType?: string | null | undefined;
  search?: string | null | undefined;
  type?: string | null | undefined;
}>;


export type UploadsAdminQuery = { uploads: { count: number, mimeTypes: Array<string> | null, types: Array<string> | null, edges: Array<{ node:
        | { id: string, destination: string, mimeType: string, originalName: string, title: string | null, type: string, images: Array<{ fileName: string, width: number } | null> | null }
        | { id: string, destination: string, mimeType: string, originalName: string, title: string | null, type: string }
        | { id: string, destination: string, mimeType: string, originalName: string, title: string | null, type: string, crops: Array<{ fileName: string, width: number }> }
        | { id: string, destination: string, mimeType: string, originalName: string, title: string | null, type: string }
       }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type DeleteMediaMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteMediaMutation = { removeMediaUpload: boolean | null };

export type MediaAdminQueryVariables = Exact<{
  id: string;
}>;


export type MediaAdminQuery = { media:
    | { description: string | null, duration: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string, images: Array<{ fileName: string, fileSize: number, height: number, width: number } | null> | null }
    | { description: string | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string }
    | { altText: string | null, caption: string | null, height: number | null, width: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string, crops: Array<{ fileName: string, fileSize: number, height: number, width: number }> }
    | { description: string | null, duration: number | null, height: number | null, width: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string }
   | null };

export type UpdateMediaMutationVariables = Exact<{
  id: string;
  input: Types.UpdateMediaUploadInput;
}>;


export type UpdateMediaMutation = { updateMediaUpload:
    | { description: string | null, duration: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string, images: Array<{ fileName: string, fileSize: number, height: number, width: number } | null> | null }
    | { description: string | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string }
    | { altText: string | null, caption: string | null, height: number | null, width: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string, crops: Array<{ fileName: string, fileSize: number, height: number, width: number }> }
    | { description: string | null, duration: number | null, height: number | null, width: number | null, id: string, destination: string, fileName: string, fileSize: number, mimeType: string, originalName: string, title: string | null, type: string }
   | null };

export type AlbumCoversAdminQueryVariables = Exact<{
  term: string;
}>;


export type AlbumCoversAdminQuery = { appleMusicAlbums: { error: string | null, albums: Array<{ id: string, artistName: string, cover: string, name: string, releaseDate: string | null, artwork: { height: number | null, width: number | null } }> } };

export type AddAlbumCoversMutationVariables = Exact<{
  ids: Array<string> | string;
}>;


export type AddAlbumCoversMutation = { addAlbumCovers: Array<
    | { id: string }
    | { id: string }
    | { id: string }
    | { id: string }
  > };

export type PodcastForm_PodcastFragment = { id: string, description: string, title: string, audio: { id: string, destination: string, fileName: string, type: string } | null, image: { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> } | null };

export type PodcastsAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  search?: string | null | undefined;
}>;


export type PodcastsAdminQuery = { podcasts: { count: number, edges: Array<{ node: { id: string, title: string } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type DeletePodcastMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeletePodcastMutation = { removePodcast: boolean | null };

export type PodcastEditQueryVariables = Exact<{
  id: string;
}>;


export type PodcastEditQuery = { podcast: { id: string, description: string, title: string, audio: { id: string, destination: string, fileName: string, type: string } | null, image: { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> } | null } | null };

export type CreatePodcastMutationVariables = Exact<{
  input: Types.CreatePodcastInput;
}>;


export type CreatePodcastMutation = { createPodcast: { id: string } | null };

export type UpdatePodcastMutationVariables = Exact<{
  id: string;
  input: Types.UpdatePodcastInput;
}>;


export type UpdatePodcastMutation = { updatePodcast: { id: string, description: string, title: string, audio: { id: string, destination: string, fileName: string, type: string } | null, image: { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> } | null } | null };

export type PostForm_PostFragment = { id: string, date: number | null, slug: string, status: Types.PostStatus | null, summary: string | null, title: string, artists: Array<{ id: string, name: string } | null> | null, editorState: { root: { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, language: string | null, children: Array<
            | { type: string | null, version: number | null }
            | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
            | Record<PropertyKey, never>
           | null> | null }
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
            | { type: string | null, version: number | null }
            | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
            | Record<PropertyKey, never>
           | null> | null }
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, tag: Types.HeadingTag | null, children: Array<
            | { type: string | null, version: number | null }
            | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
            | Record<PropertyKey, never>
           | null> | null }
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, size: string | null, image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null }
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, listType: Types.ListType | null, start: number | null, children: Array<
            | { checked: boolean | null, direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, value: number | null, version: number | null, children: Array<
                | { type: string | null, version: number | null }
                | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
                | Record<PropertyKey, never>
               | null> | null }
            | Record<PropertyKey, never>
           | null> | null }
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
            | { type: string | null, version: number | null }
            | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
            | Record<PropertyKey, never>
           | null> | null }
        | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, video: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } | null }
        | Record<PropertyKey, never>
       | null> | null } | null } | null, featuredMedia: Array<
    | { id: string, destination: string, fileName: string, type: string }
    | { id: string, destination: string, fileName: string, type: string }
    | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
    | { id: string, destination: string, fileName: string, type: string }
  > | null };

export type PostsAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  search?: string | null | undefined;
}>;


export type PostsAdminQuery = { posts: { count: number, edges: Array<{ node: { id: string, date: number | null, slug: string, status: Types.PostStatus | null, title: string } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type DeletePostMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeletePostMutation = { removePost: boolean | null };

export type PostEditQueryVariables = Exact<{
  id: string;
}>;


export type PostEditQuery = { post: { id: string, date: number | null, slug: string, status: Types.PostStatus | null, summary: string | null, title: string, artists: Array<{ id: string, name: string } | null> | null, editorState: { root: { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, language: string | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, tag: Types.HeadingTag | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, size: string | null, image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, listType: Types.ListType | null, start: number | null, children: Array<
              | { checked: boolean | null, direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, value: number | null, version: number | null, children: Array<
                  | { type: string | null, version: number | null }
                  | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
                  | Record<PropertyKey, never>
                 | null> | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, video: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } | null }
          | Record<PropertyKey, never>
         | null> | null } | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type CreatePostMutationVariables = Exact<{
  input: Types.CreatePostInput;
}>;


export type CreatePostMutation = { createPost: { id: string, date: number | null, slug: string, status: Types.PostStatus | null, summary: string | null, title: string, artists: Array<{ id: string, name: string } | null> | null, editorState: { root: { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, language: string | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, tag: Types.HeadingTag | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, size: string | null, image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, listType: Types.ListType | null, start: number | null, children: Array<
              | { checked: boolean | null, direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, value: number | null, version: number | null, children: Array<
                  | { type: string | null, version: number | null }
                  | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
                  | Record<PropertyKey, never>
                 | null> | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, video: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } | null }
          | Record<PropertyKey, never>
         | null> | null } | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type UpdatePostMutationVariables = Exact<{
  id: string;
  input: Types.UpdatePostInput;
}>;


export type UpdatePostMutation = { updatePost: { id: string, date: number | null, slug: string, status: Types.PostStatus | null, summary: string | null, title: string, artists: Array<{ id: string, name: string } | null> | null, editorState: { root: { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, language: string | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, tag: Types.HeadingTag | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, size: string | null, image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, listType: Types.ListType | null, start: number | null, children: Array<
              | { checked: boolean | null, direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, value: number | null, version: number | null, children: Array<
                  | { type: string | null, version: number | null }
                  | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
                  | Record<PropertyKey, never>
                 | null> | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, video: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } | null }
          | Record<PropertyKey, never>
         | null> | null } | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type SiteSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteSettingsQuery = { siteSettings: { id: string, copyrightText: string | null, emailAddress: string | null, language: string | null, siteTitle: string | null, siteUrl: string | null, tagline: string | null } };

export type UpdateSiteSettingsMutationVariables = Exact<{
  id: string;
  input: Types.SiteSettingsInput;
}>;


export type UpdateSiteSettingsMutation = { updateSiteSettings: { id: string } | null };

export type MediaSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MediaSettingsQuery = { mediaSettings: { id: string, crops: Array<{ height: number | null, name: string, width: number | null }> } };

export type UpdateMediaSettingsMutationVariables = Exact<{
  id: string;
  input: Types.MediaSettingsInput;
}>;


export type UpdateMediaSettingsMutation = { updateMediaSettings: { id: string } | null };

export type PodcastSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type PodcastSettingsQuery = { podcastSettings: { id: string, category: string | null, copyrightText: string | null, description: string | null, explicit: string | null, feedLink: string | null, generator: string | null, itunesEmail: string | null, itunesName: string | null, language: string | null, managingEditor: string | null, title: string | null, websiteLink: string | null, image: { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> } | null } };

export type UpdatePodcastSettingsMutationVariables = Exact<{
  id: string;
  input: Types.PodcastSettingsInput;
}>;


export type UpdatePodcastSettingsMutation = { updatePodcastSettings: { id: string } | null };

export type ShowForm_ShowFragment = { id: string, attended: boolean | null, date: number, notes: string | null, title: string | null, url: string | null, artists: Array<{ id: string, name: string }>, venue: { id: string, name: string } };

export type ShowForm_EntitiesFragment = { artists: { edges: Array<{ node: { id: string, name: string } }> } | null, venues: { edges: Array<{ node: { id: string, name: string } }> } | null };

export type ShowsAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  order?: Types.ShowOrder | null | undefined;
  search?: string | null | undefined;
}>;


export type ShowsAdminQuery = { shows: { count: number | null, edges: Array<{ node: { id: string, attended: boolean | null, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type UpdateShowAttendedMutationVariables = Exact<{
  id: string;
  input: Types.UpdateShowInput;
}>;


export type UpdateShowAttendedMutation = { updateShow: { id: string } | null };

export type DeleteShowMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteShowMutation = { removeShow: boolean | null };

export type ShowEntitiesQueryVariables = Exact<{ [key: string]: never; }>;


export type ShowEntitiesQuery = { show: { id: string, attended: boolean | null, date: number, notes: string | null, title: string | null, url: string | null, artists: Array<{ id: string, name: string }>, venue: { id: string, name: string } } | null, artists: { edges: Array<{ node: { id: string, name: string } }> } | null, venues: { edges: Array<{ node: { id: string, name: string } }> } | null };

export type CreateShowMutationVariables = Exact<{
  input: Types.CreateShowInput;
}>;


export type CreateShowMutation = { createShow: { id: string } | null };

export type ShowEditQueryVariables = Exact<{
  id: string;
}>;


export type ShowEditQuery = { show: { id: string, attended: boolean | null, date: number, notes: string | null, title: string | null, url: string | null, artists: Array<{ id: string, name: string }>, venue: { id: string, name: string } } | null, artists: { edges: Array<{ node: { id: string, name: string } }> } | null, venues: { edges: Array<{ node: { id: string, name: string } }> } | null };

export type UpdateShowMutationVariables = Exact<{
  id: string;
  input: Types.UpdateShowInput;
}>;


export type UpdateShowMutation = { updateShow: { id: string, attended: boolean | null, date: number, notes: string | null, title: string | null, url: string | null, artists: Array<{ id: string, name: string }>, venue: { id: string, name: string } } | null };

export type BulkCreateShowsMutationVariables = Exact<{
  input: Array<Types.BulkCreateShowInput> | Types.BulkCreateShowInput;
}>;


export type BulkCreateShowsMutation = { bulkCreateShows: { artistsCreated: number, showsCreated: number, venuesCreated: number } };

export type VenueListingsAdminQueryVariables = Exact<{
  venueId: string;
  withListings: boolean;
}>;


export type VenueListingsAdminQuery = { venueListings?: { error: string | null, source: string | null, listings: Array<{ cancelled: boolean, dateChanged: boolean, headliners: Array<string>, localDate: string | null, localTime: string | null, newArtists: Array<string>, sourceId: string, status: string | null, support: Array<string>, url: string | null, show: { id: string } | null }> }, venues: { edges: Array<{ node: { id: string, listingsUrl: string | null, name: string } }> } | null };

export type ImportListingsMutationVariables = Exact<{
  input: Array<Types.ImportListingInput> | Types.ImportListingInput;
  venueId: string;
}>;


export type ImportListingsMutation = { importListings: { artistsCreated: number, showsCreated: number } };

export type UserForm_UserFragment = { id: string, bio: string | null, email: string, name: string | null, roles: Array<string | null> | null };

export type UsersAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  search?: string | null | undefined;
}>;


export type UsersAdminQuery = { users: { count: number, edges: Array<{ node: { id: string, name: string | null } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type DeleteUserMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteUserMutation = { removeUser: boolean | null };

export type UserEditQueryVariables = Exact<{
  id: string;
}>;


export type UserEditQuery = { user: { id: string, bio: string | null, email: string, name: string | null, roles: Array<string | null> | null } | null };

export type CreateUserMutationVariables = Exact<{
  input: Types.CreateUserInput;
}>;


export type CreateUserMutation = { createUser: { id: string } | null };

export type UpdateUserMutationVariables = Exact<{
  id: string;
  input: Types.UpdateUserInput;
}>;


export type UpdateUserMutation = { updateUser: { id: string, bio: string | null, email: string, name: string | null, roles: Array<string | null> | null } | null };

export type VenueForm_VenueFragment = { id: string, capacity: string | null, city: string | null, description: string | null, excludeFromSearch: boolean | null, listingsUrl: string | null, name: string, permanentlyClosed: boolean | null, postalCode: string | null, slug: string, state: string | null, streetAddress: string | null, website: string | null, coordinates: { latitude: number | null, longitude: number | null } | null, featuredMedia: Array<
    | { id: string, destination: string, fileName: string, type: string }
    | { id: string, destination: string, fileName: string, type: string }
    | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
    | { id: string, destination: string, fileName: string, type: string }
  > | null };

export type VenuesAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  search?: string | null | undefined;
}>;


export type VenuesAdminQuery = { venues: { count: number, edges: Array<{ node: { id: string, address: string | null, capacity: string | null, excludeFromSearch: boolean | null, name: string, permanentlyClosed: boolean | null, slug: string, website: string | null, featuredMedia: Array<
          | { id: string, destination: string, type: string, crops: Array<{ fileName: string, width: number }> }
          | Record<PropertyKey, never>
        > | null } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type UpdateVenueFlagMutationVariables = Exact<{
  id: string;
  input: Types.UpdateVenueInput;
}>;


export type UpdateVenueFlagMutation = { updateVenue: { id: string } | null };

export type DeleteVenueMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteVenueMutation = { removeVenue: boolean | null };

export type VenueEditQueryVariables = Exact<{
  id?: string | null | undefined;
}>;


export type VenueEditQuery = { shows: { edges: Array<{ node: { id: string, date: number, title: string | null, artists: Array<{ id: string, name: string }> } }> } | null, venue: { id: string, capacity: string | null, city: string | null, description: string | null, excludeFromSearch: boolean | null, listingsUrl: string | null, name: string, permanentlyClosed: boolean | null, postalCode: string | null, slug: string, state: string | null, streetAddress: string | null, website: string | null, coordinates: { latitude: number | null, longitude: number | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type CreateVenueMutationVariables = Exact<{
  input: Types.CreateVenueInput;
}>;


export type CreateVenueMutation = { createVenue: { id: string, capacity: string | null, city: string | null, description: string | null, excludeFromSearch: boolean | null, listingsUrl: string | null, name: string, permanentlyClosed: boolean | null, postalCode: string | null, slug: string, state: string | null, streetAddress: string | null, website: string | null, coordinates: { latitude: number | null, longitude: number | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type UpdateVenueMutationVariables = Exact<{
  id: string;
  input: Types.UpdateVenueInput;
}>;


export type UpdateVenueMutation = { updateVenue: { id: string, capacity: string | null, city: string | null, description: string | null, excludeFromSearch: boolean | null, listingsUrl: string | null, name: string, permanentlyClosed: boolean | null, postalCode: string | null, slug: string, state: string | null, streetAddress: string | null, website: string | null, coordinates: { latitude: number | null, longitude: number | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type VideoForm_VideoFragment = { id: string, dataPlaylistId: string, dataType: string, slug: string, title: string, year: number, thumbnails: Array<{ height: number, url: string, width: number }> };

export type VideosAdminQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  search?: string | null | undefined;
  year?: number | null | undefined;
}>;


export type VideosAdminQuery = { videos: { count: number, years: Array<number> | null, edges: Array<{ node: { id: string, publishedAt: number, slug: string, title: string, year: number } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type DeleteVideoMutationVariables = Exact<{
  ids: Array<string | null | undefined> | string;
}>;


export type DeleteVideoMutation = { removeVideo: boolean | null };

export type VideoEditQueryVariables = Exact<{
  id?: string | null | undefined;
}>;


export type VideoEditQuery = { video: { id: string, dataPlaylistId: string, dataType: string, slug: string, title: string, year: number, thumbnails: Array<{ height: number, url: string, width: number }> } | null };

export type UpdateVideoMutationVariables = Exact<{
  id: string;
  input: Types.UpdateVideoInput;
}>;


export type UpdateVideoMutation = { updateVideo: { id: string, dataPlaylistId: string, dataType: string, slug: string, title: string, year: number, thumbnails: Array<{ height: number, url: string, width: number }> } | null };

export type ArtistQueryVariables = Exact<{
  first?: number | null | undefined;
  slug: string;
}>;


export type ArtistQuery = { artist: { id: string, name: string, website: string | null, appleMusic: { id: string | null, url: string | null, artwork: { url: string | null } | null } | null } | null, attended: { edges: Array<{ node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, city: string | null, name: string, slug: string, state: string | null } } }> } | null, shows: { edges: Array<{ cursor: string, node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type VenueQueryVariables = Exact<{
  first?: number | null | undefined;
  slug: string;
}>;


export type VenueQuery = { apiKeys: { googleMaps: string | null } | null, attended: { edges: Array<{ node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, city: string | null, name: string, slug: string, state: string | null } } }> } | null, shows: { edges: Array<{ cursor: string, node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean | null } } | null, venue: { id: string, address: string | null, capacity: string | null, name: string, permanentlyClosed: boolean | null, website: string | null, coordinates: { latitude: number | null, longitude: number | null } | null, featuredMedia: Array<
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string }
      | { id: string, destination: string, fileName: string, type: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string, fileName: string, type: string }
    > | null } | null };

export type HomeQueryVariables = Exact<{
  after?: string | null | undefined;
  before?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
  year?: number | null | undefined;
}>;


export type HomeQuery = { posts: { edges: Array<{ node: { id: string, slug: string, summary: string | null, title: string, editorState: { root: { children: Array<
              | { image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
              | Record<PropertyKey, never>
             | null> | null } | null } | null, featuredMedia: Array<
          | { id: string, destination: string }
          | { id: string, destination: string }
          | { id: string, destination: string, crops: Array<{ fileName: string, width: number }> }
          | { id: string, destination: string }
        > | null } }> } | null, shows: { edges: Array<{ node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }> } | null, videos: { count: number, edges: Array<{ cursor: string, node: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } }>, pageInfo: { hasNextPage: boolean | null, hasPreviousPage: boolean | null } } | null };

export type PodcastsQueryVariables = Exact<{
  first?: number | null | undefined;
}>;


export type PodcastsQuery = { podcasts: { edges: Array<{ node: { id: string, description: string, title: string } }> } | null };

export type PodcastQueryVariables = Exact<{
  id: string;
}>;


export type PodcastQuery = { podcast: { id: string, description: string, title: string, audio: { id: string, destination: string, duration: number | null, fileName: string } | null } | null };

export type PodcastFeedQueryVariables = Exact<{ [key: string]: never; }>;


export type PodcastFeedQuery = { podcasts: { edges: Array<{ node: { id: string, date: number | null, description: string, title: string, audio: { id: string, destination: string, duration: number | null, fileName: string, fileSize: number, mimeType: string } | null, image: { id: string, destination: string, fileName: string } | null } }> } | null, podcastSettings: { id: string, category: string | null, copyrightText: string | null, description: string | null, explicit: string | null, feedLink: string | null, generator: string | null, itunesEmail: string | null, itunesName: string | null, language: string | null, managingEditor: string | null, title: string | null, websiteLink: string | null, image: { id: string, destination: string, fileName: string } | null } };

export type PostsQueryVariables = Exact<{
  first?: number | null | undefined;
}>;


export type PostsQuery = { posts: { edges: Array<{ node: { id: string, slug: string, summary: string | null, title: string, editorState: { root: { children: Array<
              | { image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
              | Record<PropertyKey, never>
             | null> | null } | null } | null, featuredMedia: Array<
          | { id: string, destination: string }
          | { id: string, destination: string }
          | { id: string, destination: string, crops: Array<{ fileName: string, width: number }> }
          | { id: string, destination: string }
        > | null } }> } | null };

export type PostQueryVariables = Exact<{
  slug?: string | null | undefined;
}>;


export type PostQuery = { post: { id: string, slug: string, summary: string | null, title: string, editorState: { root: { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, tag: Types.HeadingTag | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, listType: Types.ListType | null, start: number | null, children: Array<
              | { children: Array<
                  | { type: string | null, version: number | null }
                  | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
                  | Record<PropertyKey, never>
                 | null> | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, children: Array<
              | { type: string | null, version: number | null }
              | { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null }
              | Record<PropertyKey, never>
             | null> | null }
          | { direction: Types.ElementDirection | null, format: number | null, indent: number | null, type: string | null, version: number | null, video: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } | null }
          | Record<PropertyKey, never>
         | null> | null } | null } | null, featuredMedia: Array<
      | { id: string, destination: string }
      | { id: string, destination: string }
      | { id: string, destination: string, crops: Array<{ fileName: string, width: number }> }
      | { id: string, destination: string }
    > | null } | null };

export type AppQueryVariables = Exact<{ [key: string]: never; }>;


export type AppQuery = { podcastSettings: { id: string, description: string | null, feedLink: string | null, title: string | null, websiteLink: string | null, image: { id: string, destination: string, fileName: string } | null }, siteSettings: { id: string, copyrightText: string | null, language: string | null, siteTitle: string | null, siteUrl: string | null, tagline: string | null } };

export type ShowsQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
}>;


export type ShowsQuery = { shows: { edges: Array<{ cursor: string, node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type ShowStatsQueryVariables = Exact<{
  entity: Types.ShowEntityType;
}>;


export type ShowStatsQuery = { showStats: Array<{ count: number, entity:
      | { id: string, name: string, slug: string }
      | { id: string, name: string, slug: string }
     }> };

export type ShowQueryVariables = Exact<{
  id?: string | null | undefined;
}>;


export type ShowQuery = { show: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string, appleMusic: { id: string | null, artwork: { url: string | null } | null } | null }>, venue: { id: string, name: string, slug: string } } | null };

export type ShowsHistoryQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  year?: number | null | undefined;
}>;


export type ShowsHistoryQuery = { shows: { count: number | null, years: Array<number> | null, edges: Array<{ cursor: string, node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type ShowsHistoryPageQueryVariables = Exact<{
  after?: string | null | undefined;
  first?: number | null | undefined;
  year?: number | null | undefined;
}>;


export type ShowsHistoryPageQuery = { shows: { edges: Array<{ cursor: string, node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean | null } } | null };

export type VideosQueryVariables = Exact<{
  after?: string | null | undefined;
  before?: string | null | undefined;
  first?: number | null | undefined;
  last?: number | null | undefined;
  year?: number | null | undefined;
}>;


export type VideosQuery = { videos: { count: number, edges: Array<{ cursor: string, node: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } }>, pageInfo: { hasNextPage: boolean | null, hasPreviousPage: boolean | null } } | null };

export type VideoQueryVariables = Exact<{
  slug?: string | null | undefined;
}>;


export type VideoQuery = { video: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } | null };

export type PostArtwork_PostFragment = { id: string, editorState: { root: { children: Array<
        | { image: { id: string, destination: string, crops: Array<{ fileName: string, width: number }> } | null }
        | Record<PropertyKey, never>
       | null> | null } | null } | null, featuredMedia: Array<
    | { id: string, destination: string }
    | { id: string, destination: string }
    | { id: string, destination: string, crops: Array<{ fileName: string, width: number }> }
    | { id: string, destination: string }
  > | null };

export type TextNodes_LinebreakNodeFragment = { type: string | null, version: number | null };

export type TextNodes_TextNodeFragment = { detail: number | null, format: number | null, mode: Types.TextModeType | null, style: string | null, text: string | null, textFormat: number | null, textStyle: string | null, type: string | null, version: number | null };

export type ShowsGrid_ShowsFragment = { edges: Array<{ cursor: string, node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, name: string, slug: string } } }>, pageInfo: { hasNextPage: boolean | null } };

export type Attended_ShowsFragment = { edges: Array<{ node: { id: string, date: number, title: string | null, url: string | null, artists: Array<{ id: string, name: string, slug: string }>, venue: { id: string, city: string | null, name: string, slug: string, state: string | null } } }> };

export type Video_VideoFragment = { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> };

export type Videos_VideosFragment = { videos: { count: number, edges: Array<{ cursor: string, node: { id: string, dataId: string, slug: string, title: string, thumbnails: Array<{ height: number, url: string, width: number }> } }>, pageInfo: { hasNextPage: boolean | null, hasPreviousPage: boolean | null } } | null };
