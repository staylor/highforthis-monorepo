import type { LoaderFunction } from '@remix-run/server-runtime';
import escape from 'html-escape';

import query from '@/utils/query';
import { uploadUrl } from '@/utils/media';
import type { AudioUpload, PodcastConnection, PodcastSettings } from '@/types/graphql';

import feedQuery from './graphql';

interface PodcastData {
  podcastSettings: PodcastSettings;
  podcasts: PodcastConnection;
}

export const loader: LoaderFunction = async ({ context }) => {
  const data = (await query({ context, query: feedQuery })) as PodcastData;
  const xml = template(data);
  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
};

const template = ({ podcastSettings: settings, podcasts }: PodcastData) => {
  const imageUrl = settings.image
    ? uploadUrl(settings.image.destination, settings.image.fileName)
    : null;

  return `<?xml version="1.0" encoding="utf-8"?>
  <rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${settings.title}</title>
    <description>${settings.description}</description>
    <managingEditor>${settings.managingEditor}</managingEditor>
    <copyright>${settings.copyrightText}</copyright>
    <generator>${settings.generator}</generator>
    <atom:link href="${settings.feedLink}" rel="self" type="application/rss+xml"/>
    <link>${settings.websiteLink}</link>
    <itunes:owner>
       <itunes:name>${settings.itunesName}</itunes:name>
       <itunes:email>${settings.itunesEmail}</itunes:email>
    </itunes:owner>
    <itunes:author>${settings.itunesName}</itunes:author>
    <itunes:summary>${escape(settings.description || '')}</itunes:summary>
    <language>${settings.language}</language>
    <itunes:explicit>${settings.explicit}</itunes:explicit>
    <itunes:category text="${settings.category}" />
    <itunes:image href="${imageUrl}" />
    <image>
      <url>${imageUrl}</url>
      <link>${settings.websiteLink}</link>
      <title>${settings.title}</title>
    </image>
    ${podcasts.edges
      .map(({ node: podcast }) => {
        const { duration, destination, fileName, fileSize } = podcast.audio as AudioUpload;
        const d = duration as number;
        const date = new Date(podcast.date as number) as any;
        const guid = `https://highforthis.com/podcast/${podcast.id}`;
        const audioUrl = uploadUrl(destination, fileName);
        let podcastImageUrl = imageUrl;
        if (podcast.image) {
          podcastImageUrl = uploadUrl(podcast.image.destination, podcast.image.fileName);
        }

        return `<item>
      <title>${escape(podcast.title)}</title>
      <description>${escape(podcast.description)}</description>
      <itunes:summary>${escape(podcast.description)}</itunes:summary>
      <content:encoded>
         <![CDATA[<p>${escape(podcast.description)}</p>]]>
      </content:encoded>
      <guid>${guid}</guid>
      <pubDate>${date.toGMTString()}</pubDate>
      <itunes:explicit>no</itunes:explicit>
      <itunes:image href="${podcastImageUrl}" />
      <itunes:duration>${Math.floor(d / 3600)}:${Math.floor((d % 3600) / 60)}:${Math.floor(
        (d % 3600) % 60
      )}</itunes:duration>
      <enclosure url="${audioUrl}" type="audio/mpeg" length="${fileSize}" />
    </item>`;
      })
      .join('\n')}
  </channel>
  </rss>
      `;
};
