import { gql } from 'graphql-tag';

import type { AppQuery } from '#/types/graphql';

import type { GraphQLClient } from './graphql';

// The same query as the public site's root, so useRootData() reads the same shape in both apps
const appQuery = gql`
  query App {
    apiKeys {
      googleMaps
    }
    podcastSettings {
      description
      feedLink
      id
      image {
        destination
        fileName
        id
      }
      title
      websiteLink
    }
    shows(first: 30, latest: true) @cache(key: "sidebar") {
      edges {
        node {
          artists {
            id
            name
            slug
          }
          date
          id
          title
          url
          venue {
            id
            name
            slug
          }
        }
      }
    }
    siteSettings {
      copyrightText
      id
      language
      siteTitle
      siteUrl
      tagline
    }
  }
`;

// Site settings and the rest of the data every page reads through useRootData()
export function loadApp({ gql }: { gql: GraphQLClient }) {
  return gql.query<AppQuery>(appQuery);
}
