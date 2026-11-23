import { gql } from 'graphql-tag';
import { html } from 'remix/html-template';

import type { PodcastFeedQuery } from '#/types/graphql.ts';
import { uploadUrl } from '#/ui/public/media.ts';

export const feedQuery = gql`
  query PodcastFeed {
    podcasts {
      edges {
        node {
          id
          date
          description
          title
          audio {
            id
            destination
            duration
            fileName
            fileSize
            mimeType
          }
          image {
            id
            destination
            fileName
          }
        }
      }
    }
    podcastSettings {
      id
      category
      copyrightText
      description
      explicit
      feedLink
      generator
      itunesEmail
      itunesName
      language
      managingEditor
      title
      websiteLink
      image {
        id
        destination
        fileName
      }
    }
  }
`;

type Upload = { destination: string; fileName: string };

const urlOf = (upload: Upload | null) =>
  upload ? uploadUrl(upload.destination, upload.fileName) : null;

// An & that doesn't start a character reference XML knows: a numbered one, or one of its five names
const STRAY_AMPERSAND = /&(?!#\d+;|#x[0-9a-f]+;|(?:amp|lt|gt|quot|apos);)/gi;

/**
 * The copyright is stored with character references, such as &#xA9; for ©, which go in as they
 * are. The rest of it is escaped, so a stray & or < can't break the feed.
 */
function copyright(text: string | null) {
  const escaped = (text ?? '')
    .replace(STRAY_AMPERSAND, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  return html.raw`${escaped}`;
}

/** The podcast's RSS feed. An episode is in it once it has audio. */
export function feedTemplate({ podcastSettings: settings, podcasts }: PodcastFeedQuery) {
  const image = urlOf(settings.image);

  const episodes = (podcasts?.edges ?? []).map(({ node: podcast }) => {
    const { audio } = podcast;
    if (!audio) {
      return null;
    }
    const episodeImage = urlOf(podcast.image) ?? image;
    // Podcast apps know an episode by its guid, so this stays as it was first published
    const guid = `https://highforthis.com/podcast/${podcast.id}`;
    const published =
      podcast.date === null
        ? null
        : html`<pubDate>${new Date(podcast.date).toUTCString()}</pubDate>`;
    // In whole seconds, which is how Apple asks for it
    const duration =
      audio.duration === null
        ? null
        : html`<itunes:duration>${Math.round(audio.duration)}</itunes:duration>`;

    return html`<item>
      <title>${podcast.title}</title>
      <description>${podcast.description}</description>
      <itunes:summary>${podcast.description}</itunes:summary>
      <content:encoded><![CDATA[<p>${podcast.description}</p>]]></content:encoded>
      <guid>${guid}</guid>
      ${published}
      <itunes:explicit>no</itunes:explicit>
      ${episodeImage && html`<itunes:image href="${episodeImage}" />`} ${duration}
      <enclosure url="${urlOf(audio)}" type="${audio.mimeType}" length="${audio.fileSize}" />
    </item> `;
  });

  // html escapes every value in the template, which XML needs as much as HTML does
  return String(
    html`<?xml version="1.0" encoding="utf-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${settings.title}</title>
    <description>${settings.description}</description>
    <managingEditor>${settings.managingEditor}</managingEditor>
    <copyright>${copyright(settings.copyrightText)}</copyright>
    <generator>${settings.generator}</generator>
    <atom:link href="${settings.feedLink}" rel="self" type="application/rss+xml"/>
    <link>${settings.websiteLink}</link>
    <itunes:owner>
      <itunes:name>${settings.itunesName}</itunes:name>
      <itunes:email>${settings.itunesEmail}</itunes:email>
    </itunes:owner>
    <itunes:author>${settings.itunesName}</itunes:author>
    <itunes:summary>${settings.description}</itunes:summary>
    <language>${settings.language}</language>
    <itunes:explicit>${settings.explicit}</itunes:explicit>
    <itunes:category text="${settings.category}" />
    ${image && html`<itunes:image href="${image}" />`}
    ${
      image &&
      html`<image>
      <url>${image}</url>
      <link>${settings.websiteLink}</link>
      <title>${settings.title}</title>
    </image>`
    }
    ${episodes}
  </channel>
</rss>
`
  );
}
