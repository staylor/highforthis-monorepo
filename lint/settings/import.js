export default {
  'import/ignore': ['node_modules', '\\.(css|md|svg|json)$'],
  'import/resolver': {
    'eslint-import-resolver-node': {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    'eslint-import-resolver-typescript': {
      alwaysTryTypes: true,
    },
  },
};
