import type {
  MutationCreateVenueArgs,
  MutationRemoveVenueArgs,
  MutationUpdateVenueArgs,
  QueryVenueArgs,
  QueryVenuesArgs,
} from 'types/graphql';

import type { AppContext } from '~/models';
import { getUniqueSlug } from '~/models/utils';

import { parseConnection } from './utils/collection';

const resolvers = {
  Venue: {
    address(venue: any) {
      return `${venue.streetAddress}\n${venue.city}, ${venue.state} ${venue.postalCode}`;
    },
    coordinates(venue: any) {
      if (venue.latitude == null && venue.longitude == null) return null;
      return { latitude: venue.latitude, longitude: venue.longitude };
    },
    async featuredMedia(venue: any, _: unknown, { prisma }: AppContext) {
      const records = await prisma.venueFeaturedMedia.findMany({
        where: { venueId: venue.id },
        include: { media: true },
      });
      return records.map((r: any) => r.media);
    },
  },
  Query: {
    async venues(_: unknown, args: QueryVenuesArgs, { prisma }: AppContext) {
      const { search, filtered, ...connectionArgs } = args;
      const where: any = {};
      if (search) {
        where.name = { contains: search, mode: 'insensitive' };
      }
      if (filtered) {
        where.excludeFromSearch = false;
        where.permanentlyClosed = false;
      }
      return parseConnection(prisma.venue, connectionArgs, {
        where,
        orderBy: { name: 'asc' },
      });
    },

    async venue(_: unknown, { id, slug }: QueryVenueArgs, { prisma }: AppContext) {
      if (id) {
        return prisma.venue.findUnique({ where: { id } });
      }
      if (slug) {
        return prisma.venue.findUnique({ where: { slug } });
      }
    },
  },
  Mutation: {
    async createVenue(_: unknown, { input }: MutationCreateVenueArgs, { prisma }: AppContext) {
      const { featuredMedia, coordinates, ...data } = input as any;
      const slug = await getUniqueSlug(prisma.venue, data.name);
      return prisma.venue.create({
        data: {
          ...data,
          slug,
          latitude: coordinates?.latitude,
          longitude: coordinates?.longitude,
          featuredMedia: featuredMedia?.length
            ? { create: featuredMedia.map((mediaId: string) => ({ mediaId })) }
            : undefined,
        },
      });
    },

    async updateVenue(
      _: unknown,
      { id, input }: MutationUpdateVenueArgs,
      { prisma }: AppContext
    ) {
      const { featuredMedia, coordinates, ...data } = input as any;
      const updateData: any = { ...data };
      if (coordinates) {
        updateData.latitude = coordinates.latitude;
        updateData.longitude = coordinates.longitude;
      }
      if (typeof featuredMedia !== 'undefined') {
        await prisma.venueFeaturedMedia.deleteMany({ where: { venueId: id } });
        if (featuredMedia?.length) {
          await prisma.venueFeaturedMedia.createMany({
            data: featuredMedia.map((mediaId: string) => ({ venueId: id, mediaId })),
          });
        }
      }
      return prisma.venue.update({ where: { id }, data: updateData });
    },

    async removeVenue(_: unknown, { ids }: MutationRemoveVenueArgs, { prisma }: AppContext) {
      try {
        await prisma.venue.deleteMany({ where: { id: { in: ids as string[] } } });
        return true;
      } catch {
        return false;
      }
    },
  },
};

export default resolvers;
