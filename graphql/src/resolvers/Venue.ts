import { ilike, inList, or, type TableRow } from 'remix/data-table';
import type { Resolvers } from 'types/graphql';

import db from '#/database/db';
import type { Loaded } from '#/database/tables';
import {
  newId,
  venueFeaturedMedia,
  venueFeaturedMediaUpload,
  venueMedia,
  venues,
} from '#/database/tables';
import { ADDRESS_FIELDS, geocodeVenue } from '#/geocode';
import { getUniqueSlug } from '#/models/utils';

import { parseConnection } from './utils/collection';
import { parseInput, removeEntities, resolveJoin } from './utils/helpers';
import { createVenueSchema, updateVenueSchema } from './validations';

type Venue = TableRow<typeof venues>;

/** A venue, with its featured media when its query loaded them */
export type VenueSource = Venue & { featuredMedia?: Loaded<typeof venueMedia> };

const withMedia = { with: { featuredMedia: venueMedia } };

// Prisma's `contains` matches the text as written, so `%` and `_` aren't wildcards
const containing = (text: string) => `%${text.replace(/[\\%_]/g, '\\$&')}%`;

const resolvers = {
  Venue: {
    // "Street" over "City, ST 12345", leaving out whatever isn't set
    address(venue) {
      const region = [venue.state, venue.postalCode].filter(Boolean).join(' ');
      const locality = [venue.city, region].filter(Boolean).join(', ');
      return [venue.streetAddress?.trim(), locality].filter(Boolean).join('\n') || null;
    },
    coordinates(venue) {
      if (venue.latitude === null && venue.longitude === null) return null;
      return { latitude: venue.latitude, longitude: venue.longitude };
    },
    featuredMedia(venue) {
      return resolveJoin(venue.featuredMedia, 'media', () =>
        db.findMany(venueFeaturedMedia, {
          where: { venueId: venue.id },
          with: { media: venueFeaturedMediaUpload },
        })
      );
    },
  },
  Query: {
    async venues(_, args) {
      const { search, filtered, ...connectionArgs } = args;
      let query = db.query(venues);
      if (search) {
        const pattern = containing(search);
        query = query.where(
          or(
            ilike('name', pattern),
            ilike('slug', pattern),
            ilike('city', pattern),
            ilike('state', pattern)
          )
        );
      }
      if (filtered) {
        query = query.where({ excludeFromSearch: false, permanentlyClosed: false });
      }
      return parseConnection(
        {
          count: () => query.count(),
          findMany: ({ skip, take }) =>
            query.with(withMedia.with).orderBy('name', 'asc').offset(skip).limit(take).all(),
        },
        connectionArgs
      );
    },

    async venue(_, { id, slug }) {
      if (id) {
        return db.find(venues, id, withMedia);
      }
      if (slug) {
        return db.findOne(venues, { where: { slug }, ...withMedia });
      }
      return null;
    },
  },
  Mutation: {
    async createVenue(_, { input }) {
      const { featuredMedia, coordinates, ...data } = parseInput(createVenueSchema, input);
      const slug = await getUniqueSlug(
        { count: ({ where }) => db.count(venues, { where }) },
        data.name
      );
      // Look the venue up unless its coordinates were entered
      const location =
        typeof coordinates?.latitude === 'number' && typeof coordinates.longitude === 'number'
          ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
          : await geocodeVenue(data);
      const id = newId();
      await db.transaction(async (tx) => {
        await tx.create(venues, { ...data, ...location, id, slug });
        if (featuredMedia?.length) {
          await tx.createMany(
            venueFeaturedMedia,
            featuredMedia.map((mediaId) => ({ venueId: id, mediaId }))
          );
        }
      });
      return db.find(venues, id, withMedia);
    },

    async updateVenue(_, { id, input }) {
      const { featuredMedia, coordinates, ...data } = parseInput(updateVenueSchema, input);
      const changes: Partial<Venue> = { ...data };
      if (coordinates) {
        changes.latitude = coordinates.latitude;
        changes.longitude = coordinates.longitude;
      }
      if (typeof featuredMedia !== 'undefined') {
        await db.deleteMany(venueFeaturedMedia, { where: { venueId: id } });
        if (featuredMedia?.length) {
          await db.createMany(
            venueFeaturedMedia,
            featuredMedia.map((mediaId) => ({ venueId: id, mediaId }))
          );
        }
      }
      const venue = await db.update(venues, id, changes, withMedia);

      // Saving an address for a venue without coordinates looks it up, which also fills in any
      // empty part of its address
      const addressSaved = ADDRESS_FIELDS.some((field) => data[field] !== undefined);
      if (!addressSaved || (venue.latitude !== null && venue.longitude !== null)) {
        return venue;
      }
      const location = await geocodeVenue(venue);
      return location ? db.update(venues, id, location, withMedia) : venue;
    },

    async removeVenue(_, { ids }) {
      return removeEntities(
        { deleteMany: ({ where }) => db.deleteMany(venues, { where: inList('id', where.id.in) }) },
        ids
      );
    },
  },
} satisfies Resolvers;

export default resolvers;
