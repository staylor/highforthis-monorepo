import { gql } from 'graphql-tag';
import { createController } from 'remix/router';

import { routes } from '../../routes.ts';
import type {
  ShowQuery,
  ShowsHistoryQuery,
  ShowsQuery,
  ShowStatsQuery,
} from '../../types/graphql.ts';
import { Artwork } from '../../ui/artist.tsx';
import { Heading1, Heading2 } from '../../ui/heading.tsx';
import { Link } from '../../ui/link.tsx';
import { cn } from '../../ui/public/cn.ts';
import { Shows, ShowsList, showsGridFragment } from '../../ui/shows/shows.tsx';
import { formatDate } from '../../ui/shows/utils.ts';
import { prefetchRootData, renderPage } from '../render-page.tsx';

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
      artists {
        appleMusic {
          artwork {
            url
          }
          id
        }
        id
        name
        slug
      }
      date
      id
      title
      url
      venue {
        id
        name
        slug
      }
    }
  }
`;

const sizes = ['text-sm', 'text-md', 'text-lg', 'text-xl', 'text-2xl', 'text-3xl'];

function parseClasses(total: number, size: number) {
  const edge = sizes.length - 1;
  const className: Record<string, boolean> = {};
  for (let i = edge; i >= 0; i -= 1) {
    if (i === edge) {
      className[sizes[i]] = total >= i * size;
    } else if (i === 0) {
      className[sizes[i]] = total < size;
    } else {
      className[sizes[i]] = total >= i * size && total < (i + 1) * size;
    }
  }
  return className;
}

export default createController(routes.shows, {
  middleware: [prefetchRootData()],
  actions: {
    async index(context) {
      const { t } = context;
      const { shows } = await context.gql.query<ShowsQuery>(showsQuery, { first: 200 });
      return renderPage(
        context,
        <article>
          <Heading1>{t('shows.recommended')}</Heading1>
          <p class="mb-8 text-base text-muted dark:text-muted-dark">
            {t('shows.todaysDate')}:{' '}
            <strong class="text-neutral-900 dark:text-white">{formatDate().formatted}</strong>
          </p>
          {shows && <Shows shows={shows} />}
        </article>,
        { title: 'Shows' }
      );
    },

    async list(context) {
      const { shows } = await context.gql.query<ShowsQuery>(showsQuery, { first: 200 });
      return renderPage(context, shows ? <ShowsList shows={shows} /> : null, { title: 'Shows' });
    },

    async history(context) {
      const { t } = context;
      const { year } = context.params;
      const { shows } = await context.gql.query<ShowsHistoryQuery>(showsHistoryQuery, {
        first: 1000,
        year: year ? parseInt(year, 10) : undefined,
      });
      const count = shows?.edges.length ?? 0;
      return renderPage(
        context,
        <article>
          {year ? (
            <>
              <Heading2>
                <span class="text-pink">{count}</span> {t('shows.attendedIn', { count, year })}
              </Heading2>
              <p class="my-5">
                <Link
                  class="text-xl text-pink uppercase underline"
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
        return new Response('Not Found', { status: 404 });
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
        <article class="w-160 max-w-full">
          <Heading1>{t(`entity.stats.${entity}`)}</Heading1>
          <p class="mb-8">
            <Link
              href={routes.shows.stats.href({ entity: other })}
              class="mr-2 text-lg text-pink underline"
            >
              {t(`entity.stats.see.${other}`)}
            </Link>
            {' • '}
            <Link href={routes.shows.history.href()} class="ml-2 text-lg text-pink underline">
              {t('entity.stats.see.all')}
            </Link>
          </p>
          {Object.entries(buckets).map(([key, stats]) => (
            <ul key={key} class="mb-4">
              {stats.map((stat) => (
                <li key={stat.entity.id} class={cn(parseClasses(stat.count, size))}>
                  <Link href={`/${entity}/${stat.entity.slug}`} class="hover:underline">
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
      const { show } = await context.gql.query<ShowQuery>(showQuery, { id: context.params.id });
      if (!show) {
        return new Response('Not Found', { status: 404 });
      }
      const lastIndex = show.artists.length - 1;
      const d = formatDate(show.date);
      const ArtistHeading = show.title ? Heading2 : Heading1;
      const [artist] = show.artists;

      return renderPage(
        context,
        <article class="mx-auto text-center md:flex md:text-left">
          <div class="mt-3 mb-8 md:mr-8">
            <Artwork
              name={artist.name}
              data={artist.appleMusic || {}}
              class="mx-auto rounded-lg md:mx-0"
            />
          </div>
          <div class="md:mt-4">
            <p class="mb-3 text-lg">
              {d.monthName} {d.day}, {d.year} - {d.time}
            </p>
            {show.title && <Heading1>{show.title}</Heading1>}
            <ArtistHeading class="font-sans">
              {show.artists.map((artist, i) => (
                <Link
                  href={routes.artist.href({ slug: artist.slug })}
                  class={cn('block', { 'mb-1': i < lastIndex })}
                >
                  {artist.name} →
                </Link>
              ))}
            </ArtistHeading>
            <Heading2 class="mt-4">
              <Link href={routes.venue.href({ slug: show.venue.slug })} class="text-gray-400">
                {show.venue.name}
              </Link>
            </Heading2>
            {show.url && (
              <a
                href={show.url}
                target="_blank"
                class="my-2 inline-block rounded-md border border-pink px-3 py-2 font-sans text-xl text-pink"
                rel="noreferrer"
              >
                {t('shows.website')}
              </a>
            )}
          </div>
        </article>,
        { title: show.title || show.artists.map(({ name }) => name).join(' / ') }
      );
    },
  },
});
