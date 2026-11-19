import { clientEntry, on, type Handle } from 'remix/component';

import { PickerDialog } from './picker-dialog.tsx';
import { buttonClass } from './styles.ts';

// The featured media field, from the admin app's FeaturedMedia field. The form submits the picked
// upload's ID in a hidden input, and the field shows it: an image by its 300px crop, or a player
// for audio.

export interface SelectedMedia {
  id: string;
  preview: string | null;
  audio?: string | null;
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

export const FeaturedMedia = clientEntry(
  import.meta.url,
  function FeaturedMedia(handle: Handle<FeaturedMediaProps>) {
    let selected: SelectedMedia[] | null = null;
    let picking = false;

    const setPicking = (value: boolean) => {
      picking = value;
      handle.update();
    };

    return () => {
      const { name, type, buttonText, heading, closeLabel, loadingText } = handle.props;
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
          <button type="button" class={buttonClass()} mix={on('click', () => setPicking(true))}>
            {buttonText}
          </button>
          <PickerDialog
            type={type}
            open={picking}
            onPick={(item) => {
              selected = [{ id: item.id, preview: item.preview, audio: item.audio }];
              setPicking(false);
            }}
            onClose={() => setPicking(false)}
            heading={heading}
            closeLabel={closeLabel}
            loadingText={loadingText}
          />
        </div>
      );
    };
  }
);
