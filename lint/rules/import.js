import { ERROR } from './constants.js';

export default {
  'import/first': ERROR,
  'import/no-amd': ERROR,
  'import/no-duplicates': ERROR,
  'import/no-webpack-loader-syntax': ERROR,
  'import/order': [
    ERROR,
    {
      'newlines-between': 'always',
      alphabetize: { order: 'asc' },
      pathGroups: [
        {
          pattern: '~/**',
          group: 'external',
          position: 'after',
        },
      ],
    },
  ],
};
