import type { GraphQLResolveInfo } from 'graphql';

import type { Album } from '../src/appleMusic';
import type { AppContext } from '../src/models';
import type { AppleMusicDataSource, ArtistSource } from '../src/resolvers/Artist';
import type { EditorNodeData } from '../src/resolvers/EditorState';
import type { MediaUploadSource } from '../src/resolvers/Media';
import type { PodcastSource } from '../src/resolvers/Podcast';
import type { PostSource } from '../src/resolvers/Post';
import type { MediaSettingsSource, PodcastSettingsSource } from '../src/resolvers/Settings';
import type { ShowSource, ShowConnectionSource, ShowEntitySource } from '../src/resolvers/Show';
import type { UserSource } from '../src/resolvers/User';
import type { VenueSource } from '../src/resolvers/Venue';
import type { VideoSource } from '../src/resolvers/Video';
import type { Connection } from '../src/resolvers/utils/collection';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs extends Record<PropertyKey, never> ? Record<never, never> : TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => Promise<TResult> | TResult;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
};

export type ApiKeys = {
  __typename?: 'APIKeys';
  googleMaps?: Maybe<Scalars['String']['output']>;
};

export type AppleMusicAlbum = {
  __typename?: 'AppleMusicAlbum';
  artistName: Scalars['String']['output'];
  artwork: AppleMusicArtwork;
  cover: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  releaseDate?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type AppleMusicAlbumCoverArgs = {
  size: Scalars['Int']['input'];
};

export type AppleMusicAlbumResults = {
  __typename?: 'AppleMusicAlbumResults';
  albums: Array<AppleMusicAlbum>;
  error?: Maybe<Scalars['String']['output']>;
};

export type AppleMusicArtwork = {
  __typename?: 'AppleMusicArtwork';
  bgColor?: Maybe<Scalars['String']['output']>;
  height?: Maybe<Scalars['Int']['output']>;
  textColor1?: Maybe<Scalars['String']['output']>;
  textColor2?: Maybe<Scalars['String']['output']>;
  textColor3?: Maybe<Scalars['String']['output']>;
  textColor4?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  width?: Maybe<Scalars['Int']['output']>;
};

export type AppleMusicArtworkInput = {
  bgColor?: InputMaybe<Scalars['String']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  textColor1?: InputMaybe<Scalars['String']['input']>;
  textColor2?: InputMaybe<Scalars['String']['input']>;
  textColor3?: InputMaybe<Scalars['String']['input']>;
  textColor4?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type AppleMusicData = {
  __typename?: 'AppleMusicData';
  artwork?: Maybe<AppleMusicArtwork>;
  genreNames?: Maybe<Array<Scalars['String']['output']>>;
  id?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type AppleMusicDataInput = {
  artwork?: InputMaybe<AppleMusicArtworkInput>;
  genreNames?: InputMaybe<Array<Scalars['String']['input']>>;
  id?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
};

export type Artist = {
  __typename?: 'Artist';
  appleMusic?: Maybe<AppleMusicData>;
  description?: Maybe<Scalars['String']['output']>;
  excludeFromSearch?: Maybe<Scalars['Boolean']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  website?: Maybe<Scalars['String']['output']>;
};

export type ArtistConnection = {
  __typename?: 'ArtistConnection';
  count: Scalars['Int']['output'];
  edges: Array<ArtistEdge>;
  pageInfo: PageInfo;
};

export type ArtistEdge = {
  __typename?: 'ArtistEdge';
  cursor: Scalars['String']['output'];
  node: Artist;
};

export type AudioUpload = MediaUpload & {
  __typename?: 'AudioUpload';
  album?: Maybe<Scalars['String']['output']>;
  albumArtist?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  artist?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  description?: Maybe<Scalars['String']['output']>;
  destination: Scalars['String']['output'];
  duration?: Maybe<Scalars['Float']['output']>;
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  genre?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
  id: Scalars['String']['output'];
  images?: Maybe<Array<Maybe<ImageUploadCrop>>>;
  mimeType: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  year?: Maybe<Scalars['Int']['output']>;
};

export type BulkCreateShowInput = {
  artists: Array<Scalars['String']['input']>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  date: Scalars['Float']['input'];
  venue: Scalars['String']['input'];
};

export type BulkCreateShowsResult = {
  __typename?: 'BulkCreateShowsResult';
  artistsCreated: Scalars['Int']['output'];
  showsCreated: Scalars['Int']['output'];
  venuesCreated: Scalars['Int']['output'];
};

export type CodeNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'CodeNode';
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    indent?: Maybe<Scalars['Int']['output']>;
    language?: Maybe<Scalars['String']['output']>;
    type?: Maybe<Scalars['String']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
  };

export type CreateArtistInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  excludeFromSearch?: InputMaybe<Scalars['Boolean']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  slug?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CreatePodcastInput = {
  audio?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreatePostInput = {
  artists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<Scalars['Float']['input']>;
  editorState?: InputMaybe<EditorStateInput>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PostStatus>;
  summary?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type CreateShowInput = {
  artists: Array<Scalars['String']['input']>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  date: Scalars['Float']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  venue: Scalars['String']['input'];
};

export type CreateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CreateVenueInput = {
  capacity?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<VenueCoordinatesInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  excludeFromSearch?: InputMaybe<Scalars['Boolean']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  listingsUrl?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  permanentlyClosed?: InputMaybe<Scalars['Boolean']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  streetAddress?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type CreateVideoInput = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  dataPlaylistId?: InputMaybe<Scalars['String']['input']>;
  dataType?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  publishedAt: Scalars['Float']['input'];
  publishedISO?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type EditorNode =
  | CodeNode
  | ElementNode
  | HeadingNode
  | ImageNode
  | LinebreakNode
  | ListItemNode
  | ListNode
  | QuoteNode
  | TextNode
  | VideoNode;

export type EditorNodeInput = {
  checked?: InputMaybe<Scalars['Boolean']['input']>;
  children?: InputMaybe<Array<InputMaybe<EditorNodeInput>>>;
  detail?: InputMaybe<Scalars['Int']['input']>;
  direction?: InputMaybe<ElementDirection>;
  format?: InputMaybe<Scalars['Int']['input']>;
  imageId?: InputMaybe<Scalars['String']['input']>;
  indent?: InputMaybe<Scalars['Int']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  listType?: InputMaybe<ListType>;
  mode?: InputMaybe<TextModeType>;
  size?: InputMaybe<Scalars['String']['input']>;
  start?: InputMaybe<Scalars['Int']['input']>;
  style?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
  textFormat?: InputMaybe<Scalars['Int']['input']>;
  textStyle?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  value?: InputMaybe<Scalars['Int']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
  videoId?: InputMaybe<Scalars['String']['input']>;
};

export type EditorState = {
  __typename?: 'EditorState';
  /** Complete Lexical JSON with media previews for the admin editor. */
  forEditing: Scalars['String']['output'];
  root?: Maybe<ElementNode>;
};

export type EditorStateInput = {
  root?: InputMaybe<RootNodeInput>;
};

export enum ElementDirection {
  Ltr = 'ltr',
  Rtl = 'rtl',
}

export type ElementNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'ElementNode';
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    indent?: Maybe<Scalars['Int']['output']>;
    type?: Maybe<Scalars['String']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
  };

export type ElementNodeType = {
  children?: Maybe<Array<Maybe<EditorNode>>>;
  direction?: Maybe<ElementDirection>;
  format?: Maybe<Scalars['Int']['output']>;
  indent?: Maybe<Scalars['Int']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type EntityArg = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type FileUpload = MediaUpload & {
  __typename?: 'FileUpload';
  description?: Maybe<Scalars['String']['output']>;
  destination: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type HeadingNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'HeadingNode';
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    indent?: Maybe<Scalars['Int']['output']>;
    tag?: Maybe<HeadingTag>;
    type?: Maybe<Scalars['String']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
  };

export enum HeadingTag {
  H1 = 'h1',
  H2 = 'h2',
  H3 = 'h3',
  H4 = 'h4',
  H5 = 'h5',
  H6 = 'h6',
}

export type ImageNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'ImageNode';
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    image?: Maybe<ImageUpload>;
    indent?: Maybe<Scalars['Int']['output']>;
    size?: Maybe<Scalars['String']['output']>;
    type?: Maybe<Scalars['String']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
  };

export type ImageUpload = MediaUpload & {
  __typename?: 'ImageUpload';
  altText?: Maybe<Scalars['String']['output']>;
  caption?: Maybe<Scalars['String']['output']>;
  crops: Array<ImageUploadCrop>;
  destination: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type ImageUploadCrop = {
  __typename?: 'ImageUploadCrop';
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  height: Scalars['Int']['output'];
  width: Scalars['Int']['output'];
};

export type ImportListingInput = {
  artists: Array<Scalars['String']['input']>;
  sourceId: Scalars['String']['input'];
};

export type ImportListingsResult = {
  __typename?: 'ImportListingsResult';
  artistsCreated: Scalars['Int']['output'];
  showsCreated: Scalars['Int']['output'];
};

export type LexicalNode = {
  type?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type LinebreakNode = LexicalNode & {
  __typename?: 'LinebreakNode';
  type?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type ListItemNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'ListItemNode';
    checked?: Maybe<Scalars['Boolean']['output']>;
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    indent?: Maybe<Scalars['Int']['output']>;
    type?: Maybe<Scalars['String']['output']>;
    value?: Maybe<Scalars['Int']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
  };

export type ListNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'ListNode';
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    indent?: Maybe<Scalars['Int']['output']>;
    listType?: Maybe<ListType>;
    start?: Maybe<Scalars['Int']['output']>;
    type?: Maybe<Scalars['String']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
  };

export enum ListType {
  Bullet = 'bullet',
  Check = 'check',
  Number = 'number',
}

export type Listing = {
  __typename?: 'Listing';
  cancelled: Scalars['Boolean']['output'];
  dateChanged: Scalars['Boolean']['output'];
  headliners: Array<Scalars['String']['output']>;
  localDate?: Maybe<Scalars['String']['output']>;
  localTime?: Maybe<Scalars['String']['output']>;
  newArtists: Array<Scalars['String']['output']>;
  show?: Maybe<Show>;
  sourceId: Scalars['String']['output'];
  status?: Maybe<Scalars['String']['output']>;
  support: Array<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
};

export type MediaCropSetting = {
  __typename?: 'MediaCropSetting';
  height?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type MediaCropSettingInput = {
  height?: InputMaybe<Scalars['Int']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
};

export type MediaSettings = {
  __typename?: 'MediaSettings';
  crops: Array<MediaCropSetting>;
  id: Scalars['String']['output'];
};

export type MediaSettingsInput = {
  crops?: InputMaybe<Array<InputMaybe<MediaCropSettingInput>>>;
};

export type MediaUpload = {
  destination: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
};

export type MediaUploadConnection = {
  __typename?: 'MediaUploadConnection';
  count: Scalars['Int']['output'];
  edges: Array<MediaUploadEdge>;
  mimeTypes?: Maybe<Array<Scalars['String']['output']>>;
  pageInfo: PageInfo;
  types?: Maybe<Array<Scalars['String']['output']>>;
};

export type MediaUploadEdge = {
  __typename?: 'MediaUploadEdge';
  cursor: Scalars['String']['output'];
  node: MediaUpload;
};

export type Mutation = {
  __typename?: 'Mutation';
  addAlbumCovers: Array<MediaUpload>;
  bulkCreateShows: BulkCreateShowsResult;
  createArtist?: Maybe<Artist>;
  createPodcast?: Maybe<Podcast>;
  createPost?: Maybe<Post>;
  createShow?: Maybe<Show>;
  createUser?: Maybe<User>;
  createVenue?: Maybe<Venue>;
  createVideo?: Maybe<Video>;
  importListings: ImportListingsResult;
  removeArtist?: Maybe<Scalars['Boolean']['output']>;
  removeMediaUpload?: Maybe<Scalars['Boolean']['output']>;
  removePodcast?: Maybe<Scalars['Boolean']['output']>;
  removePost?: Maybe<Scalars['Boolean']['output']>;
  removeShow?: Maybe<Scalars['Boolean']['output']>;
  removeUser?: Maybe<Scalars['Boolean']['output']>;
  removeVenue?: Maybe<Scalars['Boolean']['output']>;
  removeVideo?: Maybe<Scalars['Boolean']['output']>;
  updateArtist?: Maybe<Artist>;
  updateMediaSettings?: Maybe<MediaSettings>;
  updateMediaUpload?: Maybe<MediaUpload>;
  updatePodcast?: Maybe<Podcast>;
  updatePodcastSettings?: Maybe<PodcastSettings>;
  updatePost?: Maybe<Post>;
  updateShow?: Maybe<Show>;
  updateSiteSettings?: Maybe<SiteSettings>;
  updateUser?: Maybe<User>;
  updateVenue?: Maybe<Venue>;
  updateVideo?: Maybe<Video>;
};

export type MutationAddAlbumCoversArgs = {
  ids: Array<Scalars['String']['input']>;
};

export type MutationBulkCreateShowsArgs = {
  input: Array<BulkCreateShowInput>;
};

export type MutationCreateArtistArgs = {
  input: CreateArtistInput;
};

export type MutationCreatePodcastArgs = {
  input: CreatePodcastInput;
};

export type MutationCreatePostArgs = {
  input: CreatePostInput;
};

export type MutationCreateShowArgs = {
  input: CreateShowInput;
};

export type MutationCreateUserArgs = {
  input: CreateUserInput;
};

export type MutationCreateVenueArgs = {
  input: CreateVenueInput;
};

export type MutationCreateVideoArgs = {
  input: CreateVideoInput;
};

export type MutationImportListingsArgs = {
  input: Array<ImportListingInput>;
  venueId: Scalars['String']['input'];
};

export type MutationRemoveArtistArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationRemoveMediaUploadArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationRemovePodcastArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationRemovePostArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationRemoveShowArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationRemoveUserArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationRemoveVenueArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationRemoveVideoArgs = {
  ids: Array<InputMaybe<Scalars['String']['input']>>;
};

export type MutationUpdateArtistArgs = {
  id: Scalars['String']['input'];
  input: UpdateArtistInput;
};

export type MutationUpdateMediaSettingsArgs = {
  id: Scalars['String']['input'];
  input: MediaSettingsInput;
};

export type MutationUpdateMediaUploadArgs = {
  id: Scalars['String']['input'];
  input: UpdateMediaUploadInput;
};

export type MutationUpdatePodcastArgs = {
  id: Scalars['String']['input'];
  input: UpdatePodcastInput;
};

export type MutationUpdatePodcastSettingsArgs = {
  id: Scalars['String']['input'];
  input: PodcastSettingsInput;
};

export type MutationUpdatePostArgs = {
  id: Scalars['String']['input'];
  input: UpdatePostInput;
};

export type MutationUpdateShowArgs = {
  id: Scalars['String']['input'];
  input: UpdateShowInput;
};

export type MutationUpdateSiteSettingsArgs = {
  id: Scalars['String']['input'];
  input: SiteSettingsInput;
};

export type MutationUpdateUserArgs = {
  id: Scalars['String']['input'];
  input: UpdateUserInput;
};

export type MutationUpdateVenueArgs = {
  id: Scalars['String']['input'];
  input: UpdateVenueInput;
};

export type MutationUpdateVideoArgs = {
  id: Scalars['String']['input'];
  input: UpdateVideoInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Podcast = {
  __typename?: 'Podcast';
  audio?: Maybe<AudioUpload>;
  date?: Maybe<Scalars['Float']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['String']['output'];
  image?: Maybe<ImageUpload>;
  title: Scalars['String']['output'];
};

export type PodcastConnection = {
  __typename?: 'PodcastConnection';
  count: Scalars['Int']['output'];
  edges: Array<PodcastEdge>;
  pageInfo: PageInfo;
};

export type PodcastEdge = {
  __typename?: 'PodcastEdge';
  cursor: Scalars['String']['output'];
  node: Podcast;
};

export enum PodcastOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type PodcastSettings = {
  __typename?: 'PodcastSettings';
  category?: Maybe<Scalars['String']['output']>;
  copyrightText?: Maybe<Scalars['String']['output']>;
  description?: Maybe<Scalars['String']['output']>;
  explicit?: Maybe<Scalars['String']['output']>;
  feedLink?: Maybe<Scalars['String']['output']>;
  generator?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  image?: Maybe<ImageUpload>;
  itunesEmail?: Maybe<Scalars['String']['output']>;
  itunesName?: Maybe<Scalars['String']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  managingEditor?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  websiteLink?: Maybe<Scalars['String']['output']>;
};

export type PodcastSettingsInput = {
  category?: InputMaybe<Scalars['String']['input']>;
  copyrightText?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  explicit?: InputMaybe<Scalars['String']['input']>;
  feedLink?: InputMaybe<Scalars['String']['input']>;
  generator?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  itunesEmail?: InputMaybe<Scalars['String']['input']>;
  itunesName?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  managingEditor?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  websiteLink?: InputMaybe<Scalars['String']['input']>;
};

export type Post = {
  __typename?: 'Post';
  artists?: Maybe<Array<Maybe<Artist>>>;
  date?: Maybe<Scalars['Float']['output']>;
  editorState?: Maybe<EditorState>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  status?: Maybe<PostStatus>;
  summary?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
};

export type PostConnection = {
  __typename?: 'PostConnection';
  count: Scalars['Int']['output'];
  edges: Array<PostEdge>;
  pageInfo: PageInfo;
};

export type PostEdge = {
  __typename?: 'PostEdge';
  cursor: Scalars['String']['output'];
  node: Post;
};

export enum PostStatus {
  Draft = 'DRAFT',
  Publish = 'PUBLISH',
}

export type Query = {
  __typename?: 'Query';
  apiKeys?: Maybe<ApiKeys>;
  appleMusicAlbums: AppleMusicAlbumResults;
  artist?: Maybe<Artist>;
  artists?: Maybe<ArtistConnection>;
  media?: Maybe<MediaUpload>;
  mediaSettings: MediaSettings;
  podcast?: Maybe<Podcast>;
  podcastSettings: PodcastSettings;
  podcasts?: Maybe<PodcastConnection>;
  post?: Maybe<Post>;
  posts?: Maybe<PostConnection>;
  show?: Maybe<Show>;
  showStats: Array<ShowStat>;
  showTotals: ShowTotals;
  shows?: Maybe<ShowConnection>;
  siteSettings: SiteSettings;
  uploads?: Maybe<MediaUploadConnection>;
  user?: Maybe<User>;
  users?: Maybe<UserConnection>;
  venue?: Maybe<Venue>;
  venueListings: VenueListings;
  venues?: Maybe<VenueConnection>;
  video?: Maybe<Video>;
  videos?: Maybe<VideoConnection>;
};

export type QueryAppleMusicAlbumsArgs = {
  term: Scalars['String']['input'];
};

export type QueryArtistArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type QueryArtistsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filtered?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryMediaArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPodcastArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPodcastsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<PodcastOrder>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPostArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PostStatus>;
};

export type QueryShowArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  lastAdded?: InputMaybe<Scalars['Boolean']['input']>;
};

export type QueryShowStatsArgs = {
  entity: ShowEntityType;
  first?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryShowsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  artist?: InputMaybe<EntityArg>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latest?: InputMaybe<Scalars['Boolean']['input']>;
  mostRecentYear?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<ShowOrder>;
  search?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<EntityArg>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryUploadsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
};

export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryVenueArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type QueryVenueListingsArgs = {
  venueId: Scalars['String']['input'];
};

export type QueryVenuesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  filtered?: InputMaybe<Scalars['Boolean']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryVideoArgs = {
  id?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type QueryVideosArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type QuoteNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'QuoteNode';
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    indent?: Maybe<Scalars['Int']['output']>;
    type?: Maybe<Scalars['String']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
  };

export type RootNodeInput = {
  children?: InputMaybe<Array<InputMaybe<EditorNodeInput>>>;
  direction?: InputMaybe<ElementDirection>;
  format?: InputMaybe<Scalars['Int']['input']>;
  indent?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
};

export type Show = {
  __typename?: 'Show';
  artists: Array<Artist>;
  attended?: Maybe<Scalars['Boolean']['output']>;
  date: Scalars['Float']['output'];
  id: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  venue: Venue;
};

export type ShowConnection = {
  __typename?: 'ShowConnection';
  count?: Maybe<Scalars['Int']['output']>;
  edges: Array<ShowEdge>;
  pageInfo: PageInfo;
  years?: Maybe<Array<Scalars['Int']['output']>>;
};

export type ShowEdge = {
  __typename?: 'ShowEdge';
  cursor: Scalars['String']['output'];
  node: Show;
};

export type ShowEntity = Artist | Venue;

export enum ShowEntityType {
  Artist = 'ARTIST',
  Venue = 'VENUE',
}

export enum ShowOrder {
  Asc = 'ASC',
  Desc = 'DESC',
}

export type ShowStat = {
  __typename?: 'ShowStat';
  count: Scalars['Int']['output'];
  entity: ShowEntity;
  firstDate: Scalars['Float']['output'];
  lastDate: Scalars['Float']['output'];
};

export type ShowTotals = {
  __typename?: 'ShowTotals';
  artists: Scalars['Int']['output'];
  firstDate?: Maybe<Scalars['Float']['output']>;
  lastDate?: Maybe<Scalars['Float']['output']>;
  shows: Scalars['Int']['output'];
  venues: Scalars['Int']['output'];
};

export type SiteSettings = {
  __typename?: 'SiteSettings';
  copyrightText?: Maybe<Scalars['String']['output']>;
  emailAddress?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
  language?: Maybe<Scalars['String']['output']>;
  siteTitle?: Maybe<Scalars['String']['output']>;
  siteUrl?: Maybe<Scalars['String']['output']>;
  tagline?: Maybe<Scalars['String']['output']>;
};

export type SiteSettingsInput = {
  copyrightText?: InputMaybe<Scalars['String']['input']>;
  emailAddress?: InputMaybe<Scalars['String']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  siteTitle?: InputMaybe<Scalars['String']['input']>;
  siteUrl?: InputMaybe<Scalars['String']['input']>;
  tagline?: InputMaybe<Scalars['String']['input']>;
};

export enum TextModeType {
  Normal = 'normal',
  Segmented = 'segmented',
  Token = 'token',
}

export type TextNode = LexicalNode & {
  __typename?: 'TextNode';
  detail?: Maybe<Scalars['Int']['output']>;
  format?: Maybe<Scalars['Int']['output']>;
  mode?: Maybe<TextModeType>;
  style?: Maybe<Scalars['String']['output']>;
  text?: Maybe<Scalars['String']['output']>;
  textFormat?: Maybe<Scalars['Int']['output']>;
  textStyle?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
};

export type UpdateArtistInput = {
  appleMusic?: InputMaybe<AppleMusicDataInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  excludeFromSearch?: InputMaybe<Scalars['Boolean']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateMediaUploadInput = {
  altText?: InputMaybe<Scalars['String']['input']>;
  caption?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdatePodcastInput = {
  audio?: InputMaybe<Scalars['String']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type UpdatePostInput = {
  artists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  date?: InputMaybe<Scalars['Float']['input']>;
  editorState?: InputMaybe<EditorStateInput>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  status?: InputMaybe<PostStatus>;
  summary?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateShowInput = {
  artists?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UpdateVenueInput = {
  capacity?: InputMaybe<Scalars['String']['input']>;
  city?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<VenueCoordinatesInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  excludeFromSearch?: InputMaybe<Scalars['Boolean']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  listingsUrl?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  permanentlyClosed?: InputMaybe<Scalars['Boolean']['input']>;
  postalCode?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  state?: InputMaybe<Scalars['String']['input']>;
  streetAddress?: InputMaybe<Scalars['String']['input']>;
  website?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateVideoInput = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  dataPlaylistId?: InputMaybe<Scalars['String']['input']>;
  dataType?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  publishedAt?: InputMaybe<Scalars['Float']['input']>;
  publishedISO?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type User = {
  __typename?: 'User';
  bio?: Maybe<Scalars['String']['output']>;
  email: Scalars['String']['output'];
  id: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  roles?: Maybe<Array<Maybe<Scalars['String']['output']>>>;
};

export type UserConnection = {
  __typename?: 'UserConnection';
  count: Scalars['Int']['output'];
  edges: Array<UserEdge>;
  pageInfo: PageInfo;
};

export type UserEdge = {
  __typename?: 'UserEdge';
  cursor: Scalars['String']['output'];
  node: User;
};

export type Venue = {
  __typename?: 'Venue';
  address?: Maybe<Scalars['String']['output']>;
  capacity?: Maybe<Scalars['String']['output']>;
  city?: Maybe<Scalars['String']['output']>;
  coordinates?: Maybe<VenueCoordinates>;
  description?: Maybe<Scalars['String']['output']>;
  excludeFromSearch?: Maybe<Scalars['Boolean']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['String']['output'];
  listingsUrl?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  permanentlyClosed?: Maybe<Scalars['Boolean']['output']>;
  postalCode?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
  state?: Maybe<Scalars['String']['output']>;
  streetAddress?: Maybe<Scalars['String']['output']>;
  website?: Maybe<Scalars['String']['output']>;
};

export type VenueConnection = {
  __typename?: 'VenueConnection';
  count: Scalars['Int']['output'];
  edges: Array<VenueEdge>;
  pageInfo: PageInfo;
};

export type VenueCoordinates = {
  __typename?: 'VenueCoordinates';
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
};

export type VenueCoordinatesInput = {
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
};

export type VenueEdge = {
  __typename?: 'VenueEdge';
  cursor: Scalars['String']['output'];
  node: Venue;
};

export type VenueListings = {
  __typename?: 'VenueListings';
  error?: Maybe<Scalars['String']['output']>;
  listings: Array<Listing>;
  source?: Maybe<Scalars['String']['output']>;
};

export type Video = {
  __typename?: 'Video';
  createdAt: Scalars['Float']['output'];
  dataId: Scalars['String']['output'];
  dataPlaylistId: Scalars['String']['output'];
  dataType: Scalars['String']['output'];
  id: Scalars['String']['output'];
  position: Scalars['Int']['output'];
  publishedAt: Scalars['Float']['output'];
  publishedISO: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  thumbnails: Array<VideoThumbnail>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['Float']['output'];
  year: Scalars['Int']['output'];
};

export type VideoConnection = {
  __typename?: 'VideoConnection';
  count: Scalars['Int']['output'];
  edges: Array<VideoEdge>;
  pageInfo: PageInfo;
  years?: Maybe<Array<Scalars['Int']['output']>>;
};

export type VideoEdge = {
  __typename?: 'VideoEdge';
  cursor: Scalars['String']['output'];
  node: Video;
};

export type VideoNode = ElementNodeType &
  LexicalNode & {
    __typename?: 'VideoNode';
    children?: Maybe<Array<Maybe<EditorNode>>>;
    direction?: Maybe<ElementDirection>;
    format?: Maybe<Scalars['Int']['output']>;
    indent?: Maybe<Scalars['Int']['output']>;
    type?: Maybe<Scalars['String']['output']>;
    version?: Maybe<Scalars['Int']['output']>;
    video?: Maybe<Video>;
  };

export type VideoThumbnail = {
  __typename?: 'VideoThumbnail';
  height: Scalars['Int']['output'];
  url: Scalars['String']['output'];
  width: Scalars['Int']['output'];
};

export type VideoUpload = MediaUpload & {
  __typename?: 'VideoUpload';
  description?: Maybe<Scalars['String']['output']>;
  destination: Scalars['String']['output'];
  duration?: Maybe<Scalars['Float']['output']>;
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  height?: Maybe<Scalars['Int']['output']>;
  id: Scalars['String']['output'];
  mimeType: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type Resolver<
  TResult,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = ResolverFn<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<
  TTypes,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<
  T = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = Record<PropertyKey, never>,
  TParent = Record<PropertyKey, never>,
  TContext = Record<PropertyKey, never>,
  TArgs = Record<PropertyKey, never>,
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  APIKeys: ResolverTypeWrapper<ApiKeys>;
  AppleMusicAlbum: ResolverTypeWrapper<Album>;
  AppleMusicAlbumResults: ResolverTypeWrapper<
    Omit<AppleMusicAlbumResults, 'albums'> & { albums: Array<ResolversTypes['AppleMusicAlbum']> }
  >;
  AppleMusicArtwork: ResolverTypeWrapper<AppleMusicArtwork>;
  AppleMusicArtworkInput: AppleMusicArtworkInput;
  AppleMusicData: ResolverTypeWrapper<AppleMusicDataSource>;
  AppleMusicDataInput: AppleMusicDataInput;
  Artist: ResolverTypeWrapper<ArtistSource>;
  ArtistConnection: ResolverTypeWrapper<Connection<ArtistSource>>;
  ArtistEdge: ResolverTypeWrapper<Omit<ArtistEdge, 'node'> & { node: ResolversTypes['Artist'] }>;
  AudioUpload: ResolverTypeWrapper<MediaUploadSource>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']['output']>;
  BulkCreateShowInput: BulkCreateShowInput;
  BulkCreateShowsResult: ResolverTypeWrapper<BulkCreateShowsResult>;
  CodeNode: ResolverTypeWrapper<EditorNodeData>;
  CreateArtistInput: CreateArtistInput;
  CreatePodcastInput: CreatePodcastInput;
  CreatePostInput: CreatePostInput;
  CreateShowInput: CreateShowInput;
  CreateUserInput: CreateUserInput;
  CreateVenueInput: CreateVenueInput;
  CreateVideoInput: CreateVideoInput;
  EditorNode: ResolverTypeWrapper<EditorNodeData>;
  EditorNodeInput: EditorNodeInput;
  EditorState: ResolverTypeWrapper<
    Omit<EditorState, 'root'> & { root?: Maybe<ResolversTypes['ElementNode']> }
  >;
  EditorStateInput: EditorStateInput;
  ElementDirection: ElementDirection;
  ElementNode: ResolverTypeWrapper<EditorNodeData>;
  ElementNodeType: ResolverTypeWrapper<EditorNodeData>;
  EntityArg: EntityArg;
  FileUpload: ResolverTypeWrapper<MediaUploadSource>;
  Float: ResolverTypeWrapper<Scalars['Float']['output']>;
  HeadingNode: ResolverTypeWrapper<EditorNodeData>;
  HeadingTag: HeadingTag;
  ImageNode: ResolverTypeWrapper<EditorNodeData>;
  ImageUpload: ResolverTypeWrapper<MediaUploadSource>;
  ImageUploadCrop: ResolverTypeWrapper<ImageUploadCrop>;
  ImportListingInput: ImportListingInput;
  ImportListingsResult: ResolverTypeWrapper<ImportListingsResult>;
  Int: ResolverTypeWrapper<Scalars['Int']['output']>;
  LexicalNode: ResolverTypeWrapper<EditorNodeData>;
  LinebreakNode: ResolverTypeWrapper<EditorNodeData>;
  ListItemNode: ResolverTypeWrapper<EditorNodeData>;
  ListNode: ResolverTypeWrapper<EditorNodeData>;
  ListType: ListType;
  Listing: ResolverTypeWrapper<Omit<Listing, 'show'> & { show?: Maybe<ResolversTypes['Show']> }>;
  MediaCropSetting: ResolverTypeWrapper<MediaCropSetting>;
  MediaCropSettingInput: MediaCropSettingInput;
  MediaSettings: ResolverTypeWrapper<MediaSettingsSource>;
  MediaSettingsInput: MediaSettingsInput;
  MediaUpload: ResolverTypeWrapper<MediaUploadSource>;
  MediaUploadConnection: ResolverTypeWrapper<Connection<MediaUploadSource>>;
  MediaUploadEdge: ResolverTypeWrapper<
    Omit<MediaUploadEdge, 'node'> & { node: ResolversTypes['MediaUpload'] }
  >;
  Mutation: ResolverTypeWrapper<Record<PropertyKey, never>>;
  PageInfo: ResolverTypeWrapper<PageInfo>;
  Podcast: ResolverTypeWrapper<PodcastSource>;
  PodcastConnection: ResolverTypeWrapper<Connection<PodcastSource>>;
  PodcastEdge: ResolverTypeWrapper<Omit<PodcastEdge, 'node'> & { node: ResolversTypes['Podcast'] }>;
  PodcastOrder: PodcastOrder;
  PodcastSettings: ResolverTypeWrapper<PodcastSettingsSource>;
  PodcastSettingsInput: PodcastSettingsInput;
  Post: ResolverTypeWrapper<PostSource>;
  PostConnection: ResolverTypeWrapper<Connection<PostSource>>;
  PostEdge: ResolverTypeWrapper<Omit<PostEdge, 'node'> & { node: ResolversTypes['Post'] }>;
  PostStatus: PostStatus;
  Query: ResolverTypeWrapper<Record<PropertyKey, never>>;
  QuoteNode: ResolverTypeWrapper<EditorNodeData>;
  RootNodeInput: RootNodeInput;
  Show: ResolverTypeWrapper<ShowSource>;
  ShowConnection: ResolverTypeWrapper<ShowConnectionSource>;
  ShowEdge: ResolverTypeWrapper<Omit<ShowEdge, 'node'> & { node: ResolversTypes['Show'] }>;
  ShowEntity: ResolverTypeWrapper<ShowEntitySource>;
  ShowEntityType: ShowEntityType;
  ShowOrder: ShowOrder;
  ShowStat: ResolverTypeWrapper<
    Omit<ShowStat, 'entity'> & { entity: ResolversTypes['ShowEntity'] }
  >;
  ShowTotals: ResolverTypeWrapper<ShowTotals>;
  SiteSettings: ResolverTypeWrapper<SiteSettings>;
  SiteSettingsInput: SiteSettingsInput;
  String: ResolverTypeWrapper<Scalars['String']['output']>;
  TextModeType: TextModeType;
  TextNode: ResolverTypeWrapper<EditorNodeData>;
  UpdateArtistInput: UpdateArtistInput;
  UpdateMediaUploadInput: UpdateMediaUploadInput;
  UpdatePodcastInput: UpdatePodcastInput;
  UpdatePostInput: UpdatePostInput;
  UpdateShowInput: UpdateShowInput;
  UpdateUserInput: UpdateUserInput;
  UpdateVenueInput: UpdateVenueInput;
  UpdateVideoInput: UpdateVideoInput;
  User: ResolverTypeWrapper<UserSource>;
  UserConnection: ResolverTypeWrapper<Connection<UserSource>>;
  UserEdge: ResolverTypeWrapper<Omit<UserEdge, 'node'> & { node: ResolversTypes['User'] }>;
  Venue: ResolverTypeWrapper<VenueSource>;
  VenueConnection: ResolverTypeWrapper<Connection<VenueSource>>;
  VenueCoordinates: ResolverTypeWrapper<VenueCoordinates>;
  VenueCoordinatesInput: VenueCoordinatesInput;
  VenueEdge: ResolverTypeWrapper<Omit<VenueEdge, 'node'> & { node: ResolversTypes['Venue'] }>;
  VenueListings: ResolverTypeWrapper<
    Omit<VenueListings, 'listings'> & { listings: Array<ResolversTypes['Listing']> }
  >;
  Video: ResolverTypeWrapper<VideoSource>;
  VideoConnection: ResolverTypeWrapper<Connection<VideoSource>>;
  VideoEdge: ResolverTypeWrapper<Omit<VideoEdge, 'node'> & { node: ResolversTypes['Video'] }>;
  VideoNode: ResolverTypeWrapper<EditorNodeData>;
  VideoThumbnail: ResolverTypeWrapper<VideoThumbnail>;
  VideoUpload: ResolverTypeWrapper<MediaUploadSource>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  APIKeys: ApiKeys;
  AppleMusicAlbum: Album;
  AppleMusicAlbumResults: Omit<AppleMusicAlbumResults, 'albums'> & {
    albums: Array<ResolversParentTypes['AppleMusicAlbum']>;
  };
  AppleMusicArtwork: AppleMusicArtwork;
  AppleMusicArtworkInput: AppleMusicArtworkInput;
  AppleMusicData: AppleMusicDataSource;
  AppleMusicDataInput: AppleMusicDataInput;
  Artist: ArtistSource;
  ArtistConnection: Connection<ArtistSource>;
  ArtistEdge: Omit<ArtistEdge, 'node'> & { node: ResolversParentTypes['Artist'] };
  AudioUpload: MediaUploadSource;
  Boolean: Scalars['Boolean']['output'];
  BulkCreateShowInput: BulkCreateShowInput;
  BulkCreateShowsResult: BulkCreateShowsResult;
  CodeNode: EditorNodeData;
  CreateArtistInput: CreateArtistInput;
  CreatePodcastInput: CreatePodcastInput;
  CreatePostInput: CreatePostInput;
  CreateShowInput: CreateShowInput;
  CreateUserInput: CreateUserInput;
  CreateVenueInput: CreateVenueInput;
  CreateVideoInput: CreateVideoInput;
  EditorNode: EditorNodeData;
  EditorNodeInput: EditorNodeInput;
  EditorState: Omit<EditorState, 'root'> & { root?: Maybe<ResolversParentTypes['ElementNode']> };
  EditorStateInput: EditorStateInput;
  ElementNode: EditorNodeData;
  ElementNodeType: EditorNodeData;
  EntityArg: EntityArg;
  FileUpload: MediaUploadSource;
  Float: Scalars['Float']['output'];
  HeadingNode: EditorNodeData;
  ImageNode: EditorNodeData;
  ImageUpload: MediaUploadSource;
  ImageUploadCrop: ImageUploadCrop;
  ImportListingInput: ImportListingInput;
  ImportListingsResult: ImportListingsResult;
  Int: Scalars['Int']['output'];
  LexicalNode: EditorNodeData;
  LinebreakNode: EditorNodeData;
  ListItemNode: EditorNodeData;
  ListNode: EditorNodeData;
  Listing: Omit<Listing, 'show'> & { show?: Maybe<ResolversParentTypes['Show']> };
  MediaCropSetting: MediaCropSetting;
  MediaCropSettingInput: MediaCropSettingInput;
  MediaSettings: MediaSettingsSource;
  MediaSettingsInput: MediaSettingsInput;
  MediaUpload: MediaUploadSource;
  MediaUploadConnection: Connection<MediaUploadSource>;
  MediaUploadEdge: Omit<MediaUploadEdge, 'node'> & { node: ResolversParentTypes['MediaUpload'] };
  Mutation: Record<PropertyKey, never>;
  PageInfo: PageInfo;
  Podcast: PodcastSource;
  PodcastConnection: Connection<PodcastSource>;
  PodcastEdge: Omit<PodcastEdge, 'node'> & { node: ResolversParentTypes['Podcast'] };
  PodcastSettings: PodcastSettingsSource;
  PodcastSettingsInput: PodcastSettingsInput;
  Post: PostSource;
  PostConnection: Connection<PostSource>;
  PostEdge: Omit<PostEdge, 'node'> & { node: ResolversParentTypes['Post'] };
  Query: Record<PropertyKey, never>;
  QuoteNode: EditorNodeData;
  RootNodeInput: RootNodeInput;
  Show: ShowSource;
  ShowConnection: ShowConnectionSource;
  ShowEdge: Omit<ShowEdge, 'node'> & { node: ResolversParentTypes['Show'] };
  ShowEntity: ShowEntitySource;
  ShowStat: Omit<ShowStat, 'entity'> & { entity: ResolversParentTypes['ShowEntity'] };
  ShowTotals: ShowTotals;
  SiteSettings: SiteSettings;
  SiteSettingsInput: SiteSettingsInput;
  String: Scalars['String']['output'];
  TextNode: EditorNodeData;
  UpdateArtistInput: UpdateArtistInput;
  UpdateMediaUploadInput: UpdateMediaUploadInput;
  UpdatePodcastInput: UpdatePodcastInput;
  UpdatePostInput: UpdatePostInput;
  UpdateShowInput: UpdateShowInput;
  UpdateUserInput: UpdateUserInput;
  UpdateVenueInput: UpdateVenueInput;
  UpdateVideoInput: UpdateVideoInput;
  User: UserSource;
  UserConnection: Connection<UserSource>;
  UserEdge: Omit<UserEdge, 'node'> & { node: ResolversParentTypes['User'] };
  Venue: VenueSource;
  VenueConnection: Connection<VenueSource>;
  VenueCoordinates: VenueCoordinates;
  VenueCoordinatesInput: VenueCoordinatesInput;
  VenueEdge: Omit<VenueEdge, 'node'> & { node: ResolversParentTypes['Venue'] };
  VenueListings: Omit<VenueListings, 'listings'> & {
    listings: Array<ResolversParentTypes['Listing']>;
  };
  Video: VideoSource;
  VideoConnection: Connection<VideoSource>;
  VideoEdge: Omit<VideoEdge, 'node'> & { node: ResolversParentTypes['Video'] };
  VideoNode: EditorNodeData;
  VideoThumbnail: VideoThumbnail;
  VideoUpload: MediaUploadSource;
};

export type ApiKeysResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['APIKeys'] = ResolversParentTypes['APIKeys'],
> = {
  googleMaps?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type AppleMusicAlbumResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['AppleMusicAlbum'] =
    ResolversParentTypes['AppleMusicAlbum'],
> = {
  artistName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  artwork?: Resolver<ResolversTypes['AppleMusicArtwork'], ParentType, ContextType>;
  cover?: Resolver<
    ResolversTypes['String'],
    ParentType,
    ContextType,
    RequireFields<AppleMusicAlbumCoverArgs, 'size'>
  >;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  releaseDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type AppleMusicAlbumResultsResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['AppleMusicAlbumResults'] =
    ResolversParentTypes['AppleMusicAlbumResults'],
> = {
  albums?: Resolver<Array<ResolversTypes['AppleMusicAlbum']>, ParentType, ContextType>;
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type AppleMusicArtworkResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['AppleMusicArtwork'] =
    ResolversParentTypes['AppleMusicArtwork'],
> = {
  bgColor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  textColor1?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  textColor2?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  textColor3?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  textColor4?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type AppleMusicDataResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['AppleMusicData'] =
    ResolversParentTypes['AppleMusicData'],
> = {
  artwork?: Resolver<Maybe<ResolversTypes['AppleMusicArtwork']>, ParentType, ContextType>;
  genreNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  id?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type ArtistResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Artist'] = ResolversParentTypes['Artist'],
> = {
  appleMusic?: Resolver<Maybe<ResolversTypes['AppleMusicData']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  excludeFromSearch?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  featuredMedia?: Resolver<Maybe<Array<ResolversTypes['MediaUpload']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ArtistConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ArtistConnection'] =
    ResolversParentTypes['ArtistConnection'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['ArtistEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export type ArtistEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ArtistEdge'] = ResolversParentTypes['ArtistEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Artist'], ParentType, ContextType>;
};

export type AudioUploadResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['AudioUpload'] = ResolversParentTypes['AudioUpload'],
> = {
  album?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  albumArtist?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  artist?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  destination?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  genre?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  images?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['ImageUploadCrop']>>>,
    ParentType,
    ContextType
  >;
  mimeType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  year?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type BulkCreateShowsResultResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['BulkCreateShowsResult'] =
    ResolversParentTypes['BulkCreateShowsResult'],
> = {
  artistsCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  showsCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  venuesCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type CodeNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['CodeNode'] = ResolversParentTypes['CodeNode'],
> = {
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EditorNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['EditorNode'] = ResolversParentTypes['EditorNode'],
> = {
  __resolveType: TypeResolveFn<
    | 'CodeNode'
    | 'ElementNode'
    | 'HeadingNode'
    | 'ImageNode'
    | 'LinebreakNode'
    | 'ListItemNode'
    | 'ListNode'
    | 'QuoteNode'
    | 'TextNode'
    | 'VideoNode',
    ParentType,
    ContextType
  >;
};

export type EditorStateResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['EditorState'] = ResolversParentTypes['EditorState'],
> = {
  forEditing?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  root?: Resolver<Maybe<ResolversTypes['ElementNode']>, ParentType, ContextType>;
};

export type ElementNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ElementNode'] = ResolversParentTypes['ElementNode'],
> = {
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ElementNodeTypeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ElementNodeType'] =
    ResolversParentTypes['ElementNodeType'],
> = {
  __resolveType: TypeResolveFn<
    | 'CodeNode'
    | 'ElementNode'
    | 'HeadingNode'
    | 'ImageNode'
    | 'ListItemNode'
    | 'ListNode'
    | 'QuoteNode'
    | 'VideoNode',
    ParentType,
    ContextType
  >;
};

export type FileUploadResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['FileUpload'] = ResolversParentTypes['FileUpload'],
> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  destination?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mimeType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type HeadingNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['HeadingNode'] = ResolversParentTypes['HeadingNode'],
> = {
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  tag?: Resolver<Maybe<ResolversTypes['HeadingTag']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ImageNode'] = ResolversParentTypes['ImageNode'],
> = {
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['ImageUpload']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  size?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageUploadResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ImageUpload'] = ResolversParentTypes['ImageUpload'],
> = {
  altText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  caption?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  crops?: Resolver<Array<ResolversTypes['ImageUploadCrop']>, ParentType, ContextType>;
  destination?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mimeType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ImageUploadCropResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ImageUploadCrop'] =
    ResolversParentTypes['ImageUploadCrop'],
> = {
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type ImportListingsResultResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ImportListingsResult'] =
    ResolversParentTypes['ImportListingsResult'],
> = {
  artistsCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  showsCreated?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type LexicalNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['LexicalNode'] = ResolversParentTypes['LexicalNode'],
> = {
  __resolveType: TypeResolveFn<
    | 'CodeNode'
    | 'ElementNode'
    | 'HeadingNode'
    | 'ImageNode'
    | 'LinebreakNode'
    | 'ListItemNode'
    | 'ListNode'
    | 'QuoteNode'
    | 'TextNode'
    | 'VideoNode',
    ParentType,
    ContextType
  >;
};

export type LinebreakNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['LinebreakNode'] = ResolversParentTypes['LinebreakNode'],
> = {
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListItemNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ListItemNode'] = ResolversParentTypes['ListItemNode'],
> = {
  checked?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  value?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ListNode'] = ResolversParentTypes['ListNode'],
> = {
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  listType?: Resolver<Maybe<ResolversTypes['ListType']>, ParentType, ContextType>;
  start?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ListingResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Listing'] = ResolversParentTypes['Listing'],
> = {
  cancelled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  dateChanged?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  headliners?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  localDate?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  localTime?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  newArtists?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  show?: Resolver<Maybe<ResolversTypes['Show']>, ParentType, ContextType>;
  sourceId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  support?: Resolver<Array<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type MediaCropSettingResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['MediaCropSetting'] =
    ResolversParentTypes['MediaCropSetting'],
> = {
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
};

export type MediaSettingsResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['MediaSettings'] = ResolversParentTypes['MediaSettings'],
> = {
  crops?: Resolver<Array<ResolversTypes['MediaCropSetting']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type MediaUploadResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['MediaUpload'] = ResolversParentTypes['MediaUpload'],
> = {
  __resolveType: TypeResolveFn<
    'AudioUpload' | 'FileUpload' | 'ImageUpload' | 'VideoUpload',
    ParentType,
    ContextType
  >;
};

export type MediaUploadConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['MediaUploadConnection'] =
    ResolversParentTypes['MediaUploadConnection'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['MediaUploadEdge']>, ParentType, ContextType>;
  mimeTypes?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  types?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
};

export type MediaUploadEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['MediaUploadEdge'] =
    ResolversParentTypes['MediaUploadEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['MediaUpload'], ParentType, ContextType>;
};

export type MutationResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation'],
> = {
  addAlbumCovers?: Resolver<
    Array<ResolversTypes['MediaUpload']>,
    ParentType,
    ContextType,
    RequireFields<MutationAddAlbumCoversArgs, 'ids'>
  >;
  bulkCreateShows?: Resolver<
    ResolversTypes['BulkCreateShowsResult'],
    ParentType,
    ContextType,
    RequireFields<MutationBulkCreateShowsArgs, 'input'>
  >;
  createArtist?: Resolver<
    Maybe<ResolversTypes['Artist']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateArtistArgs, 'input'>
  >;
  createPodcast?: Resolver<
    Maybe<ResolversTypes['Podcast']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreatePodcastArgs, 'input'>
  >;
  createPost?: Resolver<
    Maybe<ResolversTypes['Post']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreatePostArgs, 'input'>
  >;
  createShow?: Resolver<
    Maybe<ResolversTypes['Show']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateShowArgs, 'input'>
  >;
  createUser?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateUserArgs, 'input'>
  >;
  createVenue?: Resolver<
    Maybe<ResolversTypes['Venue']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateVenueArgs, 'input'>
  >;
  createVideo?: Resolver<
    Maybe<ResolversTypes['Video']>,
    ParentType,
    ContextType,
    RequireFields<MutationCreateVideoArgs, 'input'>
  >;
  importListings?: Resolver<
    ResolversTypes['ImportListingsResult'],
    ParentType,
    ContextType,
    RequireFields<MutationImportListingsArgs, 'input' | 'venueId'>
  >;
  removeArtist?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemoveArtistArgs, 'ids'>
  >;
  removeMediaUpload?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemoveMediaUploadArgs, 'ids'>
  >;
  removePodcast?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemovePodcastArgs, 'ids'>
  >;
  removePost?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemovePostArgs, 'ids'>
  >;
  removeShow?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemoveShowArgs, 'ids'>
  >;
  removeUser?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemoveUserArgs, 'ids'>
  >;
  removeVenue?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemoveVenueArgs, 'ids'>
  >;
  removeVideo?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType,
    RequireFields<MutationRemoveVideoArgs, 'ids'>
  >;
  updateArtist?: Resolver<
    Maybe<ResolversTypes['Artist']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateArtistArgs, 'id' | 'input'>
  >;
  updateMediaSettings?: Resolver<
    Maybe<ResolversTypes['MediaSettings']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateMediaSettingsArgs, 'id' | 'input'>
  >;
  updateMediaUpload?: Resolver<
    Maybe<ResolversTypes['MediaUpload']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateMediaUploadArgs, 'id' | 'input'>
  >;
  updatePodcast?: Resolver<
    Maybe<ResolversTypes['Podcast']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePodcastArgs, 'id' | 'input'>
  >;
  updatePodcastSettings?: Resolver<
    Maybe<ResolversTypes['PodcastSettings']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePodcastSettingsArgs, 'id' | 'input'>
  >;
  updatePost?: Resolver<
    Maybe<ResolversTypes['Post']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdatePostArgs, 'id' | 'input'>
  >;
  updateShow?: Resolver<
    Maybe<ResolversTypes['Show']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateShowArgs, 'id' | 'input'>
  >;
  updateSiteSettings?: Resolver<
    Maybe<ResolversTypes['SiteSettings']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateSiteSettingsArgs, 'id' | 'input'>
  >;
  updateUser?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateUserArgs, 'id' | 'input'>
  >;
  updateVenue?: Resolver<
    Maybe<ResolversTypes['Venue']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateVenueArgs, 'id' | 'input'>
  >;
  updateVideo?: Resolver<
    Maybe<ResolversTypes['Video']>,
    ParentType,
    ContextType,
    RequireFields<MutationUpdateVideoArgs, 'id' | 'input'>
  >;
};

export type PageInfoResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['PageInfo'] = ResolversParentTypes['PageInfo'],
> = {
  endCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  hasNextPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  hasPreviousPage?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  startCursor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type PodcastResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Podcast'] = ResolversParentTypes['Podcast'],
> = {
  audio?: Resolver<Maybe<ResolversTypes['AudioUpload']>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  description?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['ImageUpload']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PodcastConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['PodcastConnection'] =
    ResolversParentTypes['PodcastConnection'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['PodcastEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export type PodcastEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['PodcastEdge'] = ResolversParentTypes['PodcastEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Podcast'], ParentType, ContextType>;
};

export type PodcastSettingsResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['PodcastSettings'] =
    ResolversParentTypes['PodcastSettings'],
> = {
  category?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  copyrightText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  explicit?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  feedLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  generator?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  image?: Resolver<Maybe<ResolversTypes['ImageUpload']>, ParentType, ContextType>;
  itunesEmail?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  itunesName?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  managingEditor?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  websiteLink?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type PostResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post'],
> = {
  artists?: Resolver<Maybe<Array<Maybe<ResolversTypes['Artist']>>>, ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  editorState?: Resolver<Maybe<ResolversTypes['EditorState']>, ParentType, ContextType>;
  featuredMedia?: Resolver<Maybe<Array<ResolversTypes['MediaUpload']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['PostStatus']>, ParentType, ContextType>;
  summary?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
};

export type PostConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['PostConnection'] =
    ResolversParentTypes['PostConnection'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['PostEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export type PostEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['PostEdge'] = ResolversParentTypes['PostEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Post'], ParentType, ContextType>;
};

export type QueryResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
  apiKeys?: Resolver<Maybe<ResolversTypes['APIKeys']>, ParentType, ContextType>;
  appleMusicAlbums?: Resolver<
    ResolversTypes['AppleMusicAlbumResults'],
    ParentType,
    ContextType,
    RequireFields<QueryAppleMusicAlbumsArgs, 'term'>
  >;
  artist?: Resolver<
    Maybe<ResolversTypes['Artist']>,
    ParentType,
    ContextType,
    Partial<QueryArtistArgs>
  >;
  artists?: Resolver<
    Maybe<ResolversTypes['ArtistConnection']>,
    ParentType,
    ContextType,
    Partial<QueryArtistsArgs>
  >;
  media?: Resolver<
    Maybe<ResolversTypes['MediaUpload']>,
    ParentType,
    ContextType,
    Partial<QueryMediaArgs>
  >;
  mediaSettings?: Resolver<ResolversTypes['MediaSettings'], ParentType, ContextType>;
  podcast?: Resolver<
    Maybe<ResolversTypes['Podcast']>,
    ParentType,
    ContextType,
    Partial<QueryPodcastArgs>
  >;
  podcastSettings?: Resolver<ResolversTypes['PodcastSettings'], ParentType, ContextType>;
  podcasts?: Resolver<
    Maybe<ResolversTypes['PodcastConnection']>,
    ParentType,
    ContextType,
    Partial<QueryPodcastsArgs>
  >;
  post?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType, Partial<QueryPostArgs>>;
  posts?: Resolver<
    Maybe<ResolversTypes['PostConnection']>,
    ParentType,
    ContextType,
    Partial<QueryPostsArgs>
  >;
  show?: Resolver<Maybe<ResolversTypes['Show']>, ParentType, ContextType, Partial<QueryShowArgs>>;
  showStats?: Resolver<
    Array<ResolversTypes['ShowStat']>,
    ParentType,
    ContextType,
    RequireFields<QueryShowStatsArgs, 'entity'>
  >;
  showTotals?: Resolver<ResolversTypes['ShowTotals'], ParentType, ContextType>;
  shows?: Resolver<
    Maybe<ResolversTypes['ShowConnection']>,
    ParentType,
    ContextType,
    Partial<QueryShowsArgs>
  >;
  siteSettings?: Resolver<ResolversTypes['SiteSettings'], ParentType, ContextType>;
  uploads?: Resolver<
    Maybe<ResolversTypes['MediaUploadConnection']>,
    ParentType,
    ContextType,
    Partial<QueryUploadsArgs>
  >;
  user?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    RequireFields<QueryUserArgs, 'id'>
  >;
  users?: Resolver<
    Maybe<ResolversTypes['UserConnection']>,
    ParentType,
    ContextType,
    Partial<QueryUsersArgs>
  >;
  venue?: Resolver<
    Maybe<ResolversTypes['Venue']>,
    ParentType,
    ContextType,
    Partial<QueryVenueArgs>
  >;
  venueListings?: Resolver<
    ResolversTypes['VenueListings'],
    ParentType,
    ContextType,
    RequireFields<QueryVenueListingsArgs, 'venueId'>
  >;
  venues?: Resolver<
    Maybe<ResolversTypes['VenueConnection']>,
    ParentType,
    ContextType,
    Partial<QueryVenuesArgs>
  >;
  video?: Resolver<
    Maybe<ResolversTypes['Video']>,
    ParentType,
    ContextType,
    Partial<QueryVideoArgs>
  >;
  videos?: Resolver<
    Maybe<ResolversTypes['VideoConnection']>,
    ParentType,
    ContextType,
    Partial<QueryVideosArgs>
  >;
};

export type QuoteNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['QuoteNode'] = ResolversParentTypes['QuoteNode'],
> = {
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type ShowResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Show'] = ResolversParentTypes['Show'],
> = {
  artists?: Resolver<Array<ResolversTypes['Artist']>, ParentType, ContextType>;
  attended?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  date?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  notes?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  url?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  venue?: Resolver<ResolversTypes['Venue'], ParentType, ContextType>;
};

export type ShowConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ShowConnection'] =
    ResolversParentTypes['ShowConnection'],
> = {
  count?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['ShowEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  years?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
};

export type ShowEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ShowEdge'] = ResolversParentTypes['ShowEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Show'], ParentType, ContextType>;
};

export type ShowEntityResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ShowEntity'] = ResolversParentTypes['ShowEntity'],
> = {
  __resolveType: TypeResolveFn<'Artist' | 'Venue', ParentType, ContextType>;
};

export type ShowStatResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ShowStat'] = ResolversParentTypes['ShowStat'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  entity?: Resolver<ResolversTypes['ShowEntity'], ParentType, ContextType>;
  firstDate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  lastDate?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
};

export type ShowTotalsResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['ShowTotals'] = ResolversParentTypes['ShowTotals'],
> = {
  artists?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  firstDate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  lastDate?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  shows?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  venues?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type SiteSettingsResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['SiteSettings'] = ResolversParentTypes['SiteSettings'],
> = {
  copyrightText?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  emailAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  language?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteTitle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  siteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  tagline?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type TextNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['TextNode'] = ResolversParentTypes['TextNode'],
> = {
  detail?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  mode?: Resolver<Maybe<ResolversTypes['TextModeType']>, ParentType, ContextType>;
  style?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  text?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  textFormat?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  textStyle?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'],
> = {
  bio?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  email?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  roles?: Resolver<Maybe<Array<Maybe<ResolversTypes['String']>>>, ParentType, ContextType>;
};

export type UserConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['UserConnection'] =
    ResolversParentTypes['UserConnection'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['UserEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export type UserEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['UserEdge'] = ResolversParentTypes['UserEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['User'], ParentType, ContextType>;
};

export type VenueResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Venue'] = ResolversParentTypes['Venue'],
> = {
  address?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  capacity?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  city?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  coordinates?: Resolver<Maybe<ResolversTypes['VenueCoordinates']>, ParentType, ContextType>;
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  excludeFromSearch?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  featuredMedia?: Resolver<Maybe<Array<ResolversTypes['MediaUpload']>>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  listingsUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  permanentlyClosed?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  postalCode?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  state?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  streetAddress?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  website?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VenueConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VenueConnection'] =
    ResolversParentTypes['VenueConnection'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['VenueEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
};

export type VenueCoordinatesResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VenueCoordinates'] =
    ResolversParentTypes['VenueCoordinates'],
> = {
  latitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  longitude?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
};

export type VenueEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VenueEdge'] = ResolversParentTypes['VenueEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Venue'], ParentType, ContextType>;
};

export type VenueListingsResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VenueListings'] = ResolversParentTypes['VenueListings'],
> = {
  error?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  listings?: Resolver<Array<ResolversTypes['Listing']>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
};

export type VideoResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['Video'] = ResolversParentTypes['Video'],
> = {
  createdAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  dataId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dataPlaylistId?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  dataType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  position?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  publishedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  publishedISO?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  slug?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  thumbnails?: Resolver<Array<ResolversTypes['VideoThumbnail']>, ParentType, ContextType>;
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  updatedAt?: Resolver<ResolversTypes['Float'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type VideoConnectionResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VideoConnection'] =
    ResolversParentTypes['VideoConnection'],
> = {
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  edges?: Resolver<Array<ResolversTypes['VideoEdge']>, ParentType, ContextType>;
  pageInfo?: Resolver<ResolversTypes['PageInfo'], ParentType, ContextType>;
  years?: Resolver<Maybe<Array<ResolversTypes['Int']>>, ParentType, ContextType>;
};

export type VideoEdgeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VideoEdge'] = ResolversParentTypes['VideoEdge'],
> = {
  cursor?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  node?: Resolver<ResolversTypes['Video'], ParentType, ContextType>;
};

export type VideoNodeResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VideoNode'] = ResolversParentTypes['VideoNode'],
> = {
  children?: Resolver<Maybe<Array<Maybe<ResolversTypes['EditorNode']>>>, ParentType, ContextType>;
  direction?: Resolver<Maybe<ResolversTypes['ElementDirection']>, ParentType, ContextType>;
  format?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  indent?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  version?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  video?: Resolver<Maybe<ResolversTypes['Video']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type VideoThumbnailResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VideoThumbnail'] =
    ResolversParentTypes['VideoThumbnail'],
> = {
  height?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  url?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
};

export type VideoUploadResolvers<
  ContextType = AppContext,
  ParentType extends ResolversParentTypes['VideoUpload'] = ResolversParentTypes['VideoUpload'],
> = {
  description?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  destination?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  duration?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  fileName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  fileSize?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  height?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  id?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  mimeType?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  originalName?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  type?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  width?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  __isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = AppContext> = {
  APIKeys?: ApiKeysResolvers<ContextType>;
  AppleMusicAlbum?: AppleMusicAlbumResolvers<ContextType>;
  AppleMusicAlbumResults?: AppleMusicAlbumResultsResolvers<ContextType>;
  AppleMusicArtwork?: AppleMusicArtworkResolvers<ContextType>;
  AppleMusicData?: AppleMusicDataResolvers<ContextType>;
  Artist?: ArtistResolvers<ContextType>;
  ArtistConnection?: ArtistConnectionResolvers<ContextType>;
  ArtistEdge?: ArtistEdgeResolvers<ContextType>;
  AudioUpload?: AudioUploadResolvers<ContextType>;
  BulkCreateShowsResult?: BulkCreateShowsResultResolvers<ContextType>;
  CodeNode?: CodeNodeResolvers<ContextType>;
  EditorNode?: EditorNodeResolvers<ContextType>;
  EditorState?: EditorStateResolvers<ContextType>;
  ElementNode?: ElementNodeResolvers<ContextType>;
  ElementNodeType?: ElementNodeTypeResolvers<ContextType>;
  FileUpload?: FileUploadResolvers<ContextType>;
  HeadingNode?: HeadingNodeResolvers<ContextType>;
  ImageNode?: ImageNodeResolvers<ContextType>;
  ImageUpload?: ImageUploadResolvers<ContextType>;
  ImageUploadCrop?: ImageUploadCropResolvers<ContextType>;
  ImportListingsResult?: ImportListingsResultResolvers<ContextType>;
  LexicalNode?: LexicalNodeResolvers<ContextType>;
  LinebreakNode?: LinebreakNodeResolvers<ContextType>;
  ListItemNode?: ListItemNodeResolvers<ContextType>;
  ListNode?: ListNodeResolvers<ContextType>;
  Listing?: ListingResolvers<ContextType>;
  MediaCropSetting?: MediaCropSettingResolvers<ContextType>;
  MediaSettings?: MediaSettingsResolvers<ContextType>;
  MediaUpload?: MediaUploadResolvers<ContextType>;
  MediaUploadConnection?: MediaUploadConnectionResolvers<ContextType>;
  MediaUploadEdge?: MediaUploadEdgeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  PageInfo?: PageInfoResolvers<ContextType>;
  Podcast?: PodcastResolvers<ContextType>;
  PodcastConnection?: PodcastConnectionResolvers<ContextType>;
  PodcastEdge?: PodcastEdgeResolvers<ContextType>;
  PodcastSettings?: PodcastSettingsResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  PostConnection?: PostConnectionResolvers<ContextType>;
  PostEdge?: PostEdgeResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  QuoteNode?: QuoteNodeResolvers<ContextType>;
  Show?: ShowResolvers<ContextType>;
  ShowConnection?: ShowConnectionResolvers<ContextType>;
  ShowEdge?: ShowEdgeResolvers<ContextType>;
  ShowEntity?: ShowEntityResolvers<ContextType>;
  ShowStat?: ShowStatResolvers<ContextType>;
  ShowTotals?: ShowTotalsResolvers<ContextType>;
  SiteSettings?: SiteSettingsResolvers<ContextType>;
  TextNode?: TextNodeResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  UserConnection?: UserConnectionResolvers<ContextType>;
  UserEdge?: UserEdgeResolvers<ContextType>;
  Venue?: VenueResolvers<ContextType>;
  VenueConnection?: VenueConnectionResolvers<ContextType>;
  VenueCoordinates?: VenueCoordinatesResolvers<ContextType>;
  VenueEdge?: VenueEdgeResolvers<ContextType>;
  VenueListings?: VenueListingsResolvers<ContextType>;
  Video?: VideoResolvers<ContextType>;
  VideoConnection?: VideoConnectionResolvers<ContextType>;
  VideoEdge?: VideoEdgeResolvers<ContextType>;
  VideoNode?: VideoNodeResolvers<ContextType>;
  VideoThumbnail?: VideoThumbnailResolvers<ContextType>;
  VideoUpload?: VideoUploadResolvers<ContextType>;
};
