import { clientEntry, css, on, type Handle } from 'remix/component';

import { merge, text } from '../../public/styles.ts';

import { input } from './styles.ts';

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
            mix={[
              css({
                marginBlock: '1.25rem',
                display: 'block',
                height: '12.5rem',
                width: '100%',
                maxWidth: '37.5rem',
                border: '4px dashed var(--dark)',
              }),
              on('dragover', (event) => event.preventDefault()),
              on('drop', (event) => {
                event.preventDefault();
                for (const file of event.dataTransfer?.files ?? []) {
                  upload(file);
                }
              }),
            ]}
          >
            <p
              mix={css({
                marginInline: 'auto',
                marginTop: '4rem',
                padding: '0.25rem 1.25rem',
                textAlign: 'center',
                ...text.xl,
              })}
            >
              {labels.dropFiles}
            </p>
          </div>
          <label
            mix={css({
              marginBottom: '1.25rem',
              display: 'block',
              maxWidth: '37.5rem',
              ...text.sm,
            })}
          >
            <span
              mix={css({
                marginBottom: '0.25rem',
                display: 'block',
                letterSpacing: '0.025em',
                color: 'var(--gray-700)',
              })}
            >
              {labels.chooseFiles}
            </span>
            <input
              type="file"
              multiple
              mix={[
                css(merge(input, { width: '100%', padding: '0.25rem' })),
                on('change', (event) => {
                  const field = event.currentTarget;
                  for (const file of field.files ?? []) {
                    upload(file);
                  }
                  field.value = '';
                }),
              ]}
            />
          </label>
          {[...uploads.entries()].map(([key, item]) => (
            <div
              mix={css({
                position: 'relative',
                marginBlock: '0.625rem',
                boxSizing: 'border-box',
                height: '1.875rem',
                width: '100%',
                maxWidth: '37.5rem',
                ...text.sm,
              })}
              key={key}
            >
              <div mix={css({ position: 'relative', zIndex: 20 })}>
                {item.name} {item.id && <a href={`/admin/media/${item.id}`}>{labels.edit}</a>}
                {item.failed && <span mix={css({ color: 'var(--red-700)' })}>{labels.failed}</span>}
              </div>
              {/* The upload's progress */}
              <div
                mix={css({
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  zIndex: 10,
                  height: '1.875rem',
                  backgroundColor: 'var(--pink)',
                })}
                style={{ width: item.id || item.failed ? '3px' : `${item.progress}%` }}
              />
            </div>
          ))}
        </>
      );
    };
  }
);
