import { loadVideoModal } from '#/server/modals';
import { graphqlClient } from '#/utils/route.server';

import type { Route } from './+types/video';

export async function loader({ request, context, params }: Route.LoaderArgs) {
  return loadVideoModal({ gql: graphqlClient({ request, context }), cursor: params.cursor });
}
