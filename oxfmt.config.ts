import { base, createConfig } from '@wonderboymusic/oxc-config/oxfmt';

const sortImports = base.sortImports as {
  customGroups: { groupName: string; elementNamePattern: string[] }[];
  groups: (string | string[])[];
};

export default createConfig({
  sortTailwindcss: {
    stylesheet: './web/src/styles/main.css',
  },
  sortImports: {
    // This repo's own packages (@highforthis/*) get a group after other packages,
    // instead of sorting in among them
    customGroups: [
      ...sortImports.customGroups,
      { groupName: 'workspace', elementNamePattern: ['@highforthis/**'] },
    ],
    groups: sortImports.groups.flatMap((group) =>
      Array.isArray(group) && group.includes('value-external') ? [group, 'workspace'] : [group]
    ),
  },
  ignorePatterns: [
    // Only code and GraphQL operations were formatted before, through ESLint
    '**/*.{css,html,json,md,toml,yml,yaml}',
    'graphql/generated/**',
    'graphql/public/**',
    'graphql/schema.graphql',
    '{shared,web,admin}/src/types/graphql.ts',
  ],
});
