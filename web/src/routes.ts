import { type RouteConfig, route, index, prefix } from '@react-router/dev/routes';

export default [
  index('routes/home/index.tsx'),
  route('artist/:slug', 'routes/artist.tsx'),
  route('oembed', 'routes/oembed.tsx'),
  route('podcast.xml', 'routes/podcast/xml/loader.tsx'),
  route('podcast/:id', 'routes/podcast/podcast.tsx'),
  route('podcast', 'routes/podcast/index.tsx'),
  route('posts', 'routes/post/index.tsx'),
  route('post/:slug', 'routes/post/post.tsx'),
  ...prefix('shows', [
    index('routes/shows/index.tsx'),
    route('history/:year?', 'routes/shows/history.tsx'),
    route('list', 'routes/shows/list.tsx'),
    route('stats/:entity', 'routes/shows/entity.tsx'),
    route(':id', 'routes/shows/show.tsx'),
  ]),
  route('sphere', 'routes/sphere/index.tsx'),
  route('venue/:slug', 'routes/venue.tsx'),
  route('video/:slug', 'routes/videos/video.tsx'),
  route('videos/:year?', 'routes/videos/index.tsx'),
  route('*', 'routes/$.tsx'),
] satisfies RouteConfig;
