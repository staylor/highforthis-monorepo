import type { CodegenConfig } from '@graphql-codegen/cli';

import typeDefs from './graphql/src/schema/index.ts';

// The schema types, which web's operation types build on and re-export, so web's code imports
// every GraphQL type from app/types/graphql.ts
const SCHEMA_TYPES = './schema.ts';

// A type from the server's code, as graphql/types/graphql.ts imports it
const server = (module: string, type: string) => `../src/${module}#${type}`;

// A page of records from parseConnection, its node one of the types the mappers import
const connection = (node: string) => server('resolvers/utils/collection', `Connection<${node}>`);

const editorNode = server('resolvers/EditorState', 'EditorNodeData');
const mediaUpload = server('resolvers/Media', 'MediaUploadSource');

// What the resolvers answer for each GraphQL type, which its fields' resolvers then get: Prisma's
// records, with whichever relations their queries include. The rest answer the type itself.
// The interfaces and unions are here with their members. The plugin spells out one it isn't given
// as a union of its members' types, which names EditorNodeData once for each kind of node.
const resolverMappers = {
  AppleMusicAlbum: server('appleMusic', 'Album'),
  AppleMusicData: server('resolvers/Artist', 'AppleMusicDataSource'),
  Artist: server('resolvers/Artist', 'ArtistSource'),
  ArtistConnection: connection('ArtistSource'),
  AudioUpload: mediaUpload,
  CodeNode: editorNode,
  EditorNode: editorNode,
  ElementNode: editorNode,
  ElementNodeType: editorNode,
  FileUpload: mediaUpload,
  HeadingNode: editorNode,
  ImageNode: editorNode,
  ImageUpload: mediaUpload,
  LexicalNode: editorNode,
  LinebreakNode: editorNode,
  ListItemNode: editorNode,
  ListNode: editorNode,
  MediaSettings: '@prisma/client#MediaSettings as MediaSettingsRecord',
  MediaUpload: mediaUpload,
  MediaUploadConnection: connection('MediaUploadSource'),
  Podcast: server('resolvers/Podcast', 'PodcastSource'),
  PodcastConnection: connection('PodcastSource'),
  PodcastSettings: server('resolvers/Settings', 'PodcastSettingsSource'),
  Post: server('resolvers/Post', 'PostSource'),
  PostConnection: connection('PostSource'),
  QuoteNode: editorNode,
  Show: server('resolvers/Show', 'ShowSource'),
  ShowConnection: server('resolvers/Show', 'ShowConnectionSource'),
  ShowEntity: server('resolvers/Show', 'ShowEntitySource'),
  TextNode: editorNode,
  User: server('resolvers/User', 'UserSource'),
  UserConnection: connection('UserSource'),
  Venue: server('resolvers/Venue', 'VenueSource'),
  VenueConnection: connection('VenueSource'),
  Video: server('resolvers/Video', 'VideoSource'),
  VideoConnection: connection('VideoSource'),
  VideoNode: editorNode,
  VideoUpload: mediaUpload,
};

// An app's operation types
const appTypes = (path: string, documents: string[]) => ({
  [path]: {
    documents,
    preset: 'import-types' as const,
    presetConfig: { typesPath: SCHEMA_TYPES },
    plugins: [{ add: { content: `export * from '${SCHEMA_TYPES}';` } }, 'typescript-operations'],
    config: {
      dedupeOperationSuffix: true,
      // The enums the operations use, as constant objects like schema.ts's
      enumType: 'const' as const,
      useTypeImports: true,
    },
  },
});

const config: CodegenConfig = {
  // The type definitions the server builds its schema from, so codegen doesn't need it running
  schema: typeDefs,
  generates: {
    './graphql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
        sort: false,
      },
    },
    // The schema's types, and the types of the server's resolvers
    './graphql/types/graphql.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: server('models', 'AppContext'),
        // A field without arguments gets {} for them, so reading one, as ShowConnection.years
        // once read `attended`, doesn't compile. The plugin's own Record<PropertyKey, never>
        // has every argument, as never.
        customResolverFn: `(
          parent: TParent,
          args: TArgs extends Record<PropertyKey, never> ? Record<never, never> : TArgs,
          context: TContext,
          info: GraphQLResolveInfo
        ) => Promise<TResult> | TResult`,
        // Every resolver is a function, never a { resolve } object, so requireAdmin can wrap it
        makeResolverTypeCallable: true,
        mappers: resolverMappers,
        useTypeImports: true,
      },
    },
    './web/app/types/schema.ts': {
      plugins: ['typescript'],
      config: {
        // Constant objects instead of enums, so HeadingTag.H1 and the like are plain values
        enumsAsConst: true,
        useTypeImports: true,
      },
    },
    // Tests define stand-in operations against fields the schema doesn't have
    ...appTypes('./web/app/types/graphql.ts', ['web/app/**/*.{ts,tsx}', '!web/app/**/*.test.*']),
  },
  hooks: {
    // oxfmt skips the files its config ignores
    afterAllFileWrite: ['oxfmt'],
  },
};

export default config;
