// @vitest-environment node
import { describe, expect, it } from 'vitest';

import { loadApp } from '../app';

import { calls, stubGraphQL } from './helpers';

describe('loadApp', () => {
  it('loads the data every page shares', async () => {
    const gql = stubGraphQL();
    await loadApp({ gql });
    expect(calls(gql.query)).toEqual([{ operation: 'App', variables: undefined }]);
  });
});
