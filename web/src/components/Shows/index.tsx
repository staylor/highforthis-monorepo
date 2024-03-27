import type { ShowConnection } from '@/types/graphql';

import ShowsList from './List';
import ShowsGrid from './Grid';

function Shows({ shows }: { shows: ShowConnection }) {
  return (
    <>
      <ShowsGrid shows={shows} className="hidden xs:block" />
      <ShowsList shows={shows} className="block xs:hidden" />
    </>
  );
}

Shows.fragments = ShowsGrid.fragments;

export default Shows;
