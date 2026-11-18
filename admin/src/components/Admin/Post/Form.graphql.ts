import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/components/Admin/Form/FeaturedMedia/index.graphql';
import { videoFragment } from '#/components/Videos/Video.graphql';

// The text inside a post's blocks
const linebreakNodeFragment = gql`
  fragment TextNodes_linebreakNode on LinebreakNode {
    type
    version
  }
`;

const textNodeFragment = gql`
  fragment TextNodes_textNode on TextNode {
    detail
    format
    mode
    style
    text
    textFormat
    textStyle
    type
    version
  }
`;

export const postFormFragment = gql`
  fragment PostForm_post on Post {
    artists {
      id
      name
    }
    date
    editorState {
      root {
        children {
          ... on ElementNodeType {
            direction
            format
            indent
            type
            version
          }
          ... on HeadingNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
            tag
          }
          ... on ImageNode {
            image {
              crops {
                fileName
                width
              }
              destination
              id
            }
            size
          }
          ... on VideoNode {
            video {
              ...Video_video
            }
          }
          ... on ElementNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
          }
          ... on QuoteNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
          }
          ... on CodeNode {
            children {
              ...TextNodes_linebreakNode
              ...TextNodes_textNode
            }
            language
          }
          ... on ListNode {
            children {
              ... on ListItemNode {
                checked
                children {
                  ...TextNodes_linebreakNode
                  ...TextNodes_textNode
                }
                direction
                format
                indent
                type
                value
                version
              }
            }
            listType
            start
          }
        }
        direction
        format
        indent
        type
        version
      }
    }
    featuredMedia {
      ...FeaturedMedia_media
    }
    id
    slug
    status
    summary
    title
  }
  ${linebreakNodeFragment}
  ${textNodeFragment}
  ${featuredMediaFragment}
  ${videoFragment}
`;
