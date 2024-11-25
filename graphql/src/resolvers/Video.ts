import type { Document } from 'mongodb';
import type {
  MutationCreateVideoArgs,
  MutationRemoveVideoArgs,
  MutationUpdateVideoArgs,
  QueryVideoArgs,
  QueryVideosArgs,
} from 'types/graphql';

import { parseConnection } from './utils/collection';

import type Video from '@/models/Video';

const resolvers = {
  Video: {
    id(video: Document) {
      return video._id;
    },
  },
  VideoConnection: {
    async years(_0: unknown, _1: unknown, { Video }: { Video: Video }) {
      const years = (await Video.collection.distinct('year')).filter(Boolean);
      years.sort();
      return years.reverse();
    },
  },
  Query: {
    async videos(_: unknown, args: QueryVideosArgs, { Video }: { Video: Video }) {
      return parseConnection(Video, args);
    },

    video(_: unknown, { id, slug }: QueryVideoArgs, { Video }: { Video: Video }) {
      if (id) {
        return Video.findOneById(id);
      }
      if (slug) {
        return Video.findOneBySlug(slug);
      }
    },
  },
  Mutation: {
    async createVideo(_: unknown, { input }: MutationCreateVideoArgs, { Video }: { Video: Video }) {
      const id = await Video.insert(input);
      return Video.findOneById(id);
    },

    async updateVideo(
      _: unknown,
      { id, input }: MutationUpdateVideoArgs,
      { Video }: { Video: Video }
    ) {
      await Video.updateById(id, input);
      return Video.findOneById(id);
    },

    async removeVideo(_: unknown, { ids }: MutationRemoveVideoArgs, { Video }: { Video: Video }) {
      return Promise.all(ids.map((id) => Video.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
