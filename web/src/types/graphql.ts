export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  ObjID: { input: any; output: any; }
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

export type Artist = Term & {
  __typename?: 'Artist';
  appleMusic?: Maybe<AppleMusicData>;
  description?: Maybe<Scalars['String']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  taxonomy: Taxonomy;
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

export type Category = Term & {
  __typename?: 'Category';
  description?: Maybe<Scalars['String']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  taxonomy: Taxonomy;
};

export type CodeNode = ElementNodeType & LexicalNode & {
  __typename?: 'CodeNode';
  children?: Maybe<Array<Maybe<EditorNode>>>;
  direction?: Maybe<ElementDirection>;
  format?: Maybe<Scalars['Int']['output']>;
  indent?: Maybe<Scalars['Int']['output']>;
  language?: Maybe<Scalars['String']['output']>;
  type?: Maybe<Scalars['String']['output']>;
  version?: Maybe<Scalars['Int']['output']>;
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
  artist: Scalars['ObjID']['input'];
  date: Scalars['Float']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  venue: Scalars['ObjID']['input'];
};

export type CreateTaxonomyInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  plural?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type CreateTermInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  capacity?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  crossStreets?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name: Scalars['String']['input'];
  neighborhood?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  taxonomy: Scalars['ObjID']['input'];
};

export type CreateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type CreateVideoInput = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  dataPlaylistIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  dataType?: InputMaybe<Scalars['String']['input']>;
  position?: InputMaybe<Scalars['Int']['input']>;
  publishedAt: Scalars['Float']['input'];
  publishedISO?: InputMaybe<Scalars['String']['input']>;
  slug: Scalars['String']['input'];
  title: Scalars['String']['input'];
  year: Scalars['Int']['input'];
};

export type CrossStreet = Term & {
  __typename?: 'CrossStreet';
  description?: Maybe<Scalars['String']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  taxonomy: Taxonomy;
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

export type EditorNode = CodeNode | ElementNode | HeadingNode | ImageNode | LinebreakNode | QuoteNode | TextNode | VideoNode;

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
  Rtl = 'rtl'
}

export type ElementNode = ElementNodeType & LexicalNode & {
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

export type HeadingNode = ElementNodeType & LexicalNode & {
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
  H6 = 'h6'
}

export type ImageNode = ElementNodeType & LexicalNode & {
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
  createPodcast?: Maybe<Podcast>;
  createPost?: Maybe<Post>;
  createShow?: Maybe<Show>;
  createTaxonomy?: Maybe<Taxonomy>;
  createTerm?: Maybe<Term>;
  createUser?: Maybe<User>;
  createVideo?: Maybe<Video>;
  removeMediaUpload?: Maybe<Scalars['Boolean']['output']>;
  removePodcast?: Maybe<Scalars['Boolean']['output']>;
  removePost?: Maybe<Scalars['Boolean']['output']>;
  removeShow?: Maybe<Scalars['Boolean']['output']>;
  removeTaxonomy?: Maybe<Scalars['Boolean']['output']>;
  removeTerm?: Maybe<Scalars['Boolean']['output']>;
  removeUser?: Maybe<Scalars['Boolean']['output']>;
  removeVideo?: Maybe<Scalars['Boolean']['output']>;
  updateDashboardSettings?: Maybe<DashboardSettings>;
  updateMediaSettings?: Maybe<MediaSettings>;
  updateMediaUpload?: Maybe<MediaUpload>;
  updatePodcast?: Maybe<Podcast>;
  updatePodcastSettings?: Maybe<PodcastSettings>;
  updatePost?: Maybe<Post>;
  updateShow?: Maybe<Show>;
  updateSiteSettings?: Maybe<SiteSettings>;
  updateTaxonomy?: Maybe<Taxonomy>;
  updateTerm?: Maybe<Term>;
  updateUser?: Maybe<User>;
  updateVideo?: Maybe<Video>;
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


export type MutationCreateTaxonomyArgs = {
  input: CreateTaxonomyInput;
};


export type MutationCreateTermArgs = {
  input: CreateTermInput;
};


export type MutationCreateUserArgs = {
  input: CreateUserInput;
};


export type MutationCreateVideoArgs = {
  input: CreateVideoInput;
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


export type MutationRemoveTaxonomyArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};


export type MutationRemoveTermArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};


export type MutationRemoveUserArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
};


export type MutationRemoveVideoArgs = {
  ids: Array<InputMaybe<Scalars['ObjID']['input']>>;
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


export type MutationUpdateTaxonomyArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateTaxonomyInput;
};


export type MutationUpdateTermArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateTermInput;
};


export type MutationUpdateUserArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateUserInput;
};


export type MutationUpdateVideoArgs = {
  id: Scalars['ObjID']['input'];
  input: UpdateVideoInput;
};

export type Neighborhood = Term & {
  __typename?: 'Neighborhood';
  description?: Maybe<Scalars['String']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  taxonomy: Taxonomy;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage?: Maybe<Scalars['Boolean']['output']>;
  hasPreviousPage?: Maybe<Scalars['Boolean']['output']>;
  startCursor?: Maybe<Scalars['String']['output']>;
};

export type Place = Term & {
  __typename?: 'Place';
  address?: Maybe<Scalars['String']['output']>;
  categories: Array<Category>;
  crossStreets: Array<CrossStreet>;
  description?: Maybe<Scalars['String']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  neighborhood?: Maybe<Neighborhood>;
  slug: Scalars['String']['output'];
  taxonomy: Taxonomy;
};

export enum PlaceOrder {
  AToZ = 'A_TO_Z',
  UpdatedAsc = 'UPDATED_ASC',
  UpdatedDesc = 'UPDATED_DESC',
  ZToA = 'Z_TO_A'
}

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
  Desc = 'DESC'
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
  artists?: Maybe<Array<Maybe<Term>>>;
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
  Publish = 'PUBLISH'
}

export type Query = {
  __typename?: 'Query';
  apiKeys?: Maybe<ApiKeys>;
  dashboardSettings: DashboardSettings;
  media?: Maybe<MediaUpload>;
  mediaSettings: MediaSettings;
  places?: Maybe<TermConnection>;
  podcast?: Maybe<Podcast>;
  podcastSettings: PodcastSettings;
  podcasts?: Maybe<PodcastConnection>;
  post?: Maybe<Post>;
  posts?: Maybe<PostConnection>;
  show?: Maybe<Show>;
  shows?: Maybe<ShowConnection>;
  siteSettings: SiteSettings;
  taxonomies?: Maybe<TaxonomyConnection>;
  taxonomy?: Maybe<Taxonomy>;
  term?: Maybe<Term>;
  terms?: Maybe<TermConnection>;
  uploads?: Maybe<MediaUploadConnection>;
  user?: Maybe<User>;
  users?: Maybe<UserConnection>;
  video?: Maybe<Video>;
  videos?: Maybe<VideoConnection>;
};


export type QueryMediaArgs = {
  id?: InputMaybe<Scalars['ObjID']['input']>;
};


export type QueryPlacesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  crossStreets?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  neighborhoods?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  order?: InputMaybe<PlaceOrder>;
  search?: InputMaybe<Scalars['String']['input']>;
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


export type QueryShowsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  latest?: InputMaybe<Scalars['Boolean']['input']>;
  order?: InputMaybe<ShowOrder>;
  search?: InputMaybe<Scalars['String']['input']>;
  taxonomy?: InputMaybe<Scalars['String']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTaxonomiesArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryTaxonomyArgs = {
  id?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTermArgs = {
  id?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  taxonomy?: InputMaybe<Scalars['String']['input']>;
};


export type QueryTermsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  taxonomy?: InputMaybe<Scalars['String']['input']>;
  taxonomyId?: InputMaybe<Scalars['ObjID']['input']>;
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

export type QuoteNode = ElementNodeType & LexicalNode & {
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
  artist: Term;
  date: Scalars['Float']['output'];
  id: Scalars['ObjID']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  title?: Maybe<Scalars['String']['output']>;
  url?: Maybe<Scalars['String']['output']>;
  venue: Term;
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

export enum ShowOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

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

export type Taxonomy = {
  __typename?: 'Taxonomy';
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  plural?: Maybe<Scalars['String']['output']>;
  slug: Scalars['String']['output'];
};

export type TaxonomyConnection = {
  __typename?: 'TaxonomyConnection';
  count: Scalars['Int']['output'];
  edges: Array<TaxonomyEdge>;
  pageInfo: PageInfo;
};

export type TaxonomyEdge = {
  __typename?: 'TaxonomyEdge';
  cursor: Scalars['String']['output'];
  node: Taxonomy;
};

export type Term = {
  description?: Maybe<Scalars['String']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  taxonomy: Taxonomy;
};

export type TermConnection = {
  __typename?: 'TermConnection';
  count: Scalars['Int']['output'];
  edges: Array<TermEdge>;
  pageInfo: PageInfo;
  taxonomy: Taxonomy;
};

export type TermEdge = {
  __typename?: 'TermEdge';
  cursor: Scalars['String']['output'];
  node: Term;
};

export enum TextModeType {
  Normal = 'normal',
  Segmented = 'segmented',
  Token = 'token'
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
  artist?: InputMaybe<Scalars['ObjID']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  notes?: InputMaybe<Scalars['String']['input']>;
  title?: InputMaybe<Scalars['String']['input']>;
  url?: InputMaybe<Scalars['String']['input']>;
  venue?: InputMaybe<Scalars['ObjID']['input']>;
};

export type UpdateTaxonomyInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  plural?: InputMaybe<Scalars['String']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
};

export type UpdateTermInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  appleMusic?: InputMaybe<AppleMusicDataInput>;
  capacity?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  coordinates?: InputMaybe<VenueCoordinatesInput>;
  crossStreets?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  description?: InputMaybe<Scalars['String']['input']>;
  featuredMedia?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
  name?: InputMaybe<Scalars['String']['input']>;
  neighborhood?: InputMaybe<Scalars['ObjID']['input']>;
  slug?: InputMaybe<Scalars['String']['input']>;
  taxonomy?: InputMaybe<Scalars['ObjID']['input']>;
};

export type UpdateUserInput = {
  bio?: InputMaybe<Scalars['String']['input']>;
  email?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  password?: InputMaybe<Scalars['String']['input']>;
  roles?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
};

export type UpdateVideoInput = {
  dataId?: InputMaybe<Scalars['String']['input']>;
  dataPlaylistIds?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>>>;
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

export type Venue = Term & {
  __typename?: 'Venue';
  address?: Maybe<Scalars['String']['output']>;
  capacity?: Maybe<Scalars['String']['output']>;
  coordinates?: Maybe<VenueCoordinates>;
  description?: Maybe<Scalars['String']['output']>;
  featuredMedia?: Maybe<Array<MediaUpload>>;
  id: Scalars['ObjID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  taxonomy: Taxonomy;
};

export type VenueCoordinates = {
  __typename?: 'VenueCoordinates';
  latitude?: Maybe<Scalars['Float']['output']>;
  longitude?: Maybe<Scalars['Float']['output']>;
};

export type VenueCoordinatesInput = {
  latitude: Scalars['Float']['input'];
  longitude: Scalars['Float']['input'];
};

export type Video = {
  __typename?: 'Video';
  createdAt: Scalars['Float']['output'];
  dataId: Scalars['String']['output'];
  dataPlaylistIds: Array<Scalars['String']['output']>;
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

export type VideoNode = ElementNodeType & LexicalNode & {
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

type FeaturedMedia_Media_AudioUpload_Fragment = { __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string };

type FeaturedMedia_Media_FileUpload_Fragment = { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string };

type FeaturedMedia_Media_ImageUpload_Fragment = { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> };

type FeaturedMedia_Media_VideoUpload_Fragment = { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string };

export type FeaturedMedia_MediaFragment = FeaturedMedia_Media_AudioUpload_Fragment | FeaturedMedia_Media_FileUpload_Fragment | FeaturedMedia_Media_ImageUpload_Fragment | FeaturedMedia_Media_VideoUpload_Fragment;

type MediaForm_Media_AudioUpload_Fragment = { __typename?: 'AudioUpload', description?: string | null, duration?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number } | null> | null };

type MediaForm_Media_FileUpload_Fragment = { __typename?: 'FileUpload', description?: string | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string };

type MediaForm_Media_ImageUpload_Fragment = { __typename?: 'ImageUpload', altText?: string | null, caption?: string | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number }> };

type MediaForm_Media_VideoUpload_Fragment = { __typename?: 'VideoUpload', description?: string | null, duration?: number | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string };

export type MediaForm_MediaFragment = MediaForm_Media_AudioUpload_Fragment | MediaForm_Media_FileUpload_Fragment | MediaForm_Media_ImageUpload_Fragment | MediaForm_Media_VideoUpload_Fragment;

export type PodcastForm_PodcastFragment = { __typename?: 'Podcast', description: string, id: any, title: string, audio?: { __typename?: 'AudioUpload', id: any, destination: string, fileName: string, type: string } | null, image?: { __typename?: 'ImageUpload', id: any, destination: string, fileName: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null };

export type PostForm_PostFragment = { __typename?: 'Post', date?: number | null, id: any, slug: string, status?: PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'HeadingNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, tag?: HeadingTag | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'ImageNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, image?: { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } | { __typename?: 'LinebreakNode' } | { __typename?: 'QuoteNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'TextNode' } | { __typename?: 'VideoNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, video?: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null } | null> | null } | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null };

export type ShowForm_ShowFragment = { __typename?: 'Show', date: number, id: any, notes?: string | null, title?: string | null, url?: string | null, artist: { __typename?: 'Artist', id: any } | { __typename?: 'Category', id: any } | { __typename?: 'CrossStreet', id: any } | { __typename?: 'Neighborhood', id: any } | { __typename?: 'Place', id: any } | { __typename?: 'Venue', id: any }, venue: { __typename?: 'Artist', id: any } | { __typename?: 'Category', id: any } | { __typename?: 'CrossStreet', id: any } | { __typename?: 'Neighborhood', id: any } | { __typename?: 'Place', id: any } | { __typename?: 'Venue', id: any } };

export type ShowForm_TermsFragment = { __typename?: 'Query', artists?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null, venues?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null };

export type TaxonomyForm_TaxonomyFragment = { __typename?: 'Taxonomy', description?: string | null, id: any, name: string, plural?: string | null, slug: string };

type TermForm_Term_Artist_Fragment = { __typename?: 'Artist', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } };

type TermForm_Term_Category_Fragment = { __typename?: 'Category', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } };

type TermForm_Term_CrossStreet_Fragment = { __typename?: 'CrossStreet', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } };

type TermForm_Term_Neighborhood_Fragment = { __typename?: 'Neighborhood', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } };

type TermForm_Term_Place_Fragment = { __typename?: 'Place', address?: string | null, description?: string | null, id: any, name: string, slug: string, categories: Array<{ __typename?: 'Category', id: any, name: string }>, crossStreets: Array<{ __typename?: 'CrossStreet', id: any, name: string }>, neighborhood?: { __typename?: 'Neighborhood', id: any, name: string } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } };

type TermForm_Term_Venue_Fragment = { __typename?: 'Venue', address?: string | null, capacity?: string | null, description?: string | null, id: any, name: string, slug: string, coordinates?: { __typename?: 'VenueCoordinates', latitude?: number | null, longitude?: number | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } };

export type TermForm_TermFragment = TermForm_Term_Artist_Fragment | TermForm_Term_Category_Fragment | TermForm_Term_CrossStreet_Fragment | TermForm_Term_Neighborhood_Fragment | TermForm_Term_Place_Fragment | TermForm_Term_Venue_Fragment;

export type TermForm_TermsFragment = { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } };

export type UserForm_UserFragment = { __typename?: 'User', bio?: string | null, email: string, id: any, name?: string | null, roles?: Array<string | null> | null };

export type VideoForm_VideoFragment = { __typename?: 'Video', dataPlaylistIds: Array<string>, dataType: string, id: any, slug: string, title: string, year: number, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> };

type FeaturedMedia_FeaturedMedia_AudioUpload_Fragment = { __typename?: 'AudioUpload', destination: string, id: any };

type FeaturedMedia_FeaturedMedia_FileUpload_Fragment = { __typename?: 'FileUpload', destination: string, id: any };

type FeaturedMedia_FeaturedMedia_ImageUpload_Fragment = { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> };

type FeaturedMedia_FeaturedMedia_VideoUpload_Fragment = { __typename?: 'VideoUpload', destination: string, id: any };

export type FeaturedMedia_FeaturedMediaFragment = FeaturedMedia_FeaturedMedia_AudioUpload_Fragment | FeaturedMedia_FeaturedMedia_FileUpload_Fragment | FeaturedMedia_FeaturedMedia_ImageUpload_Fragment | FeaturedMedia_FeaturedMedia_VideoUpload_Fragment;

export type TextNodes_LinebreakNodeFragment = { __typename?: 'LinebreakNode', type?: string | null, version?: number | null };

export type TextNodes_TextNodeFragment = { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null };

export type ShowsGrid_ShowsFragment = { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: any, title?: string | null, artist: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string }, venue: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } };

export type Video_VideoFragment = { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> };

export type Videos_VideosFragment = { __typename?: 'Query', videos?: { __typename?: 'VideoConnection', edges: Array<{ __typename?: 'VideoEdge', cursor: string, node: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null } } | null };

export type AppQueryVariables = Exact<{ [key: string]: never; }>;


export type AppQuery = { __typename?: 'Query', apiKeys?: { __typename?: 'APIKeys', googleMaps?: string | null } | null, dashboardSettings: { __typename?: 'DashboardSettings', googleClientId?: string | null, googleTrackingId?: string | null, id: string }, podcastSettings: { __typename?: 'PodcastSettings', description?: string | null, feedLink?: string | null, id: string, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: any } | null }, shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: any, title?: string | null, artist: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string }, venue: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } } }> } | null, siteSettings: { __typename?: 'SiteSettings', copyrightText?: string | null, id: string, language?: string | null, siteTitle?: string | null, siteUrl?: string | null, tagline?: string | null } };

export type HomeQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cacheKey?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type HomeQuery = { __typename?: 'Query', posts?: { __typename?: 'PostConnection', edges: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', id: any, slug: string, summary?: string | null, title: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } }> } | null, videos?: { __typename?: 'VideoConnection', edges: Array<{ __typename?: 'VideoEdge', cursor: string, node: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null } } | null };

export type MediaAdminQueryVariables = Exact<{
  id: Scalars['ObjID']['input'];
}>;


export type MediaAdminQuery = { __typename?: 'Query', media?: { __typename?: 'AudioUpload', description?: string | null, duration?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number } | null> | null } | { __typename?: 'FileUpload', description?: string | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string } | { __typename?: 'ImageUpload', altText?: string | null, caption?: string | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number }> } | { __typename?: 'VideoUpload', description?: string | null, duration?: number | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string } | null };

export type UpdateMediaMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdateMediaUploadInput;
}>;


export type UpdateMediaMutation = { __typename?: 'Mutation', updateMediaUpload?: { __typename?: 'AudioUpload', description?: string | null, duration?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number } | null> | null } | { __typename?: 'FileUpload', description?: string | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string } | { __typename?: 'ImageUpload', altText?: string | null, caption?: string | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, fileSize: number, height: number, width: number }> } | { __typename?: 'VideoUpload', description?: string | null, duration?: number | null, height?: number | null, width?: number | null, destination: string, fileName: string, fileSize: number, id: any, mimeType: string, originalName: string, title?: string | null, type: string } | null };

export type UploadsAdminQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  mimeType?: InputMaybe<Scalars['String']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}>;


export type UploadsAdminQuery = { __typename?: 'Query', uploads?: { __typename?: 'MediaUploadConnection', count: number, mimeTypes?: Array<string> | null, types?: Array<string> | null, edges: Array<{ __typename?: 'MediaUploadEdge', node: { __typename?: 'AudioUpload', destination: string, id: any, mimeType: string, originalName: string, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number } | null> | null } | { __typename?: 'FileUpload', destination: string, id: any, mimeType: string, originalName: string, title?: string | null, type: string } | { __typename?: 'ImageUpload', destination: string, id: any, mimeType: string, originalName: string, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any, mimeType: string, originalName: string, title?: string | null, type: string } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeleteMediaMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeleteMediaMutation = { __typename?: 'Mutation', removeMediaUpload?: boolean | null };

export type PodcastEditQueryVariables = Exact<{
  id: Scalars['ObjID']['input'];
}>;


export type PodcastEditQuery = { __typename?: 'Query', podcast?: { __typename?: 'Podcast', description: string, id: any, title: string, audio?: { __typename?: 'AudioUpload', id: any, destination: string, fileName: string, type: string } | null, image?: { __typename?: 'ImageUpload', id: any, destination: string, fileName: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } | null };

export type UpdatePodcastMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdatePodcastInput;
}>;


export type UpdatePodcastMutation = { __typename?: 'Mutation', updatePodcast?: { __typename?: 'Podcast', description: string, id: any, title: string, audio?: { __typename?: 'AudioUpload', id: any, destination: string, fileName: string, type: string } | null, image?: { __typename?: 'ImageUpload', id: any, destination: string, fileName: string, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } | null };

export type PodcastsAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type PodcastsAdminQuery = { __typename?: 'Query', podcasts?: { __typename?: 'PodcastConnection', count: number, edges: Array<{ __typename?: 'PodcastEdge', node: { __typename?: 'Podcast', id: any, title: string, audio?: { __typename?: 'AudioUpload', destination: string, id: any, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number } | null> | null } | null, image?: { __typename?: 'ImageUpload', destination: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeletePodcastMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeletePodcastMutation = { __typename?: 'Mutation', removePodcast?: boolean | null };

export type CreatePodcastMutationVariables = Exact<{
  input: CreatePodcastInput;
}>;


export type CreatePodcastMutation = { __typename?: 'Mutation', createPodcast?: { __typename?: 'Podcast', id: any } | null };

export type PostEditQueryVariables = Exact<{
  id: Scalars['ObjID']['input'];
}>;


export type PostEditQuery = { __typename?: 'Query', post?: { __typename?: 'Post', date?: number | null, id: any, slug: string, status?: PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'HeadingNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, tag?: HeadingTag | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'ImageNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, image?: { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } | { __typename?: 'LinebreakNode' } | { __typename?: 'QuoteNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'TextNode' } | { __typename?: 'VideoNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, video?: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null } | null> | null } | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null } | null };

export type UpdatePostMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdatePostInput;
}>;


export type UpdatePostMutation = { __typename?: 'Mutation', updatePost?: { __typename?: 'Post', date?: number | null, id: any, slug: string, status?: PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'HeadingNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, tag?: HeadingTag | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'ImageNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, image?: { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } | { __typename?: 'LinebreakNode' } | { __typename?: 'QuoteNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'TextNode' } | { __typename?: 'VideoNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, video?: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null } | null> | null } | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null } | null };

export type PostsAdminQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
}>;


export type PostsAdminQuery = { __typename?: 'Query', posts?: { __typename?: 'PostConnection', count: number, edges: Array<{ __typename?: 'PostEdge', node: { __typename?: 'Post', date?: number | null, id: any, slug: string, status?: PostStatus | null, title: string } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeletePostMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeletePostMutation = { __typename?: 'Mutation', removePost?: boolean | null };

export type CreatePostMutationVariables = Exact<{
  input: CreatePostInput;
}>;


export type CreatePostMutation = { __typename?: 'Mutation', createPost?: { __typename?: 'Post', date?: number | null, id: any, slug: string, status?: PostStatus | null, summary?: string | null, title: string, artists?: Array<{ __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } | null> | null, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'HeadingNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, tag?: HeadingTag | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'ImageNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, image?: { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } | { __typename?: 'LinebreakNode' } | { __typename?: 'QuoteNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'TextNode' } | { __typename?: 'VideoNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, video?: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null } | null> | null } | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null } | null };

export type DashboardSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type DashboardSettingsQuery = { __typename?: 'Query', dashboardSettings: { __typename?: 'DashboardSettings', googleClientId?: string | null, googleTrackingId?: string | null, id: string } };

export type UpdateDashboardSettingsMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: DashboardSettingsInput;
}>;


export type UpdateDashboardSettingsMutation = { __typename?: 'Mutation', updateDashboardSettings?: { __typename?: 'DashboardSettings', id: string } | null };

export type MediaSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type MediaSettingsQuery = { __typename?: 'Query', mediaSettings: { __typename?: 'MediaSettings', id: string, crops: Array<{ __typename?: 'MediaCropSetting', height?: number | null, name: string, width?: number | null }> } };

export type UpdateMediaSettingsMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: MediaSettingsInput;
}>;


export type UpdateMediaSettingsMutation = { __typename?: 'Mutation', updateMediaSettings?: { __typename?: 'MediaSettings', id: string } | null };

export type PodcastSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type PodcastSettingsQuery = { __typename?: 'Query', podcastSettings: { __typename?: 'PodcastSettings', category?: string | null, copyrightText?: string | null, description?: string | null, explicit?: string | null, feedLink?: string | null, generator?: string | null, id: string, itunesEmail?: string | null, itunesName?: string | null, language?: string | null, managingEditor?: string | null, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } };

export type UpdatePodcastSettingsMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: PodcastSettingsInput;
}>;


export type UpdatePodcastSettingsMutation = { __typename?: 'Mutation', updatePodcastSettings?: { __typename?: 'PodcastSettings', id: string } | null };

export type SiteSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteSettingsQuery = { __typename?: 'Query', siteSettings: { __typename?: 'SiteSettings', copyrightText?: string | null, emailAddress?: string | null, id: string, language?: string | null, siteTitle?: string | null, siteUrl?: string | null, tagline?: string | null } };

export type UpdateSiteSettingsMutationVariables = Exact<{
  id: Scalars['String']['input'];
  input: SiteSettingsInput;
}>;


export type UpdateSiteSettingsMutation = { __typename?: 'Mutation', updateSiteSettings?: { __typename?: 'SiteSettings', id: string } | null };

export type ShowEditQueryVariables = Exact<{
  id: Scalars['ObjID']['input'];
}>;


export type ShowEditQuery = { __typename?: 'Query', show?: { __typename?: 'Show', date: number, id: any, notes?: string | null, title?: string | null, url?: string | null, artist: { __typename?: 'Artist', id: any } | { __typename?: 'Category', id: any } | { __typename?: 'CrossStreet', id: any } | { __typename?: 'Neighborhood', id: any } | { __typename?: 'Place', id: any } | { __typename?: 'Venue', id: any }, venue: { __typename?: 'Artist', id: any } | { __typename?: 'Category', id: any } | { __typename?: 'CrossStreet', id: any } | { __typename?: 'Neighborhood', id: any } | { __typename?: 'Place', id: any } | { __typename?: 'Venue', id: any } } | null, artists?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null, venues?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null };

export type UpdateShowMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdateShowInput;
}>;


export type UpdateShowMutation = { __typename?: 'Mutation', updateShow?: { __typename?: 'Show', date: number, id: any, notes?: string | null, title?: string | null, url?: string | null, artist: { __typename?: 'Artist', id: any } | { __typename?: 'Category', id: any } | { __typename?: 'CrossStreet', id: any } | { __typename?: 'Neighborhood', id: any } | { __typename?: 'Place', id: any } | { __typename?: 'Venue', id: any }, venue: { __typename?: 'Artist', id: any } | { __typename?: 'Category', id: any } | { __typename?: 'CrossStreet', id: any } | { __typename?: 'Neighborhood', id: any } | { __typename?: 'Place', id: any } | { __typename?: 'Venue', id: any } } | null };

export type ShowsAdminQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  date?: InputMaybe<Scalars['Float']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  order?: InputMaybe<ShowOrder>;
  search?: InputMaybe<Scalars['String']['input']>;
  taxonomy?: InputMaybe<Scalars['String']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
}>;


export type ShowsAdminQuery = { __typename?: 'Query', shows?: { __typename?: 'ShowConnection', count?: number | null, edges: Array<{ __typename?: 'ShowEdge', node: { __typename?: 'Show', date: number, id: any, title?: string | null, artist: { __typename?: 'Artist', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Category', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'CrossStreet', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Neighborhood', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Place', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Venue', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } }, venue: { __typename?: 'Artist', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Category', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'CrossStreet', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Neighborhood', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Place', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Venue', id: any, name: string, slug: string, taxonomy: { __typename?: 'Taxonomy', id: any } } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeleteShowMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeleteShowMutation = { __typename?: 'Mutation', removeShow?: boolean | null };

export type ShowTermsQueryVariables = Exact<{ [key: string]: never; }>;


export type ShowTermsQuery = { __typename?: 'Query', artists?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null, venues?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null };

export type CreateShowMutationVariables = Exact<{
  input: CreateShowInput;
}>;


export type CreateShowMutation = { __typename?: 'Mutation', createShow?: { __typename?: 'Show', id: any } | null };

export type TaxonomyEditQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ObjID']['input']>;
}>;


export type TaxonomyEditQuery = { __typename?: 'Query', taxonomy?: { __typename?: 'Taxonomy', description?: string | null, id: any, name: string, plural?: string | null, slug: string } | null };

export type UpdateTaxonomyMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdateTaxonomyInput;
}>;


export type UpdateTaxonomyMutation = { __typename?: 'Mutation', updateTaxonomy?: { __typename?: 'Taxonomy', description?: string | null, id: any, name: string, plural?: string | null, slug: string } | null };

export type TaxonomiesAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type TaxonomiesAdminQuery = { __typename?: 'Query', taxonomies?: { __typename?: 'TaxonomyConnection', count: number, edges: Array<{ __typename?: 'TaxonomyEdge', node: { __typename?: 'Taxonomy', description?: string | null, id: any, name: string, slug: string } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeleteTaxonomyMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeleteTaxonomyMutation = { __typename?: 'Mutation', removeTaxonomy?: boolean | null };

export type CreateTaxonomyMutationVariables = Exact<{
  input: CreateTaxonomyInput;
}>;


export type CreateTaxonomyMutation = { __typename?: 'Mutation', createTaxonomy?: { __typename?: 'Taxonomy', description?: string | null, id: any, name: string, plural?: string | null, slug: string } | null };

export type TermEditQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ObjID']['input']>;
}>;


export type TermEditQuery = { __typename?: 'Query', neighborhoods?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null, term?: { __typename?: 'Artist', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Category', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'CrossStreet', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Neighborhood', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Place', address?: string | null, description?: string | null, id: any, name: string, slug: string, categories: Array<{ __typename?: 'Category', id: any, name: string }>, crossStreets: Array<{ __typename?: 'CrossStreet', id: any, name: string }>, neighborhood?: { __typename?: 'Neighborhood', id: any, name: string } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Venue', address?: string | null, capacity?: string | null, description?: string | null, id: any, name: string, slug: string, coordinates?: { __typename?: 'VenueCoordinates', latitude?: number | null, longitude?: number | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | null };

export type UpdateTermMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdateTermInput;
}>;


export type UpdateTermMutation = { __typename?: 'Mutation', updateTerm?: { __typename?: 'Artist', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Category', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'CrossStreet', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Neighborhood', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Place', address?: string | null, description?: string | null, id: any, name: string, slug: string, categories: Array<{ __typename?: 'Category', id: any, name: string }>, crossStreets: Array<{ __typename?: 'CrossStreet', id: any, name: string }>, neighborhood?: { __typename?: 'Neighborhood', id: any, name: string } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Venue', address?: string | null, capacity?: string | null, description?: string | null, id: any, name: string, slug: string, coordinates?: { __typename?: 'VenueCoordinates', latitude?: number | null, longitude?: number | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | null };

export type TermsAdminQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  taxonomy?: InputMaybe<Scalars['String']['input']>;
  taxonomyId: Scalars['ObjID']['input'];
}>;


export type TermsAdminQuery = { __typename?: 'Query', terms?: { __typename?: 'TermConnection', count: number, edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload' } | { __typename?: 'FileUpload' } | { __typename?: 'ImageUpload', destination: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload' }> | null, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Category', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload' } | { __typename?: 'FileUpload' } | { __typename?: 'ImageUpload', destination: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload' }> | null, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'CrossStreet', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload' } | { __typename?: 'FileUpload' } | { __typename?: 'ImageUpload', destination: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload' }> | null, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Neighborhood', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload' } | { __typename?: 'FileUpload' } | { __typename?: 'ImageUpload', destination: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload' }> | null, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Place', address?: string | null, id: any, name: string, slug: string, categories: Array<{ __typename?: 'Category', id: any, name: string }>, crossStreets: Array<{ __typename?: 'CrossStreet', id: any, name: string }>, neighborhood?: { __typename?: 'Neighborhood', id: any, name: string } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload' } | { __typename?: 'FileUpload' } | { __typename?: 'ImageUpload', destination: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload' }> | null, taxonomy: { __typename?: 'Taxonomy', id: any } } | { __typename?: 'Venue', address?: string | null, capacity?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload' } | { __typename?: 'FileUpload' } | { __typename?: 'ImageUpload', destination: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload' }> | null, taxonomy: { __typename?: 'Taxonomy', id: any } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null }, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | null };

export type DeleteTermMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeleteTermMutation = { __typename?: 'Mutation', removeTerm?: boolean | null };

export type TermTaxonomyQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ObjID']['input']>;
}>;


export type TermTaxonomyQuery = { __typename?: 'Query', neighborhoods?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } }>, taxonomy: { __typename?: 'Taxonomy', id: any } } | null, taxonomy?: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } | null };

export type CreateTermMutationVariables = Exact<{
  input: CreateTermInput;
}>;


export type CreateTermMutation = { __typename?: 'Mutation', createTerm?: { __typename?: 'Artist', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Category', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'CrossStreet', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Neighborhood', description?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Place', address?: string | null, description?: string | null, id: any, name: string, slug: string, categories: Array<{ __typename?: 'Category', id: any, name: string }>, crossStreets: Array<{ __typename?: 'CrossStreet', id: any, name: string }>, neighborhood?: { __typename?: 'Neighborhood', id: any, name: string } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | { __typename?: 'Venue', address?: string | null, capacity?: string | null, description?: string | null, id: any, name: string, slug: string, coordinates?: { __typename?: 'VenueCoordinates', latitude?: number | null, longitude?: number | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, type: string }> | null, taxonomy: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } } | null };

export type AdminQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminQuery = { __typename?: 'Query', taxonomies?: { __typename?: 'TaxonomyConnection', edges: Array<{ __typename?: 'TaxonomyEdge', node: { __typename?: 'Taxonomy', id: any, name: string, plural?: string | null, slug: string } }> } | null };

export type UserEditQueryVariables = Exact<{
  id: Scalars['ObjID']['input'];
}>;


export type UserEditQuery = { __typename?: 'Query', user?: { __typename?: 'User', bio?: string | null, email: string, id: any, name?: string | null, roles?: Array<string | null> | null } | null };

export type UpdateUserMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdateUserInput;
}>;


export type UpdateUserMutation = { __typename?: 'Mutation', updateUser?: { __typename?: 'User', bio?: string | null, email: string, id: any, name?: string | null, roles?: Array<string | null> | null } | null };

export type UsersAdminQueryVariables = Exact<{ [key: string]: never; }>;


export type UsersAdminQuery = { __typename?: 'Query', users?: { __typename?: 'UserConnection', count: number, edges: Array<{ __typename?: 'UserEdge', node: { __typename?: 'User', id: any, name?: string | null } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeleteUserMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeleteUserMutation = { __typename?: 'Mutation', removeUser?: boolean | null };

export type CreateUserMutationVariables = Exact<{
  input: CreateUserInput;
}>;


export type CreateUserMutation = { __typename?: 'Mutation', createUser?: { __typename?: 'User', id: any } | null };

export type VideoEditQueryVariables = Exact<{
  id?: InputMaybe<Scalars['ObjID']['input']>;
}>;


export type VideoEditQuery = { __typename?: 'Query', video?: { __typename?: 'Video', dataPlaylistIds: Array<string>, dataType: string, id: any, slug: string, title: string, year: number, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null };

export type UpdateVideoMutationVariables = Exact<{
  id: Scalars['ObjID']['input'];
  input: UpdateVideoInput;
}>;


export type UpdateVideoMutation = { __typename?: 'Mutation', updateVideo?: { __typename?: 'Video', dataPlaylistIds: Array<string>, dataType: string, id: any, slug: string, title: string, year: number, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null };

export type VideosAdminQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type VideosAdminQuery = { __typename?: 'Query', videos?: { __typename?: 'VideoConnection', count: number, years?: Array<number> | null, edges: Array<{ __typename?: 'VideoEdge', node: { __typename?: 'Video', id: any, publishedAt: number, slug: string, title: string, year: number } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type DeleteVideoMutationVariables = Exact<{
  ids: Array<InputMaybe<Scalars['ObjID']['input']>> | InputMaybe<Scalars['ObjID']['input']>;
}>;


export type DeleteVideoMutation = { __typename?: 'Mutation', removeVideo?: boolean | null };

export type ArtistQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  slug: Scalars['String']['input'];
}>;


export type ArtistQuery = { __typename?: 'Query', artist?: { __typename?: 'Artist', id: any, name: string, appleMusic?: { __typename?: 'AppleMusicData', id?: string | null, url?: string | null, artwork?: { __typename?: 'AppleMusicArtwork', url?: string | null } | null } | null } | { __typename?: 'Category', id: any, name: string } | { __typename?: 'CrossStreet', id: any, name: string } | { __typename?: 'Neighborhood', id: any, name: string } | { __typename?: 'Place', id: any, name: string } | { __typename?: 'Venue', id: any, name: string } | null, shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: any, title?: string | null, artist: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string }, venue: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type MediaModalQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  type?: InputMaybe<Scalars['String']['input']>;
}>;


export type MediaModalQuery = { __typename?: 'Query', uploads?: { __typename?: 'MediaUploadConnection', edges: Array<{ __typename?: 'MediaUploadEdge', node: { __typename?: 'AudioUpload', destination: string, fileName: string, id: any, title?: string | null, type: string, images?: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number } | null> | null } | { __typename?: 'FileUpload', destination: string, fileName: string, id: any, title?: string | null, type: string } | { __typename?: 'ImageUpload', destination: string, fileName: string, id: any, title?: string | null, type: string, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, fileName: string, id: any, title?: string | null, type: string } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage?: boolean | null } } | null };

export type VideoModalQueryVariables = Exact<{
  cursor?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type VideoModalQuery = { __typename?: 'Query', videos?: { __typename?: 'VideoConnection', edges: Array<{ __typename?: 'VideoEdge', node: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', endCursor?: string | null, hasNextPage?: boolean | null } } | null };

export type PlaceQueryVariables = Exact<{
  slug: Scalars['String']['input'];
}>;


export type PlaceQuery = { __typename?: 'Query', place?: { __typename?: 'Artist', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Category', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'CrossStreet', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Neighborhood', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Place', address?: string | null, id: any, name: string, categories: Array<{ __typename?: 'Category', id: any, name: string }>, crossStreets: Array<{ __typename?: 'CrossStreet', id: any, name: string }>, neighborhood?: { __typename?: 'Neighborhood', id: any, name: string } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Venue', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | null };

export type PlacesQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  categories?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  crossStreets?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
  first?: InputMaybe<Scalars['Int']['input']>;
  neighborhoods?: InputMaybe<Array<InputMaybe<Scalars['String']['input']>> | InputMaybe<Scalars['String']['input']>>;
}>;


export type PlacesQuery = { __typename?: 'Query', categories?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } }> } | null, crossStreets?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } }> } | null, neighborhoods?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } }> } | null, places?: { __typename?: 'TermConnection', edges: Array<{ __typename?: 'TermEdge', node: { __typename?: 'Artist', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Category', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'CrossStreet', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Neighborhood', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Place', address?: string | null, id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Venue', id: any, name: string, slug: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } }> } | null };

export type PodcastQueryVariables = Exact<{
  id: Scalars['ObjID']['input'];
}>;


export type PodcastQuery = { __typename?: 'Query', podcast?: { __typename?: 'Podcast', description: string, id: any, title: string, audio?: { __typename?: 'AudioUpload', destination: string, duration?: number | null, fileName: string, id: any } | null } | null };

export type PodcastsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
}>;


export type PodcastsQuery = { __typename?: 'Query', podcasts?: { __typename?: 'PodcastConnection', edges: Array<{ __typename?: 'PodcastEdge', node: { __typename?: 'Podcast', description: string, id: any, title: string } }> } | null };

export type PodcastFeedQueryVariables = Exact<{ [key: string]: never; }>;


export type PodcastFeedQuery = { __typename?: 'Query', podcasts?: { __typename?: 'PodcastConnection', edges: Array<{ __typename?: 'PodcastEdge', node: { __typename?: 'Podcast', date?: number | null, description: string, id: any, title: string, audio?: { __typename?: 'AudioUpload', destination: string, duration?: number | null, fileName: string, fileSize: number, id: any } | null } }> } | null, podcastSettings: { __typename?: 'PodcastSettings', category?: string | null, copyrightText?: string | null, description?: string | null, explicit?: string | null, feedLink?: string | null, generator?: string | null, id: string, itunesEmail?: string | null, itunesName?: string | null, language?: string | null, managingEditor?: string | null, title?: string | null, websiteLink?: string | null, image?: { __typename?: 'ImageUpload', destination: string, fileName: string, id: any } | null } };

export type PostQueryVariables = Exact<{
  slug?: InputMaybe<Scalars['String']['input']>;
}>;


export type PostQuery = { __typename?: 'Query', post?: { __typename?: 'Post', id: any, slug: string, summary?: string | null, title: string, editorState?: { __typename?: 'EditorState', root?: { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'ElementNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'HeadingNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, tag?: HeadingTag | null, children?: Array<{ __typename?: 'CodeNode' } | { __typename?: 'ElementNode' } | { __typename?: 'HeadingNode' } | { __typename?: 'ImageNode' } | { __typename?: 'LinebreakNode', type?: string | null, version?: number | null } | { __typename?: 'QuoteNode' } | { __typename?: 'TextNode', detail?: number | null, format?: number | null, mode?: TextModeType | null, style?: string | null, text?: string | null, type?: string | null, version?: number | null } | { __typename?: 'VideoNode' } | null> | null } | { __typename?: 'ImageNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, image?: { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | null } | { __typename?: 'LinebreakNode' } | { __typename?: 'QuoteNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null } | { __typename?: 'TextNode' } | { __typename?: 'VideoNode', direction?: ElementDirection | null, format?: number | null, indent?: number | null, type?: string | null, version?: number | null, video?: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null } | null> | null } | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | null };

export type ShowsQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  taxonomy?: InputMaybe<Scalars['String']['input']>;
  term?: InputMaybe<Scalars['String']['input']>;
}>;


export type ShowsQuery = { __typename?: 'Query', shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: any, title?: string | null, artist: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string }, venue: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null };

export type VenueQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  slug: Scalars['String']['input'];
}>;


export type VenueQuery = { __typename?: 'Query', shows?: { __typename?: 'ShowConnection', edges: Array<{ __typename?: 'ShowEdge', cursor: string, node: { __typename?: 'Show', date: number, id: any, title?: string | null, artist: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string }, venue: { __typename?: 'Artist', id: any, name: string, slug: string } | { __typename?: 'Category', id: any, name: string, slug: string } | { __typename?: 'CrossStreet', id: any, name: string, slug: string } | { __typename?: 'Neighborhood', id: any, name: string, slug: string } | { __typename?: 'Place', id: any, name: string, slug: string } | { __typename?: 'Venue', id: any, name: string, slug: string } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null } } | null, venue?: { __typename?: 'Artist', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Category', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'CrossStreet', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Neighborhood', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Place', id: any, name: string, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | { __typename?: 'Venue', address?: string | null, capacity?: string | null, id: any, name: string, coordinates?: { __typename?: 'VenueCoordinates', latitude?: number | null, longitude?: number | null } | null, featuredMedia?: Array<{ __typename?: 'AudioUpload', destination: string, id: any } | { __typename?: 'FileUpload', destination: string, id: any } | { __typename?: 'ImageUpload', destination: string, id: any, crops: Array<{ __typename?: 'ImageUploadCrop', fileName: string, width: number }> } | { __typename?: 'VideoUpload', destination: string, id: any }> | null } | null };

export type VideoQueryVariables = Exact<{
  slug?: InputMaybe<Scalars['String']['input']>;
}>;


export type VideoQuery = { __typename?: 'Query', video?: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } | null };

export type VideosQueryVariables = Exact<{
  after?: InputMaybe<Scalars['String']['input']>;
  before?: InputMaybe<Scalars['String']['input']>;
  cacheKey?: InputMaybe<Scalars['String']['input']>;
  first?: InputMaybe<Scalars['Int']['input']>;
  last?: InputMaybe<Scalars['Int']['input']>;
  year?: InputMaybe<Scalars['Int']['input']>;
}>;


export type VideosQuery = { __typename?: 'Query', videos?: { __typename?: 'VideoConnection', edges: Array<{ __typename?: 'VideoEdge', cursor: string, node: { __typename?: 'Video', dataId: string, id: any, slug: string, title: string, thumbnails: Array<{ __typename?: 'VideoThumbnail', height: number, url: string, width: number }> } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage?: boolean | null, hasPreviousPage?: boolean | null } } | null };
