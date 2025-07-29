import graphql from '@graphql-eslint/eslint-plugin';
import { legacyPlugin } from '@wonderboymusic/eslint-config/lint/legacy.js';
// import tailwind from 'eslint-plugin-tailwindcss';

import { ERROR, OFF } from './rules/constants.js';

const namingConvention = [
  ERROR,
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

export default [
  {
    files: ['./web/**/*'],
    plugins: {
      '@lexical': legacyPlugin('@lexical/eslint-plugin', '@lexical'),
    },
    rules: {
      '@lexical/rules-of-lexical': ERROR,
    },
  },
  // NO SUPPORT FOR TAILWIND 4 YET!!!!!
  // {
  //   ...tailwind.configs['flat/recommended'],
  //   files: ['./web/**/*'],
  //   settings: {
  //     tailwindcss: {
  //       config: './web/src/styles/tailwind-base.js',
  //     },
  //   },
  // },
  {
    files: ['./web/src/**/*.graphql'],
    languageOptions: {
      parser: graphql.parser,
    },
    plugins: { '@graphql-eslint': graphql },
    rules: {
      ...graphql.configs['flat/operations-all'].rules,
      ...graphql.configs['flat/schema-relay'].rules,
      '@graphql-eslint/naming-convention': namingConvention,
      '@graphql-eslint/unique-fragment-name': OFF,
      '@graphql-eslint/unique-operation-name': OFF,
    },
  },
  {
    files: ['./xcode/HighForThis/graphql/operations/*.graphql'],
    languageOptions: {
      parser: graphql.parser,
    },
    plugins: { '@graphql-eslint': graphql },
    rules: {
      ...graphql.configs['flat/operations-all'].rules,
      ...graphql.configs['flat/schema-relay'].rules,
      '@graphql-eslint/match-document-filename': OFF,
      '@graphql-eslint/naming-convention': namingConvention,
      '@graphql-eslint/no-one-place-fragments': OFF,
      '@graphql-eslint/require-import-fragment': OFF,
      '@graphql-eslint/unique-fragment-name': OFF,
      '@graphql-eslint/unique-operation-name': OFF,
    },
  },
  {
    files: ['web/**/*.test.tsx', 'web/**/*.test.ts'],
    rules: {
      'i18next/no-literal-string': OFF,
    },
  },
];
