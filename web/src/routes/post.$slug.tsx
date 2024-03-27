import { gql } from 'graphql-tag';
import type { LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import type { MetaFunction } from '@remix-run/node';

import PostTitle from '@/components/Post/PostTitle';
import Content from '@/components/Post/Content';
import query from '@/utils/query';
import titleTemplate from '@/utils/title';
import { uploadUrl } from '@/utils/media';
import type { EditorState, ImageUpload, ImageUploadCrop, Post, PostQuery } from '@/types/graphql';
import { rootData } from '@/utils/rootData';
import Video from '@/components/Videos/Video';
import TextNodes from '@/components/Post/TextNodes';

export const meta: MetaFunction = ({ data, matches }) => {
  const { post } = data as PostQuery;
  const { siteSettings } = rootData(matches);
  const { title, featuredMedia, summary, slug } = post as Post;
  const url = `${siteSettings.siteUrl}/post/${slug}`;

  let featuredImage;
  if (featuredMedia && featuredMedia.length > 0) {
    const media = featuredMedia[0] as ImageUpload;
    const crop = media.crops.find((c) => c.width === 640) as ImageUploadCrop;
    featuredImage = uploadUrl(media.destination, crop.fileName);
  }

  return [
    { title: titleTemplate({ title, siteSettings }) },
    { property: 'og:type', content: 'article' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: summary },
    { property: 'og:url', content: url },
    { property: 'og:image', content: featuredImage },
    { property: 'twitter:title', content: title },
    { property: 'twitter:description', content: summary },
    { property: 'twitter:url', content: url },
    { property: 'twitter:image', content: featuredImage },
    { property: 'twitter:card', content: 'summary_large_image' },
  ];
};

export const loader: LoaderFunction = ({ params, context }) => {
  return query({ context, query: postQuery, variables: { slug: params.slug } });
};

export default function Post() {
  const data = useLoaderData<PostQuery>();
  const post = data.post as Post;
  const editorState = post.editorState as Partial<EditorState>;

  return (
    <article className="w-160 max-w-full">
      <PostTitle>{post.title}</PostTitle>
      <Content editorState={editorState} />
    </article>
  );
}

const postQuery = gql`
  query Post($slug: String) {
    post(slug: $slug) {
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
          }
          direction
          format
          indent
          type
          version
        }
      }
      featuredMedia {
        destination
        id
        ... on ImageUpload {
          crops {
            fileName
            width
          }
        }
      }
      id
      slug
      summary
      title
    }
  }
  ${TextNodes.fragments.linebreakNode}
  ${TextNodes.fragments.textNode}
  ${Video.fragments.video}
`;
