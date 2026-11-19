import { form, get, route } from 'remix/routes';

/**
 * Every route's URL pattern, shared by the server and browser for type-safe hrefs.
 * Optional segments are groups (`(/:year)`) and the catch-all is a named wildcard.
 */
export const routes = route({
  assets: get('/assets/*path'),
  health: get('/health'),
  home: get('/'),
  posts: get('/posts'),
  post: get('/post/:slug'),
  artist: get('/artist/:slug'),
  venue: get('/venue/:slug'),
  oembed: get('/oembed'),
  sphere: get('/sphere'),
  podcastFeed: get('/podcast.xml'),
  podcast: route('/podcast', {
    index: get('/'),
    show: get('/:id'),
  }),
  shows: route('/shows', {
    index: get('/'),
    history: get('/history(/:year)'),
    list: get('/list'),
    stats: get('/stats/:entity'),
    show: get('/:id'),
  }),
  videos: get('/videos(/:year)'),
  video: get('/video/:slug'),
  // The admin pages this app renders; the rest of /admin goes to the admin app (see
  // shared/src/adminPaths.ts). Each form route is a GET page and its POST.
  admin: route('/admin', {
    users: route('/user', {
      list: form('/'),
      add: form('/add'),
      edit: form('/:id'),
    }),
    artists: route('/artist', {
      list: form('/'),
      add: form('/add'),
      edit: form('/:id'),
    }),
    venues: route('/venue', {
      list: form('/'),
      add: form('/add'),
      edit: form('/:id'),
    }),
    // The pages of uploads the featured media field's picker scrolls through, as JSON
    mediaPicker: get('/media-picker/:type'),
  }),
  notFound: '*path',
});
