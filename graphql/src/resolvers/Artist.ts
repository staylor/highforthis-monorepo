import type { Document } from 'mongodb';
import type {
  MutationCreateArtistArgs,
  MutationRemoveArtistArgs,
  MutationUpdateArtistArgs,
  QueryArtistArgs,
  QueryArtistsArgs,
} from 'types/graphql';

import type Media from '@/models/Media';
import type Artist from '@/models/Artist';

import { parseConnection } from './utils/collection';

const resolvers = {
  Artist: {
    id(artist: Document) {
      return artist._id;
    },
    featuredMedia(artist: Document, _: unknown, { Media }: { Media: Media }) {
      return Media.findByIds(artist.featuredMedia || []);
    },
  },
  Query: {
    async artists(_: unknown, args: QueryArtistsArgs, { Artist }: { Artist: Artist }) {
      return parseConnection(Artist, args);
    },

    async artist(_: unknown, { id, slug }: QueryArtistArgs, { Artist }: { Artist: Artist }) {
      if (id) {
        return Artist.findOneById(id);
      }
      if (slug) {
        return Artist.findOneBySlug(slug);
      }
    },
  },
  Mutation: {
    async createArtist(
      _: unknown,
      { input }: MutationCreateArtistArgs,
      { Artist }: { Artist: Artist }
    ) {
      const data = { ...input };
      const id = await Artist.insert(data);
      return Artist.findOneById(String(id));
    },

    async updateArtist(
      _: unknown,
      { id, input }: MutationUpdateArtistArgs,
      { Artist }: { Artist: Artist }
    ) {
      const data = { ...input };
      await Artist.updateById(id, data);
      return Artist.findOneById(id);
    },

    async removeArtist(
      _: unknown,
      { ids }: MutationRemoveArtistArgs,
      { Artist }: { Artist: Artist }
    ) {
      return Promise.all(ids.map((id: string) => Artist.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
