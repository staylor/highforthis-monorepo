import { ApolloClient, InMemoryCache } from '@apollo/client/core';

import fragmentMatcher from './fragmentMatcher.js';
import typePolicies from './typePolicies.js';

function factory(uri) {
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
