import { fileURLToPath } from 'node:url';

import { createConfig } from '@wonderboymusic/oxc-config/oxlint';
import testingLibrary from '@wonderboymusic/oxc-config/oxlint/testing-library';

export default createConfig(testingLibrary, {
  jsPlugins: ['eslint-plugin-i18next', '@lexical/eslint-plugin', 'eslint-plugin-tailwindcss'],
  ignorePatterns: ['graphql/generated/**', 'graphql/public/**'],
  settings: {
    tailwindcss: {
      cssConfigPath: fileURLToPath(new URL('./web/src/styles/main.css', import.meta.url)),
    },
  },
  rules: {
    'i18next/no-literal-string': 'error',
  },
  overrides: [
    {
      files: ['web/**/*'],
      rules: {
        '@lexical/rules-of-lexical': 'error',
        // classnames-order is left out: oxfmt sorts the classes
        'tailwindcss/enforces-canonical-classname': 'warn',
        'tailwindcss/enforces-negative-arbitrary-values': 'warn',
        'tailwindcss/enforces-shorthand': 'warn',
        'tailwindcss/important-modifier-suffix': 'warn',
        'tailwindcss/no-contradicting-classname': 'error',
        'tailwindcss/no-custom-classname': ['warn', { whitelist: ['editor-.*', 'toolbar-hidden'] }],
        'tailwindcss/no-unnecessary-arbitrary-value': 'warn',
      },
    },
    {
      files: ['web/**/*.test.ts', 'web/**/*.test.tsx'],
      rules: {
        'i18next/no-literal-string': 'off',
        'tailwindcss/no-custom-classname': 'off',
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
