import { clientEntry, on, type Handle } from 'remix/component';

import { cn } from '../../public/cn.ts';

import { inputBase } from './styles.ts';

// Each file uploads to /upload with its progress, then links to its edit page. Web adds the
// admin's token on the way to GraphQL, since the browser can't read the session cookie.

interface MediaUploaderProps {
  labels: { dropFiles: string; chooseFiles: string; edit: string; failed: string };
}

interface Upload {
  name: string;
  /** How much has been sent, out of 100. */
  progress: number;
  id?: string;
  failed?: boolean;
}

export const MediaUploader = clientEntry(
  import.meta.url,
  function MediaUploader(handle: Handle<MediaUploaderProps>) {
    const uploads = new Map<string, Upload>();

    function upload(file: File) {
      const key = `${file.name}${file.size}${file.lastModified}`;
      const current: Upload = { name: file.name, progress: 0.1 };
      uploads.set(key, current);
      handle.update();

      const formData = new FormData();
      formData.append('uploads', file);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', '/upload');
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          current.progress = Math.floor((event.loaded / event.total) * 100);
          handle.update();
        }
      });
      xhr.addEventListener('load', () => {
        try {
          const ids: unknown = JSON.parse(xhr.responseText);
          if (xhr.status >= 400 || !Array.isArray(ids) || typeof ids[0] !== 'string') {
            throw new Error(`The upload got ${xhr.status}`);
          }
          current.id = ids[0];
          current.progress = 100;
        } catch (error) {
          current.failed = true;
          console.error(error);
        }
        handle.update();
      });
      xhr.addEventListener('error', () => {
        current.failed = true;
        handle.update();
      });
      xhr.send(formData);
    }

    return () => {
      const { labels } = handle.props;
      return (
        <>
          <div
            class="my-5 block h-50 w-full max-w-150 border-4 border-dashed border-dark"
            mix={[
              on('dragover', (event) => event.preventDefault()),
              on('drop', (event) => {
                event.preventDefault();
                for (const file of event.dataTransfer?.files ?? []) {
                  upload(file);
                }
              }),
            ]}
          >
            <p class="mx-auto mt-16 px-5 py-1 text-center text-xl">{labels.dropFiles}</p>
          </div>
          <label class="mb-5 block max-w-150 text-sm">
            <span class="mb-1 block tracking-wide text-gray-700">{labels.chooseFiles}</span>
            <input
              type="file"
              multiple
              class={cn(inputBase, 'w-full p-1')}
              mix={on('change', (event) => {
                const input = event.currentTarget;
                for (const file of input.files ?? []) {
                  upload(file);
                }
                input.value = '';
              })}
            />
          </label>
          {[...uploads.entries()].map(([key, item]) => (
            <div class="relative my-2.5 box-border h-7.5 w-full max-w-150 text-sm" key={key}>
              <div class="relative z-20">
                {item.name} {item.id && <a href={`/admin/media/${item.id}`}>{labels.edit}</a>}
                {item.failed && <span class="text-red-700">{labels.failed}</span>}
              </div>
              <div
                class="absolute top-0 left-0 z-10 h-7.5 bg-pink"
                style={{ width: item.id || item.failed ? '3px' : `${item.progress}%` }}
              />
            </div>
          ))}
        </>
      );
    };
  }
);
