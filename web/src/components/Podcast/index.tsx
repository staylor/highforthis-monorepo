import type { PropsWithChildren } from 'react';

import { Heading1 } from '../Heading';

import AppleLogo from './Apple';
import SpotifyLogo from './Spotify';

type PodcastProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

export default function Podcast({ title, description, children }: PodcastProps) {
  return (
    <article className="mx-auto my-0 w-auto lg:mx-0 lg:w-3/4">
      <Heading1 className="uppercase">{title}</Heading1>
      <p
        className="text-muted dark:text-muted-dark mb-8 text-base leading-relaxed"
        dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />') }}
      />
      <div className="mb-8 flex gap-3">
        <a
          href="https://podcasts.apple.com/us/podcast/high-for-this/id1461883255"
          className="transition-opacity hover:opacity-80"
        >
          <AppleLogo className="h-10 w-auto" />
        </a>
        <a
          href="https://open.spotify.com/show/7FDueRQTovjtNdcqEzfGgV"
          className="transition-opacity hover:opacity-80"
        >
          <SpotifyLogo className="h-10 w-auto" />
        </a>
      </div>
      <div className="space-y-0">{children}</div>
    </article>
  );
}
