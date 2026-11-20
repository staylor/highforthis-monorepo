import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import type { PostQuery, PostsQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { Heading1, PostTitle } from '#/ui/heading.tsx';
import { Link } from '#/ui/link.tsx';
import { PostArtwork, postArtworkFragment } from '#/ui/post-artwork.tsx';
import { PostContent, textNodeFragments } from '#/ui/post-content.tsx';
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
        <Heading1 styles={{ marginBottom: '2rem', [lg]: { marginBottom: '2rem' } }}>
          {t('posts.heading')}
        </Heading1>
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
              href={`/post/${node.slug}`}
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
      <article mix={css({ width: '40rem', maxWidth: '100%' })}>
        <PostTitle>{post.title}</PostTitle>
        <PostContent editorState={post.editorState as any} />
      </article>
    );
  };
}
