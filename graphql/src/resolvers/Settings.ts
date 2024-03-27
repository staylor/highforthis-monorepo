import type { AugmentedContext } from '../models/types';

interface Args {
  [key: string]: any;
}

interface Result {
  [key: string]: any;
}

interface Root {
  [key: string]: any;
}

async function updateSettings(root: Root, { id, input }: Args, { Settings }: AugmentedContext) {
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
  id(settings: Result) {
    return settings._id;
  },
};

const resolver =
  (id: string) =>
  (root: Root, args: Args, { Settings }: AugmentedContext) =>
    Settings.findOneById(id);

const resolvers = {
  SiteSettings: resolveId,
  DashboardSettings: resolveId,
  MediaSettings: resolveId,
  PodcastSettings: {
    ...resolveId,
    image(settings: Result, args: Args, { Media }: AugmentedContext) {
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
