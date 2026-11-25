import { gql } from 'graphql-tag';
import { css, type Handle, type MixInput, type RemixNode } from 'remix/component';

import { routes } from '#/routes.ts';
import type { Attended_ShowsFragment, ShowsGrid_ShowsFragment } from '#/types/graphql.ts';
import { getApp } from '#/ui/app-context.tsx';
import { Link } from '#/ui/link.tsx';
import { colorTransition, label, md, pinkLink, sm, text, xs } from '#/ui/public/styles.ts';
import { SectionHeader } from '#/ui/section-header.tsx';
import { trans } from '#/ui/trans.tsx';

import { Headliner } from './headliner.tsx';
import { cell, formatArtists, formatDate, formatShowLink, row } from './utils.ts';

export const showsGridFragment = gql`
  fragment ShowsGrid_shows on ShowConnection {
    edges {
      cursor
      node {
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
    pageInfo {
      hasNextPage
    }
  }
`;

export const attendedFragment = gql`
  fragment Attended_shows on ShowConnection {
    count
    edges {
      cursor
      node {
        id
        date
        title
        url
        artists {
          id
          name
          slug
        }
        venue {
          id
          city
          name
          slug
          state
        }
      }
    }
    pageInfo {
      hasNextPage
    }
  }
`;

type ShowEdge = ShowsGrid_ShowsFragment['edges'][number];

/** The two ways shows are laid out: a table, or a list on the narrowest screens */
export type ShowsView = 'grid' | 'list';

interface ListProps {
  shows: ShowsGrid_ShowsFragment;
  /**
   * When the show before these was, for a page of the history that goes on from the one before
   * it, so it doesn't head a year or month again
   */
  previous?: number;
  /** What follows the shows: the history's lazy frame for its next page */
  more?: RemixNode;
  /** Without each show's venue: on the venue's own page, every show's is the same */
  hideVenue?: boolean;
  mix?: MixInput;
}

interface GridProps extends ListProps {
  showMonths?: boolean;
  /** Most recent first, as the history goes, rather than soonest first */
  newestFirst?: boolean;
}

/** The years and months that have their heading already: the previous show's, if there is one */
function headed(previous?: number) {
  const years: Record<number, number> = {};
  const months: Record<string, number> = {};
  if (previous !== undefined) {
    const d = formatDate(previous);
    years[d.year] = 1;
    months[`${d.year}${d.month}`] = 1;
  }
  return { years, months };
}

/** By date, and shows on the same date by their first artist */
const byDate =
  (newestFirst: boolean) =>
  ({ node: a }: ShowEdge, { node: b }: ShowEdge) => {
    if (a.date === b.date) {
      const artistA = a.artists[0]?.name ?? '';
      const artistB = b.artists[0]?.name ?? '';
      if (artistA === artistB) {
        return 0;
      }
      return artistA < artistB ? -1 : 1;
    }
    const soonestFirst = a.date < b.date ? -1 : 1;
    return newestFirst ? -soonestFirst : soonestFirst;
  };

const table = css({ width: '100%', borderCollapse: 'collapse' });
const rowStyle = css(row);
const cellStyle = css(cell);
const dateCell = css({
  ...cell,
  color: 'var(--muted)',
  width: '4rem',
  fontVariantNumeric: 'tabular-nums',
  [md]: { width: '6rem' },
});
// The venue gets its own column from the sm breakpoint, and goes under the show below it. The
// column is always the same share of the width, so each page of the history's table lines up
// with the one before it.
const venueCell = css({
  ...cell,
  color: 'var(--muted)',
  display: 'none',
  textTransform: 'uppercase',
  [sm]: { display: 'table-cell', width: '40%' },
});
const venueBelow = css({
  display: 'block',
  ...text.xs,
  color: 'var(--muted)',
  [sm]: { display: 'none' },
});
// The main artist's picture, then the show and, on narrow screens, its venue under it
const showCell = css({ display: 'flex', alignItems: 'center', gap: '0.75rem' });
const spacer = css({ height: '0.5rem' });
// A row's show is its link in pink, and anything else it links to takes pink when hovered
const showLink = css(pinkLink);
const plainLink = css({
  ...colorTransition,
  '&:hover': { color: 'var(--pink)' },
});

/**
 * Shows as a table on wider screens and a list on the narrowest. Each layout has its own `more`,
 * and only the one on screen gets near enough to the viewport to load a lazy frame.
 */
export function Shows(
  handle: Handle<
    Omit<GridProps, 'mix' | 'more'> & { more?: (view: ShowsView) => RemixNode | undefined }
  >
) {
  return () => {
    const { shows, showMonths = true, newestFirst, previous, more, hideVenue } = handle.props;
    if (!shows?.edges?.length) {
      return null;
    }
    return (
      <>
        <ShowsGrid
          shows={shows}
          showMonths={showMonths}
          newestFirst={newestFirst}
          previous={previous}
          more={more?.('grid')}
          hideVenue={hideVenue}
          mix={css({ display: 'none', [xs]: { display: 'block' } })}
        />
        <ShowsList
          shows={shows}
          previous={previous}
          more={more?.('list')}
          hideVenue={hideVenue}
          mix={css({ display: 'block', [xs]: { display: 'none' } })}
        />
      </>
    );
  };
}

const monthCell = css({ ...cell, ...label, paddingBlock: '0.5rem' });

function monthHeader(name: string, columns: number) {
  return [
    <tr>
      <td colSpan={columns} mix={spacer} />
    </tr>,
    <tr
      mix={css({
        backgroundColor: 'light-dark(var(--neutral-100), var(--surface-dark-card))',
      })}
    >
      <td colSpan={columns} mix={monthCell}>
        {name}
      </td>
    </tr>,
    <tr>
      <td colSpan={columns} mix={spacer} />
    </tr>,
  ];
}

const yearCell = css({
  ...cell,
  paddingTop: 0,
  fontWeight: 700,
  color: 'light-dark(var(--neutral-900), #fff)',
});

export function ShowsGrid(handle: Handle<GridProps>) {
  return () => {
    const { mix, more, ...shows } = handle.props;
    return (
      <div mix={mix}>
        <ShowsTable {...shows} />
        {more}
      </div>
    );
  };
}

/**
 * The table, which a page of the history adds after the page before it. A frame can't add rows to
 * that page's table instead: Remix parses a frame's HTML in a template, and the head that brings
 * the rows' styles takes the parser out of the table, so it drops the rows' tags.
 */
export function ShowsTable(handle: Handle<Omit<GridProps, 'mix' | 'more'>>) {
  return () => {
    const { shows, showMonths = true, newestFirst = false, previous, hideVenue } = handle.props;
    const { years, months } = headed(previous);
    const sorted = [...shows.edges].sort(byDate(newestFirst));
    // The date, the show and, unless it's left out, the venue
    const columns = hideVenue ? 2 : 3;

    const rows: RemixNode[] = [];
    for (const { node } of sorted) {
      const d = formatDate(node.date);
      if (!years[d.year]) {
        const firstYear = Object.keys(years).length === 0;
        years[d.year] = 1;
        months[`${d.year}${d.month}`] = 1;
        if (!firstYear) {
          rows.push(
            <tr>
              <td colSpan={columns}>
                <div mix={css({ marginTop: '1rem', height: '0.5rem' })} />
              </td>
            </tr>
          );
        }
        rows.push(
          <tr>
            <td colSpan={columns} mix={yearCell}>
              {d.year}
            </td>
          </tr>
        );
        if (showMonths) {
          rows.push(...monthHeader(d.monthName, columns));
        }
      } else if (showMonths && !months[`${d.year}${d.month}`]) {
        months[`${d.year}${d.month}`] = 1;
        rows.push(...monthHeader(d.monthName, columns));
      }
      rows.push(
        <tr key={node.id} mix={rowStyle}>
          <td mix={dateCell}>{d.formatted}</td>
          <td mix={cellStyle}>
            <div mix={showCell}>
              <Headliner show={node} size="sm" />
              <div>
                <Link mix={showLink} href={formatShowLink(node)}>
                  {formatArtists(node)}
                </Link>
                {!hideVenue && <span mix={venueBelow}>{node.venue.name}</span>}
              </div>
            </div>
          </td>
          {!hideVenue && (
            <td mix={venueCell}>
              <Link mix={plainLink} href={routes.venue.href({ slug: node.venue.slug })}>
                {node.venue.name}
              </Link>
            </td>
          )}
        </tr>
      );
    }

    return (
      <table mix={table}>
        <tbody>{rows}</tbody>
      </table>
    );
  };
}

export function ShowsList(handle: Handle<ListProps>) {
  return () => {
    const { mix, ...items } = handle.props;
    return (
      <article mix={mix}>
        <ShowsListItems {...items} />
      </article>
    );
  };
}

// The main artist's picture beside the show's date, name and venue
const listRow = css({
  marginBottom: '0.5rem',
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem',
});

/** The list's shows, which a page of the history adds to the list it goes on from */
export function ShowsListItems(handle: Handle<Omit<ListProps, 'mix'>>) {
  return () => {
    const { shows, previous, more, hideVenue } = handle.props;
    const { years, months } = headed(previous);
    return (
      <>
        {shows.edges.map(({ node }) => {
          const d = formatDate(node.date);
          const showRow = (
            <div mix={listRow}>
              <Headliner show={node} />
              <p mix={css(text.sm)}>
                <strong mix={css({ fontVariantNumeric: 'tabular-nums' })}>{d.formatted}</strong>
                <br />
                <Link mix={showLink} href={formatShowLink(node)}>
                  {formatArtists(node)}
                </Link>
                {!hideVenue && (
                  <>
                    <br />
                    <span mix={css({ color: 'var(--muted)' })}>{node.venue.name}</span>
                  </>
                )}
              </p>
            </div>
          );

          if (!years[d.year]) {
            years[d.year] = 1;
            months[`${d.year}${d.month}`] = 1;
            return (
              <div key={node.id}>
                <p mix={css({ marginBottom: '0.25rem' })}>
                  <strong mix={css(text.lg)}>{d.year}</strong>
                </p>
                <p mix={css({ marginBottom: '0.25rem', ...label })}>{d.monthName}</p>
                {showRow}
              </div>
            );
          }
          if (!months[`${d.year}${d.month}`]) {
            months[`${d.year}${d.month}`] = 1;
            return (
              <div key={node.id}>
                <p mix={css({ marginBlock: '0.75rem 0.25rem', ...label })}>{d.monthName}</p>
                {showRow}
              </div>
            );
          }
          return <div key={node.id}>{showRow}</div>;
        })}
        {more}
      </>
    );
  };
}

// How many shows, in the sentence that says whose they are
const counted = css({ fontWeight: 700, color: 'light-dark(var(--neutral-900), #fff)' });
const borderedRow = css({
  ...row,
  borderBottom: '1px solid var(--card-border)',
  '&:last-child': { borderBottom: 0 },
});

/** The shows we've been to by an artist or at a venue, under a link to the stats for all of them. */
export function Attended(
  handle: Handle<{
    shows: Attended_ShowsFragment;
    relation: 'artist' | 'venue';
  }>
) {
  const { t } = getApp(handle);

  return () => {
    const { shows, relation } = handle.props;
    if (!shows?.edges?.length) {
      return null;
    }
    return (
      <section mix={css({ marginTop: '3rem' })}>
        <SectionHeader
          label={t('shows.attended.label')}
          viewAllLink={routes.shows.stats.href({ entity: relation })}
          viewAllText={t('entity.stats.view')}
          note={trans(
            t,
            `shows.attended.${relation}`,
            { count: shows.count ?? shows.edges.length },
            { Bold: (children) => <span mix={counted}>{children}</span> }
          )}
        />
        <table mix={table}>
          <tbody>
            {shows.edges.map(({ node }) => {
              const d = formatDate(node.date);
              const place = [node.venue.city, node.venue.state].filter(Boolean).join(', ');
              return (
                <tr key={node.id} mix={borderedRow}>
                  <td mix={dateCell}>
                    {d.formatted}/{d.year}
                  </td>
                  <td mix={cellStyle}>
                    <Link
                      mix={showLink}
                      href={
                        relation === 'artist'
                          ? routes.venue.href({ slug: node.venue.slug })
                          : formatShowLink(node)
                      }
                    >
                      {relation === 'artist' ? node.venue.name : formatArtists(node)}
                    </Link>
                    {relation === 'artist' && <span mix={venueBelow}>{place}</span>}
                  </td>
                  {relation === 'artist' && <td mix={venueCell}>{place}</td>}
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    );
  };
}
