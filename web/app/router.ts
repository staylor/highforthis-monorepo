import { readdirSync } from 'node:fs';
import { constants } from 'node:zlib';

import { compression } from 'remix/middleware/compression';
import { render } from 'remix/middleware/render';
import { staticFiles } from 'remix/middleware/static';
import { createRouter, type RouterContext } from 'remix/router';

import { artistsAdd, artistsEdit, artistsList } from './actions/admin/artists/controller.tsx';
import { dashboard } from './actions/admin/dashboard/controller.tsx';
import { login, logout } from './actions/admin/login/controller.tsx';
import { mediaPicker } from './actions/admin/media/controller.ts';
import {
  mediaAlbumCovers,
  mediaEdit,
  mediaList,
  mediaUpload,
} from './actions/admin/media/library.tsx';
import {
  passkeyOptions,
  passkeysList,
  passkeyVerify,
} from './actions/admin/passkeys/controller.tsx';
import { podcastsAdd, podcastsEdit, podcastsList } from './actions/admin/podcasts/controller.tsx';
import { postsAdd, postsEdit, postsList } from './actions/admin/posts/controller.tsx';
import {
  settingsMedia,
  settingsPodcast,
  settingsSite,
} from './actions/admin/settings/controller.tsx';
import { showsAdd, showsBulk, showsEdit, showsList } from './actions/admin/shows/controller.tsx';
import { showListings } from './actions/admin/shows/listings.tsx';
import { usersAdd, usersEdit, usersList } from './actions/admin/users/controller.tsx';
import { venuesAdd, venuesEdit, venuesList } from './actions/admin/venues/controller.tsx';
import { videosEdit, videosList } from './actions/admin/videos/controller.tsx';
import controller from './actions/controller.tsx';
import podcastController from './actions/podcast/controller.tsx';
import showsController from './actions/shows/controller.tsx';
import { assets } from './assets.ts';
import { tracedMatcher } from './lib/tracing.ts';
import {
  graphql,
  openObserveBundles,
  proxies,
  rejectWordPress,
  translations,
} from './middleware/app.ts';
import { errorPage } from './middleware/error-page.tsx';
import { securityHeaders } from './middleware/headers.ts';
import { serverTiming, timed } from './middleware/timing.ts';
import { routes } from './routes.ts';

// staticFiles() looks each request's path up on disk, so only paths under public/'s own files and
// folders reach it.
const publicEntries = new Set(readdirSync('./public'));
const inPublic = (path: string) => publicEntries.has(path.split('/', 1)[0]);

// Add the security headers, time each request, reject WordPress probes, compress, serve public/
// and the OpenObserve SDK bundles, forward API paths to GraphQL, then render. HTTP logging stays
// on the Node server in server.ts, because pino-http needs Node's req/res. The matcher names each
// request's trace span after the route that matched it.
export const router = createRouter({
  matcher: tracedMatcher(),
  middleware: [
    securityHeaders(),
    serverTiming(),
    timed('rejectWordPress', rejectWordPress()),
    // Brotli's default quality, 11, takes 30-70ms a page. 5 takes under half a millisecond, and
    // its output is about 10% larger.
    timed(
      'compression',
      compression({ brotli: { params: { [constants.BROTLI_PARAM_QUALITY]: 5 } } })
    ),
    timed(
      'static',
      staticFiles('./public', {
        index: false,
        cacheControl: 'public, max-age=3600',
        filter: inPublic,
      })
    ),
    timed('openObserveBundles', openObserveBundles()),
    timed('proxies', proxies()),
    timed('graphql', graphql()),
    timed('translations', translations()),
    timed('render', render({ assets })),
    errorPage(),
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
router.map(routes.login, login);
router.map(routes.admin.dashboard, dashboard);
router.map(routes.admin.logout, logout);
router.map(routes.admin.passkeys.list, passkeysList);
router.map(routes.admin.passkeys.options, passkeyOptions);
router.map(routes.admin.passkeys.verify, passkeyVerify);
router.map(routes.admin.users.list, usersList);
router.map(routes.admin.users.add, usersAdd);
router.map(routes.admin.users.edit, usersEdit);
router.map(routes.admin.artists.list, artistsList);
router.map(routes.admin.artists.add, artistsAdd);
router.map(routes.admin.artists.edit, artistsEdit);
router.map(routes.admin.venues.list, venuesList);
router.map(routes.admin.venues.add, venuesAdd);
router.map(routes.admin.venues.edit, venuesEdit);
router.map(routes.admin.podcasts.list, podcastsList);
router.map(routes.admin.podcasts.add, podcastsAdd);
router.map(routes.admin.podcasts.edit, podcastsEdit);
router.map(routes.admin.videos.list, videosList);
router.map(routes.admin.videos.edit, videosEdit);
router.map(routes.admin.settings.site, settingsSite);
router.map(routes.admin.settings.media, settingsMedia);
router.map(routes.admin.settings.podcast, settingsPodcast);
router.map(routes.admin.shows.list, showsList);
router.map(routes.admin.shows.add, showsAdd);
router.map(routes.admin.shows.bulk, showsBulk);
router.map(routes.admin.shows.listings, showListings);
router.map(routes.admin.shows.edit, showsEdit);
router.map(routes.admin.media.list, mediaList);
router.map(routes.admin.media.upload, mediaUpload);
router.map(routes.admin.media.albumCovers, mediaAlbumCovers);
router.map(routes.admin.media.edit, mediaEdit);
router.map(routes.admin.posts.list, postsList);
router.map(routes.admin.posts.add, postsAdd);
router.map(routes.admin.posts.edit, postsEdit);
router.map(routes.admin.mediaPicker, mediaPicker);
