import { compression } from 'remix/middleware/compression';
import { render } from 'remix/middleware/render';
import { staticFiles } from 'remix/middleware/static';
import { createRouter, type RouterContext } from 'remix/router';

import { artistsAdd, artistsEdit, artistsList } from './actions/admin/artists/controller.tsx';
import { mediaPicker } from './actions/admin/media/controller.ts';
import { usersAdd, usersEdit, usersList } from './actions/admin/users/controller.tsx';
import { venuesAdd, venuesEdit, venuesList } from './actions/admin/venues/controller.tsx';
import controller from './actions/controller.tsx';
import podcastController from './actions/podcast/controller.tsx';
import showsController from './actions/shows/controller.tsx';
import { assets } from './assets.ts';
import {
  graphql,
  openObserveBundles,
  proxies,
  rejectWordPress,
  translations,
} from './middleware/app.ts';
import { routes } from './routes.ts';

// Reject WordPress probes, compress, serve public/ and the OpenObserve SDK bundles, forward
// API and admin paths to their servers, then render. HTTP logging stays on the Node server in server.ts, because
// pino-http needs Node's req/res.
export const router = createRouter({
  middleware: [
    rejectWordPress(),
    compression(),
    staticFiles('./public', { index: false, cacheControl: 'public, max-age=3600' }),
    openObserveBundles(),
    proxies(),
    graphql(),
    translations(),
    render({ assets }),
  ],
});

export type AppContext = RouterContext<typeof router>;

declare module 'remix' {
  interface RouterTypes {
    context: AppContext;
  }
}

router.map(routes, controller);
router.map(routes.podcast, podcastController);
router.map(routes.shows, showsController);
router.map(routes.admin.users.list, usersList);
router.map(routes.admin.users.add, usersAdd);
router.map(routes.admin.users.edit, usersEdit);
router.map(routes.admin.artists.list, artistsList);
router.map(routes.admin.artists.add, artistsAdd);
router.map(routes.admin.artists.edit, artistsEdit);
router.map(routes.admin.venues.list, venuesList);
router.map(routes.admin.venues.add, venuesAdd);
router.map(routes.admin.venues.edit, venuesEdit);
router.map(routes.admin.mediaPicker, mediaPicker);
