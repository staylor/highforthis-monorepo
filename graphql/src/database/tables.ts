import { randomUUID } from 'node:crypto';

import { column as c, hasManyThrough, hasMany, table, type ColumnBuilder } from 'remix/data-table';

// The tables `prisma db push` made, described for remix/data-table. These describe the database;
// they don't create or change it.

// `timestamp()` is untyped, and the driver reads these columns back as dates
const timestamp = () => c.timestamp() as ColumnBuilder<Date>;

// Prisma's `@updatedAt` is set by the client, as these are
const timestamps = { createdAt: 'createdAt', updatedAt: 'updatedAt' };

/** An ID for a new row. Prisma made CUIDs, which are also text, so the two can share a column. */
export const newId = () => randomUUID();

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
});

export const venueFeaturedMedia = table({
  name: 'VenueFeaturedMedia',
  columns: {
    venueId: c.text(),
    mediaId: c.text(),
  },
  primaryKey: ['venueId', 'mediaId'],
});

/** A venue's featured media, through the join table */
export const venueMedia = hasManyThrough(venues, mediaUploads, {
  through: hasMany(venues, venueFeaturedMedia, { foreignKey: 'venueId' }),
  throughTargetKey: 'mediaId',
  throughForeignKey: 'id',
});
