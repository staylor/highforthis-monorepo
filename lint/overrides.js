import graphql from '@graphql-eslint/eslint-plugin';
import tailwind from 'eslint-plugin-tailwindcss';
import testingLibrary from 'eslint-plugin-testing-library';
import vitest from 'eslint-plugin-vitest';

import { legacyPlugin } from './legacy.js';
import { ERROR, OFF } from './rules/constants.js';
import testingLibraryRules from './rules/testing-library.js';
import vitestRules from './rules/vitest.js';

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

const parserOptions = {
  operations: ['./web/src/**/*.{ts,tsx}', './xcode/HighForThis/graphql/operations/*.graphql'],
  schema: './graphql/schema.graphql',
};

export default [
  {
    ...tailwind.configs['flat/recommended'],
    files: ['./web/**/*'],
    settings: {
      tailwindcss: {
        config: './web/src/styles/tailwind-base.js',
      },
    },
  },
  {
    files: ['./web/src/**/*.tsx', './web/src/**/*.graphql.ts', './web/src/**/graphql.ts'],
    processor: graphql.processor,
  },
  {
    files: ['./web/src/**/*.graphql'],
    languageOptions: {
      parserOptions,
    },
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
      parserOptions,
    },
    rules: {
      ...graphql.configs['flat/operations-all'].rules,
      ...graphql.configs['flat/schema-relay'].rules,
      '@graphql-eslint/match-document-filename': OFF,
      '@graphql-eslint/naming-convention': namingConvention,
      '@graphql-eslint/no-one-place-fragments': OFF,
      '@graphql-eslint/unique-fragment-name': OFF,
      '@graphql-eslint/unique-operation-name': OFF,
    },
  },
  {
    files: ['**/*.{js,cjs,json}'],
    rules: {
      '@typescript-eslint/no-require-imports': OFF,
      '@typescript-eslint/no-unused-expressions': OFF,
    },
  },
  {
    // Rules specifically for our tests
    files: ['**/*.test.*'],
    plugins: {
      'testing-library': legacyPlugin('eslint-plugin-testing-library', 'testing-library'),
      vitest,
    },
    rules: {
      ...testingLibrary.configs.dom.rules,
      ...testingLibrary.configs.react.rules,
      ...testingLibraryRules,
      ...vitest.configs.all.rules,
      ...vitestRules,
    },
  },
  {
    files: ['vitest.setup.ts', 'src/**/*.test.{tsx,ts}', 'src/tests/**/*.{tsx,ts}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': OFF,
      '@typescript-eslint/no-explicit-any': OFF,
    },
  },
  {
    files: ['src/**/*.test.tsx', 'src/**/*.test.ts'],
    rules: {
      'testing-library/no-await-sync-events': OFF,
      'testing-library/prefer-user-event': OFF,
      'testing-library/render-result-naming-convention': OFF,
    },
  },
];
