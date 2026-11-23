import * as assert from 'remix/assert';
import { renderToString } from 'remix/component/server';
import { describe, it } from 'remix/test';

import { getT } from '#/lib/i18n.ts';
import type { Videos_VideosFragment } from '#/types/graphql.ts';
import { AppProvider, type AppValue } from '#/ui/app-context.tsx';

import { Videos } from './videos.tsx';

type Connection = NonNullable<Videos_VideosFragment['videos']>;

const app: AppValue = { t: getT(), root: {} as AppValue['root'], pathname: '/videos' };

const video = (id: string): Connection['edges'][number] => ({
  cursor: `cursor-${id}`,
  node: {
    id,
    dataId: `youtube-${id}`,
    slug: `video-${id}`,
    title: `Video ${id}`,
    thumbnails: [{ height: 360, url: `https://i.ytimg.com/${id}.jpg`, width: 480 }],
  },
});

const render = (
  edges: Connection['edges'],
  pageInfo: Connection['pageInfo'],
  search = new URLSearchParams(),
  heading?: 'h3'
) =>
  renderToString(
    <AppProvider value={app}>
      <Videos videos={{ count: edges.length, edges, pageInfo }} search={search} heading={heading} />
    </AppProvider>
  );

const links = (html: string) =>
  Array.from(html.matchAll(/<a[^>]* href="(\?[^"]*)"/g), ([, href]) => href);

describe('Videos', () => {
  it('pages back from its first video and on from its last', async () => {
    const html = await render([video('1'), video('2'), video('3')], {
      hasNextPage: true,
      hasPreviousPage: true,
    });
    assert.deepEqual(links(html), ['?before=cursor-1', '?after=cursor-3']);
  });

  it('pages back to where it came from, and on to where it went back from', async () => {
    const pageInfo = { hasNextPage: false, hasPreviousPage: false };
    assert.deepEqual(
      links(await render([video('4')], pageInfo, new URLSearchParams('after=cursor-3'))),
      ['?before=cursor-4']
    );
    assert.deepEqual(
      links(await render([video('1')], pageInfo, new URLSearchParams('before=cursor-2'))),
      ['?after=cursor-1']
    );
  });

  it("titles each video a level below the page's heading, or a section's when asked", async () => {
    const pageInfo = { hasNextPage: false, hasPreviousPage: false };
    const page = await render([video('1'), video('2')], pageInfo);
    assert.equal(page.match(/<h2[ >]/g)?.length, 2);
    assert.doesNotMatch(page, /<h1[ >]/);

    const section = await render([video('1')], pageInfo, new URLSearchParams(), 'h3');
    assert.match(section, /<h3[^>]*><a [^>]*href="\/video\/video-1"[^>]*>Video 1<\/a><\/h3>/);
    assert.doesNotMatch(section, /<h[12][ >]/);
  });

  it('has no links on a single page', async () => {
    const html = await render([video('1')], { hasNextPage: false, hasPreviousPage: false });
    assert.deepEqual(links(html), []);
  });

  it('says so when a page has no videos, as past the last one', async () => {
    const html = await render(
      [],
      { hasNextPage: false, hasPreviousPage: false },
      new URLSearchParams('after=cursor-9')
    );
    assert.match(html, /No videos found\./);
    assert.deepEqual(links(html), []);
  });
});
