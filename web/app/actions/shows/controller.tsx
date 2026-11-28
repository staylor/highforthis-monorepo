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
import { Billing } from '#/ui/artist.tsx';
import { Link } from '#/ui/link.tsx';
import { PageHeader } from '#/ui/page-header.tsx';
import { colorTransition, pinkButton, text } from '#/ui/public/styles.ts';
import { ShowsNav } from '#/ui/shows/nav.tsx';
import { Shows, ShowsList } from '#/ui/shows/shows.tsx';
import { formatArtists, formatSchedule, formatToday } from '#/ui/shows/utils.ts';

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
      schedule {
        localDate
        localTime
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
            <PageHeader
              display
              eyebrow={t('shows.today', { date: formatToday() })}
              title={t('shows.recommended')}
              nav={<ShowsNav />}
            />
            {shows?.edges.length ? (
              <Shows shows={shows} />
            ) : (
              <p mix={css({ ...text.sm, color: 'var(--muted)' })}>{t('shows.noRecommended')}</p>
            )}
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
            previous={
              Number.isSafeInteger(previous) && Math.abs(previous) <= 8640000000000000
                ? previous
                : undefined
            }
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
        const d = formatSchedule(show.schedule);
        const [artist] = show.artists;
        // Each artist on a line, linking to their page
        const artists = show.artists.map((each) => (
          <Link
            href={routes.artist.href({ slug: each.slug })}
            mix={css({ display: 'block', color: 'inherit', '&:hover': { color: 'var(--pink)' } })}
          >
            {each.name} →
          </Link>
        ));
        // Where it is, which is also what a show without a title or artists goes by
        const venue = (
          <Link
            href={routes.venue.href({ slug: show.venue.slug })}
            mix={css({ color: 'inherit', ...colorTransition, '&:hover': { color: 'var(--pink)' } })}
          >
            {show.venue.name}
          </Link>
        );
        const named = Boolean(show.title) || artists.length > 0;

        return renderPage(
          context,
          <article>
            <Billing name={artist?.name} data={artist?.appleMusic}>
              <PageHeader
                eyebrow={`${d.weekday}, ${d.monthName} ${d.day}, ${d.year}${d.time ? ' · ' + d.time : ''}`}
                title={show.title || (artists.length > 0 ? artists : venue)}
                styles={{ marginBottom: '1rem' }}
              />
              {show.title && artists.length > 0 && (
                <h2 mix={css({ marginBottom: '1rem', ...text.xl, fontWeight: 700 })}>{artists}</h2>
              )}
              {named && (
                <p mix={css({ ...text.xl, fontWeight: 600, color: 'var(--muted)' })}>{venue}</p>
              )}
              {show.url && (
                <a
                  href={show.url}
                  target="_blank"
                  rel="noreferrer"
                  mix={css({ ...pinkButton, marginTop: '1.5rem' })}
                >
                  {t('shows.website')} →
                </a>
              )}
            </Billing>
          </article>,
          {
            title: formatArtists(show),
          }
        );
      },
    },
  },
});
