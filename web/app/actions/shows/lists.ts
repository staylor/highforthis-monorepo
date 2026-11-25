import { gql } from 'graphql-tag';

import type { GraphQLClient } from '#/lib/graphql.ts';
import { everyPage, withEveryPage } from '#/lib/paging.ts';
import type {
  Attended_ShowsFragment,
  AttendedShowsQuery,
  ShowsGrid_ShowsFragment,
  ShowsQuery,
} from '#/types/graphql.ts';
import { attendedFragment, showsGridFragment } from '#/ui/shows/shows.tsx';

// Lists of shows with nowhere to show a next page, which load every page after the first instead

const upcomingShowsQuery = gql`
  query Shows($after: String, $artist: EntityArg, $first: Int, $venue: EntityArg) {
    shows(after: $after, artist: $artist, first: $first, latest: true, venue: $venue) {
      ...ShowsGrid_shows
    }
  }
  ${showsGridFragment}
`;

const attendedShowsQuery = gql`
  query AttendedShows($after: String, $artist: EntityArg, $first: Int, $venue: EntityArg) {
    shows(after: $after, artist: $artist, attended: true, first: $first, venue: $venue) {
      ...Attended_shows
    }
  }
  ${attendedFragment}
`;

/** How many shows a page asks for */
const PAGE_SIZE = 200;

/** Whose shows: an artist's or a venue's, by slug */
interface ShowsOf {
  artist?: { slug: string };
  venue?: { slug: string };
}

/** Every show coming up */
export function everyUpcomingShow(gql: GraphQLClient) {
  return everyPage(
    async (after) =>
      (await gql.query<ShowsQuery>(upcomingShowsQuery, { after, first: PAGE_SIZE })).shows
  );
}

/** A page of an artist's or a venue's shows coming up, with every page after it */
export function withEveryUpcomingShow(
  gql: GraphQLClient,
  page: ShowsGrid_ShowsFragment,
  of: ShowsOf
) {
  return withEveryPage(
    page,
    async (after) =>
      (await gql.query<ShowsQuery>(upcomingShowsQuery, { ...of, after, first: PAGE_SIZE })).shows
  );
}

/** A page of the shows we've been to of an artist or at a venue, with every page after it */
export function withEveryAttendedShow(
  gql: GraphQLClient,
  page: Attended_ShowsFragment,
  of: ShowsOf
) {
  return withEveryPage(
    page,
    async (after) =>
      (await gql.query<AttendedShowsQuery>(attendedShowsQuery, { ...of, after, first: PAGE_SIZE }))
        .shows
  );
}
