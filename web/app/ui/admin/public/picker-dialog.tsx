import { css, on, ref, type Handle } from 'remix/component';

import { colorTransition, sm, text } from '../../public/styles.ts';

import { Icon } from './icon.tsx';

// A <dialog>, which brings focus handling and Escape, that pages through
// /admin/media-picker/:type as it scrolls. The featured media field and the post editor's image
// and video blocks use it.

/** An image as the post editor's image block keeps it. */
interface PickerImage {
  id: string;
  destination: string;
  crops: { fileName: string; width: number }[];
}

/** A video as the post editor's video block keeps it. */
interface PickerVideo {
  id: string;
  dataId: string;
  slug: string;
  title: string;
  thumbnails: { url: string; width: number; height: number }[];
}

export interface MediaPickerItem {
  id: string;
  title: string;
  thumb: string | null;
  /** What a field shows once it's picked: an image's 300px crop. */
  preview: string | null;
  /** An audio file, to play. */
  audio?: string | null;
  image?: PickerImage | null;
  video?: PickerVideo | null;
}

interface PickerPage {
  items: MediaPickerItem[];
  endCursor: string | null;
  hasNextPage: boolean;
}

interface PickerDialogProps {
  /** What it lists: `image`, `audio` or `video`. */
  type: string;
  open: boolean;
  onPick: (item: MediaPickerItem) => void;
  onClose: () => void;
  heading: string;
  closeLabel: string;
  loadingText: string;
}

// Nearly the whole window, with the page dimmed behind it
const dialogStyle = css({
  position: 'fixed',
  inset: '0.5rem',
  margin: 0,
  maxHeight: 'none',
  maxWidth: 'none',
  width: 'auto',
  height: 'auto',
  border: '2px solid var(--dark)',
  backgroundColor: '#fff',
  padding: '1rem',
  '&::backdrop': { backgroundColor: 'rgb(0 0 0 / 0.5)' },
  [sm]: { inset: '10%', padding: '1.75rem' },
});

const closeButton = css({
  position: 'absolute',
  top: '0.625rem',
  right: '0.625rem',
  display: 'flex',
  width: '1.5rem',
  height: '1.5rem',
  cursor: 'pointer',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '9999px',
  color: 'var(--dark)',
  ...colorTransition,
  '&:hover': { backgroundColor: 'var(--neutral-100)' },
});

// The scrolling list of uploads, which float in rows
const frameStyle = css({
  position: 'absolute',
  insetInline: '1rem',
  top: '3rem',
  bottom: '1rem',
  overflow: 'auto',
  '&::after': { content: '""', clear: 'both', display: 'table' },
  [sm]: { top: '1.875rem', right: '2.5rem', bottom: '2.5rem', left: '1.875rem' },
});

// A column from the top: a button centers what it holds
const itemStyle = css({
  float: 'left',
  margin: '0.375rem',
  display: 'flex',
  height: '7rem',
  width: '7.5rem',
  cursor: 'pointer',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  overflow: 'hidden',
  backgroundColor: 'var(--zinc-50)',
  textAlign: 'left',
});

export function PickerDialog(handle: Handle<PickerDialogProps>) {
  let items: MediaPickerItem[] = [];
  let endCursor: string | null = null;
  let hasNextPage = true;
  let loading = false;
  let dialog: HTMLDialogElement | null = null;

  async function loadMore() {
    if (loading || !hasNextPage) {
      return;
    }
    loading = true;
    handle.update();
    const url = new URL(`/admin/media-picker/${handle.props.type}`, window.location.href);
    if (endCursor) {
      url.searchParams.set('cursor', endCursor);
    }
    try {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      if (!response.ok) {
        throw new Error(`The picker got ${response.status}`);
      }
      const page: PickerPage = await response.json();
      const seen = new Set(items.map((item) => item.id));
      items = [...items, ...page.items.filter((item) => !seen.has(item.id))];
      endCursor = page.endCursor;
      hasNextPage = page.hasNextPage;
    } catch (error) {
      hasNextPage = false;
      console.error(error);
    } finally {
      loading = false;
      handle.update();
    }
  }

  // Opens or closes the dialog to match `open`, once it's rendered
  const sync = () => {
    if (!dialog) {
      return;
    }
    if (handle.props.open && !dialog.open) {
      dialog.showModal();
      if (items.length === 0) {
        void loadMore();
      }
    } else if (!handle.props.open && dialog.open) {
      dialog.close();
    }
  };

  return () => {
    const { heading, closeLabel, loadingText, onPick, onClose } = handle.props;
    handle.queueTask(sync);
    return (
      <dialog
        aria-label={heading}
        mix={[
          dialogStyle,
          ref((node) => {
            dialog = node as HTMLDialogElement;
            sync();
          }),
          // Escape closes it too
          on('close', () => onClose()),
        ]}
      >
        <button
          type="button"
          aria-label={closeLabel}
          mix={[closeButton, on('click', () => onClose())]}
        >
          <Icon name="close" size="1rem" />
        </button>
        <div
          mix={[
            frameStyle,
            on('scroll', (event) => {
              const frame = event.currentTarget;
              if (frame.scrollTop + frame.offsetHeight >= frame.scrollHeight - 200) {
                void loadMore();
              }
            }),
          ]}
        >
          {items.map((item) => (
            <button type="button" mix={[itemStyle, on('click', () => onPick(item))]}>
              {item.thumb ? <img alt="" src={item.thumb} /> : null}
              <span
                mix={css({
                  display: 'block',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  ...text.sm,
                })}
              >
                {item.title}
              </span>
            </button>
          ))}
          {loading && (
            <p mix={css({ clear: 'both', paddingBlock: '1rem', ...text.sm })}>{loadingText}</p>
          )}
        </div>
      </dialog>
    );
  };
}
