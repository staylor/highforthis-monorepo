import { gql } from 'graphql-tag';
import type { MetaFunction } from 'react-router';

import Podcast from '~/components/Podcast';
import { metaTags } from '~/components/Podcast/utils';
import type { PodcastQuery } from '~/types/graphql';
import { createClientCache } from '~/utils/cache';
import { uploadUrl } from '~/utils/media';
import query from '~/utils/query';
import { rootData } from '~/utils/rootData';

import type { Route } from './+types/podcast';

export const meta: MetaFunction = ({ data, matches }) => {
  const { siteSettings, podcastSettings } = rootData(matches);
  const { podcast } = data as PodcastQuery;
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
  query Podcast($id: ObjID!) {
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
