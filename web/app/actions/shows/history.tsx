import { gql } from 'graphql-tag';
import { css, Frame, type Handle } from 'remix/component';

import { routes } from '#/routes.ts';
import type { ShowsGrid_ShowsFragment, ShowsHistoryQuery } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { Heading2 } from '#/ui/heading.tsx';
import { Link } from '#/ui/link.tsx';
import { text } from '#/ui/public/styles.ts';
import { YearSelect } from '#/ui/public/year-select.tsx';
import {
  Shows,
  ShowsListItems,
  ShowsTable,
  showsGridFragment,
  type ShowsView,
} from '#/ui/shows/shows.tsx';

/** How many shows the history loads at a time, newest first, as it scrolls */
export const HISTORY_PAGE_SIZE = 50;

// The first page, with how many shows there are and which years they're from
export const showsHistoryQuery = gql`
  query ShowsHistory($after: String, $first: Int, $year: Int) {
    shows(after: $after, attended: true, first: $first, year: $year) {
      ...ShowsGrid_shows
      count
      years
    }
  }
  ${showsGridFragment}
`;

// Each page after it, for the lazy frame at the end of the one before
export const showsHistoryPageQuery = gql`
  query ShowsHistoryPage($after: String, $first: Int, $year: Int) {
    shows(after: $after, attended: true, first: $first, year: $year) {
      ...ShowsGrid_shows
    }
  }
  ${showsGridFragment}
`;

/** Where the history goes on from a page that has another after it */
interface NextPage {
  year?: string;
  after: string;
  /** The page's last date, so the next doesn't head its year again */
  previous: number;
}

function nextPage(shows: ShowsGrid_ShowsFragment, year?: string): NextPage | undefined {
  const last = shows.edges.at(-1);
  if (!shows.pageInfo.hasNextPage || !last) {
    return undefined;
  }
  return { year, after: last.cursor, previous: last.node.date };
}

const moreStyle = css({ paddingBlock: '1.5rem', textAlign: 'center' });
const moreLink = css({
  ...text.sm,
  color: 'var(--pink)',
  textTransform: 'uppercase',
  textDecoration: 'underline',
});

/**
 * The next page, in a frame that loads as it nears the screen and adds the page after that the
 * same way. Until then, and without JavaScript, it's a link to that page.
 */
function MoreShows(handle: Handle<{ next: NextPage; view: ShowsView; label: string }>) {
  return () => {
    const { next, view, label } = handle.props;
    const { year, after, previous } = next;
    return (
      <Frame
        src={routes.shows.historyPage.href({ year, view }, { searchParams: { after, previous } })}
        loading="lazy"
        fallback={
          <p mix={moreStyle}>
            <a
              href={routes.shows.history.href({ year }, { searchParams: { after } })}
              mix={moreLink}
            >
              {label}
            </a>
          </p>
        }
      />
    );
  };
}

/** The shows we've been to, or one year's, a page at a time, and a menu of the years. */
export function HistoryPage(
  handle: Handle<{ shows: NonNullable<ShowsHistoryQuery['shows']>; year?: string }>
) {
  const { t } = getApp(handle);

  return () => {
    const { shows, year } = handle.props;
    const next = nextPage(shows, year);
    const count = shows.count ?? shows.edges.length;
    const years = (shows.years ?? []).map((choice) => ({
      year: choice,
      href: routes.shows.history.href({ year: String(choice) }),
    }));
    return (
      <article>
        <div
          mix={css({
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            columnGap: '1rem',
          })}
        >
          <Heading2>
            {year ? (
              <>
                <span mix={css({ color: 'var(--pink)' })}>{count}</span>{' '}
                {t('shows.attendedIn', { count, year })}
              </>
            ) : (
              t('shows.attended.heading')
            )}
          </Heading2>
          {years.length > 0 && (
            <YearSelect
              value={year ?? ''}
              placeholder={t('shows.byYear')}
              years={years}
              allHref={routes.shows.history.href()}
            />
          )}
        </div>
        {year && (
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
        )}
        <Shows
          shows={shows}
          showMonths={false}
          newestFirst
          more={(view) => next && <MoreShows next={next} view={view} label={t('shows.more')} />}
        />
      </article>
    );
  };
}

/**
 * A page of the history after the first, for the lazy frame at the end of the page before it: a
 * table under that page's table, or shows that go on in its list.
 */
export function HistoryRows(
  handle: Handle<{
    shows: ShowsGrid_ShowsFragment;
    view: ShowsView;
    year?: string;
    previous?: number;
    label: string;
  }>
) {
  return () => {
    const { shows, view, year, previous, label } = handle.props;
    const next = nextPage(shows, year);
    const more = next && <MoreShows next={next} view={view} label={label} />;
    return view === 'grid' ? (
      <>
        <ShowsTable shows={shows} showMonths={false} newestFirst previous={previous} />
        {more}
      </>
    ) : (
      <ShowsListItems shows={shows} previous={previous} more={more} />
    );
  };
}
