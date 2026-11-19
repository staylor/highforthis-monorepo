import { clientEntry, css, on, type Handle } from 'remix/component';

interface VideoThumbnailProps {
  href: string;
  dataId: string;
  title: string;
  thumbUrl?: string;
  /** In a post: no space below. */
  embedded?: boolean;
}

const frame = css({
  display: 'block',
  marginBottom: '0.75rem',
  '&[data-embedded]': { marginBottom: 0 },
});

/**
 * Click-to-play thumbnail: clicking swaps it for the YouTube player. Without JavaScript the
 * link still goes to the video page.
 */
export const VideoThumbnail = clientEntry(
  import.meta.url,
  function VideoThumbnail(handle: Handle<VideoThumbnailProps>) {
    let playing = false;

    return () => {
      const { href, dataId, title, thumbUrl, embedded } = handle.props;
      if (playing) {
        return (
          <div mix={frame} data-embedded={embedded || undefined}>
            <iframe
              mix={css({ aspectRatio: '16 / 9', width: '100%' })}
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
          data-embedded={embedded || undefined}
          mix={[
            frame,
            on('click', (event) => {
              event.preventDefault();
              playing = true;
              handle.update();
            }),
          ]}
        >
          {/* Hovering zooms the thumbnail and shows the play button */}
          <figure
            mix={css({
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '0.75rem',
              '& img': {
                aspectRatio: '16 / 9',
                width: '100%',
                objectFit: 'cover',
                transition: 'scale 500ms var(--ease)',
              },
              '&:hover img': { scale: 1.05 },
              '& .play': {
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: 0,
                transition: 'opacity 150ms var(--ease)',
              },
              '&:hover .play': { opacity: 1 },
            })}
          >
            {thumbUrl && <img src={thumbUrl} alt={title} />}
            <div class="play">
              <div
                mix={css({
                  display: 'flex',
                  width: '3.5rem',
                  height: '3.5rem',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '9999px',
                  backgroundColor: 'rgb(229 0 130 / 0.9)',
                  backdropFilter: 'blur(8px)',
                })}
              >
                <svg
                  mix={css({
                    marginLeft: '0.125rem',
                    width: '1.75rem',
                    height: '1.75rem',
                    color: '#fff',
                  })}
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <figcaption hidden>{title}</figcaption>
          </figure>
        </a>
      );
    };
  }
);
