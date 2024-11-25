import { OFF, ERROR } from './constants.js';

export default {
  'vitest/consistent-test-it': [
    ERROR,
    {
      fn: 'it',
      withinDescribe: 'it',
    },
  ],
  'vitest/max-expects': OFF,
  'vitest/no-conditional-expect': OFF,
  'vitest/no-conditional-in-test': OFF,
  'vitest/no-disabled-tests': OFF,
  'vitest/no-hooks': OFF,
  'vitest/prefer-called-with': OFF,
  'vitest/prefer-expect-assertions': OFF,
  'vitest/prefer-strict-equal': OFF,
  'vitest/require-hook': OFF,
  'vitest/prefer-to-be-falsy': OFF,
};
