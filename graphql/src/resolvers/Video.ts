import type { Prisma, Video } from '@prisma/client';
import type {
  MutationCreateVideoArgs,
  MutationRemoveVideoArgs,
  MutationUpdateVideoArgs,
  QueryVideoArgs,
  QueryVideosArgs,
} from 'types/graphql';

import prisma from '#/database';
import { getUniqueSlug } from '#/models/utils';

import { parseConnection } from './utils/collection';
import { removeEntities, timestampResolver } from './utils/helpers';
import { createVideoSchema, updateVideoSchema } from './validations';

const videoIncludes = {
  thumbnails: true,
};

const resolvers = {
  Video: {
    publishedAt: timestampResolver('publishedAt'),
    createdAt: timestampResolver('createdAt'),
    updatedAt: timestampResolver('updatedAt'),
    thumbnails(video: Video) {
      if ('thumbnails' in video && Array.isArray(video.thumbnails)) return video.thumbnails;
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
    async videos(_: unknown, args: QueryVideosArgs) {
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

    video(_: unknown, { id, slug }: QueryVideoArgs) {
      if (id) {
        return prisma.video.findUnique({ where: { id }, include: videoIncludes });
      }
      if (slug) {
        return prisma.video.findUnique({ where: { slug }, include: videoIncludes });
      }
    },
  },
  Mutation: {
    async createVideo(_: unknown, { input }: MutationCreateVideoArgs) {
      const { publishedAt, ...rest } = createVideoSchema.parse(input);
      const slug = await getUniqueSlug(prisma.video, rest.title);
      return prisma.video.create({
        data: { ...rest, slug, publishedAt: new Date(publishedAt) },
        include: videoIncludes,
      });
    },

    async updateVideo(_: unknown, { id, input }: MutationUpdateVideoArgs) {
      const { publishedAt, ...rest } = updateVideoSchema.parse(input);
      return prisma.video.update({
        where: { id },
        data: {
          ...rest,
          ...(publishedAt !== null && { publishedAt: new Date(publishedAt || '') }),
        },
        include: videoIncludes,
      });
    },

    async removeVideo(_: unknown, { ids }: MutationRemoveVideoArgs) {
      return removeEntities(prisma.video, ids);
    },
  },
};

export default resolvers;
