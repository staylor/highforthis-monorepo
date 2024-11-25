import ShowsGrid from './Grid';
import ShowsList from './List';

import type { ShowConnection } from '@/types/graphql';

function Shows({
  shows,
  showMonths = true,
  showYears = true,
}: {
  shows: ShowConnection;
  showMonths?: boolean;
  showYears?: boolean;
}) {
  if (!shows || !shows.edges || shows.edges.length === 0) {
    return null;
  }

  return (
    <>
      <ShowsGrid
        shows={shows}
        showMonths={showMonths}
        showYears={showYears}
        className="hidden xs:block"
      />
      <ShowsList shows={shows} className="block xs:hidden" />
    </>
  );
}

Shows.fragments = ShowsGrid.fragments;

export default Shows;
