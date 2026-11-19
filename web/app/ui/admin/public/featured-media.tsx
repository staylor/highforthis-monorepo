import { clientEntry, on, ref, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { buttonClass } from './styles.ts';

// The form submits the picked upload's ID in a hidden input. The picker is a <dialog>, which
// brings focus handling and Escape, and it pages through /admin/media-picker/:type as it
// scrolls.

export interface SelectedMedia {
  id: string;
  preview: string | null;
  audio?: string | null;
}

export interface MediaPickerItem extends SelectedMedia {
  title: string;
  thumb: string | null;
}

interface FeaturedMediaProps {
  name: string;
  type: string;
  media: SelectedMedia[];
  buttonText: string;
  heading: string;
  closeLabel: string;
  loadingText: string;
}

interface PickerPage {
  items: MediaPickerItem[];
  endCursor: string | null;
  hasNextPage: boolean;
}

export const FeaturedMedia = clientEntry(
  import.meta.url,
  function FeaturedMedia(handle: Handle<FeaturedMediaProps>) {
    let selected: SelectedMedia[] | null = null;
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
          throw new Error(`The media picker got ${response.status}`);
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

    const open = () => {
      dialog?.showModal();
      if (items.length === 0) {
        void loadMore();
      }
    };

    const pick = (item: MediaPickerItem) => {
      selected = [{ id: item.id, preview: item.preview, audio: item.audio }];
      dialog?.close();
      handle.update();
    };

    return () => {
      const { name, buttonText, heading, closeLabel, loadingText } = handle.props;
      const media = (selected ?? handle.props.media).filter(Boolean);
      return (
        <div>
          {/* Several uploads submit as an array, because they share the name */}
          {media.map((upload) => (
            <input type="hidden" name={name} value={upload.id} />
          ))}
          {media.map((upload) => {
            if (upload.audio) {
              return (
                <figure class="my-4">
                  <audio controls src={upload.audio} />
                </figure>
              );
            }
            return upload.preview ? (
              <img class="mr-2.5 mb-2.5" alt="" src={upload.preview} />
            ) : (
              <p>{upload.id}</p>
            );
          })}
          <button type="button" class={buttonClass()} mix={on('click', open)}>
            {buttonText}
          </button>
          <dialog
            aria-label={heading}
            class={cn(
              'fixed inset-2 m-0 max-h-none max-w-none size-auto',
              'border-2 border-dark bg-white p-4 backdrop:bg-black/50 sm:inset-[10%] sm:p-7'
            )}
            mix={ref((node) => {
              dialog = node as HTMLDialogElement;
            })}
          >
            <button
              type="button"
              aria-label={closeLabel}
              class={cn(
                'absolute top-2.5 right-2.5 flex size-6 cursor-pointer items-center justify-center',
                'rounded-full text-dark transition-colors hover:bg-neutral-100'
              )}
              mix={on('click', () => dialog?.close())}
            >
              {/* The admin's close icon (ui/admin/icon.tsx), which stays server-only */}
              <svg
                class="size-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                stroke-width="1.5"
                aria-hidden="true"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
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
                  mix={on('click', () => pick(item))}
                >
                  {item.thumb ? <img alt="" src={item.thumb} /> : null}
                  <span class="block truncate text-sm">{item.title}</span>
                </button>
              ))}
              {loading && <p class="clear-both py-4 text-sm">{loadingText}</p>}
            </div>
          </dialog>
        </div>
      );
    };
  }
);
