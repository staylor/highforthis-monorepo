import ShowsList from '~/components/Shows/List';

import type { Route } from './+types/list';

export { loader, meta } from '.';

function List({ loaderData }: Route.ComponentProps) {
  if (!loaderData.shows) {
    return null;
  }

  return <ShowsList shows={loaderData.shows} />;
}

export default List;
