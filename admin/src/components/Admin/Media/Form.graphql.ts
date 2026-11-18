import { gql } from 'graphql-tag';

export const mediaFormFragment = gql`
  fragment MediaForm_media on MediaUpload {
    destination
    fileName
    fileSize
    id
    mimeType
    originalName
    title
    type
    ... on ImageUpload {
      altText
      caption
      crops {
        fileName
        fileSize
        height
        width
      }
      height
      width
    }
    ... on AudioUpload {
      description
      duration
      images {
        fileName
        fileSize
        height
        width
      }
    }
    ... on VideoUpload {
      description
      duration
      height
      width
    }
    ... on FileUpload {
      description
    }
  }
`;
