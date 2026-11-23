import * as assert from 'remix/assert';
import { describe, it } from 'remix/test';

import type { PodcastFeedQuery } from '#/types/graphql.ts';

import { feedTemplate } from './feed.ts';

type Episode = NonNullable<PodcastFeedQuery['podcasts']>['edges'][number]['node'];

const storage = 'https://storage.googleapis.com/wonderboymusic';

const settings: PodcastFeedQuery['podcastSettings'] = {
  id: 'podcast',
  category: 'Music',
  copyrightText: '&#xA9; 2026 High for This',
  description: 'Music as it happens.',
  explicit: 'no',
  feedLink: 'https://highforthis.com/podcast.xml',
  generator: 'High for This',
  itunesEmail: 'podcast@highforthis.test',
  itunesName: 'High for This',
  language: 'en-us',
  managingEditor: 'podcast@highforthis.test (High for This)',
  title: 'High for This',
  websiteLink: 'https://highforthis.com/podcast',
  image: { id: 'i1', destination: '2024/01', fileName: 'podcast.jpg' },
};

const episode = (fields: Partial<Episode> = {}): Episode => ({
  id: 'p1',
  date: Date.UTC(2024, 0, 5, 17),
  description: 'Talking about shows',
  title: 'Episode One',
  audio: {
    id: 'a1',
    destination: '2024/01',
    duration: 307.4,
    fileName: 'episode-one.mp3',
    fileSize: 4_915_200,
    mimeType: 'audio/mpeg',
  },
  image: null,
  ...fields,
});

const feed = (episodes: Episode[], podcastSettings = settings) =>
  feedTemplate({ podcastSettings, podcasts: { edges: episodes.map((node) => ({ node })) } });

/** The feed's <item>s, each as its XML. */
const items = (xml: string): string[] => xml.match(/<item>[\s\S]*?<\/item>/g) ?? [];

describe('podcast feed', () => {
  it('describes the podcast', () => {
    const xml = feed([]);
    assert.ok(xml.startsWith('<?xml version="1.0" encoding="utf-8"?>'));
    assert.match(xml, /<title>High for This<\/title>/);
    assert.match(
      xml,
      /<atom:link href="https:\/\/highforthis\.com\/podcast\.xml" rel="self" type="application\/rss\+xml"\/>/
    );
    assert.match(xml, /<itunes:category text="Music" \/>/);
    assert.ok(xml.includes(`<itunes:image href="${storage}/2024/01/podcast.jpg" />`));
    assert.ok(xml.includes(`<url>${storage}/2024/01/podcast.jpg</url>`));
    assert.deepEqual(items(xml), []);
  });

  it('lists an episode with its audio, its length in seconds and when it came out', () => {
    const [item] = items(feed([episode()]));
    assert.match(item, /<title>Episode One<\/title>/);
    assert.match(item, /<guid>https:\/\/highforthis\.com\/podcast\/p1<\/guid>/);
    assert.match(item, /<pubDate>Fri, 05 Jan 2024 17:00:00 GMT<\/pubDate>/);
    assert.match(item, /<itunes:duration>307<\/itunes:duration>/);
    assert.ok(
      item.includes(
        `<enclosure url="${storage}/2024/01/episode-one.mp3" type="audio/mpeg" length="4915200" />`
      )
    );
  });

  it("gives an episode its own image, or the podcast's", () => {
    const [own, shared] = items(
      feed([
        episode({ image: { id: 'i2', destination: '2024/02', fileName: 'episode.jpg' } }),
        episode({ id: 'p2' }),
      ])
    );
    assert.ok(own.includes(`<itunes:image href="${storage}/2024/02/episode.jpg" />`));
    assert.ok(shared.includes(`<itunes:image href="${storage}/2024/01/podcast.jpg" />`));
  });

  it('leaves out an episode that has no audio yet', () => {
    const xml = feed([episode({ id: 'draft', audio: null }), episode()]);
    assert.equal(items(xml).length, 1);
    assert.ok(!xml.includes('/podcast/draft'));
  });

  it("says what kind of file an episode's audio is, and skips what it doesn't know", () => {
    const [item] = items(
      feed([
        episode({
          date: null,
          audio: { ...episode().audio!, duration: null, mimeType: 'audio/mp4' },
        }),
      ])
    );
    assert.match(item, /type="audio\/mp4"/);
    assert.ok(!item.includes('<pubDate>'));
    assert.ok(!item.includes('<itunes:duration>'));
  });

  it('leaves the images out when the podcast has none', () => {
    const xml = feed([episode()], { ...settings, image: null });
    assert.ok(!xml.includes('<itunes:image'));
    assert.ok(!xml.includes('<image>'));
  });

  it("escapes text, and keeps the copyright's character references", () => {
    const xml = feed([episode({ title: 'Rock & <Roll>', description: 'Q&A' })], {
      ...settings,
      copyrightText: '&#xA9; 2026 Tom & Jerry <b>&copy;',
    });
    assert.match(xml, /<title>Rock &amp; &lt;Roll&gt;<\/title>/);
    assert.match(xml, /<!\[CDATA\[<p>Q&amp;A<\/p>\]\]>/);
    assert.match(xml, /<copyright>&#xA9; 2026 Tom &amp; Jerry &lt;b&gt;&amp;copy;<\/copyright>/);
  });
});
