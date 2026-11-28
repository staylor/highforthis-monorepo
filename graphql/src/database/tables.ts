import { randomInt } from 'node:crypto';

import {
  belongsTo,
  column as c,
  hasMany,
  hasOne,
  table,
  type AnyTable,
  type ColumnBuilder,
  type Relation,
  type TableBeforeWriteContext,
  type TableRowWith,
} from 'remix/data-table';

// The tables the migrations in graphql/migrations make, described for remix/data-table. These
// describe the database; they don't create or change it. A migration that changes a table changes
// it here too, and `pnpm db:check`, which CI runs on a migrated database, finds where they differ.

/** What a relation loads: a list of rows, or a row or null */
export type Loaded<TRelation> =
  TRelation extends Relation<AnyTable, infer TTarget, infer TCardinality, infer TLoaded>
    ? TCardinality extends 'many'
      ? TableRowWith<TTarget, TLoaded>[]
      : TableRowWith<TTarget, TLoaded> | null
    : never;

// `timestamp()` is untyped, and the driver reads these columns back as dates
const timestamp = () => c.timestamp() as ColumnBuilder<Date>;

// Prisma's `@updatedAt` is set by the client, as these are
const timestamps = { createdAt: 'createdAt', updatedAt: 'updatedAt' };

/**
 * Leaves out the columns a write gives as `undefined`, which Prisma skipped and pg would write as
 * NULL. Every table writes through this.
 */
function skipUndefined<TRow extends Record<string, unknown>>({
  value,
}: TableBeforeWriteContext<TRow>) {
  const defined = Object.entries(value).filter(([, column]) => column !== undefined);
  return { value: Object.fromEntries(defined) as Partial<TRow> };
}

// IDs are made the way Prisma's `cuid()` made them, so new rows' IDs look like the rest: a "c",
// then the time, a counter, a block for the process and random characters, all in base 36. They
// sort by when they were made.
const BLOCK = 36 ** 4;
const block = (value: number) => value.toString(36).padStart(4, '0');
const processBlock = block(process.pid % BLOCK);
let counter = randomInt(BLOCK);

/** An ID for a new row, as Prisma's `cuid()` would make it */
export function newId() {
  counter = (counter + 1) % BLOCK;
  const time = Date.now().toString(36);
  return `c${time}${block(counter)}${processBlock}${block(randomInt(BLOCK))}${block(randomInt(BLOCK))}`;
}

export const venues = table({
  name: 'Venue',
  columns: {
    id: c.text(),
    name: c.text(),
    slug: c.text(),
    description: c.text().nullable(),
    capacity: c.text().nullable(),
    streetAddress: c.text().nullable(),
    city: c.text().nullable(),
    state: c.text().nullable(),
    postalCode: c.text().nullable(),
    // `double precision`, which has no column type here. The driver reads it as a number.
    latitude: c.decimal(53, 0).nullable(),
    longitude: c.decimal(53, 0).nullable(),
    website: c.text().nullable(),
    listingsUrl: c.text().nullable(),
    excludeFromSearch: c.boolean(),
    permanentlyClosed: c.boolean(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

export const mediaUploads = table({
  name: 'MediaUpload',
  columns: {
    id: c.text(),
    title: c.text().nullable(),
    description: c.text().nullable(),
    originalName: c.text(),
    destination: c.text(),
    fileName: c.text(),
    mimeType: c.text(),
    type: c.text(),
    fileSize: c.integer(),
    width: c.integer().nullable(),
    height: c.integer().nullable(),
    caption: c.text().nullable(),
    altText: c.text().nullable(),
    album: c.text().nullable(),
    year: c.integer().nullable(),
    duration: c.decimal(53, 0).nullable(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

// A join table's rows make a list: saving it numbers them from 0 in `position`, and they're read in
// that order. Loading the records they join through `hasManyThrough` would put those in their own
// table's order instead.

export const venueFeaturedMedia = table({
  name: 'VenueFeaturedMedia',
  columns: {
    venueId: c.text(),
    mediaId: c.text(),
    position: c.integer(),
  },
  primaryKey: ['venueId', 'mediaId'],
  beforeWrite: skipUndefined,
});

/** The media a venue's featured-media row joins */
export const venueFeaturedMediaUpload = belongsTo(venueFeaturedMedia, mediaUploads, {
  foreignKey: 'mediaId',
});

/** A venue's featured-media rows, in order, each with its media */
export const venueMedia = hasMany(venues, venueFeaturedMedia, { foreignKey: 'venueId' })
  .orderBy('position')
  .with({ media: venueFeaturedMediaUpload });

// --- Artist ---

export const artists = table({
  name: 'Artist',
  columns: {
    id: c.text(),
    name: c.text(),
    slug: c.text(),
    description: c.text().nullable(),
    website: c.text().nullable(),
    excludeFromSearch: c.boolean(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

export const appleMusicData = table({
  name: 'AppleMusicData',
  columns: {
    id: c.text(),
    artistId: c.text(),
    appleId: c.text().nullable(),
    url: c.text().nullable(),
  },
  beforeWrite: skipUndefined,
});

export const appleMusicGenres = table({
  name: 'AppleMusicGenre',
  columns: {
    id: c.text(),
    appleMusicDataId: c.text(),
    name: c.text(),
  },
  beforeWrite: skipUndefined,
});

export const appleMusicArtworks = table({
  name: 'AppleMusicArtwork',
  columns: {
    id: c.text(),
    appleMusicDataId: c.text(),
    width: c.integer().nullable(),
    height: c.integer().nullable(),
    url: c.text().nullable(),
    bgColor: c.text().nullable(),
    textColor1: c.text().nullable(),
    textColor2: c.text().nullable(),
    textColor3: c.text().nullable(),
    textColor4: c.text().nullable(),
  },
  beforeWrite: skipUndefined,
});

export const artistFeaturedMedia = table({
  name: 'ArtistFeaturedMedia',
  columns: {
    artistId: c.text(),
    mediaId: c.text(),
    position: c.integer(),
  },
  primaryKey: ['artistId', 'mediaId'],
  beforeWrite: skipUndefined,
});

/** Apple Music data's genres and artwork */
export const appleMusicDetails = {
  genreNames: hasMany(appleMusicData, appleMusicGenres, { foreignKey: 'appleMusicDataId' }),
  artwork: hasOne(appleMusicData, appleMusicArtworks, { foreignKey: 'appleMusicDataId' }),
};

/** An artist's Apple Music data, with its genres and artwork */
export const artistAppleMusic = hasOne(artists, appleMusicData, { foreignKey: 'artistId' }).with(
  appleMusicDetails
);

/** The media an artist's featured-media row joins */
export const artistFeaturedMediaUpload = belongsTo(artistFeaturedMedia, mediaUploads, {
  foreignKey: 'mediaId',
});

/** An artist's featured-media rows, in order, each with its media */
export const artistMedia = hasMany(artists, artistFeaturedMedia, { foreignKey: 'artistId' })
  .orderBy('position')
  .with({ media: artistFeaturedMediaUpload });

// --- Media ---

export const imageUploadCrops = table({
  name: 'ImageUploadCrop',
  columns: {
    id: c.text(),
    mediaId: c.text(),
    fileName: c.text(),
    width: c.integer(),
    height: c.integer(),
    fileSize: c.integer(),
  },
  beforeWrite: skipUndefined,
});

export const audioArtists = table({
  name: 'AudioArtist',
  columns: { id: c.text(), mediaId: c.text(), name: c.text() },
  beforeWrite: skipUndefined,
});

export const audioAlbumArtists = table({
  name: 'AudioAlbumArtist',
  columns: { id: c.text(), mediaId: c.text(), name: c.text() },
  beforeWrite: skipUndefined,
});

export const audioGenres = table({
  name: 'AudioGenre',
  columns: { id: c.text(), mediaId: c.text(), name: c.text() },
  beforeWrite: skipUndefined,
});

export const audioImages = table({
  name: 'AudioImage',
  columns: {
    id: c.text(),
    mediaId: c.text(),
    fileName: c.text(),
    width: c.integer(),
    height: c.integer(),
    fileSize: c.integer(),
  },
  beforeWrite: skipUndefined,
});

/** An upload's crops, and an audio file's details */
export const mediaDetails = {
  crops: hasMany(mediaUploads, imageUploadCrops, { foreignKey: 'mediaId' }),
  audioArtists: hasMany(mediaUploads, audioArtists, { foreignKey: 'mediaId' }),
  audioAlbumArtists: hasMany(mediaUploads, audioAlbumArtists, { foreignKey: 'mediaId' }),
  audioGenres: hasMany(mediaUploads, audioGenres, { foreignKey: 'mediaId' }),
  audioImages: hasMany(mediaUploads, audioImages, { foreignKey: 'mediaId' }),
};

// --- Settings ---

/** The one row of each kind of settings has the ID 'site', 'media' or 'podcast' */
export const siteSettings = table({
  name: 'SiteSettings',
  columns: {
    id: c.text(),
    siteTitle: c.text().nullable(),
    tagline: c.text().nullable(),
    siteUrl: c.text().nullable(),
    emailAddress: c.text().nullable(),
    language: c.text().nullable(),
    copyrightText: c.text().nullable(),
  },
  beforeWrite: skipUndefined,
});

export const mediaSettings = table({
  name: 'MediaSettings',
  columns: { id: c.text() },
  beforeWrite: skipUndefined,
});

export const podcastSettings = table({
  name: 'PodcastSettings',
  columns: {
    id: c.text(),
    title: c.text().nullable(),
    description: c.text().nullable(),
    managingEditor: c.text().nullable(),
    copyrightText: c.text().nullable(),
    websiteLink: c.text().nullable(),
    feedLink: c.text().nullable(),
    imageId: c.text().nullable(),
    itunesName: c.text().nullable(),
    itunesEmail: c.text().nullable(),
    generator: c.text().nullable(),
    language: c.text().nullable(),
    explicit: c.text().nullable(),
    category: c.text().nullable(),
  },
  beforeWrite: skipUndefined,
});

/** The podcast's image */
export const podcastSettingsImage = belongsTo(podcastSettings, mediaUploads, {
  foreignKey: 'imageId',
});

/** The sizes an uploaded image is cropped to, which belong to the one media settings row */
export const mediaCropSettings = table({
  name: 'MediaCropSetting',
  columns: {
    id: c.text(),
    mediaSettingsId: c.text(),
    name: c.text(),
    width: c.integer().nullable(),
    height: c.integer().nullable(),
  },
  beforeWrite: skipUndefined,
});

// --- Show ---

export const shows = table({
  name: 'Show',
  columns: {
    id: c.text(),
    title: c.text().nullable(),
    notes: c.text().nullable(),
    date: timestamp(),
    localDate: c.date() as ColumnBuilder<string>,
    localTime: (c.time({ precision: 3 }) as ColumnBuilder<string>).nullable(),
    timeZone: c.text().nullable(),
    startsAt: (c.timestamp({ withTimezone: true, precision: 3 }) as ColumnBuilder<Date>).nullable(),
    url: c.text().nullable(),
    attended: c.boolean(),
    venueId: c.text(),
    // The venue listing a show was added from: "aeg" or "ticketmaster", and its event ID there
    source: c.text().nullable(),
    sourceId: c.text().nullable(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

export const showArtists = table({
  name: 'ShowArtist',
  columns: {
    showId: c.text(),
    artistId: c.text(),
    position: c.integer(),
  },
  primaryKey: ['showId', 'artistId'],
  beforeWrite: skipUndefined,
});

/** The artist a show's lineup row joins */
export const lineupArtist = belongsTo(showArtists, artists, { foreignKey: 'artistId' });

/** A show's lineup: its artist rows, from the headliner, each with its artist */
export const showLineup = hasMany(shows, showArtists, { foreignKey: 'showId' })
  .orderBy('position')
  .with({ artist: lineupArtist });

/** A show's venue */
export const showVenue = belongsTo(shows, venues, { foreignKey: 'venueId' });

// --- Post ---

export const posts = table({
  name: 'Post',
  columns: {
    id: c.text(),
    title: c.text(),
    slug: c.text(),
    editorState: c.json().nullable(),
    contentBody: c.text().nullable(),
    summary: c.text().nullable(),
    status: c.text(),
    date: timestamp(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

export const postFeaturedMedia = table({
  name: 'PostFeaturedMedia',
  columns: {
    postId: c.text(),
    mediaId: c.text(),
    position: c.integer(),
  },
  primaryKey: ['postId', 'mediaId'],
  beforeWrite: skipUndefined,
});

export const postArtists = table({
  name: 'PostArtist',
  columns: {
    postId: c.text(),
    artistId: c.text(),
    position: c.integer(),
  },
  primaryKey: ['postId', 'artistId'],
  beforeWrite: skipUndefined,
});

/**
 * The media a post's featured-media row joins, with its crops: the artwork on post lists picks a
 * size from them, which took a query per image when ImageUpload.crops loaded them
 */
export const postFeaturedMediaUpload = belongsTo(postFeaturedMedia, mediaUploads, {
  foreignKey: 'mediaId',
}).with({ crops: mediaDetails.crops });

/** A post's featured-media rows, in order, each with its media */
export const postMedia = hasMany(posts, postFeaturedMedia, { foreignKey: 'postId' })
  .orderBy('position')
  .with({ media: postFeaturedMediaUpload });

/** The artist a post's tag row joins */
export const postTagArtist = belongsTo(postArtists, artists, { foreignKey: 'artistId' });

/** The artists a post is tagged with: its tag rows, in order, each with its artist */
export const postTags = hasMany(posts, postArtists, { foreignKey: 'postId' })
  .orderBy('position')
  .with({ artist: postTagArtist });

// --- Podcast ---

export const podcasts = table({
  name: 'Podcast',
  columns: {
    id: c.text(),
    title: c.text(),
    description: c.text(),
    audioId: c.text().nullable(),
    imageId: c.text().nullable(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

/** An episode's audio and image */
export const podcastMedia = {
  audio: belongsTo(podcasts, mediaUploads, { foreignKey: 'audioId' }),
  image: belongsTo(podcasts, mediaUploads, { foreignKey: 'imageId' }),
};

// --- Video ---

export const videos = table({
  name: 'Video',
  columns: {
    id: c.text(),
    dataId: c.text(),
    slug: c.text(),
    dataType: c.text(),
    dataPlaylistId: c.text(),
    year: c.integer(),
    publishedAt: timestamp(),
    publishedISO: c.text(),
    title: c.text(),
    position: c.integer(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

export const videoThumbnails = table({
  name: 'VideoThumbnail',
  columns: {
    id: c.text(),
    videoId: c.text(),
    url: c.text(),
    width: c.integer(),
    height: c.integer(),
  },
  beforeWrite: skipUndefined,
});

/** A video's thumbnails */
export const videoThumbnailRows = hasMany(videos, videoThumbnails, { foreignKey: 'videoId' });

// --- User ---

export const users = table({
  name: 'User',
  columns: {
    id: c.text(),
    name: c.text().nullable(),
    email: c.text(),
    bio: c.text().nullable(),
    hash: c.text(),
    createdAt: timestamp(),
    updatedAt: timestamp(),
  },
  timestamps,
  beforeWrite: skipUndefined,
});

export const userRoles = table({
  name: 'UserRole',
  columns: {
    id: c.text(),
    userId: c.text(),
    name: c.text(),
  },
  beforeWrite: skipUndefined,
});

// The tables below have only a creation time. Prisma's `@default(now())` set it in UTC, where
// the column's default would take the database's time zone, so it's set here as for the others.
const createdOnly = { createdAt: 'createdAt' };

/** A signed-in user's session, which their token names */
export const sessions = table({
  name: 'Session',
  columns: {
    id: c.text(),
    userId: c.text(),
    expiresAt: timestamp(),
    createdAt: timestamp(),
  },
  timestamps: createdOnly,
  beforeWrite: skipUndefined,
});

export const passkeys = table({
  name: 'Passkey',
  columns: {
    id: c.text(),
    userId: c.text(),
    // `bytea`, which the driver reads as a Buffer
    publicKey: c.binary() as ColumnBuilder<Uint8Array<ArrayBuffer>>,
    // `bigint`, which the driver reads as text, keeping every digit
    counter: c.bigint() as ColumnBuilder<string>,
    // `text[]`, which has no column type here. The driver reads and writes it as an array.
    transports: c.text().nullable() as ColumnBuilder<string[] | null>,
    deviceType: c.text(),
    backedUp: c.boolean(),
    name: c.text().nullable(),
    createdAt: timestamp(),
    lastUsedAt: timestamp().nullable(),
  },
  timestamps: createdOnly,
  beforeWrite: skipUndefined,
});

/**
 * The challenge a passkey being added has to answer, or one a sign-in has answered, kept so it
 * can't be answered again. A sign-in's challenge is signed, not saved, until then.
 */
export const webAuthnChallenges = table({
  name: 'WebAuthnChallenge',
  columns: {
    id: c.text(),
    challenge: c.text(),
    type: c.text(),
    userId: c.text().nullable(),
    expiresAt: timestamp(),
    createdAt: timestamp(),
  },
  timestamps: createdOnly,
  beforeWrite: skipUndefined,
});

/** A user's roles */
export const userRoleRows = hasMany(users, userRoles, { foreignKey: 'userId' });

/** The user a session belongs to, with their roles */
export const sessionUser = belongsTo(sessions, users, { foreignKey: 'userId' }).with({
  roles: userRoleRows,
});

/** The user a passkey belongs to, with their roles */
export const passkeyUser = belongsTo(passkeys, users, { foreignKey: 'userId' }).with({
  roles: userRoleRows,
});
