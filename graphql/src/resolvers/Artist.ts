import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

const resolvers = {
  Artist: {
    id(artist: any) {
      return artist._id;
    },
    featuredMedia(artist: any, args: any, { Media }: AugmentedContext) {
      return Media.findByIds(artist.featuredMedia || []);
    },
  },
  Query: {
    async artists(root: any, args: any, { Artist }: AugmentedContext) {
      return parseConnection(Artist, args);
    },

    async artist(root: any, { id, slug }: any, { Artist }: AugmentedContext) {
      if (id) {
        return Artist.findOneById(id);
      }
      return Artist.findOneBySlug(slug);
    },
  },
  Mutation: {
    async createArtist(root: any, { input }: any, { Artist }: AugmentedContext) {
      const data = { ...input };
      const id = await Artist.insert(data);
      return Artist.findOneById(id);
    },

    async updateArtist(root: any, { id, input }: any, { Artist }: AugmentedContext) {
      const data = { ...input };
      await Artist.updateById(id, data);
      return Artist.findOneById(id);
    },

    async removeArtist(root: any, { ids }: any, { Artist }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Artist.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
