import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Podcast: {
    id(podcast: any) {
      return podcast._id;
    },
    audio(podcast: any, args: any, { Media }: AugmentedContext) {
      return podcast.audio ? Media.findOneById(podcast.audio) : null;
    },
    image(podcast: any, args: any, { Media }: AugmentedContext) {
      return podcast.image ? Media.findOneById(podcast.image) : null;
    },
    date(podcast: any) {
      return podcast.updatedAt;
    },
  },
  Query: {
    async podcasts(root: any, args: any, { Podcast }: AugmentedContext) {
      return parseConnection(Podcast, args);
    },

    async podcast(root: any, { id }: any, { Podcast }: AugmentedContext) {
      return Podcast.findOneById(id);
    },
  },
  Mutation: {
    async createPodcast(root: any, { input }: any, { Podcast }: AugmentedContext) {
      const id = await Podcast.insert(input);
      return Podcast.findOneById(id);
    },

    async updatePodcast(root: any, { id, input }: any, { Podcast }: AugmentedContext) {
      await Podcast.updateById(id, input);
      return Podcast.findOneById(id);
    },

    async removePodcast(root: any, { ids }: any, { Podcast }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Podcast.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
