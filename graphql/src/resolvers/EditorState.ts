import { ObjectId, type Document } from 'mongodb';

import type Media from '@/models/Media';
import type Video from '@/models/Video';

const resolvers = {
  EditorNode: {
    __resolveType(node: Document) {
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
    image(data: Document, _: unknown, { Media }: { Media: Media }) {
      const id = new ObjectId(data.imageId);
      return Media.findOneById(id);
    },
  },
  VideoNode: {
    video(data: Document, _: unknown, { Video }: { Video: Video }) {
      return Video.findOneById(data.videoId);
    },
  },
};

export default resolvers;
