import type { PodcastQuery } from '@highforthis/shared/web/types/graphql';
import { uploadUrl } from '@highforthis/shared/web/utils/media';
import query from '@highforthis/shared/web/utils/query';
import { rootData } from '@highforthis/shared/web/utils/rootData';
import { gql } from 'graphql-tag';
import type { MetaFunction } from 'react-router';

import Podcast from '#/components/Podcast';
import { metaTags } from '#/components/Podcast/utils';
import { createClientCache } from '#/utils/cache';

import type { Route } from './+types/podcast';

export const meta: MetaFunction = ({ loaderData, matches }) => {
  const { siteSettings, podcastSettings } = rootData(matches);
  const { podcast } = loaderData as PodcastQuery;
  if (!podcast) {
    return [];
  }
  const { title, description } = podcast;
  return metaTags({
    title,
    description,
    url: `${siteSettings.siteUrl}/podcast/${podcast.id}`,
    image: podcastSettings.image,
    siteSettings,
  });
};

export async function loader({ request, params, context }: Route.LoaderArgs) {
  return query<PodcastQuery>({
    request,
    context,
    query: podcastQuery,
    variables: { id: params.id },
  });
}

export const clientLoader = createClientCache();

export default function PodcastRoute({ loaderData }: Route.ComponentProps) {
  const { podcast } = loaderData;
  const audio = podcast.audio;

  return (
    <Podcast title={podcast.title} description={podcast.description}>
      <figure className="mb-6">
        <audio src={uploadUrl(audio.destination, audio.fileName)} controls />
      </figure>
    </Podcast>
  );
}

const podcastQuery = gql`
  query Podcast($id: String!) {
    podcast(id: $id) {
      audio {
        destination
        duration
        fileName
        id
      }
      description
      id
      title
    }
  }
`;
