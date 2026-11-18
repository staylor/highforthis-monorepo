import { gql } from 'graphql-tag';

export const videoFormFragment = gql`
  fragment VideoForm_video on Video {
    dataPlaylistId
    dataType
    id
    slug
    thumbnails {
      height
      url
      width
    }
    title
    year
  }
`;
