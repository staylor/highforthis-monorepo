import type { CodegenConfig } from '@graphql-codegen/cli';

import typeDefs from './graphql/src/schema/index.ts';

// The schema types, which web's operation types build on and re-export, so web's code imports
// every GraphQL type from app/types/graphql.ts
const SCHEMA_TYPES = './schema.ts';

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
    './graphql/types/graphql.ts': {
      plugins: ['typescript'],
      config: {
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
