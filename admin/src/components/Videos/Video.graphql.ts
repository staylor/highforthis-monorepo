import { gql } from 'graphql-tag';

export const videoFragment = gql`
  fragment Video_video on Video {
    dataId
    id
    slug
    thumbnails {
      height
      url
      width
    }
    title
  }
`;
