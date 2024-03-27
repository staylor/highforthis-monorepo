import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Video: {
    id(video: any) {
      return video._id;
    },
  },
  VideoConnection: {
    async years(connection: any, args: any, { Video }: AugmentedContext) {
      const years = (await Video.collection.distinct('year')).filter(Boolean);
      years.sort();
      return years.reverse();
    },
  },
  Query: {
    async videos(root: any, args: any, { Video }: AugmentedContext) {
      return parseConnection(Video, args);
    },

    video(root: any, { id, slug }: any, { Video }: AugmentedContext) {
      if (id) {
        return Video.findOneById(id);
      }
      return Video.findOneBySlug(slug);
    },
  },
  Mutation: {
    async createVideo(root: any, { input }: any, { Video }: AugmentedContext) {
      const id = await Video.insert(input);
      return Video.findOneById(id);
    },

    async updateVideo(root: any, { id, input }: any, { Video }: AugmentedContext) {
      await Video.updateById(id, input);
      return Video.findOneById(id);
    },

    async removeVideo(root: any, { ids }: any, { Video }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Video.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
