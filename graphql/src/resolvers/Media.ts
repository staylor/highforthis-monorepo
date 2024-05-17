import type { Document } from 'mongodb';
import type {
  MutationRemoveMediaUploadArgs,
  MutationUpdateMediaUploadArgs,
  QueryMediaArgs,
  QueryUploadsArgs,
} from 'types/graphql';

import type Media from '@/models/Media';

import { parseConnection } from './utils/collection';

const resolvers = {
  MediaUpload: {
    __resolveType(media: Document) {
      if (media.type === 'image') {
        return 'ImageUpload';
      }
      if (media.type === 'audio') {
        return 'AudioUpload';
      }
      if (media.type === 'video') {
        return 'VideoUpload';
      }
      return 'FileUpload';
    },
  },
  ImageUpload: {
    id(media: Document) {
      return media._id;
    },
  },
  AudioUpload: {
    id(media: Document) {
      return media._id;
    },
  },
  VideoUpload: {
    id(media: Document) {
      return media._id;
    },
  },
  FileUpload: {
    id(media: Document) {
      return media._id;
    },
  },
  MediaUploadConnection: {
    async types(_0: unknown, _1: unknown, { Media }: { Media: Media }) {
      const types = await Media.collection.distinct('type');
      types.sort();
      return types;
    },
    async mimeTypes(_0: unknown, _1: unknown, { Media }: { Media: Media }) {
      const mimeTypes = await Media.collection.distinct('mimeType');
      mimeTypes.sort();
      return mimeTypes;
    },
  },
  Query: {
    async uploads(_: unknown, args: QueryUploadsArgs, { Media }: { Media: Media }) {
      return parseConnection(Media, args);
    },
    media(_: unknown, { id }: QueryMediaArgs, { Media }: { Media: Media }) {
      return Media.findOneById(id);
    },
  },
  Mutation: {
    async updateMediaUpload(
      _: unknown,
      { id, input }: MutationUpdateMediaUploadArgs,
      { Media }: { Media: Media }
    ) {
      await Media.updateById(id, input);
      return Media.findOneById(id);
    },

    async removeMediaUpload(
      _: unknown,
      { ids }: MutationRemoveMediaUploadArgs,
      { Media }: { Media: Media }
    ) {
      return Promise.all(ids.map((id: string) => Media.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
