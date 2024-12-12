import type { Document } from 'mongodb';
import { ObjectId } from 'mongodb';
import type {
  MutationCreateShowArgs,
  MutationRemoveShowArgs,
  MutationUpdateShowArgs,
  QueryShowArgs,
  QueryShowStatsArgs,
  QueryShowsArgs,
  UpdateShowInput,
} from 'types/graphql';

import type Artist from '~/models/Artist';
import type Show from '~/models/Show';
import type Venue from '~/models/Venue';

import { parseConnection, emptyConnection } from './utils/collection';

const resolvers = {
  Show: {
    id(show: Document) {
      return show._id;
    },
    artists(show: Document, _: unknown, { Artist }: { Artist: Artist }) {
      return Artist.findByIds(show.artists);
    },
    venue(show: Document, _: unknown, { Venue }: { Venue: Venue }) {
      return Venue.findOneById(show.venue);
    },
  },
  ShowEntity: {
    __resolveType(entity: Document) {
      if (entity.type === 'artist') {
        return 'Artist';
      }
      if (entity.type === 'venue') {
        return 'Venue';
      }
    },
  },
  ShowConnection: {
    async years(_0: unknown, args: QueryShowsArgs, { Show }: { Show: Show }) {
      return Show.years(!!args.attended);
    },
  },
  Query: {
    async shows(
      _: unknown,
      args: QueryShowsArgs,
      { Show, Artist, Venue }: { Show: Show; Artist: Artist; Venue: Venue }
    ) {
      const { artist, venue, ...rest } = args;
      const connectionArgs: Document = rest;

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

    async show(_: unknown, { id, slug, lastAdded }: QueryShowArgs, { Show }: { Show: Show }) {
      if (lastAdded) {
        return Show.lastAdded();
      }

      if (id) {
        return Show.findOneById(id);
      }
      if (slug) {
        return Show.findOneBySlug(slug);
      }
    },

    async showStats(_: unknown, { entity }: QueryShowStatsArgs, { Show }: { Show: Show }) {
      return Show.stats(entity.toLowerCase());
    },
  },
  Mutation: {
    async createShow(_: unknown, { input }: MutationCreateShowArgs, { Show }: { Show: Show }) {
      const id = await Show.insert(input);
      return Show.findOneById(id);
    },

    async updateShow(_: unknown, { id, input }: MutationUpdateShowArgs, { Show }: { Show: Show }) {
      const values: Document = { ...input };
      for (const key of ['title', 'notes', 'url']) {
        if (!input[key as keyof UpdateShowInput]) {
          values[key] = null;
        }
      }
      await Show.updateById(id, values);
      return Show.findOneById(id);
    },

    async removeShow(_: unknown, { ids }: MutationRemoveShowArgs, { Show }: { Show: Show }) {
      return Promise.all(ids.map((id: string) => Show.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
