import type { LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';
import { gql } from 'graphql-tag';
import type { MetaFunction } from '@remix-run/node';

import query from '@/utils/query';
import { uploadUrl } from '@/utils/media';
import Podcast from '@/components/Podcast';
import { metaTags } from '@/components/Podcast/utils';
import { rootData } from '@/utils/rootData';
import type { Podcast as PodcastType, PodcastQuery, AudioUpload } from '@/types/graphql';
import { createClientCache } from '@/utils/cache';

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

export const loader: LoaderFunction = async ({ params, context }) => {
  return query({ context, query: podcastQuery, variables: { id: params.id } });
};

export const clientLoader = createClientCache();

export default function PodcastRoute() {
  const data = useLoaderData<PodcastQuery>();
  const podcast = data.podcast as PodcastType;
  const audio = podcast.audio as AudioUpload;

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
