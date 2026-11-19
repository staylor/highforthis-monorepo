import { on, ref, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { Icon } from './icon.tsx';

// The picker for media and videos, from the admin app's media and video modals: a <dialog>, which
// brings focus handling and Escape, that pages through /admin/media-picker/:type as it scrolls.
// The featured media field and the post editor's image and video blocks use it.

/** An image as the post editor's image block keeps it. */
export interface PickerImage {
  id: string;
  destination: string;
  crops: { fileName: string; width: number }[];
}

/** A video as the post editor's video block keeps it. */
export interface PickerVideo {
  id: string;
  dataId: string;
  slug: string;
  title: string;
  thumbnails: { url: string; width: number; height: number }[];
}

/** An upload or video in the picker, with its thumbnail. */
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
  /** Translated text: the picker's name, its close button and its loading line. */
  heading: string;
  closeLabel: string;
  loadingText: string;
}

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
        class={cn(
          'fixed inset-2 m-0 max-h-none max-w-none size-auto',
          'border-2 border-dark bg-white p-4 backdrop:bg-black/50 sm:inset-[10%] sm:p-7'
        )}
        mix={[
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
          class={cn(
            'absolute top-2.5 right-2.5 flex size-6 cursor-pointer items-center justify-center',
            'rounded-full text-dark transition-colors hover:bg-neutral-100'
          )}
          mix={on('click', () => onClose())}
        >
          <Icon name="close" class="size-4" />
        </button>
        <div
          class={cn(
            'absolute inset-x-4 top-12 bottom-4 overflow-auto after:clear-both after:table',
            'sm:top-7.5 sm:right-10 sm:bottom-10 sm:left-7.5'
          )}
          mix={on('scroll', (event) => {
            const frame = event.currentTarget;
            if (frame.scrollTop + frame.offsetHeight >= frame.scrollHeight - 200) {
              void loadMore();
            }
          })}
        >
          {items.map((item) => (
            <button
              type="button"
              // A column from the top: a button centers what it holds
              class="float-left m-1.5 flex h-28 w-30 cursor-pointer flex-col justify-start overflow-hidden bg-zinc-50 text-left"
              mix={on('click', () => onPick(item))}
            >
              {item.thumb ? <img alt="" src={item.thumb} /> : null}
              <span class="block truncate text-sm">{item.title}</span>
            </button>
          ))}
          {loading && <p class="clear-both py-4 text-sm">{loadingText}</p>}
        </div>
      </dialog>
    );
  };
}
