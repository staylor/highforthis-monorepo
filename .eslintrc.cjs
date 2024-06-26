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

const parserOptions = {
  operations: ['./web/src/**/*.{ts,tsx}', './xcode/HighForThis/graphql/operations/*.graphql'],
  schema: './graphql/schema.graphql',
};

/**
 * @type {import('@types/eslint').Linter.BaseConfig}
 */
module.exports = {
  extends: [
    '@remix-run/eslint-config',
    '@remix-run/eslint-config/node',
    '@remix-run/eslint-config/jest-testing-library',
    'prettier',
  ],
  plugins: ['json', 'prettier'],
  rules: {
    'import/order': [
      'error',
      {
        'newlines-between': 'always',
        pathGroups: [
          {
            pattern: '@/**',
            group: 'external',
            position: 'after',
          },
        ],
      },
    ],
    'json/*': 'error',
    'prettier/prettier': [
      'error',
      {
        singleQuote: true,
        trailingComma: 'es5',
        useTabs: false,
        tabWidth: 2,
        printWidth: 100,
      },
    ],
  },
  overrides: [
    {
      files: ['./web/**/*'],
      extends: ['plugin:tailwindcss/recommended'],
      settings: {
        tailwindcss: {
          config: './web/src/styles/tailwind-base.js',
        },
      },
    },
    {
      files: ['./web/src/**/*.tsx', './web/src/**/*.ts'],
      plugins: ['react-compiler'],
      rules: {
        'react-compiler/react-compiler': 'error',
      },
    },
    {
      files: ['./web/src/**/*.tsx', './web/src/**/*.graphql.ts', './web/src/**/graphql.ts'],
      processor: '@graphql-eslint/graphql',
    },
    {
      files: ['./web/src/**/*.graphql'],
      extends: ['plugin:@graphql-eslint/operations-all', 'plugin:@graphql-eslint/relay'],
      parserOptions,
      rules: {
        '@graphql-eslint/naming-convention': namingConvention,
        '@graphql-eslint/unique-fragment-name': 'off',
        '@graphql-eslint/unique-operation-name': 'off',
      },
    },
    {
      files: ['./xcode/HighForThis/graphql/operations/*.graphql'],
      extends: ['plugin:@graphql-eslint/operations-all', 'plugin:@graphql-eslint/relay'],
      parserOptions,
      rules: {
        '@graphql-eslint/match-document-filename': 'off',
        '@graphql-eslint/naming-convention': namingConvention,
        '@graphql-eslint/no-one-place-fragments': 'off',
        '@graphql-eslint/unique-fragment-name': 'off',
        '@graphql-eslint/unique-operation-name': 'off',
      },
    },
  ],
  // we're using vitest which has a very similar API to jest
  // (so the linting plugins work nicely), but it means we have to explicitly
  // set the jest version.
  settings: {
    jest: {
      version: 29,
    },
  },
};
