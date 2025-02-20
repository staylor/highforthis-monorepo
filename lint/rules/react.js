import { OFF, ERROR, WARN } from './constants.js';

export default {
  'react/display-name': WARN,
  'react/forbid-foreign-prop-types': [WARN, { allowInPropTypes: true }],
  'react/jsx-key': WARN,
  'react/jsx-no-comment-textnodes': WARN,
  'react/jsx-no-target-blank': WARN,
  'react/jsx-no-undef': ERROR,
  'react/jsx-no-useless-fragment': ERROR,
  'react/jsx-pascal-case': [WARN, { allowAllCaps: true, ignore: [] }],
  'react/jsx-uses-vars': WARN,
  'react/jsx-uses-react': WARN,
  'react/no-danger-with-children': WARN,
  'react/no-direct-mutation-state': WARN,
  'react/no-find-dom-node': WARN,
  'react/no-is-mounted': WARN,
  'react/no-render-return-value': ERROR,
  'react/no-string-refs': WARN,
  'react/no-typos': WARN,
  'react/no-unknown-property': ERROR,
  'react/react-in-jsx-scope': OFF,
  'react/require-render-return': ERROR,
  'react/style-prop-object': WARN,

  // react-hooks
  // https://github.com/facebook/react/tree/main/packages/eslint-plugin-react-hooks
  'react-hooks/exhaustive-deps': WARN,
  'react-hooks/rules-of-hooks': ERROR,
};
