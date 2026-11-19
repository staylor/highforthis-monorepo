import { gql } from 'graphql-tag';
import { unsafeHTML } from 'remix/component';
import { createController } from 'remix/router';

import { routes } from '../../routes.ts';
import type { PodcastQuery, PodcastsQuery } from '../../types/graphql.ts';
import { Link } from '../../ui/link.tsx';
import { Podcast, podcastMetaTags } from '../../ui/podcast.tsx';
import { cn } from '../../ui/public/cn.ts';
import { uploadUrl } from '../../ui/public/media.ts';
import { loadRootData, prefetchRootData, renderPage } from '../render-page.tsx';

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

export default createController(routes.podcast, {
  middleware: [prefetchRootData()],
  actions: {
    async index(context) {
      const [{ podcasts }, { podcastSettings }] = await Promise.all([
        context.gql.query<PodcastsQuery>(podcastsQuery, { first: 10 }),
        loadRootData(context),
      ]);
      const title = `Podcast: ${podcastSettings.title}`;
      return renderPage(
        context,
        <Podcast title={title} description={podcastSettings.description ?? ''}>
          {podcasts?.edges.map(({ node }) => (
            <Link
              href={routes.podcast.show.href({ id: node.id })}
              class={cn(
                'group -mx-4 block rounded-lg px-4 py-5',
                'border-b border-neutral-100 dark:border-white/5',
                'dark:hover:bg-surface-dark-elevated/50 transition-colors hover:bg-neutral-50',
                'last:border-b-0'
              )}
            >
              <h3 class="mb-2 text-lg font-semibold transition-colors group-hover:text-pink">
                {node.title}
              </h3>
              {node.description && (
                <p
                  class="line-clamp-3 text-sm leading-relaxed text-muted dark:text-muted-dark"
                  innerHTML={unsafeHTML(node.description.replace(/\n/g, '<br />'))}
                />
              )}
            </Link>
          ))}
        </Podcast>,
        {
          title,
          meta: podcastMetaTags({
            title,
            description: podcastSettings.description,
            url: podcastSettings.websiteLink,
            image: podcastSettings.image,
          }),
        }
      );
    },

    async show(context) {
      const [{ podcast }, { siteSettings, podcastSettings }] = await Promise.all([
        context.gql.query<PodcastQuery>(podcastQuery, { id: context.params.id }),
        loadRootData(context),
      ]);
      if (!podcast) {
        return new Response('Not Found', { status: 404 });
      }
      const { audio } = podcast;
      return renderPage(
        context,
        <Podcast title={podcast.title} description={podcast.description}>
          {audio && (
            <figure class="mb-6">
              <audio src={uploadUrl(audio.destination, audio.fileName)} controls />
            </figure>
          )}
        </Podcast>,
        {
          title: podcast.title,
          meta: podcastMetaTags({
            title: podcast.title,
            description: podcast.description,
            url: `${siteSettings.siteUrl}/podcast/${podcast.id}`,
            image: podcastSettings.image,
          }),
        }
      );
    },
  },
});
