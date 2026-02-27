import type {
  MutationCreateVenueArgs,
  MutationRemoveVenueArgs,
  MutationUpdateVenueArgs,
  QueryVenueArgs,
  QueryVenuesArgs,
} from 'types/graphql';

import type { AppContext } from '#/models';
import { getUniqueSlug } from '#/models/utils';

import { parseConnection } from './utils/collection';

const venueIncludes = {
  featuredMedia: { include: { media: true } },
};

const resolvers = {
  Venue: {
    address(venue: any) {
      return `${venue.streetAddress}\n${venue.city}, ${venue.state} ${venue.postalCode}`;
    },
    coordinates(venue: any) {
      if (venue.latitude === null && venue.longitude === null) return null;
      return { latitude: venue.latitude, longitude: venue.longitude };
    },
    featuredMedia(venue: any, _: unknown, { prisma }: AppContext) {
      if ('featuredMedia' in venue) {
        return venue.featuredMedia.map((r: any) => r.media);
      }
      return prisma.venueFeaturedMedia
        .findMany({ where: { venueId: venue.id }, include: { media: true } })
        .then((records: any[]) => records.map((r) => r.media));
    },
  },
  Query: {
    async venues(_: unknown, args: QueryVenuesArgs, { prisma }: AppContext) {
      const { search, filtered, ...connectionArgs } = args;
      const where: any = {};
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

    async venue(_: unknown, { id, slug }: QueryVenueArgs, { prisma }: AppContext) {
      if (id) {
        return prisma.venue.findUnique({ where: { id }, include: venueIncludes });
      }
      if (slug) {
        return prisma.venue.findUnique({ where: { slug }, include: venueIncludes });
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
        include: venueIncludes,
      });
    },

    async updateVenue(_: unknown, { id, input }: MutationUpdateVenueArgs, { prisma }: AppContext) {
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
      return prisma.venue.update({ where: { id }, data: updateData, include: venueIncludes });
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
