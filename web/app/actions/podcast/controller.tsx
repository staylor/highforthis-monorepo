import { gql } from 'graphql-tag';
import { css, unsafeHTML } from 'remix/component';
import { createController } from 'remix/router';

import { routes } from '../../routes.ts';
import type { PodcastQuery, PodcastsQuery } from '../../types/graphql.ts';
import { Link } from '../../ui/link.tsx';
import { Podcast, podcastMetaTags } from '../../ui/podcast.tsx';
import { uploadUrl } from '../../ui/public/media.ts';
import { colorTransition, lineClamp, linkHover, text } from '../../ui/public/styles.ts';
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

const episodeLink = css({
  marginInline: '-1rem',
  display: 'block',
  borderRadius: '0.5rem',
  padding: '1.25rem 1rem',
  borderBottom: '1px solid var(--card-border)',
  ...colorTransition,
  '&:hover': {
    backgroundColor: 'light-dark(var(--neutral-50), rgb(20 20 20 / 0.5))',
  },
  '&:last-child': { borderBottom: 0 },
});

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
            <Link href={routes.podcast.show.href({ id: node.id })} mix={episodeLink}>
              <h3
                mix={css({
                  marginBottom: '0.5rem',
                  ...text.lg,
                  fontWeight: 600,
                  ...colorTransition,
                  [linkHover]: { color: 'var(--pink)' },
                })}
              >
                {node.title}
              </h3>
              {node.description && (
                <p
                  mix={css({
                    ...lineClamp(3),
                    fontSize: '0.875rem',
                    lineHeight: 1.625,
                    color: 'var(--muted)',
                  })}
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
        context.gql.query<PodcastQuery>(podcastQuery, {
          id: context.params.id,
        }),
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
            <figure mix={css({ marginBottom: '1.5rem' })}>
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
