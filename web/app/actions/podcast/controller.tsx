import { gql } from 'graphql-tag';
import { css } from 'remix/component';
import { createController } from 'remix/router';

import {
  loadRootData,
  prefetchRootData,
  renderNotFound,
  renderPage,
  siteUrl,
} from '#/actions/render-page.tsx';
import { routes } from '#/routes.ts';
import type { PodcastQuery, PodcastsQuery } from '#/types/graphql.ts';
import { lines } from '#/ui/lines.tsx';
import { Link } from '#/ui/link.tsx';
import { Podcast, podcastMetaTags } from '#/ui/podcast.tsx';
import { uploadUrl } from '#/ui/public/media.ts';
import { card, colorTransition, lineClamp, linkHover, merge, text } from '#/ui/public/styles.ts';

import { ALL_EPISODES } from './feed.ts';

const podcastsQuery = gql`
  query Podcasts($first: Int) {
    podcasts(first: $first) {
      edges {
        node {
          id
          description
          title
        }
      }
    }
  }
`;

const podcastQuery = gql`
  query Podcast($id: String!) {
    podcast(id: $id) {
      id
      description
      title
      audio {
        id
        destination
        duration
        fileName
      }
    }
  }
`;

// A card, as the home page's posts are
const episodeLink = css(
  merge(card, {
    display: 'block',
    borderRadius: '0.75rem',
    padding: '1.25rem',
  })
);

export default createController(routes.podcast, {
  middleware: [prefetchRootData()],
  actions: {
    async index(context) {
      const [{ podcasts }, { podcastSettings }] = await Promise.all([
        // Every episode: the page has no next page to reach older ones on
        context.gql.query<PodcastsQuery>(podcastsQuery, { first: ALL_EPISODES }),
        loadRootData(context),
      ]);
      const { t } = context;
      const title = podcastSettings?.title
        ? t('podcast.title', { title: podcastSettings.title })
        : t('nav.podcast');
      const episodes = podcasts?.edges ?? [];
      // The podcast's own name, and how many episodes there are
      const eyebrow = [podcastSettings?.title, t('podcast.episodes', { count: episodes.length })]
        .filter(Boolean)
        .join(' · ');
      return renderPage(
        context,
        <Podcast
          display
          eyebrow={eyebrow}
          title={t('nav.podcast')}
          description={podcastSettings?.description ?? ''}
        >
          <div mix={css({ display: 'grid', gap: '0.75rem' })}>
            {episodes.map(({ node }) => (
              <Link href={routes.podcast.show.href({ id: node.id })} mix={episodeLink}>
                <h2
                  mix={css({
                    marginBottom: '0.375rem',
                    ...text.lg,
                    fontWeight: 600,
                    ...colorTransition,
                    [linkHover]: { color: 'var(--pink)' },
                  })}
                >
                  {node.title}
                </h2>
                {node.description && (
                  <p
                    mix={css({
                      ...lineClamp(3),
                      ...text.sm,
                      color: 'var(--muted)',
                    })}
                  >
                    {lines(node.description)}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </Podcast>,
        {
          title,
          meta: podcastMetaTags({
            title,
            description: podcastSettings?.description,
            url: podcastSettings?.websiteLink,
            image: podcastSettings?.image,
          }),
        }
      );
    },

    async show(context) {
      const [{ podcast }, root] = await Promise.all([
        context.gql.query<PodcastQuery>(podcastQuery, {
          id: context.params.id,
        }),
        loadRootData(context),
      ]);
      if (!podcast) {
        return renderNotFound(context);
      }
      const { audio } = podcast;
      return renderPage(
        context,
        <Podcast
          eyebrow={context.t('nav.podcast')}
          back={routes.podcast.index.href()}
          title={podcast.title}
          description={podcast.description}
        >
          {audio && (
            <figure mix={css({ '& audio': { width: '100%' } })}>
              <audio src={uploadUrl(audio.destination, audio.fileName)} controls />
            </figure>
          )}
        </Podcast>,
        {
          title: podcast.title,
          meta: podcastMetaTags({
            title: podcast.title,
            description: podcast.description,
            url: `${siteUrl(context, root)}/podcast/${podcast.id}`,
            image: root.podcastSettings?.image,
          }),
        }
      );
    },
  },
});
