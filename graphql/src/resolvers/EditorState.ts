import { ObjectId } from 'mongodb';
import type { AugmentedContext } from '../models/types';

const resolvers = {
  EditorNode: {
    __resolveType(node: any) {
      if (node.type === 'code') {
        return 'CodeNode';
      }
      if (node.type === 'heading') {
        return 'HeadingNode';
      }
      if (node.type === 'image') {
        return 'ImageNode';
      }
      if (node.type === 'linebreak') {
        return 'LinebreakNode';
      }
      if (node.type === 'list') {
        return 'ListNode';
      }
      if (node.type === 'quote') {
        return 'QuoteNode';
      }
      if (node.type === 'text') {
        return 'TextNode';
      }
      if (node.type === 'video') {
        return 'VideoNode';
      }
      return 'ElementNode';
    },
  },
  ImageNode: {
    image(data: any, args: any, { Media }: AugmentedContext) {
      return Media.findOneById(new ObjectId(data.imageId));
    }
  },
  VideoNode: {
    video(data: any, args: any, { Video }: AugmentedContext) {
      return Video.findOneById(new ObjectId(data.videoId));
    },
  }
};

export default resolvers;