import { gql } from 'graphql-tag';
import { css } from 'remix/component';
import { createController } from 'remix/router';

import { prefetchRootData, renderNotFound, renderPage } from '#/actions/render-page.tsx';
import { isYear } from '#/lib/year.ts';
import { routes } from '#/routes.ts';
import type {
  ShowQuery,
  ShowsHistoryPageQuery,
  ShowsHistoryQuery,
  ShowStatsQuery,
} from '#/types/graphql.ts';
import { Artwork } from '#/ui/artist.tsx';
import { Heading1, Heading2 } from '#/ui/heading.tsx';
import { Link } from '#/ui/link.tsx';
import { md, text } from '#/ui/public/styles.ts';
import { Shows, ShowsList } from '#/ui/shows/shows.tsx';
import { formatArtists, formatDate } from '#/ui/shows/utils.ts';

import {
  HISTORY_PAGE_SIZE,
  HistoryPage,
  HistoryRows,
  showsHistoryPageQuery,
  showsHistoryQuery,
} from './history.tsx';
import { everyUpcomingShow } from './lists.ts';
import { LEADERS, StatsPage, showStatsQuery } from './stats.tsx';

const showQuery = gql`
  query Show($id: String) {
    show(id: $id) {
      id
      date
      title
      url
      artists {
        id
        name
        slug
        appleMusic {
          id
          artwork {
            url
          }
        }
      }
      venue {
        id
        name
        slug
      }
    }
  }
`;

// The pages start the App query before running their own, so the two run together. The history's
// later pages are only rows, for a frame in the page, so they skip it.
const prefetch = [prefetchRootData()];

export default createController(routes.shows, {
  actions: {
    index: {
      middleware: prefetch,
      async handler(context) {
        const { t } = context;
        const shows = await everyUpcomingShow(context.gql);
        return renderPage(
          context,
          <article>
            <Heading1>{t('shows.recommended')}</Heading1>
            <p
              mix={css({
                marginBottom: '2rem',
                ...text.base,
                color: 'var(--muted)',
              })}
            >
              {t('shows.todaysDate')}:{' '}
              <strong mix={css({ color: 'light-dark(var(--neutral-900), #fff)' })}>
                {formatDate().formatted}
              </strong>
            </p>
            {shows && <Shows shows={shows} />}
          </article>,
          { title: t('shows.heading') }
        );
      },
    },

    list: {
      middleware: prefetch,
      async handler(context) {
        const shows = await everyUpcomingShow(context.gql);
        return renderPage(context, shows ? <ShowsList shows={shows} /> : null, {
          title: context.t('shows.heading'),
        });
      },
    },

    // The shows we've been to, newest first, a page at a time. Each page ends with a lazy frame
    // that adds the next as it scrolls into view, or without JavaScript, a link to it (?after=).
    history: {
      middleware: prefetch,
      async handler(context) {
        const { t } = context;
        const { year } = context.params;
        if (year && !isYear(year)) {
          return renderNotFound(context);
        }
        const { shows } = await context.gql.query<ShowsHistoryQuery>(showsHistoryQuery, {
          after: context.url.searchParams.get('after') ?? undefined,
          first: HISTORY_PAGE_SIZE,
          year: year ? Number(year) : undefined,
        });
        return renderPage(context, shows ? <HistoryPage shows={shows} year={year} /> : null, {
          title: year ? t('shows.historyIn', { year }) : t('shows.history'),
        });
      },
    },

    // A page of the history after the first: only its rows, for the frame that loads it
    async historyPage(context) {
      const { year, view } = context.params;
      const after = context.url.searchParams.get('after');
      const previous = Number(context.url.searchParams.get('previous') || Number.NaN);
      if ((year && !isYear(year)) || (view !== 'grid' && view !== 'list') || !after) {
        return new Response('Not Found', { status: 404 });
      }
      const { shows } = await context.gql.query<ShowsHistoryPageQuery>(showsHistoryPageQuery, {
        after,
        first: HISTORY_PAGE_SIZE,
        year: year ? Number(year) : undefined,
      });
      return context.render(
        shows ? (
          <HistoryRows
            shows={shows}
            view={view}
            year={year}
            previous={Number.isFinite(previous) ? previous : undefined}
            label={context.t('shows.more')}
          />
        ) : null
      );
    },

    stats: {
      middleware: prefetch,
      async handler(context) {
        const { entity } = context.params;
        if (entity !== 'artist' && entity !== 'venue') {
          return renderNotFound(context);
        }
        const data = await context.gql.query<ShowStatsQuery>(showStatsQuery, {
          entity: entity.toUpperCase(),
          leaders: LEADERS,
        });
        return renderPage(context, <StatsPage entity={entity} data={data} />, {
          title: context.t(`entity.stats.${entity}`),
        });
      },
    },

    show: {
      middleware: prefetch,
      async handler(context) {
        const { t } = context;
        const { show } = await context.gql.query<ShowQuery>(showQuery, {
          id: context.params.id,
        });
        if (!show) {
          return renderNotFound(context);
        }
        const lastIndex = show.artists.length - 1;
        const d = formatDate(show.date);
        const ArtistHeading = show.title ? Heading2 : Heading1;
        const [artist] = show.artists;

        return renderPage(
          context,
          <article
            mix={css({
              marginInline: 'auto',
              textAlign: 'center',
              [md]: { display: 'flex', textAlign: 'left' },
            })}
          >
            <div
              mix={css({
                marginBlock: '0.75rem 2rem',
                [md]: { marginRight: '2rem' },
              })}
            >
              {artist && (
                <Artwork
                  name={artist.name}
                  data={artist.appleMusic || {}}
                  styles={{
                    marginInline: 'auto',
                    borderRadius: '0.5rem',
                    [md]: { marginLeft: 0 },
                  }}
                />
              )}
            </div>
            <div mix={css({ [md]: { marginTop: '1rem' } })}>
              <p mix={css({ marginBottom: '0.75rem', ...text.lg })}>
                {d.monthName} {d.day}, {d.year} - {d.time}
              </p>
              {show.title && <Heading1>{show.title}</Heading1>}
              {artist && (
                <ArtistHeading styles={{ fontFamily: 'var(--font-sans)' }}>
                  {show.artists.map((artist, i) => (
                    <Link
                      href={routes.artist.href({ slug: artist.slug })}
                      mix={css({
                        display: 'block',
                        marginBottom: i < lastIndex ? '0.25rem' : undefined,
                      })}
                    >
                      {artist.name} →
                    </Link>
                  ))}
                </ArtistHeading>
              )}
              <Heading2 styles={{ marginTop: '1rem' }}>
                <Link
                  href={routes.venue.href({ slug: show.venue.slug })}
                  mix={css({ color: 'var(--gray-400)' })}
                >
                  {show.venue.name}
                </Link>
              </Heading2>
              {show.url && (
                <a
                  href={show.url}
                  target="_blank"
                  mix={css({
                    marginBlock: '0.5rem',
                    display: 'inline-block',
                    borderRadius: '0.375rem',
                    border: '1px solid var(--pink)',
                    padding: '0.5rem 0.75rem',
                    fontFamily: 'var(--font-sans)',
                    ...text.xl,
                    color: 'var(--pink)',
                  })}
                  rel="noreferrer"
                >
                  {t('shows.website')}
                </a>
              )}
            </div>
          </article>,
          {
            title: formatArtists(show),
          }
        );
      },
    },
  },
});
