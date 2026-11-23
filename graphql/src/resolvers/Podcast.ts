import type { Prisma, Podcast } from '@prisma/client';
import type { Resolvers } from 'types/graphql';

import prisma from '#/database';
import type { WithIncludes } from '#/models';

import { parseConnection } from './utils/collection';
import { parseInput, removeEntities, timestampResolver } from './utils/helpers';
import { createPodcastSchema, updatePodcastSchema } from './validations';

const podcastIncludes = {
  audio: true,
  image: true,
} satisfies Prisma.PodcastInclude;

/** A podcast, with its audio and image when its query included them */
export type PodcastSource = WithIncludes<
  Podcast,
  Prisma.PodcastGetPayload<{ include: typeof podcastIncludes }>
>;

const resolvers = {
  Podcast: {
    audio(podcast) {
      if (podcast.audio !== undefined) return podcast.audio;
      if (!podcast.audioId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: podcast.audioId } });
    },
    image(podcast) {
      if (podcast.image !== undefined) return podcast.image;
      if (!podcast.imageId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: podcast.imageId } });
    },
    // When the episode was added. Editing one doesn't publish it again.
    date: timestampResolver('createdAt'),
  },
  Query: {
    async podcasts(_, args) {
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

    async podcast(_, { id }) {
      if (!id) return null;
      return prisma.podcast.findUnique({ where: { id }, include: podcastIncludes });
    },
  },
  Mutation: {
    async createPodcast(_, { input }) {
      const { audio, image, ...data } = parseInput(createPodcastSchema, input);
      // The unchecked input takes audioId and imageId as they are
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

    async updatePodcast(_, { id, input }) {
      const { audio, image, ...data } = parseInput(updatePodcastSchema, input);
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

    async removePodcast(_, { ids }) {
      return removeEntities(prisma.podcast, ids);
    },
  },
} satisfies Resolvers;

export default resolvers;
