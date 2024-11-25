import { gql } from 'graphql-tag';
import type { MetaFunction } from 'react-router';

import Link from '~/components/Link';
import Podcast from '~/components/Podcast';
import { metaTags } from '~/components/Podcast/utils';
import type { PodcastEdge, PodcastsQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import query from '~/utils/query';
import { rootData, useRootData } from '~/utils/rootData';

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
        <figure className="mb-6" key={node.id}>
          <figcaption className="mb-3">
            <Link to={`/podcast/${node.id}`} className="block text-pink dark:text-pink">
              {node.title}
            </Link>
            <p>{node.description}</p>
          </figcaption>
        </figure>
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
