import { gql } from 'graphql-tag';
import { css, type Handle, type MixInput, type RemixNode } from 'remix/component';

import type { Attended_ShowsFragment, ShowsGrid_ShowsFragment } from '../../types/graphql.ts';
import { getApp } from '../app-context.tsx';
import { Link } from '../link.tsx';
import { colorTransition, md, sm, text, xs } from '../public/styles.ts';
import { trans } from '../trans.tsx';

import { cell, formatArtists, formatDate, formatShowLink, row } from './utils.ts';

export const showsGridFragment = gql`
  fragment ShowsGrid_shows on ShowConnection {
    edges {
      cursor
      node {
        artists {
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
    pageInfo {
      hasNextPage
    }
  }
`;

export const attendedFragment = gql`
  fragment Attended_shows on ShowConnection {
    edges {
      node {
        artists {
          id
          name
          slug
        }
        date
        id
        title
        url
        venue {
          city
          id
          name
          slug
          state
        }
      }
    }
  }
`;

type GridProps = {
  shows: ShowsGrid_ShowsFragment;
  mix?: MixInput;
  showMonths?: boolean;
  showYears?: boolean;
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
// The venue gets its own column from the sm breakpoint, and goes under the show below it
const venueCell = css({
  ...cell,
  color: 'var(--muted)',
  display: 'none',
  textTransform: 'uppercase',
  [sm]: { display: 'table-cell' },
});
const venueBelow = css({
  display: 'block',
  ...text.xs,
  color: 'var(--muted)',
  [sm]: { display: 'none' },
});
const spacer = css({ height: '0.5rem' });
const pinkLink = css({
  color: 'var(--pink)',
  '&:hover': { textDecoration: 'underline' },
});
const plainLink = css({
  ...colorTransition,
  '&:hover': { color: 'var(--pink)' },
});
const monthName = {
  ...text.xs,
  fontWeight: 600,
  letterSpacing: '0.05em',
  color: 'var(--muted)',
  textTransform: 'uppercase',
};

/** Shows as a table on wider screens and a list on the narrowest. */
export function Shows(handle: Handle<Omit<GridProps, 'mix'>>) {
  return () => {
    const { shows, showMonths = true, showYears = true } = handle.props;
    if (!shows?.edges?.length) {
      return null;
    }
    return (
      <>
        <ShowsGrid
          shows={shows}
          showMonths={showMonths}
          showYears={showYears}
          mix={css({ display: 'none', [xs]: { display: 'block' } })}
        />
        <ShowsList shows={shows} mix={css({ display: 'block', [xs]: { display: 'none' } })} />
      </>
    );
  };
}

const monthCell = css({ ...cell, ...monthName, paddingBlock: '0.5rem' });

function monthHeader(name: string) {
  return [
    <tr>
      <td colSpan={3} mix={spacer} />
    </tr>,
    <tr
      mix={css({
        backgroundColor: 'light-dark(var(--neutral-100), var(--surface-dark-card))',
      })}
    >
      <td colSpan={3} mix={monthCell}>
        {name}
      </td>
    </tr>,
    <tr>
      <td colSpan={3} mix={spacer} />
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
    const { shows, showMonths = true, showYears = true } = handle.props;
    const years: Record<number, number> = {};
    const months: Record<string, number> = {};
    const sorted = [...shows.edges].sort(({ node: a }, { node: b }) => {
      if (a.date === b.date) {
        const artistA = a.artists[0].name;
        const artistB = b.artists[0].name;
        if (artistA === artistB) {
          return 0;
        }
        return artistA < artistB ? -1 : 1;
      }
      return a.date < b.date ? -1 : 1;
    });

    const rows: RemixNode[] = [];
    for (const { node } of sorted) {
      const d = formatDate(node.date);
      if (showYears && !years[d.year]) {
        const firstYear = Object.keys(years).length === 0;
        years[d.year] = 1;
        months[`${d.year}${d.month}`] = 1;
        if (!firstYear) {
          rows.push(
            <tr>
              <td colSpan={3}>
                <div mix={css({ marginTop: '1rem', height: '0.5rem' })} />
              </td>
            </tr>
          );
        }
        rows.push(
          <tr>
            <td colSpan={3} mix={yearCell}>
              {d.year}
            </td>
          </tr>
        );
        if (showMonths) {
          rows.push(...monthHeader(d.monthName));
        }
      } else if (showMonths && !months[`${d.year}${d.month}`]) {
        months[`${d.year}${d.month}`] = 1;
        rows.push(...monthHeader(d.monthName));
      }
      rows.push(
        <tr key={node.id} mix={rowStyle}>
          <td mix={dateCell}>{d.formatted}</td>
          <td mix={cellStyle}>
            <Link mix={pinkLink} href={formatShowLink(node)}>
              {formatArtists(node)}
            </Link>
            <span mix={venueBelow}>{node.venue.name}</span>
          </td>
          <td mix={venueCell}>
            <Link mix={plainLink} href={`/venue/${node.venue.slug}`}>
              {node.venue.name}
            </Link>
          </td>
        </tr>
      );
    }

    return (
      <div mix={handle.props.mix}>
        <table mix={table}>
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };
}

export function ShowsList(handle: Handle<{ shows: ShowsGrid_ShowsFragment; mix?: MixInput }>) {
  return () => {
    const years: Record<number, number> = {};
    const months: Record<string, number> = {};
    return (
      <article mix={handle.props.mix}>
        {handle.props.shows.edges.map(({ node }) => {
          const d = formatDate(node.date);
          const showRow = (
            <p mix={css({ marginBottom: '0.5rem', ...text.sm })}>
              <strong mix={css({ fontVariantNumeric: 'tabular-nums' })}>{d.formatted}</strong>
              <br />
              <Link mix={css({ color: 'var(--pink)' })} href={formatShowLink(node)}>
                {formatArtists(node)}
              </Link>
              <br />
              <span mix={css({ color: 'var(--muted)' })}>{node.venue.name}</span>
            </p>
          );

          if (!years[d.year]) {
            years[d.year] = 1;
            months[`${d.year}${d.month}`] = 1;
            return (
              <div key={node.id}>
                <p mix={css({ marginBottom: '0.25rem' })}>
                  <strong mix={css(text.lg)}>{d.year}</strong>
                </p>
                <p mix={css({ marginBottom: '0.25rem', ...monthName })}>{d.monthName}</p>
                {showRow}
              </div>
            );
          }
          if (!months[`${d.year}${d.month}`]) {
            months[`${d.year}${d.month}`] = 1;
            return (
              <div key={node.id}>
                <p mix={css({ marginBlock: '0.75rem 0.25rem', ...monthName })}>{d.monthName}</p>
                {showRow}
              </div>
            );
          }
          return <div key={node.id}>{showRow}</div>;
        })}
      </article>
    );
  };
}

const underline = css({ textDecoration: 'underline' });
const borderedRow = css({
  ...row,
  borderBottom: '1px solid var(--card-border)',
  '&:last-child': { borderBottom: 0 },
});
const underlinedLink = css({
  ...colorTransition,
  '&:hover': { color: 'var(--pink)', textDecoration: 'underline' },
});

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
      <article mix={css({ marginTop: '3rem' })}>
        <p mix={css({ marginBottom: '0.75rem', ...text.sm })}>
          <Link href={`/shows/stats/${relation}`} mix={pinkLink}>
            {trans(
              t,
              `shows.attended.${relation}`,
              { count: shows.edges.length },
              { Bold: (children) => <span mix={underline}>{children}</span> }
            )}
          </Link>
          :
        </p>
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
                      mix={underlinedLink}
                      href={
                        relation === 'artist' ? `/venue/${node.venue.slug}` : formatShowLink(node)
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
      </article>
    );
  };
}
