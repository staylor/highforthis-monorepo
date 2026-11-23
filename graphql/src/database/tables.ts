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

// The tables `prisma db push` made, described for remix/data-table. These describe the database;
// they don't create or change it.

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

// IDs are made the way Prisma's `cuid()` made them: a "c", then the time, a counter, a block for
// the process and random characters, all in base 36. They sort by when they were made, which
// matters where rows come back in the order of an index on an ID: one show's artists, for one.
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

export const venueFeaturedMedia = table({
  name: 'VenueFeaturedMedia',
  columns: {
    venueId: c.text(),
    mediaId: c.text(),
  },
  primaryKey: ['venueId', 'mediaId'],
  beforeWrite: skipUndefined,
});

// A join table's rows come back in the order they were saved, as Prisma loaded them. Loading their
// media through `hasManyThrough` would put them in the order of the media table instead.

/** The media a venue's featured-media row joins */
export const venueFeaturedMediaUpload = belongsTo(venueFeaturedMedia, mediaUploads, {
  foreignKey: 'mediaId',
});

/** A venue's featured-media rows, each with its media */
export const venueMedia = hasMany(venues, venueFeaturedMedia, { foreignKey: 'venueId' }).with({
  media: venueFeaturedMediaUpload,
});

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

/** An artist's featured-media rows, each with its media */
export const artistMedia = hasMany(artists, artistFeaturedMedia, { foreignKey: 'artistId' }).with({
  media: artistFeaturedMediaUpload,
});

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
  },
  primaryKey: ['showId', 'artistId'],
  beforeWrite: skipUndefined,
});

/** The artist a show's lineup row joins */
export const lineupArtist = belongsTo(showArtists, artists, { foreignKey: 'artistId' });

/** A show's lineup: its artist rows, in the order they were saved, each with its artist */
export const showLineup = hasMany(shows, showArtists, { foreignKey: 'showId' }).with({
  artist: lineupArtist,
});

/** A show's venue */
export const showVenue = belongsTo(shows, venues, { foreignKey: 'venueId' });
