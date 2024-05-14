import { ObjectId } from 'mongodb';

import type { AugmentedContext } from '../models/types';

import { parseConnection, emptyConnection } from './utils/collection';

const resolvers = {
  Show: {
    id(show: any) {
      return show._id;
    },
    artists(show: any, _: any, { Artist }: AugmentedContext) {
      return Artist.findByIds(show.artists);
    },
    venue(show: any, _: any, { Venue }: AugmentedContext) {
      return Venue.findOneById(show.venue);
    },
  },
  ShowEntity: {
    __resolveType(entity: any) {
      if (entity.type === 'artist') {
        return 'Artist';
      }
      if (entity.type === 'venue') {
        return 'Venue';
      }
    },
  },
  Query: {
    async shows(_: any, args: any, { Show, Artist, Venue }: AugmentedContext) {
      const { artist, venue, ...rest } = args;
      const connectionArgs = rest;

      if (artist?.id) {
        connectionArgs.artist = new ObjectId(String(artist.id));
      } else if (venue?.id) {
        connectionArgs.venue = new ObjectId(String(venue.id));
      } else if (artist?.slug) {
        const node = await Artist.findOneBySlug(artist.slug);
        if (node) {
          connectionArgs.artist = node._id;
        } else {
          return emptyConnection();
        }
      } else if (venue?.slug) {
        const node = await Venue.findOneBySlug(venue.slug);
        if (node) {
          connectionArgs.venue = node._id;
        } else {
          return emptyConnection();
        }
      }
      return parseConnection(Show, connectionArgs);
    },

    async show(_: any, { id, slug }: any, { Show }: AugmentedContext) {
      if (id) {
        return Show.findOneById(id);
      }
      return Show.findOneBySlug(slug);
    },

    async showStats(_: any, { entity }: any, { Show }: AugmentedContext) {
      return Show.stats(entity.toLowerCase());
    },
  },
  Mutation: {
    async createShow(_: any, { input }: any, { Show }: AugmentedContext) {
      const id = await Show.insert(input);
      return Show.findOneById(id);
    },

    async updateShow(_: any, { id, input }: any, { Show }: AugmentedContext) {
      const values = { ...input };
      for (const key of ['title', 'notes', 'url']) {
        if (!input[key]) {
          values[key] = null;
        }
      }
      await Show.updateById(id, values);
      return Show.findOneById(id);
    },

    async removeShow(_: any, { ids }: any, { Show }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Show.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
