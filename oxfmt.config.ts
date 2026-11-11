import { createConfig } from '@wonderboymusic/oxc-config/oxfmt';

export default createConfig({
  sortTailwindcss: {
    stylesheet: './web/src/styles/main.css',
  },
  ignorePatterns: [
    // Only code and GraphQL operations were formatted before, through ESLint
    '**/*.{css,html,json,md,toml,yml,yaml}',
    'graphql/generated/**',
    'graphql/public/**',
    'graphql/schema.graphql',
    'web/src/types/graphql.ts',
  ],
});
