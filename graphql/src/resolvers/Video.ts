import type { Prisma, Video } from '@prisma/client';
import type { Resolvers } from 'types/graphql';

import prisma from '#/database';
import type { WithIncludes } from '#/models';
import { getUniqueSlug } from '#/models/utils';

import { parseConnection } from './utils/collection';
import { removeEntities, timestampResolver } from './utils/helpers';
import { createVideoSchema, updateVideoSchema } from './validations';

const videoIncludes = {
  thumbnails: true,
} satisfies Prisma.VideoInclude;

/** A video, with its thumbnails when its query included them */
export type VideoSource = WithIncludes<
  Video,
  Prisma.VideoGetPayload<{ include: typeof videoIncludes }>
>;

const resolvers = {
  Video: {
    publishedAt: timestampResolver('publishedAt'),
    createdAt: timestampResolver('createdAt'),
    updatedAt: timestampResolver('updatedAt'),
    thumbnails(video) {
      if (video.thumbnails) return video.thumbnails;
      return prisma.videoThumbnail.findMany({ where: { videoId: video.id } });
    },
  },
  VideoConnection: {
    async years() {
      const results = await prisma.video.findMany({
        distinct: ['year'],
        select: { year: true },
        where: { year: { not: 0 } },
        orderBy: { year: 'desc' },
      });
      return results.map((r) => r.year);
    },
  },
  Query: {
    async videos(_, args) {
      const { year, search, ...connectionArgs } = args;
      const where: Prisma.VideoWhereInput = {};
      if (year) where.year = year;
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ];
      }
      return parseConnection(prisma.video, connectionArgs, {
        where,
        orderBy: [{ year: 'desc' }, { position: 'desc' }],
        include: videoIncludes,
      });
    },

    video(_, { id, slug }) {
      if (id) {
        return prisma.video.findUnique({ where: { id }, include: videoIncludes });
      }
      if (slug) {
        return prisma.video.findUnique({ where: { slug }, include: videoIncludes });
      }
      return null;
    },
  },
  Mutation: {
    async createVideo(_, { input }) {
      const { publishedAt, ...rest } = createVideoSchema.parse(input);
      const slug = await getUniqueSlug(prisma.video, rest.title);
      return prisma.video.create({
        data: { ...rest, slug, publishedAt: new Date(publishedAt) },
        include: videoIncludes,
      });
    },

    async updateVideo(_, { id, input }) {
      const { publishedAt, ...rest } = updateVideoSchema.parse(input);
      return prisma.video.update({
        where: { id },
        data: {
          ...rest,
          // A form that leaves the date out sends no publishedAt, which keeps the saved one
          ...(publishedAt !== undefined && { publishedAt: new Date(publishedAt) }),
        },
        include: videoIncludes,
      });
    },

    async removeVideo(_, { ids }) {
      return removeEntities(prisma.video, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
