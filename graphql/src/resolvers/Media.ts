import type { AugmentedContext } from '../models/types';

import { parseConnection } from './utils/collection';

interface Args {
  [key: string]: any;
}

interface Result {
  [key: string]: any;
}

interface Root {
  [key: string]: any;
}

const resolvers = {
  MediaUpload: {
    __resolveType(media: Result) {
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
    id(media: Result) {
      return media._id;
    },
  },
  AudioUpload: {
    id(media: Result) {
      return media._id;
    },
  },
  VideoUpload: {
    id(media: Result) {
      return media._id;
    },
  },
  FileUpload: {
    id(media: Result) {
      return media._id;
    },
  },
  MediaUploadConnection: {
    async types(connection: Result, args: Args, { Media }: AugmentedContext) {
      const types = await Media.collection.distinct('type');
      types.sort();
      return types;
    },
    async mimeTypes(connection: Result, args: Args, { Media }: AugmentedContext) {
      const mimeTypes = await Media.collection.distinct('mimeType');
      mimeTypes.sort();
      return mimeTypes;
    },
  },
  Query: {
    async uploads(root: Root, args: Args, { Media }: AugmentedContext) {
      return parseConnection(Media, args);
    },
    media(root: Root, { id }: Args, { Media }: AugmentedContext) {
      return Media.findOneById(id);
    },
  },
  Mutation: {
    async updateMediaUpload(root: Root, { id, input }: Args, { Media }: AugmentedContext) {
      await Media.updateById(id, input);
      return Media.findOneById(id);
    },

    async removeMediaUpload(root: Root, { ids }: Args, { Media }: AugmentedContext) {
      return Promise.all(ids.map((id: string) => Media.removeById(id)))
        .then(() => true)
        .catch(() => false);
    },
  },
};

export default resolvers;
