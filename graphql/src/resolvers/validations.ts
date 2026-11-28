import { z } from 'zod';

import { epochMillis, isoInstant } from '#/time';

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

// Apple Music catalog IDs of the albums whose covers to add, at most a page of search results
export const addAlbumCoversSchema = z.array(z.string().regex(/^\d+$/)).min(1).max(25);

// --- Podcast ---

export const createPodcastSchema = z.object({
  audio: z.string().nullish(),
  description: z.string().optional(),
  image: z.string().nullish(),
  title: z.string().min(1),
});

export const updatePodcastSchema = z.object({
  audio: z.string().nullish(),
  description: z.string().optional(),
  image: z.string().nullish(),
  title: z.string().min(1),
});

// --- Post ---

// EditorState is a complex recursive Lexical structure stored as JSON.
// We validate the top-level shape; Lexical manages the internal structure.
const editorStateInput = z
  .object({
    root: z.record(z.string(), z.any()),
  })
  .nullish();

export const createPostSchema = z.object({
  artists: z.array(z.string()).nullish(),
  date: epochMillis.nullish(),
  editorState: editorStateInput,
  featuredMedia: z.array(z.string()).nullish(),
  status: z.enum(['DRAFT', 'PUBLISH']).optional(),
  summary: z.string().nullish(),
  title: z.string().min(1),
});

export const updatePostSchema = z.object({
  artists: z.array(z.string()).nullish(),
  date: epochMillis.nullish(),
  editorState: editorStateInput,
  featuredMedia: z.array(z.string()).nullish(),
  status: z.enum(['DRAFT', 'PUBLISH']).optional(),
  summary: z.string().nullish(),
  title: z.string().optional(),
});

// --- Show ---

const SHOW_NEEDS_ARTIST = 'A show needs an artist';

// A show's lineup as it's saved: at least one artist, as shows added from a CSV or a venue's
// listings have
const lineup = z.array(z.string(), SHOW_NEEDS_ARTIST).min(1, SHOW_NEEDS_ARTIST);

const schedule = z.object({
  localDate: z.string(),
  localTime: z.string().nullish(),
  timeZone: z.string().nullish(),
  startsAt: epochMillis.nullish(),
});

export const createShowSchema = z.object({
  artists: lineup,
  attended: z.boolean().optional(),
  date: epochMillis.nullish(),
  schedule: schedule.nullish(),
  notes: z.string().nullish(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  venue: z.string(),
});

export const bulkCreateShowsSchema = z
  .array(
    z.object({
      artists: z.array(z.string().trim().min(1)).min(1),
      attended: z.boolean().nullish(),
      date: epochMillis.nullish(),
      schedule: schedule.nullish(),
      venue: z.string().trim().min(1),
    })
  )
  .min(1);

export const updateShowSchema = z.object({
  // Left out, the lineup stays as it is
  artists: lineup.optional(),
  attended: z.boolean().optional(),
  date: epochMillis.nullish(),
  schedule: schedule.nullish(),
  notes: z.string().nullish(),
  title: z.string().nullish(),
  url: z.string().nullish(),
  venue: z.string().optional(),
});

export const importListingsSchema = z
  .array(
    z.object({
      artists: z.array(z.string().trim().min(1)).min(1),
      sourceId: z.string().min(1),
    })
  )
  .min(1);

// --- User ---

export const createUserSchema = z.object({
  bio: z.string().nullish(),
  // Signing in trims what's typed, so a saved email has no spaces around it either
  email: z.string().trim().nullish(),
  name: z.string().nullish(),
  password: z.string().nullish(),
  roles: z.array(z.string()).nullish(),
});

export const updateUserSchema = z.object({
  bio: z.string().nullish(),
  email: z.string().trim().min(1).optional(),
  name: z.string().nullish(),
  password: z.string().nullish(),
  roles: z.array(z.string()).nullish(),
});

// --- Venue ---

const venueCoordinatesInput = z.object({
  latitude: z.number().nullish(),
  longitude: z.number().nullish(),
});

// An empty form field clears the listings page
const listingsUrl = z
  .union([z.url(), z.literal('')])
  .nullish()
  .transform((value) => (value === '' ? null : value));

export const createVenueSchema = z.object({
  capacity: z.string().nullish(),
  city: z.string().nullish(),
  coordinates: venueCoordinatesInput.nullish(),
  description: z.string().nullish(),
  excludeFromSearch: z.boolean().optional(),
  featuredMedia: z.array(z.string()).nullish(),
  listingsUrl,
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
  listingsUrl,
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
  publishedAt: epochMillis,
  publishedISO: isoInstant.nullish(),
  slug: z.string(),
  title: z.string().min(1),
  year: z.number().int(),
});

export const updateVideoSchema = z.object({
  dataId: z.string().optional(),
  dataPlaylistId: z.string().optional(),
  dataType: z.string().optional(),
  position: z.number().int().optional(),
  publishedAt: epochMillis.optional(),
  publishedISO: isoInstant.optional(),
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

const cropDimension = z.number().int().positive().max(100_000_000).nullish();

const mediaCropSettingInput = z.object({
  height: cropDimension,
  name: z.string(),
  width: cropDimension,
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
