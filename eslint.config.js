import json from '@eslint/json';
import i18next from 'eslint-plugin-i18next';
import importPlugin from 'eslint-plugin-import';
import node from 'eslint-plugin-node';
import prettier from 'eslint-plugin-prettier/recommended';
import react from 'eslint-plugin-react';
import globals from 'globals';
import tseslint from 'typescript-eslint';

import ignores from './lint/ignores.js';
import { legacyPlugin } from './lint/legacy.js';
import overrides from './lint/overrides.js';
import coreRules from './lint/rules/core.js';
import importRules from './lint/rules/import.js';
import reactRules from './lint/rules/react.js';
import typescriptRules from './lint/rules/typescript.js';
import importSettings from './lint/settings/import.js';
import reactSettings from './lint/settings/react.js';

const createConfig = (config) => ({
  ...config,
  files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
  ignores,
});

export default tseslint.config(
  {
    ignores,
  },
  i18next.configs['flat/recommended'],
  importPlugin.flatConfigs.typescript,
  prettier,
  ...tseslint.configs.recommended.map(createConfig),
  createConfig({
    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      globals: {
        ...globals.browser,
        ...globals.commonjs,
        ...globals.es6,
        ...globals.jest,
        ...globals.node,
      },
    },
    plugins: {
      import: importPlugin,
      json,
      node,
      react,
      'react-hooks': legacyPlugin('eslint-plugin-react-hooks', 'react-hooks'),
    },
    settings: {
      ...importSettings,
      ...reactSettings,
    },
    rules: {
      ...coreRules,
      ...importRules,
      ...reactRules,
      ...typescriptRules,
    },
  }),
  ...overrides
);
