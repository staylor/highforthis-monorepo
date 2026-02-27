import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8080/graphql',
  documents: ['web/src/**/*.tsx', 'web/src/**/*.ts'],
  generates: {
    './graphql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        commentDescriptions: true,
        includeDirectives: true,
        sort: false,
      },
    },
    './graphql/schema.json': {
      plugins: ['introspection'],
      config: {
        minify: true,
      },
    },
    './graphql/types/graphql.ts': {
      plugins: ['typescript'],
      config: {
        useTypeImports: true,
      },
    },
    './web/apollo/fragmentMatcher.js': {
      plugins: ['fragment-matcher'],
    },
    './web/src/types/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        dedupeOperationSuffix: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
