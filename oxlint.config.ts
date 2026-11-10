import { createConfig } from '@wonderboymusic/oxc-config/oxlint';
import testingLibrary from '@wonderboymusic/oxc-config/oxlint/testing-library';

export default createConfig(testingLibrary, {
  jsPlugins: ['eslint-plugin-i18next', '@lexical/eslint-plugin'],
  ignorePatterns: ['graphql/generated/**', 'graphql/public/**'],
  rules: {
    'i18next/no-literal-string': 'error',
  },
  overrides: [
    {
      files: ['web/**/*'],
      rules: {
        '@lexical/rules-of-lexical': 'error',
      },
    },
    {
      files: ['web/**/*.test.ts', 'web/**/*.test.tsx'],
      rules: {
        'i18next/no-literal-string': 'off',
      },
    },
    {
      files: ['web/src/components/Admin/**/*.tsx', 'web/src/routes/podcast/**/*.tsx'],
      rules: {
        'jsx-a11y/media-has-caption': 'off',
      },
    },
  ],
});
