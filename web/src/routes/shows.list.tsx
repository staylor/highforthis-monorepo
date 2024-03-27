import { useLoaderData } from '@remix-run/react';

import ShowsList from '@/components/Shows/List';
import type { ShowConnection, ShowsQuery } from '@/types/graphql';

export { loader, meta } from './shows._index';

function List() {
  const data = useLoaderData<ShowsQuery>();
  const shows = data.shows as ShowConnection;
  return <ShowsList shows={shows} />;
}

export default List;
