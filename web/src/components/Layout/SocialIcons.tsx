import cn from 'classnames';
import type { PropsWithChildren } from 'react';

import {
  YOUTUBE_USERNAME,
  INSTAGRAM_USERNAME,
  TWITTER_USERNAME,
  TIKTOK_USERNAME,
} from '@/constants';

type IconProps = PropsWithChildren<{
  url: string;
  className: string;
}>;

const SocialIcon = ({ url, className, children }: IconProps) => (
  <a
    className={cn(
      'font-icons inline-block text-center leading-none',
      'xs:w-10 w-8 text-xl md:text-2xl',
      className
    )}
    href={url}
  >
    <span className="sr-only">{children}</span>
  </a>
);

export default function SocialIcons() {
  return (
    <>
      <SocialIcon className="icons-youtube" url={`https://youtube.com/${YOUTUBE_USERNAME}`}>
        YouTube
      </SocialIcon>
      <SocialIcon className="icons-instagram" url={`https://instagram.com/${INSTAGRAM_USERNAME}`}>
        Instagram
      </SocialIcon>
      <SocialIcon className="icons-twitter" url={`https://twitter.com/${TWITTER_USERNAME}`}>
        Twitter
      </SocialIcon>
      <SocialIcon className="icons-tiktok" url={`https://www.tiktok.com/${TIKTOK_USERNAME}`}>
        TikTok
      </SocialIcon>
    </>
  );
}
