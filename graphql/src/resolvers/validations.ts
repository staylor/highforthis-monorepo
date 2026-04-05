import { z } from 'zod';

// --- Artist ---

const appleMusicArtworkInput = z.object({
  bgColor: z.string().nullish(),
  height: z.number().int().nullish(),
  textColor1: z.string().nullish(),
  textColor2: z.string().nullish(),
  textColor3: z.string().nullish(),
  textColor4: z.string().nullish(),
  url: z.string().nullish(),
  width: z.number().int().nullish(),
});

const appleMusicDataInput = z.object({
  artwork: appleMusicArtworkInput.nullish(),
  genreNames: z.array(z.string()).nullish(),
  id: z.string().nullish(),
  url: z.string().nullish(),
});

export const createArtistSchema = z.object({
  name: z.string().min(1),
  description: z.string().nullish(),
  excludeFromSearch: z.boolean().optional(),
  featuredMedia: z.array(z.string()).nullish(),
  slug: z.string().nullish(),
  website: z.string().nullish(),
});

export const updateArtistSchema = z.object({
  appleMusic: appleMusicDataInput.nullish(),
  description: z.string().nullish(),
  excludeFromSearch: z.boolean().optional(),
  featuredMedia: z.array(z.string()).nullish(),
  name: z.string().optional(),
  slug: z.string().optional(),
  website: z.string().nullish(),
});

// --- Media ---

export const updateMediaUploadSchema = z.object({
  altText: z.string().nullish(),
  caption: z.string().nullish(),
  description: z.string().nullish(),
  title: z.string().nullish(),
});

// --- Podcast ---

export const createPodcastSchema = z.object({
  audio: z.string().nullish(),
  date: z.number().nullish(),
  description: z.string().optional(),
  image: z.string().nullish(),
  title: z.string().min(1),
});

export const updatePodcastSchema = z.object({
  audio: z.string().nullish(),
  date: z.number().nullish(),
  description: z.string().optional(),
  image: z.string().nullish(),
  title: z.string().min(1),
});

// --- Post ---

// EditorState is a complex recursive Lexical structure stored as Prisma Json.
// We validate the top-level shape; Lexical manages the internal structure.
const editorStateInput = z
  .object({
    root: z.record(z.string(), z.any()),
  })
  .nullish();

export const createPostSchema = z.object({
  artists: z.array(z.string()).nullish(),
  date: z.number().nullish(),
  editorState: editorStateInput,
  featuredMedia: z.array(z.string()).nullish(),
  status: z.enum(['DRAFT', 'PUBLISH']).optional(),
  summary: z.string().nullish(),
  title: z.string().min(1),
});

export const updatePostSchema = z.object({
  artists: z.array(z.string()).nullish(),
  date: z.number().nullish(),
  editorState: editorStateInput,
  featuredMedia: z.array(z.string()).nullish(),
  status: z.enum(['DRAFT', 'PUBLISH']).optional(),
  summary: z.string().nullish(),
  title: z.string().optional(),
});

// --- Show ---

export const createShowSchema = z.object({
  artists: z.array(z.string()),
  attended: z.boolean().optional(),
  date: z.number(),
  notes: z.string().nullish(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  venue: z.string(),
});

export const updateShowSchema = z.object({
  artists: z.array(z.string()).nullish(),
  attended: z.boolean().optional(),
  date: z.number().optional(),
  notes: z.string().nullish(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  venue: z.string().optional(),
});

// --- User ---

export const createUserSchema = z.object({
  bio: z.string().nullish(),
  email: z.string().nullish(),
  name: z.string().nullish(),
  password: z.string().nullish(),
  roles: z.array(z.string()).nullish(),
});

export const updateUserSchema = z.object({
  bio: z.string().nullish(),
  email: z.string().optional(),
  name: z.string().nullish(),
  password: z.string().nullish(),
  roles: z.array(z.string()).nullish(),
});

// --- Venue ---

const venueCoordinatesInput = z.object({
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

export const createVenueSchema = z.object({
  capacity: z.string().nullish(),
  city: z.string().nullish(),
  coordinates: venueCoordinatesInput.nullish(),
  description: z.string().nullish(),
  excludeFromSearch: z.boolean().optional(),
  featuredMedia: z.array(z.string()).nullish(),
  name: z.string().min(1),
  permanentlyClosed: z.boolean().optional(),
  postalCode: z.string().nullish(),
  slug: z.string().nullish(),
  state: z.string().nullish(),
  streetAddress: z.string().nullish(),
  website: z.string().nullish(),
});

export const updateVenueSchema = z.object({
  capacity: z.string().nullish(),
  city: z.string().nullish(),
  coordinates: venueCoordinatesInput.nullish(),
  description: z.string().nullish(),
  excludeFromSearch: z.boolean().optional(),
  featuredMedia: z.array(z.string()).nullish(),
  name: z.string().optional(),
  permanentlyClosed: z.boolean().optional(),
  postalCode: z.string().nullish(),
  slug: z.string().optional(),
  state: z.string().nullish(),
  streetAddress: z.string().nullish(),
  website: z.string().nullish(),
});

// --- Video ---

export const createVideoSchema = z.object({
  dataId: z.string(),
  dataPlaylistId: z.string(),
  dataType: z.string().optional(),
  position: z.number().int().optional(),
  publishedAt: z.number(),
  publishedISO: z.string(),
  slug: z.string(),
  title: z.string().min(1),
  year: z.number().int(),
});

export const updateVideoSchema = z.object({
  dataId: z.string().optional(),
  dataPlaylistId: z.string().optional(),
  dataType: z.string().optional(),
  position: z.number().int().optional(),
  publishedAt: z.number().optional(),
  publishedISO: z.string().optional(),
  slug: z.string().optional(),
  title: z.string().optional(),
  year: z.number().int().optional(),
});

// --- Settings ---

export const siteSettingsSchema = z.object({
  copyrightText: z.string().nullish(),
  emailAddress: z.string().nullish(),
  language: z.string().nullish(),
  siteTitle: z.string().nullish(),
  siteUrl: z.string().nullish(),
  tagline: z.string().nullish(),
});

export const dashboardSettingsSchema = z.object({
  googleClientId: z.string().nullish(),
  googleTrackingId: z.string().nullish(),
});

const mediaCropSettingInput = z.object({
  height: z.number().int().nullish(),
  name: z.string(),
  width: z.number().int().nullish(),
});

export const mediaSettingsSchema = z.object({
  crops: z.array(mediaCropSettingInput).nullish(),
});

export const podcastSettingsSchema = z.object({
  category: z.string().nullish(),
  copyrightText: z.string().nullish(),
  description: z.string().nullish(),
  explicit: z.string().nullish(),
  feedLink: z.string().nullish(),
  generator: z.string().nullish(),
  image: z.string().nullish(),
  itunesEmail: z.string().nullish(),
  itunesName: z.string().nullish(),
  language: z.string().nullish(),
  managingEditor: z.string().nullish(),
  title: z.string().nullish(),
  websiteLink: z.string().nullish(),
});
