import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client/core';

import fragmentMatcher from '@highforthis/shared/apollo/fragmentMatcher';
import typePolicies from '@highforthis/shared/apollo/typePolicies';

function factory(uri) {
  return () =>
    new ApolloClient({
      link: new HttpLink({ uri }),
      cache: new InMemoryCache({
        possibleTypes: fragmentMatcher.possibleTypes,
        typePolicies,
      }),
    });
}

export default factory;
