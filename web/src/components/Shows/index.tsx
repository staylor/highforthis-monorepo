import type { ShowConnection } from '~/types/graphql';

import ShowsGrid from './Grid';
import ShowsList from './List';

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
        className="xs:block hidden"
      />
      <ShowsList shows={shows} className="xs:hidden block" />
    </>
  );
}

Shows.fragments = ShowsGrid.fragments;

export default Shows;
