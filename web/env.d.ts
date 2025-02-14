import type { ApolloClient } from '@apollo/client';
import type { i18n } from 'i18next';

declare module 'react-router' {
  interface AppLoadContext {
    apolloClient: ApolloClient;
    i18n: i18n;
  }
}
