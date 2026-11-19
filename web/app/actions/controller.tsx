import { css } from 'remix/component';
import { createController } from 'remix/router';

import { assets } from '../assets.ts';
import { routes } from '../routes.ts';
import type {
  ArtistQuery,
  HomeQuery,
  PodcastFeedQuery,
  PostQuery,
  PostsQuery,
  VenueQuery,
  VideoQuery,
  VideosQuery,
} from '../types/graphql.ts';
import { Heading1 } from '../ui/heading.tsx';
import { uploadUrl } from '../ui/public/media.ts';
import { Video } from '../ui/videos.tsx';

import { ArtistPage, artistQuery, VenuePage, venueQuery } from './entities/page.tsx';
import { HomePage, homeQuery } from './home/page.tsx';
import { feedQuery, feedTemplate } from './podcast/feed.ts';
import { PostPage, postQuery, PostsPage, postsQuery } from './posts/page.tsx';
import { loadRootData, prefetchRootData, renderPage } from './render-page.tsx';
import { Setlists, type Setlist, type Stats } from './sphere/public/setlists.tsx';
import setlists from './sphere/setlists.json' with { type: 'json' };
import { VideosPage, videoQuery, videosQuery } from './videos/page.tsx';

// Pages that run their own query start the App query first, so the two run together. The rest
// of this controller's actions (assets, health, feeds) don't render a page, so they skip it.
const prefetch = [prefetchRootData()];

export default createController(routes, {
  actions: {
    async assets(context) {
      return (await assets.fetch(context.request)) ?? new Response('Not Found', { status: 404 });
    },

    health() {
      return Response.json({ status: 'ok' });
    },

    home: {
      middleware: prefetch,
      async handler(context) {
        const data = await context.gql.query<HomeQuery>(homeQuery, {
          cacheKey: 'home-videos',
          first: 9,
        });
        return renderPage(context, <HomePage data={data} artworkSeed={crypto.randomUUID()} />);
      },
    },

    posts: {
      middleware: prefetch,
      async handler(context) {
        const { posts } = await context.gql.query<PostsQuery>(postsQuery, {
          first: 50,
        });
        if (!posts) {
          return renderPage(context, null, { title: 'Posts' });
        }
        return renderPage(context, <PostsPage posts={posts} artworkSeed={crypto.randomUUID()} />, {
          title: 'Posts',
        });
      },
    },

    post: {
      middleware: prefetch,
      async handler(context) {
        const { post } = await context.gql.query<PostQuery>(postQuery, {
          slug: context.params.slug,
        });
        if (!post) {
          return notFound(context);
        }
        const { siteSettings } = await loadRootData(context);
        const media = post.featuredMedia?.[0];
        const crop =
          media && 'crops' in media ? media.crops.find((c) => c.width === 640) : undefined;
        const featuredImage =
          media && crop ? uploadUrl(media.destination, crop.fileName) : undefined;
        const url = `${siteSettings.siteUrl}/post/${post.slug}`;
        return renderPage(context, <PostPage post={post} />, {
          title: post.title,
          meta: [
            { property: 'og:type', content: 'article' },
            { property: 'og:title', content: post.title },
            { property: 'og:description', content: post.summary },
            { property: 'og:url', content: url },
            { property: 'og:image', content: featuredImage },
            { property: 'twitter:title', content: post.title },
            { property: 'twitter:description', content: post.summary },
            { property: 'twitter:url', content: url },
            { property: 'twitter:image', content: featuredImage },
            { property: 'twitter:card', content: 'summary_large_image' },
          ],
        });
      },
    },

    artist: {
      middleware: prefetch,
      async handler(context) {
        const data = await context.gql.query<ArtistQuery>(artistQuery, {
          first: 100,
          slug: context.params.slug,
        });
        if (!data.artist) {
          return notFound(context);
        }
        return renderPage(context, <ArtistPage data={data} />, {
          title: data.artist.name,
        });
      },
    },

    venue: {
      middleware: prefetch,
      async handler(context) {
        const data = await context.gql.query<VenueQuery>(venueQuery, {
          first: 100,
          slug: context.params.slug,
        });
        if (!data.venue) {
          return notFound(context);
        }
        return renderPage(context, <VenuePage data={data} />, {
          title: data.venue.name,
        });
      },
    },

    videos: {
      middleware: prefetch,
      async handler(context) {
        const { year } = context.params;
        const after = context.url.searchParams.get('after');
        const before = context.url.searchParams.get('before');
        const variables: Record<string, unknown> = { cacheKey: 'videos' };
        if (before && !after) {
          variables.last = 9;
          variables.before = before;
        } else {
          variables.first = 9;
          if (after) {
            variables.after = after;
          }
        }
        if (year) {
          variables.year = parseInt(year, 10);
        }
        const { videos } = await context.gql.query<VideosQuery>(videosQuery, variables);
        const title = year ? `${year} » Videos` : 'Videos';
        if (!videos) {
          return renderPage(context, null, { title });
        }
        return renderPage(
          context,
          <VideosPage videos={videos} year={year} search={context.url.searchParams} />,
          { title }
        );
      },
    },

    video: {
      middleware: prefetch,
      async handler(context) {
        const { video } = await context.gql.query<VideoQuery>(videoQuery, {
          slug: context.params.slug,
        });
        if (!video) {
          return notFound(context);
        }
        return renderPage(context, <Video single video={video} />, {
          title: video.title,
        });
      },
    },

    async podcastFeed(context) {
      const data = await context.gql.query<PodcastFeedQuery>(feedQuery);
      return new Response(feedTemplate(data as any), {
        headers: { 'Content-Type': 'application/xml' },
      });
    },

    async oembed(context) {
      const provider = context.url.searchParams.get('provider');
      const url = context.url.searchParams.get('url');
      if (!(provider && url)) {
        return Response.json(null);
      }
      const oembedUrl = new URL(provider);
      oembedUrl.searchParams.set('url', url);
      return Response.json(await fetch(oembedUrl).then((response) => response.json()));
    },

    sphere(context) {
      const { t } = context;
      const stats: Stats = {};
      for (const { sets } of setlists as Setlist[]) {
        for (const song of sets.flat()) {
          stats[song] = (stats[song] ?? 0) + 1;
        }
      }
      const sortedStats = Object.fromEntries(Object.entries(stats).sort(([, a], [, b]) => b - a));
      return renderPage(
        context,
        <article mix={css({ marginTop: '2rem' })}>
          <Heading1>{t('sphere.heading')}</Heading1>
          <Setlists
            setlists={setlists as Setlist[]}
            stats={sortedStats}
            messages={{
              show: t('sphere.stats.show'),
              hide: t('sphere.stats.hide'),
              weekend: t('sphere.stats.weekend'),
              set1: t('sphere.set1'),
              set2: t('sphere.set2'),
              encore: t('sphere.encore'),
              songOne: t('sphere.stats.song_one'),
              songOther: t('sphere.stats.song_other'),
              songsSummary: t('sphere.stats.songs', {
                songCount: Object.keys(stats).length,
                setlistCount: setlists.length,
              }),
            }}
          />
        </article>,
        { title: t('sphere.heading') }
      );
    },

    notFound(context) {
      return notFound(context);
    },
  },
});

/** The 404 page, for any path no route matches. */
function notFound(context: Parameters<typeof renderPage>[0]) {
  return renderPage(context, <pre>{'Yikes! Not Found!'}</pre>, {
    title: 'Not Found',
    layout: 'bare',
    status: 404,
  });
}
