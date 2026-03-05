import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import Link from '#/components/Link';
import SectionHeader from '#/components/SectionHeader';
import type { ImageUpload, PostConnection } from '#/types/graphql';
import { uploadUrl } from '#/utils/media';

function Latest({ posts }: { posts: PostConnection }) {
  const { t } = useTranslation();
  if (!posts || posts.edges.length === 0) {
    return null;
  }

  const [featured, ...rest] = posts.edges;
  const featuredCrop = featured.node.featuredMedia
    ?.map((media) => (media as ImageUpload).crops?.find((c) => c.width === 640 || c.width === 300))
    .find(Boolean);

  return (
    <section>
      <SectionHeader
        label={t('posts.latest')}
        viewAllLink="/posts"
        viewAllText={t('posts.viewAll')}
      />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Featured hero card */}
        <Link
          to={`/post/${featured.node.slug}`}
          className={cn(
            'group relative block overflow-hidden rounded-2xl',
            'dark:bg-surface-dark-card bg-white shadow-sm',
            'transition-all duration-300 hover:-translate-y-0.5',
            'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
          )}
        >
          <div className="aspect-[4/3] overflow-hidden">
            {featuredCrop && featured.node.featuredMedia?.[0] && (
              <img
                alt=""
                src={uploadUrl(featured.node.featuredMedia[0].destination, featuredCrop.fileName)}
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          </div>
          <div className="absolute right-0 bottom-0 left-0 p-8">
            <span className="bg-pink/90 mb-4 inline-block rounded px-3 py-1 text-xs font-bold tracking-wider text-white uppercase">
              {t('posts.featured')}
            </span>
            <h2 className="font-display mb-3 text-3xl leading-tight font-bold text-white lg:text-4xl">
              {featured.node.title}
            </h2>
            {featured.node.summary && (
              <p className="line-clamp-2 max-w-lg text-sm leading-relaxed text-white/70">
                {featured.node.summary}
              </p>
            )}
          </div>
        </Link>

        {/* Secondary posts stack */}
        <div className="flex flex-col gap-4">
          {rest.map(({ node }) => {
            const crop = node.featuredMedia
              ?.map((media) => (media as ImageUpload).crops?.find((c) => c.width === 300))
              .find(Boolean);

            return (
              <Link
                to={`/post/${node.slug}`}
                key={node.id}
                className={cn(
                  'group flex gap-5 rounded-xl p-4',
                  'border border-neutral-100 bg-white shadow-sm',
                  'dark:bg-surface-dark-card dark:border-white/5',
                  'transition-all duration-300 hover:-translate-y-0.5',
                  'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
                )}
              >
                {crop && node.featuredMedia?.[0] && (
                  <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-lg">
                    <img
                      alt=""
                      src={uploadUrl(node.featuredMedia[0].destination, crop.fileName)}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="flex flex-col justify-center">
                  <h3 className="font-display group-hover:text-pink mb-1.5 text-lg font-semibold transition-colors">
                    {node.title}
                  </h3>
                  {node.summary && (
                    <p className="text-muted dark:text-muted-dark line-clamp-2 text-sm">
                      {node.summary}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Latest;
