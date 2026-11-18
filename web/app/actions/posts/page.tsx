import { gql } from 'graphql-tag';
import type { Handle } from 'remix/component';

import type { PostQuery, PostsQuery } from '../../types/graphql.ts';
import { getApp } from '../../ui/app-context.tsx';
import { Heading1, PostTitle } from '../../ui/heading.tsx';
import { Link } from '../../ui/link.tsx';
import { PostArtwork, postArtworkFragment } from '../../ui/post-artwork.tsx';
import { PostContent, textNodeFragments } from '../../ui/post-content.tsx';
import { cn } from '../../ui/public/cn.ts';
import { videoFragment } from '../../ui/videos.tsx';

export const postsQuery = gql`
  query Posts($first: Int) {
    posts(first: $first, status: PUBLISH) @cache(key: "posts") {
      edges {
        node {
          ...PostArtwork_post
          id
          slug
          summary
          title
        }
      }
    }
  }
  ${postArtworkFragment}
`;

export function PostsPage(
  handle: Handle<{ posts: NonNullable<PostsQuery['posts']>; artworkSeed: string }>
) {
  const { t } = getApp(handle);

  return () => {
    const { posts, artworkSeed } = handle.props;
    return (
      <article>
        <Heading1 class="mb-8">{t('posts.heading')}</Heading1>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.edges.map(({ node }) => (
            <Link
              href={`/post/${node.slug}`}
              class={cn(
                'group overflow-hidden rounded-xl',
                'border border-neutral-100 bg-white shadow-sm',
                'dark:bg-surface-dark-card dark:border-white/5',
                'transition-all duration-300 hover:-translate-y-0.5',
                'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
              )}
            >
              <div class="aspect-3/2 overflow-hidden bg-neutral-950">
                <PostArtwork post={node} seed={`${artworkSeed}:${node.id}`} variant="collage" />
              </div>
              <div class="p-4">
                <h2 class="mb-1.5 text-base font-semibold transition-colors group-hover:text-pink">
                  {node.title}
                </h2>
                {node.summary && (
                  <p class="line-clamp-2 text-sm text-muted dark:text-muted-dark">{node.summary}</p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </article>
    );
  };
}

export const postQuery = gql`
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
            }
            ... on ListNode {
              children {
                ... on ListItemNode {
                  children {
                    ...TextNodes_linebreakNode
                    ...TextNodes_textNode
                  }
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
  ${textNodeFragments}
  ${videoFragment}
`;

export function PostPage(handle: Handle<{ post: NonNullable<PostQuery['post']> }>) {
  return () => {
    const { post } = handle.props;
    return (
      <article class="w-160 max-w-full">
        <PostTitle>{post.title}</PostTitle>
        <PostContent editorState={post.editorState as any} />
      </article>
    );
  };
}
