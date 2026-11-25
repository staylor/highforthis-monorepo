import { gql } from 'graphql-tag';
import { css, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import type { HomeQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { Link } from '#/ui/link.tsx';
import { PostArtwork, postArtworkFragment } from '#/ui/post-artwork.tsx';
import {
  card,
  colorTransition,
  lg,
  lineClamp,
  linkHover,
  merge,
  text,
} from '#/ui/public/styles.ts';
import { RecommendedShows } from '#/ui/recommended-shows.tsx';
import { AccentLine, SectionHeader } from '#/ui/section-header.tsx';
import { Videos, videosFragment } from '#/ui/videos.tsx';

export const homeQuery = gql`
  query Home($after: String, $before: String, $first: Int, $last: Int, $year: Int) {
    ...Videos_videos
    posts(first: 5, status: PUBLISH) {
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
    shows(first: 30, latest: true) {
      edges {
        node {
          id
          date
          title
          url
          artists {
            id
            name
            slug
            appleMusic {
              id
              artwork {
                url
              }
            }
          }
          venue {
            id
            name
            slug
          }
        }
      }
    }
  }
  ${postArtworkFragment}
  ${videosFragment}
`;

export function HomePage(handle: Handle<{ data: HomeQuery; artworkSeed: string }>) {
  const { t } = getApp(handle);

  return () => {
    const { data, artworkSeed } = handle.props;
    const posts = data.posts?.edges ?? [];
    const [featured, ...rest] = posts;

    return (
      <>
        {data.shows && (
          <>
            <RecommendedShows shows={data.shows} />
            <AccentLine />
          </>
        )}
        {data.videos && (
          <section>
            <SectionHeader
              label={t('videos.heading')}
              viewAllLink={routes.videos.href()}
              viewAllText={t('videos.viewAll')}
            />
            <Videos videos={data.videos} paginate={false} heading="h3" />
          </section>
        )}
        <AccentLine />
        {featured && (
          <section>
            <SectionHeader
              label={t('posts.latest')}
              viewAllLink={routes.posts.href()}
              viewAllText={t('posts.viewAll')}
            />
            <div
              mix={css({
                display: 'grid',
                gap: '2rem',
                [lg]: { gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' },
              })}
            >
              <Link
                href={routes.post.href({ slug: featured.node.slug })}
                mix={css(
                  merge(card, {
                    border: 'none',
                    position: 'relative',
                    display: 'block',
                    overflow: 'hidden',
                    borderRadius: '1rem',
                  })
                )}
              >
                <div
                  mix={css({
                    aspectRatio: '4 / 3',
                    overflow: 'hidden',
                    backgroundColor: 'var(--neutral-950)',
                  })}
                >
                  <PostArtwork
                    post={featured.node}
                    seed={`${artworkSeed}:${featured.node.id}`}
                    variant="collage"
                  />
                  <div
                    mix={css({
                      position: 'absolute',
                      inset: 0,
                      background:
                        'linear-gradient(to top in oklab, rgb(0 0 0 / 0.8), rgb(0 0 0 / 0.2), transparent)',
                    })}
                  />
                </div>
                <div
                  mix={css({
                    position: 'absolute',
                    insetInline: 0,
                    bottom: 0,
                    padding: '2rem',
                  })}
                >
                  <span
                    mix={css({
                      marginBottom: '1rem',
                      display: 'inline-block',
                      borderRadius: '0.25rem',
                      backgroundColor: 'rgb(229 0 130 / 0.9)',
                      padding: '0.25rem 0.75rem',
                      ...text.xs,
                      fontWeight: 700,
                      letterSpacing: '0.05em',
                      color: '#fff',
                      textTransform: 'uppercase',
                    })}
                  >
                    {t('posts.featured')}
                  </span>
                  <h2
                    mix={css({
                      marginBottom: '0.75rem',
                      fontSize: '1.875rem',
                      lineHeight: 1.25,
                      fontWeight: 700,
                      color: '#fff',
                      [lg]: { fontSize: '2.25rem' },
                    })}
                  >
                    {featured.node.title}
                  </h2>
                  {featured.node.summary && (
                    <p
                      mix={css({
                        ...lineClamp(2),
                        maxWidth: '32rem',
                        fontSize: '0.875rem',
                        lineHeight: 1.625,
                        color: 'rgb(255 255 255 / 0.7)',
                      })}
                    >
                      {featured.node.summary}
                    </p>
                  )}
                </div>
              </Link>

              <div
                mix={css({
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                })}
              >
                {rest.map(({ node }) => (
                  <Link
                    href={routes.post.href({ slug: node.slug })}
                    mix={css(
                      merge(card, {
                        display: 'flex',
                        gap: '1.25rem',
                        borderRadius: '0.75rem',
                        padding: '1rem',
                      })
                    )}
                  >
                    <PostArtwork post={node} seed={`${artworkSeed}:${node.id}`} variant="stack" />
                    <div
                      mix={css({
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                      })}
                    >
                      <h3
                        mix={css({
                          marginBottom: '0.375rem',
                          ...text.lg,
                          fontWeight: 600,
                          ...colorTransition,
                          [linkHover]: { color: 'var(--pink)' },
                        })}
                      >
                        {node.title}
                      </h3>
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
            </div>
          </section>
        )}
      </>
    );
  };
}
