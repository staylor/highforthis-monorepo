export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = {
  [_ in K]?: never;
};
export type Incremental<T> =
  | T
  | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string };
  String: { input: string; output: string };
  Boolean: { input: boolean; output: boolean };
  Int: { input: number; output: number };
  Float: { input: number; output: number };
  ObjID: { input: any; output: any };
};

export type ApiKeys = {
  __typename?: 'APIKeys';
  googleMaps?: Maybe<Scalars['String']['output']>;
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
  id: Scalars['ObjID']['output'];
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
  id: Scalars['ObjID']['output'];
  images?: Maybe<Array<Maybe<ImageUploadCrop>>>;
  mimeType: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  year?: Maybe<Scalars['Int']['output']>;
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
  audio?: InputMaybe<Scalars['ObjID']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ObjID']['input']>;
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
  artists: Array<Scalars['ObjID']['input']>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  date: Scalars['Float']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  venue: Scalars['ObjID']['input'];
};

export type CreateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CreateVenueInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  capacity?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<VenueCoordinatesInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  excludeFromSearch?: InputMaybe<Scalars['Boolean']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  permanentlyClosed?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
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

export type DashboardSettings = {
  __typename?: 'DashboardSettings';
  googleClientId?: Maybe<Scalars['String']['output']>;
  googleTrackingId?: Maybe<Scalars['String']['output']>;
  id: Scalars['String']['output'];
};

export type DashboardSettingsInput = {
  googleClientId?: InputMaybe<Scalars['String']['input']>;
  googleTrackingId?: InputMaybe<Scalars['String']['input']>;
};

export type EditorNode =
  | CodeNode
  | ElementNode
  | HeadingNode
  | ImageNode
  | LinebreakNode
  | QuoteNode
  | TextNode
  | VideoNode;

export type EditorNodeInput = {
  children?: InputMaybe<Array<InputMaybe<EditorNodeInput>>>;
  detail?: InputMaybe<Scalars['Int']['input']>;
  direction?: InputMaybe<ElementDirection>;
  format?: InputMaybe<Scalars['Int']['input']>;
  imageId?: InputMaybe<Scalars['String']['input']>;
  indent?: InputMaybe<Scalars['Int']['input']>;
  language?: InputMaybe<Scalars['String']['input']>;
  mode?: InputMaybe<TextModeType>;
  size?: InputMaybe<Scalars['String']['input']>;
  style?: InputMaybe<Scalars['String']['input']>;
  tag?: InputMaybe<HeadingTag>;
  text?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
  videoId?: InputMaybe<Scalars['String']['input']>;
};

export type EditorState = {
  __typename?: 'EditorState';
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

export type ElementNodeInput = {
  children?: InputMaybe<Array<InputMaybe<EditorNodeInput>>>;
  direction?: InputMaybe<ElementDirection>;
  format?: InputMaybe<Scalars['Int']['input']>;
  indent?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
  version?: InputMaybe<Scalars['Int']['input']>;
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
  id?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type FileUpload = MediaUpload & {
  __typename?: 'FileUpload';
  description?: Maybe<Scalars['String']['output']>;
  destination: Scalars['String']['output'];
  fileName: Scalars['String']['output'];
  fileSize: Scalars['Int']['output'];
  id: Scalars['ObjID']['output'];
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
  id: Scalars['ObjID']['output'];
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

export type ImageUploadCropInput = {
  fileName?: InputMaybe<Scalars['String']['input']>;
  fileSize?: InputMaybe<Scalars['Int']['input']>;
  height?: InputMaybe<Scalars['Int']['input']>;
  width?: InputMaybe<Scalars['Int']['input']>;
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
  id: Scalars['ObjID']['output'];
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
  createArtist?: Maybe<Artist>;
  createPodcast?: Maybe<Podcast>;
  createPost?: Maybe<Post>;
  createShow?: Maybe<Show>;
  createUser?: Maybe<User>;
  createVenue?: Maybe<Venue>;
  createVideo?: Maybe<Video>;
  removeArtist?: Maybe<Scalars['Boolean']['output']>;
  removeMediaUpload?: Maybe<Scalars['Boolean']['output']>;
  removePodcast?: Maybe<Scalars['Boolean']['output']>;
  removePost?: Maybe<Scalars['Boolean']['output']>;
  removeShow?: Maybe<Scalars['Boolean']['output']>;
  removeUser?: Maybe<Scalars['Boolean']['output']>;
  removeVenue?: Maybe<Scalars['Boolean']['output']>;
  removeVideo?: Maybe<Scalars['Boolean']['output']>;
  updateArtist?: Maybe<Artist>;
  updateDashboardSettings?: Maybe<DashboardSettings>;
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

export type MutationRemoveArtistArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationRemoveMediaUploadArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationRemovePodcastArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationRemovePostArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationRemoveShowArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationRemoveUserArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationRemoveVenueArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationRemoveVideoArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};

export type MutationUpdateArtistArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateArtistInput;
};

export type MutationUpdateDashboardSettingsArgs = {
  id: Scalars['String']['input'];
  input: DashboardSettingsInput;
};

export type MutationUpdateMediaSettingsArgs = {
  id: Scalars['String']['input'];
  input: MediaSettingsInput;
};

export type MutationUpdateMediaUploadArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateMediaUploadInput;
};

export type MutationUpdatePodcastArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdatePodcastInput;
};

export type MutationUpdatePodcastSettingsArgs = {
  id: Scalars['String']['input'];
  input: PodcastSettingsInput;
};

export type MutationUpdatePostArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdatePostInput;
};

export type MutationUpdateShowArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateShowInput;
};

export type MutationUpdateSiteSettingsArgs = {
  id: Scalars['String']['input'];
  input: SiteSettingsInput;
};

export type MutationUpdateUserArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateUserInput;
};

export type MutationUpdateVenueArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateVenueInput;
};

export type MutationUpdateVideoArgs = {
  id: Scalars['ObjID']['input'];
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
  id: Scalars['ObjID']['output'];
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
  image?: InputMaybe<Scalars['ObjID']['input']>;
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
  id: Scalars['ObjID']['output'];
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
  artist?: Maybe<Artist>;
  artists?: Maybe<ArtistConnection>;
  dashboardSettings: DashboardSettings;
  media?: Maybe<MediaUpload>;
  mediaSettings: MediaSettings;
  podcast?: Maybe<Podcast>;
  podcastSettings: PodcastSettings;
  podcasts?: Maybe<PodcastConnection>;
  post?: Maybe<Post>;
  posts?: Maybe<PostConnection>;
  show?: Maybe<Show>;
  showStats: Array<ShowStat>;
  shows?: Maybe<ShowConnection>;
  siteSettings: SiteSettings;
  uploads?: Maybe<MediaUploadConnection>;
  user?: Maybe<User>;
  users?: Maybe<UserConnection>;
  venue?: Maybe<Venue>;
  venues?: Maybe<VenueConnection>;
  video?: Maybe<Video>;
  videos?: Maybe<VideoConnection>;
};

export type QueryArtistArgs = {
  id?: InputMaybe<Scalars['ObjID']['input']>;
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
  id?: InputMaybe<Scalars['ObjID']['input']>;
};

export type QueryPodcastArgs = {
  id?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
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
  id?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type QueryPostsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<PostStatus>;
  year?: InputMaybe<Scalars['Int']['input']>;
};

export type QueryShowArgs = {
  id?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type QueryShowStatsArgs = {
  entity: ShowEntityType;
};

export type QueryShowsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  artist?: InputMaybe<EntityArg>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latest?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<ShowOrder>;
  search?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<EntityArg>;
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
  id: Scalars['ObjID']['input'];
};

export type QueryUsersArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type QueryVenueArgs = {
  id?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
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
  id?: InputMaybe<Scalars['ObjID']['input']>;
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
  id: Scalars['ObjID']['output'];
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
  audio?: InputMaybe<Scalars['ObjID']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  image?: InputMaybe<Scalars['ObjID']['input']>;
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
  artists?: InputMaybe<Array<InputMaybe<Scalars['ObjID']['input']>>>;
  attended?: InputMaybe<Scalars['Boolean']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['ObjID']['input']>;
};

export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UpdateVenueInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  capacity?: InputMaybe<Scalars['String']['input']>;
  coordinates?: InputMaybe<VenueCoordinatesInput>;
  description?: InputMaybe<Scalars['String']['input']>;
  excludeFromSearch?: InputMaybe<Scalars['Boolean']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  permanentlyClosed?: InputMaybe<Scalars['Boolean']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
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
  id: Scalars['ObjID']['output'];
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
  coordinates?: Maybe<VenueCoordinates>;
  description?: Maybe<Scalars['String']['output']>;
  excludeFromSearch?: Maybe<Scalars['Boolean']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  permanentlyClosed?: Maybe<Scalars['Boolean']['output']>;
  slug: Scalars['String']['output'];
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

export type Video = {
  __typename?: 'Video';
  createdAt: Scalars['Float']['output'];
  dataId: Scalars['String']['output'];
  dataPlaylistId: Scalars['String']['output'];
  dataType: Scalars['String']['output'];
  id: Scalars['ObjID']['output'];
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
  id: Scalars['ObjID']['output'];
  mimeType: Scalars['String']['output'];
  originalName: Scalars['String']['output'];
  title?: Maybe<Scalars['String']['output']>;
  type: Scalars['String']['output'];
  width?: Maybe<Scalars['Int']['output']>;
};
