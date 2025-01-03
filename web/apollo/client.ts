import { InMemoryCache } from '@apollo/client/cache/inmemory/inMemoryCache.js';
import { ApolloClient } from '@apollo/client/core/ApolloClient.js';

import fragmentMatcher from './fragmentMatcher';
import typePolicies from './typePolicies';

function factory(uri: string) {
  return () =>
    new ApolloClient({
      uri,
      cache: new InMemoryCache({
        possibleTypes: fragmentMatcher.possibleTypes,
        typePolicies,
      }),
    });
}

export default factory;
