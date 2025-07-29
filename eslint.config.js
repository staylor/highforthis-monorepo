import config from '@wonderboymusic/eslint-config';
import { defineConfig } from 'eslint/config';
import i18next from 'eslint-plugin-i18next';

import ignores from './lint/ignores.js';
import overrides from './lint/overrides.js';

export default defineConfig([
  {
    ignores,
  },
  {
    extends: [config],
  },
  i18next.configs['flat/recommended'],
  ...overrides,
]);
