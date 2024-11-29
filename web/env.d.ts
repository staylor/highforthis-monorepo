import type { ApolloClient } from '@apollo/client';

declare module 'react-router' {
  interface AppLoadContext {
    apolloClient: ApolloClient;
  }
}
