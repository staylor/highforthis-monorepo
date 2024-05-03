import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Venue: {
    id(venue: any) {
      return venue._id;
    },
    featuredMedia(venue: any, args: any, { Media }: AugmentedContext) {
      return Media.findByIds(venue.featuredMedia || []);
    },
  },
  Query: {
    async venues(root: any, args: any, { Venue }: AugmentedContext) {
      return parseConnection(Venue, args);
    },

    async venue(root: any, { id, slug }: any, { Venue }: AugmentedContext) {
      if (id) {
        return Venue.findOneById(id);
      }
      return Venue.findOneBySlug(slug);
    },
  },
  Mutation: {
    async createVenue(root: any, { input }: any, { Venue }: AugmentedContext) {
      const data = { ...input };
      const id = await Venue.insert(data);
      return Venue.findOneById(id);
    },

    async updateVenue(root: any, { id, input }: any, { Venue }: AugmentedContext) {
      const data = { ...input };
      await Venue.updateById(id, data);
      return Venue.findOneById(id);
    },

    async removeVenue(root: any, { ids }: any, { Venue }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Venue.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
