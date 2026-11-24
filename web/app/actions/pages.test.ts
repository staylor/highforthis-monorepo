// The public site's pages, each rendered through the router from what GraphQL would answer.
import * as assert from 'remix/assert';
import { describe, it, type TestContext } from 'remix/test';

import { router } from '#/router.ts';
import { routes } from '#/routes.ts';

const origin = 'http://localhost';
const storage = 'https://storage.googleapis.com/wonderboymusic';

interface Operation {
  operationName: string;
  query: string;
  variables: Record<string, unknown>;
}

/** Stands in for GraphQL: answers each operation by name with its data, and records them. */
function stubGraphQL(t: TestContext, answers: Record<string, unknown>) {
  const operations: Operation[] = [];
  t.mock.method(globalThis, 'fetch', async (_input: RequestInfo | URL, init?: RequestInit) => {
    const operation: Operation = JSON.parse(String(init?.body));
    operations.push(operation);
    const data = answers[operation.operationName];
    return data === undefined
      ? Response.json({ errors: [{ message: `unstubbed ${operation.operationName}` }] })
      : Response.json({ data });
  });
  return operations;
}

async function page(path: string) {
  const response = await router.fetch(new URL(path, origin));
  return { status: response.status, headers: response.headers, html: await response.text() };
}

/** An <a> to `href`, with what it holds. */
const link = (html: string, href: string) =>
  html.match(
    new RegExp(`<a [^>]*href="${href.replace(/[?.]/g, '\\$&')}"[^>]*>([\\s\\S]*?)</a>`)
  )?.[1];

/** A page's text, without its markup. */
const textOf = (html: string) =>
  html
    .slice(html.indexOf('<body'))
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ');

const meta = (html: string, property: string) =>
  html.match(new RegExp(`<meta property="${property}" content="([^"]*)"`))?.[1];

// --- What GraphQL answers

const App = {
  siteSettings: {
    id: 'site',
    copyrightText: '&copy; 2026 <a href="https://example.com/us">Us</a><script>alert(1)</script>',
    language: 'en-US',
    siteTitle: 'High for This',
    siteUrl: 'https://highforthis.com',
    tagline: 'Music as it happens.',
  },
  podcastSettings: {
    id: 'podcast',
    description: 'Talking about shows',
    feedLink: 'https://highforthis.com/podcast.xml',
    title: 'The Podcast',
    websiteLink: 'https://highforthis.com/podcast',
    image: { id: 'i1', destination: '2024/01', fileName: 'podcast.jpg' },
  },
};

const wilco = { id: 'a1', name: 'Wilco', slug: 'wilco' };
const spoon = { id: 'a2', name: 'Spoon', slug: 'spoon' };
const bowery = { id: 'v1', name: 'Bowery Ballroom', slug: 'bowery-ballroom' };

// Local times, since pages show dates in the server's time zone
const june14 = new Date(2030, 5, 14, 20, 0).getTime();
const july4 = new Date(2030, 6, 4, 19, 30).getTime();

const show = (id: string, date: number, artists: object[], fields: object = {}) => ({
  cursor: `cursor-${id}`,
  node: { id, date, title: null, url: null, artists, venue: bowery, ...fields },
});

const shows = {
  edges: [
    show('s1', june14, [wilco]),
    show('s2', july4, [wilco, spoon]),
    show('s3', july4, [spoon], { title: 'Fourth of July Jam', url: 'https://tickets.example/jam' }),
  ],
  pageInfo: { hasNextPage: false },
};

const video = (id: string) => ({
  id,
  dataId: `youtube-${id}`,
  slug: `video-${id}`,
  title: `Video ${id}`,
  thumbnails: [{ height: 360, url: `https://i.ytimg.com/vi/${id}/hq.jpg`, width: 480 }],
});

const videos = {
  count: 2,
  edges: [
    { cursor: 'cursor-1', node: video('1') },
    { cursor: 'cursor-2', node: video('2') },
  ],
  pageInfo: { hasNextPage: true, hasPreviousPage: false },
};

const text = (value: string, format = 0) => ({ type: 'text', text: value, format });
const cover = {
  id: 'm1',
  destination: '2024/05',
  crops: [{ fileName: 'cover-640.jpg', width: 640 }],
};

const post = {
  id: 'p1',
  slug: 'best-of-2024',
  summary: 'The year in records',
  title: 'Best of 2024',
  editorState: {
    root: {
      children: [
        { type: 'heading', tag: 'h2', children: [text('Records')] },
        { type: 'paragraph', children: [text('Start with '), text('this one', 1), text('.')] },
        { type: 'image', image: cover },
        { type: 'video', video: video('9') },
        { type: 'list', listType: 'bullet', children: [{ children: [text('One more')] }] },
      ],
    },
  },
  featuredMedia: [cover],
};

const posts = {
  edges: [
    { node: post },
    { node: { ...post, id: 'p2', slug: 'second-post', title: 'Second Post', summary: null } },
  ],
};

describe('the home page', () => {
  it('shows recommended shows by month, the latest videos and posts', async (t) => {
    // Apple Music has artwork for Wilco, and none for Spoon
    const wilcoArtwork = 'https://is1-ssl.mzstatic.com/image/thumb/wilco/{w}x{h}bb.jpg';
    const withArtwork = { ...wilco, appleMusic: { id: 'am1', artwork: { url: wilcoArtwork } } };
    const withoutArtwork = { ...spoon, appleMusic: null };
    const recommended = {
      edges: [
        show('s1', june14, [withArtwork]),
        show('s2', july4, [withArtwork, withoutArtwork]),
        show('s3', july4, [withoutArtwork], {
          title: 'Fourth of July Jam',
          url: 'https://tickets.example/jam',
        }),
      ],
    };
    const operations = stubGraphQL(t, { App, Home: { videos, posts, shows: recommended } });
    const { status, html, headers } = await page(routes.home.href());
    assert.equal(status, 200);
    assert.match(headers.get('content-type') ?? '', /text\/html/);
    assert.match(html, /<title>Music as it happens\. » High for This<\/title>/);
    assert.match(html, /<html lang="en-US"/);

    const body = textOf(html);
    assert.match(body, /Recommended Shows .*June 2030 .*14 .*Wilco .*Bowery Ballroom/);
    assert.doesNotMatch(body, /Upcoming/);
    assert.match(body, /July 2030 .*Wilco \/ Spoon .*Fourth of July Jam/);
    // One artist and nothing more is on the artist's page; anything else has a page of its own
    assert.match(link(html, '/artist/wilco') ?? '', /Wilco/);
    assert.match(link(html, '/shows/s2') ?? '', /Wilco \/ Spoon/);
    assert.match(link(html, '/shows/s3') ?? '', /Fourth of July Jam/);

    // Each show has its main artist's picture, the first artist's, or their initials without one
    const picture =
      /<img [^>]*src="https:\/\/is1-ssl\.mzstatic\.com\/image\/thumb\/wilco\/96x96bb\.jpg"/;
    assert.match(link(html, '/artist/wilco') ?? '', picture);
    assert.match(link(html, '/shows/s2') ?? '', picture);
    assert.match(link(html, '/shows/s3') ?? '', /<span [^>]*aria-hidden="true"[^>]*>S<\/span>/);
    assert.doesNotMatch(link(html, '/shows/s3') ?? '', /<img /);

    // Each video's title is under the section's heading
    assert.match(html, /<h3[^>]*><a [^>]*href="\/video\/video-1"[^>]*>Video 1<\/a><\/h3>/);
    assert.doesNotMatch(html, /<h1[ >]/);
    assert.match(
      body,
      /Latest Posts .*Featured .*Best of 2024 .*The year in records .*Second Post/
    );
    assert.ok(link(html, '/post/best-of-2024'));
    assert.ok(html.includes(`${storage}/2024/05/cover-640.jpg`));

    // The shows are the home page's own, not something every page asks for
    assert.deepEqual(operations.map(({ operationName }) => operationName).sort(), ['App', 'Home']);
    const app = operations.find(({ operationName }) => operationName === 'App')!;
    assert.doesNotMatch(app.query, /shows|apiKeys/);
  });

  it('says so when there are no shows', async (t) => {
    stubGraphQL(t, { App, Home: { videos: null, posts: null, shows: { edges: [] } } });
    const { status, html } = await page(routes.home.href());
    assert.equal(status, 200);
    assert.match(textOf(html), /No recommended shows at this time\./);
  });
});

describe('the frame around every page', () => {
  it('has the navigation, the podcast feed, and a footer with only safe markup', async (t) => {
    stubGraphQL(t, { App, Posts: { posts } });
    const { html } = await page(routes.posts.href());
    for (const href of ['/', '/podcast', '/shows', '/videos']) {
      assert.ok(link(html, href) !== undefined, `a link to ${href}`);
    }
    assert.match(
      html,
      /<link rel="alternate" type="application\/rss\+xml" href="https:\/\/highforthis\.com\/podcast\.xml" title="The Podcast"/
    );
    assert.ok(html.includes('&copy; 2026 <a href="https://example.com/us">Us</a>alert(1)'));
    assert.doesNotMatch(html, /<script>alert/);
  });
});

describe('posts', () => {
  it('lists the published posts', async (t) => {
    const operations = stubGraphQL(t, { App, Posts: { posts } });
    const { status, html } = await page(routes.posts.href());
    assert.equal(status, 200);
    assert.match(html, /<title>Posts » High for This<\/title>/);
    assert.match(link(html, '/post/best-of-2024') ?? '', /Best of 2024/);
    assert.match(link(html, '/post/second-post') ?? '', /Second Post/);
    assert.deepEqual(operations.find((op) => op.operationName === 'Posts')?.variables, {
      first: 50,
    });
  });

  it('shows a post with its body, and describes it for sharing', async (t) => {
    stubGraphQL(t, { App, Post: { post } });
    const { status, html } = await page(routes.post.href({ slug: post.slug }));
    assert.equal(status, 200);
    assert.match(html, /<title>Best of 2024 » High for This<\/title>/);
    assert.match(html, /<h1[^>]*>Best of 2024<\/h1>/);
    assert.match(html, /<h2[^>]*>Records<\/h2>/);
    assert.match(html, /<p[^>]*>Start with <strong>this one<\/strong>\.<\/p>/);
    assert.match(html, /<li>One more<\/li>/);
    assert.ok(html.includes(`<img alt="" src="${storage}/2024/05/cover-640.jpg"`));
    // The video is in the post, with its title linking to its own page
    assert.match(link(html, '/video/video-9') ?? '', /Video 9/);

    assert.equal(meta(html, 'og:title'), 'Best of 2024');
    assert.equal(meta(html, 'og:description'), 'The year in records');
    assert.equal(meta(html, 'og:url'), 'https://highforthis.com/post/best-of-2024');
    assert.equal(meta(html, 'og:image'), `${storage}/2024/05/cover-640.jpg`);
    assert.equal(meta(html, 'twitter:card'), 'summary_large_image');
  });

  it("links a post to this site when the site's address isn't known", async (t) => {
    stubGraphQL(t, { Post: { post } });
    const { status, html } = await page(routes.post.href({ slug: post.slug }));
    assert.equal(status, 200);
    assert.equal(meta(html, 'og:url'), 'http://localhost/post/best-of-2024');
  });

  it("renders the 404 page for a post that doesn't exist", async (t) => {
    stubGraphQL(t, { App, Post: { post: null } });
    const { status, html } = await page(routes.post.href({ slug: 'nope' }));
    assert.equal(status, 404);
    assert.match(html, /Yikes! Not Found!/);
  });
});

describe('artists and venues', () => {
  const attended = {
    edges: [
      {
        node: {
          ...show('s9', new Date(2019, 2, 1, 20).getTime(), [wilco]).node,
          venue: { ...bowery, city: 'New York', state: 'NY' },
        },
      },
    ],
  };

  it('shows an artist with their links, upcoming shows and the shows attended', async (t) => {
    const artist = {
      ...wilco,
      website: 'https://wilcoworld.net',
      appleMusic: {
        id: 'am1',
        url: 'https://music.apple.com/wilco',
        artwork: { url: 'https://art.example/{w}x{h}.jpg' },
      },
    };
    const operations = stubGraphQL(t, { App, Artist: { artist, shows, attended } });
    const { status, html } = await page(routes.artist.href({ slug: 'wilco' }));
    assert.equal(status, 200);
    assert.match(html, /<title>Wilco » High for This<\/title>/);
    assert.match(link(html, 'https://wilcoworld.net') ?? '', /Artist Website/);
    assert.ok(html.includes('src="https://art.example/300x300.jpg"'));
    const body = textOf(html);
    assert.match(body, /06\/14 .*Wilco .*Bowery Ballroom/);
    assert.match(body, /1 Show we have attended by this artist .*03\/01\/2019 .*New York, NY/);
    assert.deepEqual(operations.find((op) => op.operationName === 'Artist')?.variables, {
      first: 100,
      slug: 'wilco',
    });
  });

  it('shows a venue with its address, its map and that it has closed', async (t) => {
    const venue = {
      ...bowery,
      address: '6 Delancey St\nNew York, NY 10002',
      capacity: '575',
      permanentlyClosed: true,
      website: 'https://boweryballroom.com',
      coordinates: { latitude: 40.72, longitude: -73.99 },
      featuredMedia: [],
    };
    const data = { apiKeys: { googleMaps: 'maps-key' }, venue, shows, attended };
    stubGraphQL(t, { App, Venue: data });
    const { status, html } = await page(routes.venue.href({ slug: bowery.slug }));
    assert.equal(status, 200);
    assert.match(html, /6 Delancey St<br \/>New York, NY 10002/);
    const body = textOf(html);
    assert.match(body, /Capacity: 575/);
    assert.match(body, /Permanently Closed\./);
    assert.match(
      html,
      /src="https:\/\/maps\.googleapis\.com\/maps\/api\/staticmap\?[^"]*key=maps-key/
    );
    assert.match(html, /href="https:\/\/maps\.apple\.com\/\?q=Bowery\+Ballroom/);
    assert.match(body, /1 Show we have attended at this venue/);
  });

  it('leaves the map out without a key for it', async (t) => {
    const venue = { ...bowery, coordinates: { latitude: 40.72, longitude: -73.99 } };
    stubGraphQL(t, { App, Venue: { apiKeys: null, venue, shows: null, attended: null } });
    const { status, html } = await page(routes.venue.href({ slug: bowery.slug }));
    assert.equal(status, 200);
    assert.doesNotMatch(html, /maps\.googleapis\.com/);
  });

  it("renders the 404 page for an artist or a venue that doesn't exist", async (t) => {
    stubGraphQL(t, { App, Artist: { artist: null }, Venue: { venue: null } });
    assert.equal((await page(routes.artist.href({ slug: 'nope' }))).status, 404);
    assert.equal((await page(routes.venue.href({ slug: 'nope' }))).status, 404);
  });
});

describe('videos', () => {
  it('lists videos a page at a time, with a link to the next page', async (t) => {
    const operations = stubGraphQL(t, { App, Videos: { videos } });
    const { status, html } = await page(routes.videos.href());
    assert.equal(status, 200);
    assert.match(html, /<title>Videos » High for This<\/title>/);
    assert.match(html, /<h2[^>]*><a [^>]*href="\/video\/video-2"[^>]*>Video 2<\/a><\/h2>/);
    assert.match(link(html, '?after=cursor-2') ?? '', /NEXT/);
    assert.equal(link(html, '?before=cursor-1'), undefined);
    assert.deepEqual(operations.find((op) => op.operationName === 'Videos')?.variables, {
      first: 9,
    });
  });

  it("lists a year's videos, and pages back through them", async (t) => {
    const operations = stubGraphQL(t, { App, Videos: { videos } });
    const { html } = await page('/videos/2024?before=cursor-9');
    assert.match(html, /<title>2024 » Videos » High for This<\/title>/);
    assert.match(html, /<option value="2024" selected>/);
    assert.deepEqual(operations.find((op) => op.operationName === 'Videos')?.variables, {
      before: 'cursor-9',
      last: 9,
      year: 2024,
    });
  });

  it('shows one video, or the 404 page when there is none', async (t) => {
    stubGraphQL(t, { App, Video: { video: video('1') } });
    const found = await page(routes.video.href({ slug: 'video-1' }));
    assert.equal(found.status, 200);
    assert.match(found.html, /<title>Video 1 » High for This<\/title>/);
    assert.ok(found.html.includes('src="https://i.ytimg.com/vi/1/hq.jpg"'));

    stubGraphQL(t, { App, Video: { video: null } });
    assert.equal((await page(routes.video.href({ slug: 'nope' }))).status, 404);
  });
});

describe('shows', () => {
  it('lists the recommended shows in date order, under their years and months', async (t) => {
    const operations = stubGraphQL(t, { App, Shows: { shows } });
    const { status, html } = await page(routes.shows.index.href());
    assert.equal(status, 200);
    assert.match(html, /<title>Shows » High for This<\/title>/);
    const body = textOf(html);
    assert.match(body, /Recommended Shows .*Today's date is/);
    assert.match(body, /2030 .*June .*06\/14 .*Wilco .*July .*07\/04/);
    assert.deepEqual(operations.find((op) => op.operationName === 'Shows')?.variables, {
      first: 200,
    });
    assert.equal((await page(routes.shows.list.href())).status, 200);
  });

  it("counts a year's attended shows, with a link to all of them", async (t) => {
    const history = { ...shows, count: 3, years: [2030, 2029] };
    const operations = stubGraphQL(t, { App, ShowsHistory: { shows: history } });
    const { status, html } = await page(routes.shows.history.href({ year: '2030' }));
    assert.equal(status, 200);
    assert.match(textOf(html), /3 Shows attended in 2030 .*View Full History/);
    assert.ok(link(html, '/shows/history') !== undefined);
    assert.match(html, /<option value="2030" selected>2030<\/option>/);
    assert.match(html, /<option value="2029">2029<\/option>/);
    assert.deepEqual(operations.find((op) => op.operationName === 'ShowsHistory')?.variables, {
      first: 50,
      year: 2030,
    });

    const all = await page(routes.shows.history.href());
    assert.match(textOf(all.html), /Shows I have attended/);
    assert.match(all.html, /<option value="">-- Shows By Year --<\/option>/);
    assert.doesNotMatch(all.html, /<option[^>]* selected/);
  });

  // The history comes newest first, as GraphQL answers it, and the next page follows the last show
  const history = {
    edges: [shows.edges[2], shows.edges[1], shows.edges[0]],
    pageInfo: { hasNextPage: true },
  };
  const historyOperation = (operations: Operation[], name: string) =>
    operations.filter((op) => op.operationName === name).at(-1);

  // 50 at a time, so the page doesn't load every show we've been to at once
  it('lists the shows we have been to newest first, and loads more as they scroll', async (t) => {
    const operations = stubGraphQL(t, {
      App,
      ShowsHistory: { shows: { ...history, count: 120, years: [2030] } },
    });
    const { html } = await page(routes.shows.history.href());
    assert.match(
      textOf(html),
      /2030 .*07\/04 .*Fourth of July Jam .*07\/04 .*Wilco \/ Spoon .*06\/14 .*Wilco/
    );
    // Without JavaScript, a link to the next page. With it, a frame for each layout, which loads
    // that page when it nears the screen.
    assert.match(link(html, '/shows/history?after=cursor-s1') ?? '', /More Shows/);
    assert.ok(html.includes(`"/shows/history/page/grid?after=cursor-s1&previous=${june14}"`));
    assert.ok(html.includes(`"/shows/history/page/list?after=cursor-s1&previous=${june14}"`));
    assert.match(html, /"status":"lazy"/);

    await page(`${routes.shows.history.href()}?after=cursor-s1`);
    assert.deepEqual(historyOperation(operations, 'ShowsHistory')?.variables, {
      after: 'cursor-s1',
      first: 50,
    });
  });

  it("answers a frame's next page with only its shows, which go on from the page before", async (t) => {
    const operations = stubGraphQL(t, { App, ShowsHistoryPage: { shows: history } });
    const grid = await page(
      `${routes.shows.historyPage.href({ view: 'grid' })}?after=cursor-s0&previous=${july4}`
    );
    assert.equal(grid.status, 200);
    assert.match(grid.html, /<!--\s*rmx:flush fragment\s*-->/);
    // A table of its own, under the page before's: the rows' styles come in a head, after which
    // the template Remix parses a frame in wouldn't keep rows that weren't in a table
    assert.match(grid.html, /<\/head><table[^>]*><tbody><tr/);
    assert.doesNotMatch(grid.html, /<html|<body|<title/);
    // The page before ended in 2030, so these rows go on under that year's heading
    assert.doesNotMatch(textOf(`<body>${grid.html}`), /2030/);
    assert.match(textOf(`<body>${grid.html}`), /Fourth of July Jam .*Wilco \/ Spoon .*Wilco/);
    assert.ok(grid.html.includes(`"/shows/history/page/grid?after=cursor-s1&previous=${june14}"`));
    // Rows for a frame in a page that has the site's settings already
    assert.deepEqual(
      operations.map((op) => op.operationName),
      ['ShowsHistoryPage']
    );
    assert.deepEqual(operations[0].variables, { after: 'cursor-s0', first: 50 });

    const list = await page(
      `${routes.shows.historyPage.href({ year: '2030', view: 'list' })}?after=cursor-s0`
    );
    assert.equal(list.status, 200);
    assert.match(textOf(`<body>${list.html}`), /2030 July .*Fourth of July Jam .*June .*Wilco/);
    assert.ok(list.html.includes(`"/shows/history/2030/page/list?after=cursor-s1&previous=`));
    assert.deepEqual(historyOperation(operations, 'ShowsHistoryPage')?.variables, {
      after: 'cursor-s0',
      first: 50,
      year: 2030,
    });

    for (const path of [
      '/shows/history/page/table?after=cursor-s0',
      '/shows/history/20x4/page/grid?after=cursor-s0',
      '/shows/history/page/grid',
    ]) {
      assert.equal((await page(path)).status, 404, path);
    }
  });

  // The stats: the leaders with their artwork and dates, everyone's counts, and the totals
  const showTotals = { artists: 249, firstDate: Date.UTC(2005, 9, 7, 20), shows: 458, venues: 65 };
  const seen = { firstDate: Date.UTC(2009, 6, 4, 20), lastDate: Date.UTC(2025, 5, 21, 20) };
  const artist = (name: string) => ({
    id: name,
    name,
    slug: name.toLowerCase().replace(/\W+/g, '-'),
  });
  const stat = (count: number, entity: { name: string }) => ({ count, entity });
  const artwork = {
    id: 'am-1',
    artwork: {
      bgColor: '1c160c',
      textColor1: 'eae9ed',
      textColor2: 'cdcdcf',
      url: 'https://is1-ssl.mzstatic.com/image/thumb/{w}x{h}bb.jpg',
    },
  };
  // The leaders, as ShowStats asks for them, from everyone's counts
  const leadersOf = (stats: ReturnType<typeof stat>[]) =>
    stats.map(({ count, entity }, index) => ({
      count,
      ...seen,
      entity: { ...entity, appleMusic: index === 0 ? artwork : null },
    }));

  it('puts the artists we have seen most on a podium, then ranks the rest of the leaders', async (t) => {
    // In GraphQL's order: most first, and a tie by name
    const everyone = [
      stat(12, wilco),
      stat(9, artist('Low')),
      stat(9, spoon),
      stat(7, artist('Bedhead')),
      stat(7, artist('Yo La Tengo')),
      stat(2, artist('Spiritualized')),
    ];
    const operations = stubGraphQL(t, {
      App,
      ShowStats: { leaders: leadersOf(everyone), showStats: everyone, showTotals },
    });
    const { status, html } = await page(routes.shows.stats.href({ entity: 'artist' }));
    assert.equal(status, 200);
    assert.match(html, /<title>Show Stats: Artists » High for This<\/title>/);
    const body = textOf(html);
    assert.match(body, /Show Stats .*Shows 458 Artists 249 Venues 65 Since 2005/);
    // The winner wears its artwork's colors, in front of its rank
    assert.match(html, /style="--bg: #1c160c; --fg: #eae9ed; --fg2: #cdcdcf;/);
    assert.ok(html.includes('src="https://is1-ssl.mzstatic.com/image/thumb/440x440bb.jpg"'));
    assert.match(body, /Number 1 Wilco 12 shows 2009–2025 .*Number 2 Low 9 shows/);
    // Spoon ties Low, and the leaderboard's ties share a rank too. Without artwork, a place has
    // initials.
    assert.match(
      body,
      /Number 2 Spoon 9 shows .*Most seen .*Number 4 4 B Bedhead .*Number 4 4 YLT Yo La Tengo/
    );
    assert.match(body, /Number 6 6 S Spiritualized 2009–2025 2 shows/);
    assert.doesNotMatch(body, /Also on the bill/);
    assert.ok(link(html, '/artist/wilco') !== undefined);
    assert.match(html, /<a href="\/shows\/stats\/artist" aria-current="page"[^>]*>Artists<\/a>/);
    assert.match(link(html, '/shows/stats/venue') ?? '', /Venues/);
    assert.deepEqual(operations.find((op) => op.operationName === 'ShowStats')?.variables, {
      entity: 'ARTIST',
      leaders: 20,
    });
  });

  it('bills the artists past the leaderboard like a festival poster, by count', async (t) => {
    // Eighteen bands seen four times would run past the leaderboard's twenty places
    const bands = Array.from({ length: 18 }, (_, index) => stat(4, artist(`Band ${index + 1}`)));
    const everyone = [
      stat(12, wilco),
      stat(9, spoon),
      stat(9, artist('Low')),
      ...bands,
      stat(2, artist('Bedhead')),
      stat(1, artist('Yo La Tengo')),
    ];
    stubGraphQL(t, {
      App,
      ShowStats: { leaders: leadersOf(everyone.slice(0, 20)), showStats: everyone, showTotals },
    });
    const body = textOf((await page(routes.shows.stats.href({ entity: 'artist' }))).html);
    assert.doesNotMatch(body, /Most seen/);
    assert.match(
      body,
      /Also on the bill 4 times Band 1 ★ Band 2 .*Band 18 Twice Bedhead Once Yo La Tengo/
    );
  });

  it("gives a venue's place its initials and where it is", async (t) => {
    const garden = {
      id: 'v2',
      city: 'New York',
      name: 'Madison Square Garden',
      slug: 'msg',
      state: 'NY',
    };
    stubGraphQL(t, {
      App,
      ShowStats: {
        leaders: [{ count: 42, ...seen, entity: garden }],
        showStats: [{ count: 42, entity: garden }],
        showTotals,
      },
    });
    const { html } = await page(routes.shows.stats.href({ entity: 'venue' }));
    assert.match(textOf(html), /MSG Number 1 Madison Square Garden New York, NY 42 shows/);
    assert.match(html, /<a href="\/shows\/stats\/venue" aria-current="page"[^>]*>Venues<\/a>/);
    assert.ok(link(html, '/venue/msg') !== undefined);
  });

  it('shows a show with its artists, its venue and where to get tickets', async (t) => {
    const { node } = shows.edges[2];
    stubGraphQL(t, { App, Show: { show: { ...node, artists: [{ ...spoon, appleMusic: null }] } } });
    const { status, html } = await page(routes.shows.show.href({ id: 's3' }));
    assert.equal(status, 200);
    assert.match(html, /<title>Fourth of July Jam » High for This<\/title>/);
    assert.match(textOf(html), /July 4, 2030 - 7:30PM .*Fourth of July Jam .*Spoon/);
    assert.match(link(html, '/artist/spoon') ?? '', /Spoon/);
    assert.match(link(html, '/venue/bowery-ballroom') ?? '', /Bowery Ballroom/);
    assert.match(link(html, 'https://tickets.example/jam') ?? '', /Event Website/);
  });

  it('shows a show whose artists have all been deleted', async (t) => {
    const { node } = shows.edges[0];
    stubGraphQL(t, { App, Show: { show: { ...node, artists: [] } } });
    const { status, html } = await page(routes.shows.show.href({ id: 's1' }));
    assert.equal(status, 200);
    assert.match(html, /<title>Bowery Ballroom » High for This<\/title>/);
    assert.match(textOf(html), /June 14, 2030 - 8:00PM/);
  });
});

describe('the podcast', () => {
  const episode = {
    id: 'e1',
    date: Date.UTC(2024, 0, 5, 17),
    description: 'First line\nSecond line',
    title: 'Episode One',
    audio: {
      id: 'a1',
      destination: '2024/01',
      duration: 307.4,
      fileName: 'one.mp3',
      fileSize: 4_915_200,
      mimeType: 'audio/mpeg',
    },
    image: null,
  };

  it('lists the episodes under what the podcast is about', async (t) => {
    stubGraphQL(t, { App, Podcasts: { podcasts: { edges: [{ node: episode }] } } });
    const { status, html } = await page(routes.podcast.index.href());
    assert.equal(status, 200);
    assert.match(html, /<title>Podcast: The Podcast » High for This<\/title>/);
    assert.match(textOf(html), /Podcast: The Podcast .*Talking about shows .*Episode One/);
    assert.match(link(html, '/podcast/e1') ?? '', /First line<br \/>Second line/);
    assert.equal(meta(html, 'og:image'), `${storage}/2024/01/podcast.jpg`);
    assert.equal(meta(html, 'og:url'), 'https://highforthis.com/podcast');
  });

  it('plays an episode', async (t) => {
    stubGraphQL(t, { App, Podcast: { podcast: episode } });
    const { status, html } = await page(routes.podcast.show.href({ id: 'e1' }));
    assert.equal(status, 200);
    assert.match(html, /<title>Episode One » High for This<\/title>/);
    assert.ok(html.includes(`<audio src="${storage}/2024/01/one.mp3" controls`));
    assert.equal(meta(html, 'og:url'), 'https://highforthis.com/podcast/e1');
  });

  it('serves its feed as XML', async (t) => {
    const podcastSettings = {
      ...App.podcastSettings,
      category: 'Music',
      copyrightText: '&#xA9; 2026',
      explicit: 'no',
      generator: 'High for This',
      itunesEmail: 'podcast@highforthis.test',
      itunesName: 'High for This',
      language: 'en-us',
      managingEditor: 'podcast@highforthis.test',
    };
    stubGraphQL(t, { PodcastFeed: { podcasts: { edges: [{ node: episode }] }, podcastSettings } });
    const { status, html: xml, headers } = await page(routes.podcastFeed.href());
    assert.equal(status, 200);
    assert.equal(headers.get('content-type'), 'application/xml');
    assert.match(xml, /^<\?xml version="1\.0" encoding="utf-8"\?>\s*<rss /);
    assert.match(xml, /<item>\s*<title>Episode One<\/title>/);
    assert.ok(xml.includes(`<enclosure url="${storage}/2024/01/one.mp3" type="audio/mpeg"`));
  });
});
