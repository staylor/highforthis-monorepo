import { randomBytes } from 'node:crypto';

import { test as base } from '@playwright/test';

import { graphqlUrl } from './env.ts';
import { GraphQL } from './graphql.ts';

export { expect } from '@playwright/test';

/** Everything the tests create is named with this, so leftovers can be found and removed. */
export const E2E_PREFIX = '[e2e] ';

export const test = base.extend<
  {
    /**
     * Starts the title or name of everything a test creates. Whatever matches is removed after
     * the test, however it ends.
     */
    prefix: string;
  },
  { graphql: GraphQL }
>({
  graphql: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({ baseURL: graphqlUrl });
      await use(await GraphQL.signIn(request));
      await request.dispose();
    },
    { scope: 'worker' },
  ],
  prefix: async ({ graphql }, use) => {
    const prefix = `${E2E_PREFIX}${randomBytes(4).toString('hex')}`;
    await use(prefix);
    await graphql.removeMatching(prefix);
  },
});
