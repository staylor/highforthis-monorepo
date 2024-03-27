import { ObjectId } from 'mongodb';
import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language/index.js';
import merge from 'lodash.merge';

import APIKeys from '@/resolvers/APIKeys';
import EditorState from '@/resolvers/EditorState';
import Media from '@/resolvers/Media';
import Podcast from '@/resolvers/Podcast';
import Post from '@/resolvers/Post';
import Settings from '@/resolvers/Settings';
import Show from '@/resolvers/Show';
import Taxonomy from '@/resolvers/Taxonomy';
import Term from '@/resolvers/Term';
import User from '@/resolvers/User';
import Video from '@/resolvers/Video';

const modules = {
  APIKeys,
  EditorState,
  Media,
  Podcast,
  Post,
  Settings,
  Show,
  Taxonomy,
  Term,
  User,
  Video,
} as any;
const resolvers = Object.keys(modules).reduce((memo, name) => {
  merge(memo, modules[name]);
  return memo;
}, {}) as {
  [key: string]: any;
};

resolvers.ObjID = new GraphQLScalarType({
  name: 'ObjID',
  description: 'Id representation, based on Mongo Object Ids',
  parseValue(value) {
    return new ObjectId(value as string);
  },
  serialize(value: any) {
    return value.toString();
  },
  parseLiteral(ast) {
    if (ast.kind === Kind.STRING) {
      return new ObjectId(ast.value);
    }
    return null;
  },
});

export default resolvers;
