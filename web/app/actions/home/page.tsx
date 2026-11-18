import { gql } from 'graphql-tag';
import type { Handle } from 'remix/component';

import type { HomeQuery } from '../../types/graphql.ts';
import { getApp } from '../../ui/app-context.tsx';
import { Link } from '../../ui/link.tsx';
import { PostArtwork, postArtworkFragment } from '../../ui/post-artwork.tsx';
import { cn } from '../../ui/public/cn.ts';
import { AccentLine, SectionHeader } from '../../ui/section-header.tsx';
import { Videos, videosFragment } from '../../ui/videos.tsx';

export const homeQuery = gql`
  query Home(
    $after: String
    $before: String
    $cacheKey: String
    $first: Int
    $last: Int
    $year: Int
  ) {
    posts(first: 5, status: PUBLISH) @cache(key: "latest") {
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
    ...Videos_videos
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
        {data.videos && (
          <section>
            <SectionHeader label="Videos" viewAllLink="/videos" />
            <Videos videos={data.videos} paginate={false} />
          </section>
        )}
        <AccentLine />
        {featured && (
          <section>
            <SectionHeader
              label={t('posts.latest')}
              viewAllLink="/posts"
              viewAllText={t('posts.viewAll')}
            />
            <div class="grid gap-8 lg:grid-cols-2">
              <Link
                href={`/post/${featured.node.slug}`}
                class={cn(
                  'group relative block overflow-hidden rounded-2xl',
                  'dark:bg-surface-dark-card bg-white shadow-sm',
                  'transition-all duration-300 hover:-translate-y-0.5',
                  'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
                )}
              >
                <div class="aspect-4/3 overflow-hidden bg-neutral-950">
                  <PostArtwork
                    post={featured.node}
                    seed={`${artworkSeed}:${featured.node.id}`}
                    variant="collage"
                  />
                  <div class="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
                </div>
                <div class="absolute inset-x-0 bottom-0 p-8">
                  <span class="mb-4 inline-block rounded bg-pink/90 px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
                    {t('posts.featured')}
                  </span>
                  <h2 class="mb-3 text-3xl leading-tight font-bold text-white lg:text-4xl">
                    {featured.node.title}
                  </h2>
                  {featured.node.summary && (
                    <p class="line-clamp-2 max-w-lg text-sm leading-relaxed text-white/70">
                      {featured.node.summary}
                    </p>
                  )}
                </div>
              </Link>

              <div class="flex flex-col gap-4">
                {rest.map(({ node }) => (
                  <Link
                    href={`/post/${node.slug}`}
                    class={cn(
                      'group flex gap-5 rounded-xl p-4',
                      'border border-neutral-100 bg-white shadow-sm',
                      'dark:bg-surface-dark-card dark:border-white/5',
                      'transition-all duration-300 hover:-translate-y-0.5',
                      'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
                    )}
                  >
                    <PostArtwork post={node} seed={`${artworkSeed}:${node.id}`} variant="stack" />
                    <div class="flex flex-col justify-center">
                      <h3 class="mb-1.5 text-lg font-semibold transition-colors group-hover:text-pink">
                        {node.title}
                      </h3>
                      {node.summary && (
                        <p class="line-clamp-2 text-sm text-muted dark:text-muted-dark">
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
