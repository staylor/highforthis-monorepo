import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import type { PostQuery, PostsQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { Link } from '#/ui/link.tsx';
import { PageHeader } from '#/ui/page-header.tsx';
import { PostArtwork, postArtworkFragment } from '#/ui/post-artwork.tsx';
import { PostContent, linebreakNodeFragment, textNodeFragment } from '#/ui/post-content.tsx';
import {
  card,
  colorTransition,
  lg,
  lineClamp,
  linkHover,
  merge,
  sm,
  text,
} from '#/ui/public/styles.ts';
import { videoFragment } from '#/ui/videos.tsx';

export const postsQuery = gql`
  query Posts($after: String, $first: Int) {
    posts(after: $after, first: $first, status: PUBLISH) {
      edges {
        cursor
        node {
          ...PostArtwork_post
          id
          slug
          summary
          title
        }
      }
      pageInfo {
        hasNextPage
      }
    }
  }
  ${postArtworkFragment}
`;

export function PostsPage(
  handle: Handle<{
    posts: NonNullable<PostsQuery['posts']>;
    artworkSeed: string;
  }>
) {
  const { t } = getApp(handle);

  return () => {
    const { posts, artworkSeed } = handle.props;
    return (
      <article>
        <PageHeader
          display
          eyebrow={t('posts.count', { count: posts.edges.length })}
          title={t('posts.heading')}
        />
        <div
          mix={css({
            display: 'grid',
            gap: '1.5rem',
            [sm]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
            [lg]: { gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' },
          })}
        >
          {posts.edges.map(({ node }) => (
            <Link
              href={routes.post.href({ slug: node.slug })}
              mix={css(merge(card, { overflow: 'hidden', borderRadius: '0.75rem' }))}
            >
              <div
                mix={css({
                  aspectRatio: '3 / 2',
                  overflow: 'hidden',
                  backgroundColor: 'var(--neutral-950)',
                })}
              >
                <PostArtwork post={node} seed={`${artworkSeed}:${node.id}`} variant="collage" />
              </div>
              <div mix={css({ padding: '1rem' })}>
                <h2
                  mix={css({
                    marginBottom: '0.375rem',
                    ...text.base,
                    fontWeight: 600,
                    ...colorTransition,
                    [linkHover]: { color: 'var(--pink)' },
                  })}
                >
                  {node.title}
                </h2>
                {node.summary && (
                  <p
                    mix={css({
                      ...lineClamp(2),
                      ...text.sm,
                      color: 'var(--muted)',
                    })}
                  >
                    {node.summary}
                  </p>
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
      id
      slug
      summary
      title
      editorState {
        root {
          direction
          format
          indent
          type
          version
          children {
            ... on ElementNodeType {
              direction
              format
              indent
              type
              version
            }
            ... on HeadingNode {
              tag
              children {
                ...TextNodes_linebreakNode
                ...TextNodes_textNode
              }
            }
            ... on ImageNode {
              image {
                id
                destination
                crops {
                  fileName
                  width
                }
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
              listType
              start
              children {
                ... on ListItemNode {
                  children {
                    ...TextNodes_linebreakNode
                    ...TextNodes_textNode
                  }
                }
              }
            }
          }
        }
      }
      featuredMedia {
        id
        destination
        ... on ImageUpload {
          crops {
            fileName
            width
          }
        }
      }
    }
  }
  ${linebreakNodeFragment}
  ${textNodeFragment}
  ${videoFragment}
`;

export function PostPage(handle: Handle<{ post: NonNullable<PostQuery['post']> }>) {
  const { t } = getApp(handle);

  return () => {
    const { post } = handle.props;
    return (
      <article mix={css({ width: '40rem', maxWidth: '100%' })}>
        <PageHeader eyebrow={t('posts.heading')} back={routes.posts.href()} title={post.title} />
        <PostContent editorState={post.editorState as any} />
      </article>
    );
  };
}
