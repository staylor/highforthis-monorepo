import type { PodcastSettings, Prisma } from '@prisma/client';
import type { Resolvers } from 'types/graphql';

import prisma from '#/database';

import { siteSettingsSchema, mediaSettingsSchema, podcastSettingsSchema } from './validations';

/**
 * The podcast's settings, with their image when the query included it, or only the ID of
 * settings that were never saved
 */
export type PodcastSettingsSource = Pick<PodcastSettings, 'id'> &
  Partial<Prisma.PodcastSettingsGetPayload<{ include: { image: true } }>>;

const resolvers = {
  MediaSettings: {
    async crops(settings) {
      return prisma.mediaCropSetting.findMany({ where: { mediaSettingsId: settings.id } });
    },
  },
  PodcastSettings: {
    async image(settings) {
      // Query.podcastSettings includes it
      if (settings.image !== undefined) return settings.image;
      if (!settings.imageId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: settings.imageId } });
    },
  },
  Query: {
    async siteSettings() {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'site' } });
      return settings || { id: 'site' };
    },
    async mediaSettings() {
      const settings = await prisma.mediaSettings.findUnique({ where: { id: 'media' } });
      return settings || { id: 'media' };
    },
    async podcastSettings() {
      const settings = await prisma.podcastSettings.findUnique({
        where: { id: 'podcast' },
        include: { image: true },
      });
      return settings || { id: 'podcast' };
    },
  },
  Mutation: {
    async updateSiteSettings(_, { id, input }) {
      const data = siteSettingsSchema.parse(input);
      return prisma.siteSettings.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
    },
    async updateMediaSettings(_, { id, input }) {
      const { crops, ...rest } = mediaSettingsSchema.parse(input);
      const settings = await prisma.mediaSettings.upsert({
        where: { id },
        create: { id, ...rest },
        update: rest,
      });
      if (typeof crops !== 'undefined') {
        await prisma.mediaCropSetting.deleteMany({ where: { mediaSettingsId: id } });
        if (crops?.length) {
          await prisma.mediaCropSetting.createMany({
            data: crops.map((crop) => ({ ...crop, mediaSettingsId: id })),
          });
        }
      }
      return settings;
    },
    async updatePodcastSettings(_, { id, input }) {
      const { image, ...data } = podcastSettingsSchema.parse(input);
      return prisma.podcastSettings.upsert({
        where: { id },
        create: { id, ...data, imageId: image },
        update: { ...data, imageId: image },
      });
    },
  },
} satisfies Resolvers;

export default resolvers;
