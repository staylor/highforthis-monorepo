import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:8081/graphql',
  documents: ['{web,admin}/src/**/*.{ts,tsx}', 'shared/src/web/**/*.{ts,tsx}'],
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
    './shared/src/web/apollo/fragmentMatcher.js': {
      plugins: ['fragment-matcher'],
    },
    './shared/src/web/types/graphql.ts': {
      plugins: ['typescript', 'typescript-operations'],
      config: {
        dedupeOperationSuffix: true,
        useTypeImports: true,
      },
    },
  },
};

export default config;
