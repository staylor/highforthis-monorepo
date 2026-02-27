import prisma from '#/database';

const resolvers = {
  MediaSettings: {
    async crops(settings: any) {
      return prisma.mediaCropSetting.findMany({ where: { mediaSettingsId: settings.id } });
    },
  },
  PodcastSettings: {
    async image(settings: any) {
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
    async updateSiteSettings(_: unknown, { id, input }: { id: string; input: any }) {
      return prisma.siteSettings.upsert({
        where: { id },
        create: { id, ...input },
        update: input,
      });
    },
    async updateDashboardSettings(_: unknown, { id, input }: { id: string; input: any }) {
      return prisma.dashboardSettings.upsert({
        where: { id },
        create: { id, ...input },
        update: input,
      });
    },
    async updateMediaSettings(_: unknown, { id, input }: { id: string; input: any }) {
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
    async updatePodcastSettings(_: unknown, { id, input }: { id: string; input: any }) {
      return prisma.podcastSettings.upsert({
        where: { id },
        create: { id, ...input },
        update: input,
      });
    },
  },
};

export default resolvers;
