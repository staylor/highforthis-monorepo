import type { Document } from 'mongodb';

import type Media from '~/models/Media';
import type Settings from '~/models/Settings';

async function updateSettings(
  _: unknown,
  { id, input }: { id: string; input: any },
  { Settings }: { Settings: Settings }
) {
  const exists = await Settings.findOneById(id);
  if (!exists) {
    const newSettings = input;
    newSettings._id = id;
    await Settings.insert(newSettings);
  } else {
    await Settings.updateById(id, input);
  }
  return Settings.findOneById(id);
}

const resolveId = {
  id(settings: Document) {
    return settings._id;
  },
};

const resolver =
  (id: string) =>
  (_0: unknown, _1: unknown, { Settings }: { Settings: Settings }) =>
    Settings.findOneById(id);

const resolvers = {
  SiteSettings: resolveId,
  DashboardSettings: resolveId,
  MediaSettings: resolveId,
  PodcastSettings: {
    ...resolveId,
    image(settings: Document, _: unknown, { Media }: { Media: Media }) {
      return settings.image ? Media.findOneById(settings.image) : null;
    },
  },
  Query: {
    siteSettings: resolver('site'),
    dashboardSettings: resolver('dashboard'),
    mediaSettings: resolver('media'),
    podcastSettings: resolver('podcast'),
  },
  Mutation: {
    updateSiteSettings: updateSettings,
    updateDashboardSettings: updateSettings,
    updateMediaSettings: updateSettings,
    updatePodcastSettings: updateSettings,
  },
};

export default resolvers;
