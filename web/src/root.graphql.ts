import { gql } from 'graphql-tag';

export const appQuery = gql`
  query App {
    apiKeys {
      googleMaps
    }
    dashboardSettings {
      googleClientId
      googleTrackingId
      id
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
    shows(first: 15, latest: true) @cache(key: "sidebar") {
      edges {
        node {
          artist {
            id
            name
            slug
          }
          date
          id
          title
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
