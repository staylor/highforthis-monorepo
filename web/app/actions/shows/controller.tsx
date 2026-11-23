import { gql } from 'graphql-tag';
import { css } from 'remix/component';
import { createController } from 'remix/router';

import { prefetchRootData, renderNotFound, renderPage } from '#/actions/render-page.tsx';
import { isYear } from '#/lib/year.ts';
import { routes } from '#/routes.ts';
import type { ShowQuery, ShowsHistoryQuery, ShowsQuery, ShowStatsQuery } from '#/types/graphql.ts';
import { Artwork } from '#/ui/artist.tsx';
import { Heading1, Heading2 } from '#/ui/heading.tsx';
import { Link } from '#/ui/link.tsx';
import { md, text, type Styles } from '#/ui/public/styles.ts';
import { Shows, ShowsList, showsGridFragment } from '#/ui/shows/shows.tsx';
import { formatDate } from '#/ui/shows/utils.ts';

const showsQuery = gql`
  query Shows($after: String, $first: Int) {
    shows(after: $after, first: $first, latest: true) {
      ...ShowsGrid_shows
    }
  }
  ${showsGridFragment}
`;

const showsHistoryQuery = gql`
  query ShowsHistory($after: String, $first: Int, $year: Int) {
    shows(after: $after, attended: true, first: $first, year: $year) {
      ...ShowsGrid_shows
    }
  }
  ${showsGridFragment}
`;

const showStatsQuery = gql`
  query ShowStats($entity: ShowEntityType!) {
    showStats(entity: $entity) {
      count
      entity {
        ... on Artist {
          id
          name
          slug
        }
        ... on Venue {
          id
          name
          slug
        }
      }
    }
  }
`;

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

// Font sizes for names in the stats, larger the more shows they had. The second keeps the
// page's size.
const sizes: Styles[] = [text.sm, {}, text.lg, text.xl, text['2xl'], text['3xl']];

function sizeFor(total: number, size: number) {
  const edge = sizes.length - 1;
  if (total >= edge * size) {
    return sizes[edge];
  }
  return total < size ? sizes[0] : sizes[Math.floor(total / size)];
}

const statsLink = css({
  ...text.lg,
  color: 'var(--pink)',
  textDecoration: 'underline',
});

export default createController(routes.shows, {
  middleware: [prefetchRootData()],
  actions: {
    async index(context) {
      const { t } = context;
      const { shows } = await context.gql.query<ShowsQuery>(showsQuery, {
        first: 200,
      });
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
        { title: 'Shows' }
      );
    },

    async list(context) {
      const { shows } = await context.gql.query<ShowsQuery>(showsQuery, {
        first: 200,
      });
      return renderPage(context, shows ? <ShowsList shows={shows} /> : null, {
        title: 'Shows',
      });
    },

    async history(context) {
      const { t } = context;
      const { year } = context.params;
      if (year && !isYear(year)) {
        return renderNotFound(context);
      }
      const { shows } = await context.gql.query<ShowsHistoryQuery>(showsHistoryQuery, {
        first: 1000,
        year: year ? Number(year) : undefined,
      });
      const count = shows?.edges.length ?? 0;
      return renderPage(
        context,
        <article>
          {year ? (
            <>
              <Heading2>
                <span mix={css({ color: 'var(--pink)' })}>{count}</span>{' '}
                {t('shows.attendedIn', { count, year })}
              </Heading2>
              <p mix={css({ marginBlock: '1.25rem' })}>
                <Link
                  mix={css({
                    ...text.xl,
                    color: 'var(--pink)',
                    textTransform: 'uppercase',
                    textDecoration: 'underline',
                  })}
                  href={routes.shows.history.href()}
                >
                  {t('shows.viewFullHistory')}
                </Link>
              </p>
            </>
          ) : (
            <Heading2>{t('shows.attended.heading')}</Heading2>
          )}
          {shows && <Shows shows={shows} showMonths={false} />}
        </article>,
        { title: year ? `${year} Shows > History` : 'Shows > History' }
      );
    },

    async stats(context) {
      const { t } = context;
      const { entity } = context.params;
      if (entity !== 'artist' && entity !== 'venue') {
        return renderNotFound(context);
      }
      const { showStats } = await context.gql.query<ShowStatsQuery>(showStatsQuery, {
        entity: entity.toUpperCase(),
      });
      const buckets: Record<string, ShowStatsQuery['showStats']> = {};
      for (const stat of showStats ?? []) {
        (buckets[`bucket_${stat.count}`] ||= []).push(stat);
      }
      const other = entity === 'artist' ? 'venue' : 'artist';
      const total = showStats?.[0]?.count ?? 0;
      const size = (total - (total % sizes.length)) / sizes.length;

      return renderPage(
        context,
        <article mix={css({ width: '40rem', maxWidth: '100%' })}>
          <Heading1>{t(`entity.stats.${entity}`)}</Heading1>
          <p mix={css({ marginBottom: '2rem' })}>
            <Link
              href={routes.shows.stats.href({ entity: other })}
              mix={[statsLink, css({ marginRight: '0.5rem' })]}
            >
              {t(`entity.stats.see.${other}`)}
            </Link>
            {' • '}
            <Link
              href={routes.shows.history.href()}
              mix={[statsLink, css({ marginLeft: '0.5rem' })]}
            >
              {t('entity.stats.see.all')}
            </Link>
          </p>
          {Object.entries(buckets).map(([key, stats]) => (
            <ul key={key} mix={css({ marginBottom: '1rem' })}>
              {stats.map((stat) => (
                <li key={stat.entity.id} mix={css(sizeFor(stat.count, size))}>
                  <Link
                    href={`/${entity}/${stat.entity.slug}`}
                    mix={css({ '&:hover': { textDecoration: 'underline' } })}
                  >
                    {stat.entity.name}
                  </Link>
                  {' - '}
                  {stat.count}
                </li>
              ))}
            </ul>
          ))}
        </article>,
        { title: t(`entity.stats.${entity}`) }
      );
    },

    async show(context) {
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
            <Artwork
              name={artist.name}
              data={artist.appleMusic || {}}
              styles={{
                marginInline: 'auto',
                borderRadius: '0.5rem',
                [md]: { marginLeft: 0 },
              }}
            />
          </div>
          <div mix={css({ [md]: { marginTop: '1rem' } })}>
            <p mix={css({ marginBottom: '0.75rem', ...text.lg })}>
              {d.monthName} {d.day}, {d.year} - {d.time}
            </p>
            {show.title && <Heading1>{show.title}</Heading1>}
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
          title: show.title || show.artists.map(({ name }) => name).join(' / '),
        }
      );
    },
  },
});
