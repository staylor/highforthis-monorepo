import type { Prisma, Podcast } from '@prisma/client';
import type {
  MutationCreatePodcastArgs,
  MutationRemovePodcastArgs,
  MutationUpdatePodcastArgs,
  QueryPodcastArgs,
  QueryPodcastsArgs,
} from 'types/graphql';

import prisma from '#/database';

import { parseConnection } from './utils/collection';
import { removeEntities, timestampResolver } from './utils/helpers';
import { createPodcastSchema, updatePodcastSchema } from './validations';

const podcastIncludes = {
  audio: true,
  image: true,
};

const resolvers = {
  Podcast: {
    audio(podcast: Podcast) {
      if ('audio' in podcast) return podcast.audio;
      if (!podcast.audioId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: podcast.audioId } });
    },
    image(podcast: Podcast) {
      if ('image' in podcast) return podcast.image;
      if (!podcast.imageId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: podcast.imageId } });
    },
    date: timestampResolver('updatedAt'),
  },
  Query: {
    async podcasts(_: unknown, args: QueryPodcastsArgs) {
      const { search, order, ...connectionArgs } = args;
      const where: Prisma.PodcastWhereInput = {};
      if (search) {
        where.OR = [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ];
      }
      return parseConnection(prisma.podcast, connectionArgs, {
        where,
        orderBy: { createdAt: order === 'ASC' ? 'asc' : 'desc' },
        include: podcastIncludes,
      });
    },

    async podcast(_: unknown, { id }: QueryPodcastArgs) {
      if (!id) return null;
      return prisma.podcast.findUnique({ where: { id }, include: podcastIncludes });
    },
  },
  Mutation: {
    async createPodcast(_: unknown, { input }: MutationCreatePodcastArgs) {
      const { audio, image, date: _date, ...data } = createPodcastSchema.parse(input);
      // Prisma's Without<> union can't resolve FK fields from a spread;
      // use UncheckedCreateInput via assertion on validated data.
      const podcastData: Prisma.PodcastUncheckedCreateInput = {
        ...data,
        audioId: audio ?? undefined,
        imageId: image ?? undefined,
      };
      return prisma.podcast.create({
        data: podcastData,
        include: podcastIncludes,
      });
    },

    async updatePodcast(_: unknown, { id, input }: MutationUpdatePodcastArgs) {
      const { audio, image, date: _date, ...data } = updatePodcastSchema.parse(input);
      const podcastData: Prisma.PodcastUncheckedUpdateInput = {
        ...data,
        audioId: audio ?? undefined,
        imageId: image ?? undefined,
      };
      return prisma.podcast.update({
        where: { id },
        data: podcastData,
        include: podcastIncludes,
      });
    },

    async removePodcast(_: unknown, { ids }: MutationRemovePodcastArgs) {
      return removeEntities(prisma.podcast, ids);
    },
  },
};

export default resolvers;
