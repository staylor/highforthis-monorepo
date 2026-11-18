import { gql } from 'graphql-tag';

export const featuredMediaFragment = gql`
  fragment FeaturedMedia_media on MediaUpload {
    destination
    fileName
    id
    type
    ... on ImageUpload {
      crops {
        fileName
        width
      }
    }
  }
`;
