import { gql } from 'graphql-tag';
import type { Handle, RemixNode } from 'remix/component';

import type { Attended_ShowsFragment, ShowsGrid_ShowsFragment } from '../../types/graphql.ts';
import { getApp } from '../app-context.tsx';
import { Link } from '../link.tsx';
import { cn } from '../public/cn.ts';
import { trans } from '../trans.tsx';

import {
  cellBase,
  formatArtists,
  formatDate,
  formatShowLink,
  rowBorder,
  rowHover,
} from './utils.ts';

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
  class?: string;
  showMonths?: boolean;
  showYears?: boolean;
};

/** Shows as a table on wider screens and a list on the narrowest. */
export function Shows(handle: Handle<Omit<GridProps, 'class'>>) {
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
          class="hidden xs:block"
        />
        <ShowsList shows={shows} class="block xs:hidden" />
      </>
    );
  };
}

function monthHeader(cellClass: string, monthName: string) {
  return [
    <tr>
      <td colSpan={3} class="h-2" />
    </tr>,
    <tr class="bg-neutral-100 dark:bg-surface-dark-card">
      <td
        colSpan={3}
        class={cn(
          cellClass,
          'text-muted dark:text-muted-dark py-2 text-xs font-semibold tracking-wider uppercase'
        )}
      >
        {monthName}
      </td>
    </tr>,
    <tr>
      <td colSpan={3} class="h-2" />
    </tr>,
  ];
}

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
    const headerCell = cn(cellBase, 'font-bold text-neutral-900 dark:text-white');

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
                <div class="mt-4 h-2" />
              </td>
            </tr>
          );
        }
        rows.push(
          <tr>
            <td colSpan={3} class={cn(headerCell, 'pt-6 text-lg first:pt-0')}>
              {d.year}
            </td>
          </tr>
        );
        if (showMonths) {
          rows.push(...monthHeader(cellBase, d.monthName));
        }
      } else if (showMonths && !months[`${d.year}${d.month}`]) {
        months[`${d.year}${d.month}`] = 1;
        rows.push(...monthHeader(cellBase, d.monthName));
      }
      rows.push(
        <tr key={node.id} class={rowHover}>
          <td class={cn(cellBase, 'text-muted dark:text-muted-dark w-16 tabular-nums md:w-24')}>
            {d.formatted}
          </td>
          <td class={cellBase}>
            <Link class="text-pink hover:underline" href={formatShowLink(node)}>
              {formatArtists(node)}
            </Link>
            <span class="block text-xs text-muted sm:hidden dark:text-muted-dark">
              {node.venue.name}
            </span>
          </td>
          <td
            class={cn(cellBase, 'text-muted dark:text-muted-dark hidden uppercase sm:table-cell')}
          >
            <Link class="transition-colors hover:text-pink" href={`/venue/${node.venue.slug}`}>
              {node.venue.name}
            </Link>
          </td>
        </tr>
      );
    }

    return (
      <div class={handle.props.class}>
        <table class="w-full border-collapse">
          <tbody>{rows}</tbody>
        </table>
      </div>
    );
  };
}

export function ShowsList(handle: Handle<{ shows: ShowsGrid_ShowsFragment; class?: string }>) {
  return () => {
    const years: Record<number, number> = {};
    const months: Record<string, number> = {};
    return (
      <article class={handle.props.class}>
        {handle.props.shows.edges.map(({ node }) => {
          const d = formatDate(node.date);
          const showRow = (
            <p class="mb-2 text-sm">
              <strong class="tabular-nums">{d.formatted}</strong>
              <br />
              <Link class="text-pink" href={formatShowLink(node)}>
                {formatArtists(node)}
              </Link>
              <br />
              <span class="text-muted dark:text-muted-dark">{node.venue.name}</span>
            </p>
          );

          if (!years[d.year]) {
            years[d.year] = 1;
            months[`${d.year}${d.month}`] = 1;
            return (
              <div key={node.id}>
                <p class="mt-4 mb-1 first:mt-0">
                  <strong class="text-lg">{d.year}</strong>
                </p>
                <p class="mb-1 text-xs font-semibold tracking-wider text-muted uppercase dark:text-muted-dark">
                  {d.monthName}
                </p>
                {showRow}
              </div>
            );
          }
          if (!months[`${d.year}${d.month}`]) {
            months[`${d.year}${d.month}`] = 1;
            return (
              <div key={node.id}>
                <p class="mt-3 mb-1 text-xs font-semibold tracking-wider text-muted uppercase dark:text-muted-dark">
                  {d.monthName}
                </p>
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

export function Attended(
  handle: Handle<{ shows: Attended_ShowsFragment; relation: 'artist' | 'venue'; class?: string }>
) {
  const { t } = getApp(handle);

  return () => {
    const { shows, relation } = handle.props;
    if (!shows?.edges?.length) {
      return null;
    }
    return (
      <article class={handle.props.class || 'mt-12'}>
        <p class="mb-3 text-sm">
          <Link href={`/shows/stats/${relation}`} class="text-pink hover:underline">
            {trans(
              t,
              `shows.attended.${relation}`,
              { count: shows.edges.length },
              { Bold: (children) => <span class="underline">{children}</span> }
            )}
          </Link>
          :
        </p>
        <table class="w-full border-collapse">
          <tbody>
            {shows.edges.map(({ node }) => {
              const d = formatDate(node.date);
              const place = [node.venue.city, node.venue.state].filter(Boolean).join(', ');
              return (
                <tr key={node.id} class={cn(rowHover, rowBorder)}>
                  <td
                    class={cn(
                      cellBase,
                      'text-muted dark:text-muted-dark w-16 tabular-nums md:w-24'
                    )}
                  >
                    {d.formatted}/{d.year}
                  </td>
                  <td class={cellBase}>
                    <Link
                      class="transition-colors hover:text-pink hover:underline"
                      href={
                        relation === 'artist' ? `/venue/${node.venue.slug}` : formatShowLink(node)
                      }
                    >
                      {relation === 'artist' ? node.venue.name : formatArtists(node)}
                    </Link>
                    {relation === 'artist' && (
                      <span class="block text-xs text-muted sm:hidden dark:text-muted-dark">
                        {place}
                      </span>
                    )}
                  </td>
                  {relation === 'artist' && (
                    <td
                      class={cn(
                        cellBase,
                        'text-muted dark:text-muted-dark hidden uppercase sm:table-cell'
                      )}
                    >
                      {place}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </article>
    );
  };
}
