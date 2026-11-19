import type { CodegenConfig } from '@graphql-codegen/cli';

const SHARED_TYPES = '@highforthis/shared/types/graphql';

// The operations an app defines. Schema types come from shared's file, which the app's file
// re-exports, so app code imports every GraphQL type from its own types file.
const appTypes = (path: string, documents: string[]) => ({
  [path]: {
    documents,
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
    // Schema types both apps' operation types build on
    './shared/src/types/graphql.ts': {
      plugins: ['typescript'],
      config: {
        dedupeOperationSuffix: true,
        // Constant objects instead of enums: web loads this file through Node's type
        // stripping, which can't handle enums. HeadingTag.H1 and the like still work.
        enumsAsConst: true,
        useTypeImports: true,
      },
    },
    // Tests define stand-in operations against fields the schema doesn't have
    ...appTypes('./web/app/types/graphql.ts', ['web/app/**/*.{ts,tsx}', '!web/app/**/*.test.*']),
    ...appTypes('./admin/src/types/graphql.ts', [
      'admin/src/**/*.{ts,tsx}',
      '!admin/src/**/__tests__/**',
    ]),
  },
};

export default config;
