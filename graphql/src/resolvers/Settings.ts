import type { AppContext } from '~/models';

const resolvers = {
  MediaSettings: {
    async crops(settings: any, _: unknown, { prisma }: AppContext) {
      return prisma.mediaCropSetting.findMany({ where: { mediaSettingsId: settings.id } });
    },
  },
  PodcastSettings: {
    async image(settings: any, _: unknown, { prisma }: AppContext) {
      if (!settings.imageId) return null;
      return prisma.mediaUpload.findUnique({ where: { id: settings.imageId } });
    },
  },
  Query: {
    async siteSettings(_0: unknown, _1: unknown, { prisma }: AppContext) {
      const settings = await prisma.siteSettings.findUnique({ where: { id: 'site' } });
      return settings || { id: 'site' };
    },
    async dashboardSettings(_0: unknown, _1: unknown, { prisma }: AppContext) {
      const settings = await prisma.dashboardSettings.findUnique({ where: { id: 'dashboard' } });
      return settings || { id: 'dashboard' };
    },
    async mediaSettings(_0: unknown, _1: unknown, { prisma }: AppContext) {
      const settings = await prisma.mediaSettings.findUnique({ where: { id: 'media' } });
      return settings || { id: 'media' };
    },
    async podcastSettings(_0: unknown, _1: unknown, { prisma }: AppContext) {
      const settings = await prisma.podcastSettings.findUnique({ where: { id: 'podcast' } });
      return settings || { id: 'podcast' };
    },
  },
  Mutation: {
    async updateSiteSettings(
      _: unknown,
      { id, input }: { id: string; input: any },
      { prisma }: AppContext
    ) {
      return prisma.siteSettings.upsert({
        where: { id },
        create: { id, ...input },
        update: input,
      });
    },
    async updateDashboardSettings(
      _: unknown,
      { id, input }: { id: string; input: any },
      { prisma }: AppContext
    ) {
      return prisma.dashboardSettings.upsert({
        where: { id },
        create: { id, ...input },
        update: input,
      });
    },
    async updateMediaSettings(
      _: unknown,
      { id, input }: { id: string; input: any },
      { prisma }: AppContext
    ) {
      const { crops, ...rest } = input;
      const settings = await prisma.mediaSettings.upsert({
        where: { id },
        create: { id, ...rest },
        update: rest,
      });
      if (typeof crops !== 'undefined') {
        await prisma.mediaCropSetting.deleteMany({ where: { mediaSettingsId: id } });
        if (crops?.length) {
          await prisma.mediaCropSetting.createMany({
            data: crops.map((crop: any) => ({ ...crop, mediaSettingsId: id })),
          });
        }
      }
      return settings;
    },
    async updatePodcastSettings(
      _: unknown,
      { id, input }: { id: string; input: any },
      { prisma }: AppContext
    ) {
      return prisma.podcastSettings.upsert({
        where: { id },
        create: { id, ...input },
        update: input,
      });
    },
  },
};

export default resolvers;
