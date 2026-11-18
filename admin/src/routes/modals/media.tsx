import { loadMediaModal } from '#/server/modals';
import { graphqlClient } from '#/utils/route.server';

import type { Route } from './+types/media';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadMediaModal({
    gql: graphqlClient({ request, context }),
    type: params.type,
    cursor: params.cursor,
  });
}
