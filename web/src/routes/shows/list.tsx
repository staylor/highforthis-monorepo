import ShowsList from '~/components/Shows/List';

import type { Route } from './+types/list';

export { loader, meta } from '.';

function List({ loaderData }: Route.ComponentProps) {
  return <ShowsList shows={loaderData.shows} />;
}

export default List;
