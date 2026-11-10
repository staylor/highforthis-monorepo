import graphql from '@graphql-eslint/eslint-plugin';
import { defineConfig, globalIgnores } from 'eslint/config';

const namingConvention = [
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
];

export default defineConfig([
  // oxlint lints JavaScript and TypeScript; ESLint only covers GraphQL, which oxlint cannot parse
  globalIgnores(['**/*.{js,cjs,mjs}']),
  {
    files: ['web/src/**/*.graphql'],
    languageOptions: {
      parser: graphql.parser,
    },
    plugins: { '@graphql-eslint': graphql },
    rules: {
      ...graphql.configs['flat/operations-all'].rules,
      ...graphql.configs['flat/schema-relay'].rules,
      '@graphql-eslint/naming-convention': namingConvention,
      '@graphql-eslint/unique-fragment-name': 'off',
      '@graphql-eslint/unique-operation-name': 'off',
    },
  },
  {
    files: ['xcode/graphql/*.graphql'],
    languageOptions: {
      parser: graphql.parser,
    },
    plugins: { '@graphql-eslint': graphql },
    rules: {
      ...graphql.configs['flat/operations-all'].rules,
      ...graphql.configs['flat/schema-relay'].rules,
      '@graphql-eslint/match-document-filename': 'off',
      '@graphql-eslint/naming-convention': namingConvention,
      '@graphql-eslint/no-one-place-fragments': 'off',
      '@graphql-eslint/require-import-fragment': 'off',
      '@graphql-eslint/unique-fragment-name': 'off',
      '@graphql-eslint/unique-operation-name': 'off',
    },
  },
]);
