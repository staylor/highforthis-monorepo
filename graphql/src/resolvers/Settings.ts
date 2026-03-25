import type { MediaSettings, PodcastSettings } from '@prisma/client';

import prisma from '#/database';

import {
  siteSettingsSchema,
  dashboardSettingsSchema,
  mediaSettingsSchema,
  podcastSettingsSchema,
} from './validations';

const resolvers = {
  MediaSettings: {
    async crops(settings: MediaSettings) {
      return prisma.mediaCropSetting.findMany({ where: { mediaSettingsId: settings.id } });
    },
  },
  PodcastSettings: {
    async image(settings: PodcastSettings) {
      if (!settings.imageId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: settings.imageId } });
    },
  },
  Query: {
    async siteSettings() {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'site' } });
      return settings || { id: 'site' };
    },
    async dashboardSettings() {
      const settings = await prisma.dashboardSettings.findUnique({ where: { id: 'dashboard' } });
      return settings || { id: 'dashboard' };
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
    async updateSiteSettings(_: unknown, { id, input }: { id: string; input: unknown }) {
      const data = siteSettingsSchema.parse(input);
      return prisma.siteSettings.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
    },
    async updateDashboardSettings(_: unknown, { id, input }: { id: string; input: unknown }) {
      const data = dashboardSettingsSchema.parse(input);
      return prisma.dashboardSettings.upsert({
        where: { id },
        create: { id, ...data },
        update: data,
      });
    },
    async updateMediaSettings(_: unknown, { id, input }: { id: string; input: unknown }) {
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
    async updatePodcastSettings(_: unknown, { id, input }: { id: string; input: unknown }) {
      const { image, ...data } = podcastSettingsSchema.parse(input);
      return prisma.podcastSettings.upsert({
        where: { id },
        create: { id, ...data, imageId: image },
        update: { ...data, imageId: image },
      });
    },
  },
};

export default resolvers;
