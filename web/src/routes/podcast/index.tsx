import cn from 'classnames';
import { gql } from 'graphql-tag';
import type { MetaFunction } from 'react-router';

import Link from '#/components/Link';
import Podcast from '#/components/Podcast';
import { metaTags } from '#/components/Podcast/utils';
import type { PodcastEdge, PodcastsQuery } from '#/types/graphql';
import { createClientCache } from '#/utils/cache';
import query from '#/utils/query';
import { rootData, useRootData } from '#/utils/rootData';

import type { Route } from './+types/index';

export const meta: MetaFunction = ({ matches }) => {
  const { siteSettings, podcastSettings } = rootData(matches);
  const { description, websiteLink: url, image } = podcastSettings;

  return metaTags({
    title: 'Podcast: ' + podcastSettings.title,
    description,
    url,
    image,
    siteSettings,
  });
};

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<PodcastsQuery>({ request, context, query: podcastsQuery, variables: { first: 10 } });
}

export const clientLoader = createClientCache();

export default function Podcasts({ loaderData }: Route.ComponentProps) {
  const { podcasts } = loaderData;
  const { podcastSettings } = useRootData();
  const { title, description: summary } = podcastSettings;

  return (
    <Podcast title={`Podcast: ${title}`} description={summary as string}>
      {podcasts.edges.map(({ node }: PodcastEdge) => (
        <Link
          to={`/podcast/${node.id}`}
          key={node.id}
          className={cn(
            'group -mx-4 block rounded-lg px-4 py-5',
            'border-b border-neutral-100 dark:border-white/5',
            'dark:hover:bg-surface-dark-elevated/50 transition-colors hover:bg-neutral-50',
            'last:border-b-0'
          )}
        >
          <h3 className="font-display group-hover:text-pink mb-2 text-lg font-semibold transition-colors">
            {node.title}
          </h3>
          {node.description && (
            <p
              className="text-muted dark:text-muted-dark line-clamp-3 text-sm leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: (node.description || '').replace(/\n/g, '<br />'),
              }}
            />
          )}
        </Link>
      ))}
    </Podcast>
  );
}

const podcastsQuery = gql`
  query Podcasts($first: Int) {
    podcasts(first: $first) {
      edges {
        node {
          description
          id
          title
        }
      }
    }
  }
`;
