import graphql from '@graphql-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';

/**
 * graphql-eslint's processor hands ESLint each gql document in a file as a .graphql file of its
 * own, followed by the file itself. ESLint can't parse TypeScript, and oxlint lints it anyway, so
 * only the documents are kept.
 */
const gqlDocuments = {
  meta: { name: 'gql-documents' },
  supportsAutofix: true,
  preprocess: (code, filePath) =>
    graphql.processor.preprocess(code, filePath).filter((block) => typeof block !== 'string'),
  postprocess: graphql.processor.postprocess,
};

// The rules for web's and the app's operations
const operations = {
  languageOptions: {
    parser: graphql.parser,
  },
  plugins: { '@graphql-eslint': graphql },
  rules: {
    ...graphql.configs['flat/operations-all'].rules,
    '@graphql-eslint/naming-convention': [
      'error',
      {
        VariableDefinition: 'camelCase',
        OperationDefinition: {
          style: 'PascalCase',
          forbiddenPrefixes: ['Query', 'Mutation', 'Subscription', 'Get'],
          forbiddenSuffixes: ['Query', 'Mutation', 'Subscription'],
        },
        FragmentDefinition: {
          forbiddenPrefixes: ['Fragment'],
          forbiddenSuffixes: ['Fragment'],
        },
      },
    ],
    // Web interpolates fragments into its gql tags, and Apollo iOS reads every file at once, so
    // nothing imports them with #import
    '@graphql-eslint/require-import-fragment': 'off',
    // Post lists read album covers from each post's editor state, eight levels down
    '@graphql-eslint/selection-set-depth': ['error', { maxDepth: 8 }],
    '@graphql-eslint/unique-fragment-name': 'off',
    '@graphql-eslint/unique-operation-name': 'off',
  },
};

export default defineConfig([
  // oxlint lints JavaScript and TypeScript; ESLint only covers GraphQL, which oxlint cannot parse
  globalIgnores(['**/*.{js,cjs,mjs}']),
  {
    files: ['web/app/**/*.{ts,tsx}'],
    // Tests define stand-in operations against fields the schema doesn't have
    ignores: ['web/app/**/*.test.*'],
    processor: gqlDocuments,
  },
  {
    // The documents gqlDocuments takes out of web's code
    files: ['web/app/**/*.graphql'],
    ...operations,
  },
  {
    files: ['apple/graphql/*.graphql'],
    ...operations,
    rules: {
      ...operations.rules,
      '@graphql-eslint/match-document-filename': 'off',
      '@graphql-eslint/no-one-place-fragments': 'off',
    },
  },
]);
