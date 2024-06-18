import type { Document } from 'mongodb';
import type {
  MutationCreatePodcastArgs,
  MutationRemovePodcastArgs,
  MutationUpdatePodcastArgs,
  QueryPodcastArgs,
  QueryPodcastsArgs,
} from 'types/graphql';

import type Media from '@/models/Media';
import type Podcast from '@/models/Podcast';

import { parseConnection } from './utils/collection';

const resolvers = {
  Podcast: {
    id(podcast: Document) {
      return podcast._id;
    },
    audio(podcast: Document, _: unknown, { Media }: { Media: Media }) {
      return podcast.audio ? Media.findOneById(podcast.audio) : null;
    },
    image(podcast: Document, _: unknown, { Media }: { Media: Media }) {
      return podcast.image ? Media.findOneById(podcast.image) : null;
    },
    date(podcast: Document) {
      return podcast.updatedAt;
    },
  },
  Query: {
    async podcasts(_: unknown, args: QueryPodcastsArgs, { Podcast }: { Podcast: Podcast }) {
      return parseConnection(Podcast, args);
    },

    async podcast(_: unknown, { id }: QueryPodcastArgs, { Podcast }: { Podcast: Podcast }) {
      return Podcast.findOneById(id);
    },
  },
  Mutation: {
    async createPodcast(
      _: unknown,
      { input }: MutationCreatePodcastArgs,
      { Podcast }: { Podcast: Podcast }
    ) {
      const id = await Podcast.insert(input);
      return Podcast.findOneById(id);
    },

    async updatePodcast(
      _: unknown,
      { id, input }: MutationUpdatePodcastArgs,
      { Podcast }: { Podcast: Podcast }
    ) {
      await Podcast.updateById(id, input);
      return Podcast.findOneById(id);
    },

    async removePodcast(
      _: unknown,
      { ids }: MutationRemovePodcastArgs,
      { Podcast }: { Podcast: Podcast }
    ) {
      return Promise.all(ids.map((id: string) => Podcast.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
