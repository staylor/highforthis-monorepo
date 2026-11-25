import { css } from 'remix/component';
import { createController } from 'remix/router';

import { assets } from '#/assets.ts';
import type { Variables } from '#/lib/graphql.ts';
import { isYear } from '#/lib/year.ts';
import { routes } from '#/routes.ts';
import type {
  ArtistQuery,
  HomeQuery,
  PodcastFeedQuery,
  PostQuery,
  PostsQuery,
  VenueQuery,
  VideoQuery,
  VideosQuery,
} from '#/types/graphql.ts';
import { Heading1 } from '#/ui/heading.tsx';
import { uploadUrl } from '#/ui/public/media.ts';
import { Video } from '#/ui/videos.tsx';

import { sharingTags } from './document.tsx';
import { ArtistPage, artistQuery, VenuePage, venueQuery } from './entities/page.tsx';
import { HomePage, homeQuery } from './home/page.tsx';
import { ALL_EPISODES, feedQuery, feedTemplate } from './podcast/feed.ts';
import { PostPage, postQuery, PostsPage, postsQuery } from './posts/page.tsx';
import {
  loadRootData,
  prefetchRootData,
  renderNotFound,
  renderPage,
  siteUrl,
} from './render-page.tsx';
import { Setlists, type Setlist, type Stats } from './sphere/public/setlists.tsx';
import setlists from './sphere/setlists.json' with { type: 'json' };
import { VideosPage, videoQuery, videosQuery } from './videos/page.tsx';

// How many times each song was played at the Sphere, most played first
const songCounts: Stats = {};
for (const { sets } of setlists as Setlist[]) {
  for (const song of sets.flat()) {
    songCounts[song] = (songCounts[song] ?? 0) + 1;
  }
}
const sortedStats = Object.fromEntries(Object.entries(songCounts).sort(([, a], [, b]) => b - a));

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
        const data = await context.gql.query<HomeQuery>(homeQuery, { first: 9 });
        return renderPage(context, <HomePage data={data} artworkSeed={crypto.randomUUID()} />);
      },
    },

    posts: {
      middleware: prefetch,
      async handler(context) {
        const { posts } = await context.gql.query<PostsQuery>(postsQuery, {
          first: 50,
        });
        const title = context.t('posts.heading');
        if (!posts) {
          return renderPage(context, null, { title });
        }
        return renderPage(context, <PostsPage posts={posts} artworkSeed={crypto.randomUUID()} />, {
          title,
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
          return renderNotFound(context);
        }
        const media = post.featuredMedia?.[0];
        const crop =
          media && 'crops' in media ? media.crops.find((c) => c.width === 640) : undefined;
        const featuredImage =
          media && crop ? uploadUrl(media.destination, crop.fileName) : undefined;
        const url = `${siteUrl(context, await loadRootData(context))}/post/${post.slug}`;
        return renderPage(context, <PostPage post={post} />, {
          title: post.title,
          meta: sharingTags({
            title: post.title,
            description: post.summary,
            url,
            image: featuredImage,
            largeImage: true,
          }),
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
          return renderNotFound(context);
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
          return renderNotFound(context);
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
        if (year && !isYear(year)) {
          return renderNotFound(context);
        }
        const after = context.url.searchParams.get('after');
        const before = context.url.searchParams.get('before');
        const variables: Variables = {};
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
          variables.year = Number(year);
        }
        const { videos } = await context.gql.query<VideosQuery>(videosQuery, variables);
        const title = year ? context.t('videos.titleIn', { year }) : context.t('videos.heading');
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
          return renderNotFound(context);
        }
        return renderPage(context, <Video single video={video} />, {
          title: video.title,
        });
      },
    },

    async podcastFeed(context) {
      const data = await context.gql.query<PodcastFeedQuery>(feedQuery, { first: ALL_EPISODES });
      return new Response(feedTemplate(data), {
        headers: { 'Content-Type': 'application/xml' },
      });
    },

    sphere(context) {
      const { t } = context;
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
              everyShow: t('sphere.stats.everyShow'),
              share: t('sphere.stats.share'),
              clear: t('sphere.stats.clear'),
              songOne: t('sphere.stats.song_one'),
              songOther: t('sphere.stats.song_other'),
              songsSummary: t('sphere.stats.songs', {
                songCount: Object.keys(songCounts).length,
                setlistCount: setlists.length,
              }),
            }}
          />
        </article>,
        { title: t('sphere.heading') }
      );
    },

    notFound(context) {
      return renderNotFound(context);
    },
  },
});
