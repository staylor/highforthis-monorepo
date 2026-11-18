import type { CodegenConfig } from '@graphql-codegen/cli';

const SHARED_DOCUMENTS = 'shared/src/**/*.{ts,tsx}';
const SHARED_TYPES = '@highforthis/shared/types/graphql';

// The operations an app defines. Its documents include shared's, because its queries spread
// shared fragments. Schema types come from shared's file, which the app's file re-exports,
// so app code imports every GraphQL type from its own #/types/graphql.
const appTypes = (app: 'admin' | 'web') => ({
  [`./${app}/src/types/graphql.ts`]: {
    documents: [`${app}/src/**/*.{ts,tsx}`, SHARED_DOCUMENTS],
    preset: 'import-types' as const,
    presetConfig: { typesPath: SHARED_TYPES },
    plugins: [{ add: { content: `export * from '${SHARED_TYPES}';` } }, 'typescript-operations'],
    config: {
      dedupeOperationSuffix: true,
      useTypeImports: true,
    },
  },
});

const config: CodegenConfig = {
  schema: 'http://localhost:8081/graphql',
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
    './shared/src/apollo/fragmentMatcher.js': {
      plugins: ['fragment-matcher'],
    },
    // Schema types, plus the fragments and queries defined in shared
    './shared/src/types/graphql.ts': {
      documents: [SHARED_DOCUMENTS],
      plugins: ['typescript', 'typescript-operations'],
      config: {
        dedupeOperationSuffix: true,
        useTypeImports: true,
      },
    },
    ...appTypes('web'),
    ...appTypes('admin'),
  },
};

export default config;
