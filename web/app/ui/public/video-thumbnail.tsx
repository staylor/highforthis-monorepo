import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from './cn.ts';

interface VideoThumbnailProps {
  href: string;
  dataId: string;
  title: string;
  thumbUrl?: string;
  class?: string;
}

/**
 * Click-to-play thumbnail: clicking swaps it for the YouTube player. Without JavaScript the
 * link still goes to the video page.
 */
export const VideoThumbnail = clientEntry(
  import.meta.url,
  function VideoThumbnail(handle: Handle<VideoThumbnailProps>) {
    let playing = false;

    return () => {
      const { href, dataId, title, thumbUrl } = handle.props;
      if (playing) {
        return (
          <div class={cn('block', handle.props.class)}>
            <iframe
              class="aspect-video w-full"
              src={`https://www.youtube.com/embed/${dataId}?autoplay=1`}
              title={title}
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      }
      return (
        <a
          href={href}
          class={cn('block', handle.props.class)}
          mix={on('click', (event) => {
            event.preventDefault();
            playing = true;
            handle.update();
          })}
        >
          <figure class="group/thumb relative overflow-hidden rounded-xl">
            {thumbUrl && (
              <img
                src={thumbUrl}
                alt={title}
                class="aspect-video w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
            <div class="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
              <div class="flex size-14 items-center justify-center rounded-full bg-pink/90 backdrop-blur-sm">
                <svg class="ml-0.5 size-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <figcaption class="hidden">{title}</figcaption>
          </figure>
        </a>
      );
    };
  }
);
