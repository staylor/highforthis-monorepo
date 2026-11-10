import type { Prisma, Venue } from '@prisma/client';
import type {
  MutationCreateVenueArgs,
  MutationRemoveVenueArgs,
  MutationUpdateVenueArgs,
  QueryVenueArgs,
  QueryVenuesArgs,
} from 'types/graphql';

import prisma from '#/database';
import { ADDRESS_FIELDS, geocodeVenue } from '#/geocode';
import { getUniqueSlug } from '#/models/utils';

import { parseConnection } from './utils/collection';
import { removeEntities, resolveJoin } from './utils/helpers';
import { createVenueSchema, updateVenueSchema } from './validations';

const venueIncludes = {
  featuredMedia: { include: { media: true } },
};

const resolvers = {
  Venue: {
    // "Street" over "City, ST 12345", leaving out whatever isn't set
    address(venue: Venue) {
      const region = [venue.state, venue.postalCode].filter(Boolean).join(' ');
      const locality = [venue.city, region].filter(Boolean).join(', ');
      return [venue.streetAddress?.trim(), locality].filter(Boolean).join('\n') || null;
    },
    coordinates(venue: Venue) {
      if (venue.latitude === null && venue.longitude === null) return null;
      return { latitude: venue.latitude, longitude: venue.longitude };
    },
    featuredMedia(venue: Venue) {
      return resolveJoin(venue, 'featuredMedia', 'media', () =>
        prisma.venueFeaturedMedia.findMany({
          where: { venueId: venue.id },
          include: { media: true },
        })
      );
    },
  },
  Query: {
    async venues(_: unknown, args: QueryVenuesArgs) {
      const { search, filtered, ...connectionArgs } = args;
      const where: Prisma.VenueWhereInput = {};
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
          { city: { contains: search, mode: 'insensitive' } },
          { state: { contains: search, mode: 'insensitive' } },
        ];
      }
      if (filtered) {
        where.excludeFromSearch = false;
        where.permanentlyClosed = false;
      }
      return parseConnection(prisma.venue, connectionArgs, {
        where,
        orderBy: { name: 'asc' },
        include: venueIncludes,
      });
    },

    async venue(_: unknown, { id, slug }: QueryVenueArgs) {
      if (id) {
        return prisma.venue.findUnique({ where: { id }, include: venueIncludes });
      }
      if (slug) {
        return prisma.venue.findUnique({ where: { slug }, include: venueIncludes });
      }
    },
  },
  Mutation: {
    async createVenue(_: unknown, { input }: MutationCreateVenueArgs) {
      const { featuredMedia, coordinates, ...data } = createVenueSchema.parse(input);
      const slug = await getUniqueSlug(prisma.venue, data.name);
      // Look the venue up unless its coordinates were entered
      const location =
        typeof coordinates?.latitude === 'number' && typeof coordinates.longitude === 'number'
          ? { latitude: coordinates.latitude, longitude: coordinates.longitude }
          : await geocodeVenue(data);
      return prisma.venue.create({
        data: {
          ...data,
          ...location,
          slug,
          featuredMedia: featuredMedia?.length
            ? { create: featuredMedia.map((mediaId) => ({ mediaId })) }
            : undefined,
        },
        include: venueIncludes,
      });
    },

    async updateVenue(_: unknown, { id, input }: MutationUpdateVenueArgs) {
      const { featuredMedia, coordinates, ...data } = updateVenueSchema.parse(input);
      const updateData: Record<string, unknown> = { ...data };
      if (coordinates) {
        updateData.latitude = coordinates.latitude;
        updateData.longitude = coordinates.longitude;
      }
      if (typeof featuredMedia !== 'undefined') {
        await prisma.venueFeaturedMedia.deleteMany({ where: { venueId: id } });
        if (featuredMedia?.length) {
          await prisma.venueFeaturedMedia.createMany({
            data: featuredMedia.map((mediaId) => ({ venueId: id, mediaId })),
          });
        }
      }
      const venue = await prisma.venue.update({
        where: { id },
        data: updateData,
        include: venueIncludes,
      });

      // Saving an address for a venue without coordinates looks it up, which also fills in any
      // empty part of its address
      const addressSaved = ADDRESS_FIELDS.some((field) => data[field] !== undefined);
      if (!addressSaved || (venue.latitude !== null && venue.longitude !== null)) {
        return venue;
      }
      const location = await geocodeVenue(venue);
      return location
        ? prisma.venue.update({ where: { id }, data: location, include: venueIncludes })
        : venue;
    },

    async removeVenue(_: unknown, { ids }: MutationRemoveVenueArgs) {
      return removeEntities(prisma.venue, ids);
    },
  },
};

export default resolvers;
