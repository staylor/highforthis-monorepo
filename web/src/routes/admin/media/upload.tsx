import type { DragEvent } from 'react';
import { useReducer } from 'react';
import { useTranslation } from 'react-i18next';

import { Heading } from '~/components/Admin/styles';
import Link from '~/components/Link';

interface PendingUpload extends File {
  id: string;
  progress: number;
}

interface PendingUploads {
  [key: string]: PendingUpload;
}

const reducer = (a: PendingUploads, b: PendingUploads) => ({ ...a, ...b });

export default function Media() {
  const { t } = useTranslation();
  const [uploads, setUploads] = useReducer(reducer, {} as PendingUploads);

  const setUpload = (guid: string, data: Partial<PendingUpload>) => {
    setUploads({
      [guid]: {
        ...uploads[guid],
        ...data,
      },
    });
  };

  const createUpload = (file: File) => {
    const guid = `${file.name}${file.size}${file.lastModified}`;

    const upload = {
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0.1,
    };

    const setComplete = (id: string) => {
      setUpload(guid, {
        progress: 100,
        id,
      });
    };

    const formData = new FormData();
    formData.append('uploads', file);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/upload');
    xhr.onload = function onload() {
      const ids = JSON.parse(this.responseText);
      setComplete(ids[0]);
    };

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const complete = ((event.loaded / event.total) * 100) | 0;
        setUpload(guid, {
          progress: complete,
        });
      }
    };

    xhr.send(formData);
    setUpload(guid, upload);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();

    if (!e.dataTransfer) {
      return;
    }

    for (let i = 0; i < e.dataTransfer.files.length; i += 1) {
      createUpload(e.dataTransfer.files[i]);
    }
  };

  return (
    <>
      <Heading>{t('media.upload')}</Heading>
      <div
        className="h-50 w-150 border-dark my-5 block border-4 border-dashed"
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnd={() => false}
      >
        <p className="mx-auto mt-16 px-5 py-1 text-center text-xl">{t('media.dropFiles')}</p>
      </div>
      {Object.keys(uploads).map((key) => {
        const upload = uploads[key];
        return (
          <div className="h-7.5 w-150 relative my-2.5 box-border text-sm" key={key}>
            <div className="relative z-20">
              {upload.name}{' '}
              {upload.id ? <Link to={`/admin/media/${upload.id}`}>{t('media.edit')}</Link> : null}
            </div>
            <div
              className="h-7.5 bg-pink absolute left-0 top-0 z-10"
              style={{ width: upload.id ? '3px' : `${upload.progress}%` }}
            />
          </div>
        );
      })}
    </>
  );
}
