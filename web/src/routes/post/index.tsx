import cn from 'classnames';
import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';
import type { MetaFunction } from 'react-router';

import { Heading1 } from '#/components/Heading';
import Link from '#/components/Link';
import PostArtwork from '#/components/PostArtwork';
import type { PostEdge, PostsQuery } from '#/types/graphql';
import { createClientCache } from '#/utils/cache';
import query from '#/utils/query';
import { rootData } from '#/utils/rootData';
import titleTemplate from '#/utils/title';

import type { Route } from './+types/index';

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings } = rootData(matches);
  return [
    {
      title: titleTemplate({ title: 'Posts', siteSettings }),
    },
  ];
};

export async function loader({ request, context }: Route.LoaderArgs) {
  const data = await query<PostsQuery>({
    request,
    context,
    query: postsQuery,
    variables: { first: 50 },
  });

  return { ...data, artworkSeed: crypto.randomUUID() };
}

export const clientLoader = createClientCache();

export default function Posts({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { artworkSeed, posts } = loaderData;

  if (!posts) {
    return null;
  }

  return (
    <article>
      <Heading1 className="mb-8">{t('posts.heading')}</Heading1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.edges.map(({ node }: PostEdge) => {
          return (
            <Link
              to={`/post/${node.slug}`}
              key={node.id}
              className={cn(
                'group overflow-hidden rounded-xl',
                'border border-neutral-100 bg-white shadow-sm',
                'dark:bg-surface-dark-card dark:border-white/5',
                'transition-all duration-300 hover:-translate-y-0.5',
                'hover:shadow-pink/5 dark:hover:shadow-pink/10 hover:shadow-lg'
              )}
            >
              <div className="aspect-[3/2] overflow-hidden bg-neutral-950">
                <PostArtwork post={node} seed={`${artworkSeed}:${node.id}`} variant="collage" />
              </div>
              <div className="p-4">
                <h2 className="group-hover:text-pink mb-1.5 text-base font-semibold transition-colors">
                  {node.title}
                </h2>
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
    </article>
  );
}

const postsQuery = gql`
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
  ${PostArtwork.fragments.post}
`;
