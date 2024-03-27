import { gql } from 'graphql-tag';

const feedQuery = gql`
  query PodcastFeed {
    podcasts {
      edges {
        node {
          audio {
            destination
            duration
            fileName
            fileSize
            id
          }
          date
          description
          id
          title
        }
      }
    }
    podcastSettings {
      category
      copyrightText
      description
      explicit
      feedLink
      generator
      id
      image {
        destination
        fileName
        id
      }
      itunesEmail
      itunesName
      language
      managingEditor
      title
      websiteLink
    }
  }
`;

export default feedQuery;
