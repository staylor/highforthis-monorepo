import cn from 'classnames';
import { gql } from 'graphql-tag';
import type { SyntheticEvent } from 'react';

import Link, { type CustomLinkProps } from '#/components/Link';
import TextTitle from '#/components/TextTitle';
import type { VideoThumbnail, Video } from '#/types/graphql';

const VideoLink = ({ className, children, ...props }: CustomLinkProps) => (
  <Link {...props} className={cn('block', className)}>
    {children}
  </Link>
);

interface VideoProps {
  video: Video;
  single?: boolean;
  embed?: boolean;
}

const findThumb = (thumbs: VideoThumbnail[]) => {
  const sizes = [640, 480, 320];
  let thumb;

  for (let i = 0; i < sizes.length; i += 1) {
    const size = sizes[i];
    thumb = thumbs.find((t) => t.width === size);
    if (thumb) {
      break;
    }
  }
  return thumb;
};

function VideoComponent({ video, single = false, embed = false }: VideoProps) {
  if (!video) {
    return null;
  }

  const onClick = (e: SyntheticEvent) => {
    e.preventDefault();

    const iframe = document.createElement('iframe');
    iframe.className = 'w-full aspect-video';
    iframe.src = `https://www.youtube.com/embed/${video.dataId}?autoplay=1`;

    e.currentTarget.innerHTML = iframe.outerHTML;
  };

  const thumb = findThumb(video.thumbnails);

  const placeholder = (
    <figure className="group/thumb relative overflow-hidden rounded-xl">
      {thumb && (
        <img
          src={thumb.url}
          alt={video.title}
          className="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      )}
      {/* Play button overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
        <div className="bg-pink/90 flex h-14 w-14 items-center justify-center rounded-full backdrop-blur-sm">
          <svg className="ml-0.5 h-7 w-7 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>
      <figcaption className="hidden">{video.title}</figcaption>
    </figure>
  );

  if (embed) {
    return (
      <>
        <VideoLink to={`/video/${video.slug}`} onClick={onClick} className="m-0">
          {placeholder}
        </VideoLink>
        <h3 className="mb-6 text-base">
          {single ? video.title : <Link to={`/video/${video.slug}`}>{video.title}</Link>}
        </h3>
      </>
    );
  }

  return (
    <article className="group">
      <VideoLink to={`/video/${video.slug}`} onClick={onClick} className="mb-3">
        {placeholder}
      </VideoLink>
      {single ? (
        <TextTitle>{video.title}</TextTitle>
      ) : (
        <h1 className="group-hover:text-pink text-base leading-snug font-semibold transition-colors">
          <Link to={`/video/${video.slug}`}>{video.title}</Link>
        </h1>
      )}
    </article>
  );
}

VideoComponent.fragments = {
  video: gql`
    fragment Video_video on Video {
      dataId
      id
      slug
      thumbnails {
        height
        url
        width
      }
      title
    }
  `,
};

export default VideoComponent;
