import { css, unsafeHTML } from 'remix/component';
import { createAction, createController } from 'remix/router';

import {
  backTo,
  formActions,
  listAction,
  renderAdminNotFound,
  renderAdminPage,
  type AdminContext,
  type AdminEditContext,
} from '#/actions/admin/render-page.tsx';
import { isRedirect, type SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { MediaAdminQuery, UploadsAdminQuery } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListFilter, ListTable, Search, TitleCell } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { Alert, HeaderAdd, Heading } from '#/ui/admin/page.tsx';
import { CoverPicker } from '#/ui/admin/public/cover-picker.tsx';
import { MediaUploader } from '#/ui/admin/public/media-uploader.tsx';
import { input } from '#/ui/admin/public/styles.ts';
import { uploadUrl } from '#/ui/public/media.ts';
import { merge, text } from '#/ui/public/styles.ts';

import {
  addAlbumCovers,
  deleteMedia,
  loadMedia,
  loadMediaList,
  searchAlbumCovers,
  updateMedia,
} from './library-data.ts';

const previewImage = css({ marginBlock: '0.625rem' });
const player = css({ marginBlock: '0.625rem 1.25rem' });

// Each route has its own controller, since controller middleware doesn't apply to nested route
// maps.

const media = routes.admin.media;

type UploadRow = NonNullable<UploadsAdminQuery['uploads']>['edges'][number]['node'];
type Media = NonNullable<MediaAdminQuery['media']>;

interface Crop {
  fileName: string;
  width: number;
  height?: number | null;
  fileSize?: number;
}

function formatFileSize(bytes: number) {
  const units = ['B', 'kB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1000 && unit < units.length - 1) {
    size /= 1000;
    unit += 1;
  }
  return `${unit === 0 ? size : Number(size.toFixed(2))} ${units[unit]}`;
}

/** An upload's crops, or an audio file's images, smallest first. */
function cropsOf(upload: { crops?: (Crop | null)[] | null; images?: (Crop | null)[] | null }) {
  const crops = [...(upload.crops ?? upload.images ?? [])].filter((crop): crop is Crop =>
    Boolean(crop)
  );
  return crops.sort((a, b) => a.width - b.width);
}

function thumbnail(upload: UploadRow) {
  const [smallest] = cropsOf(upload as Parameters<typeof cropsOf>[0]);
  return smallest ? (
    <img
      mix={css({ width: '4rem' })}
      src={uploadUrl(upload.destination, smallest.fileName)}
      alt=""
    />
  ) : null;
}

export const mediaList = createController(media.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { searchParams } = context.url;
      const { uploads } = await loadMediaList({ gql: context.admin.gql, searchParams });
      const filterHref = (key: string, value: string) =>
        `${media.list.index.href()}?${new URLSearchParams({ [key]: value })}`;
      const columns = [
        { styles: { width: '4rem' }, render: thumbnail },
        {
          label: t('media.title'),
          styles: { width: '60%' },
          render: (upload: UploadRow) => (
            <TitleCell
              href={media.edit.index.href({ id: upload.id })}
              title={upload.title}
              subtitle={upload.originalName}
              id={upload.id}
            />
          ),
        },
        {
          label: t('media.type'),
          render: (upload: UploadRow) => (
            <a href={filterHref('type', upload.type)}>{upload.type}</a>
          ),
        },
        {
          label: t('media.mimeType'),
          render: (upload: UploadRow) => (
            <a href={filterHref('mimeType', upload.mimeType)}>{upload.mimeType}</a>
          ),
        },
      ];
      const filters = (
        <>
          <ListFilter
            name="type"
            placeholder={t('media.selectMediaType')}
            choices={(uploads?.types ?? []).map((type) => ({
              value: type,
              label: type.charAt(0).toUpperCase() + type.slice(1),
            }))}
          />
          <ListFilter
            name="mimeType"
            placeholder={t('media.selectMimeType')}
            choices={(uploads?.mimeTypes ?? []).map((type) => ({ value: type, label: type }))}
          />
        </>
      );

      return renderAdminPage(
        context,
        <>
          <Heading>{t('media.heading')}</Heading>
          <HeaderAdd href={media.upload.href()} label={t('media.add')} />
          <Message param="deleted" text={(count) => t('media.deleted', { count })} />
          <Message param="added" text={(count) => t('media.albumCovers.added', { count })} />
          <Search placeholder={t('media.search')} />
          <ListTable connection={uploads} columns={columns} filters={filters} />
        </>,
        { title: t('media.heading') }
      );
    },

    action: listAction(deleteMedia),
  },
});

export const mediaUpload = createAction(media.upload, {
  middleware: [requireAdmin()],
  handler(context) {
    const t = getAdminT();
    const label = t('media.upload');
    return renderAdminPage(
      context,
      <>
        <Heading>{label}</Heading>
        <MediaUploader
          editHref={media.edit.index.href({ id: 'ID' }).replace(/ID$/, '{id}')}
          labels={{
            dropFiles: t('media.dropFiles'),
            chooseFiles: t('media.chooseFiles'),
            edit: t('media.edit'),
            failed: t('media.uploadFailed'),
          }}
        />
      </>,
      { title: label }
    );
  },
});

async function renderAlbumCoversPage(context: AdminContext, options: { failed?: boolean } = {}) {
  const t = getAdminT();
  const { appleMusicAlbums: results } = await searchAlbumCovers({
    gql: context.admin.gql,
    searchParams: context.url.searchParams,
  });
  const label = t('media.albumCovers.heading');
  let body;
  if (results?.error) {
    body = <Alert>{results.error}</Alert>;
  } else if (!results) {
    body = <p mix={css({ marginBlock: '1rem', ...text.sm })}>{t('media.albumCovers.hint')}</p>;
  } else if (results.albums.length === 0) {
    body = <p mix={css({ marginBlock: '2.5rem' })}>{t('media.albumCovers.empty')}</p>;
  } else {
    const albums = results.albums.map(({ id, name, artistName, releaseDate, cover, artwork }) => ({
      id,
      name,
      artistName,
      cover,
      details: [
        releaseDate?.slice(0, 4),
        artwork.width && artwork.height && `${artwork.width} × ${artwork.height}`,
      ]
        .filter(Boolean)
        .join(' · '),
    }));
    body = (
      <CoverPicker
        albums={albums}
        labels={{
          add: Array.from({ length: albums.length + 1 }, (_, count) =>
            t('media.albumCovers.add', { count })
          ),
          adding: t('media.albumCovers.adding'),
        }}
      />
    );
  }
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <Search placeholder={t('media.albumCovers.search')} />
      <div mix={css({ clear: 'both' })}>
        {options.failed && <Alert>{t('media.albumCovers.failed')}</Alert>}
        {body}
      </div>
    </>,
    { title: label, status: options.failed ? 502 : undefined }
  );
}

export const mediaAlbumCovers = createController(media.albumCovers, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index(context) {
      return renderAlbumCoversPage(context);
    },

    // Adds the picked covers, then goes to the media list, which says how many
    async action(context) {
      const formData = await context.request.formData();
      const result = await addAlbumCovers({ gql: context.admin.gql, formData });
      if (isRedirect(result)) {
        return backTo(result);
      }
      return renderAlbumCoversPage(context, { failed: true });
    },
  },
});

function preview(upload: Media) {
  const url = uploadUrl(upload.destination, upload.fileName);
  if (upload.type === 'image' && 'crops' in upload) {
    const crop = upload.crops.find((c) => c.width === 300);
    return (
      <img
        mix={previewImage}
        src={crop ? uploadUrl(upload.destination, crop.fileName) : url}
        alt=""
      />
    );
  }
  if (upload.type === 'audio') {
    return <audio mix={player} controls src={url} />;
  }
  if (upload.type === 'video' && 'duration' in upload && 'width' in upload) {
    return (
      <video
        mix={[player, css({ maxWidth: '40rem', appearance: 'none' })]}
        preload="metadata"
        width={upload.width ?? undefined}
        height={upload.height ?? undefined}
        controls
        src={url}
      />
    );
  }
  return null;
}

function details(t: TFunction, upload: Media) {
  const link = (crop: { fileName: string; width?: number | null; height?: number | null }) => (
    <a href={uploadUrl(upload.destination, crop.fileName)}>
      {crop.width}
      {' x '}
      {crop.height}
    </a>
  );
  if (upload.type === 'image' && 'crops' in upload) {
    return (
      <>
        <p>
          <strong>{t('image.fileType')}:</strong> {upload.mimeType}
        </p>
        <strong>{t('image.availableCrops')}:</strong>
        <br />
        {link({ fileName: upload.fileName, width: upload.width, height: upload.height })}
        {` - ${formatFileSize(upload.fileSize)} - ${t('image.original')}`}
        {upload.crops.map((crop) => (
          <>
            <br />
            {link(crop)}
            {` - ${formatFileSize(crop.fileSize)}`}
          </>
        ))}
      </>
    );
  }
  if (upload.type === 'audio' && 'images' in upload) {
    const [first, ...others] = cropsOf(upload);
    return (
      <>
        <strong>{t('audio.fileSize')}:</strong> {formatFileSize(upload.fileSize)}
        <br />
        <strong>{t('audio.fileType')}:</strong> {upload.mimeType}
        {first && (
          <>
            <img mix={previewImage} src={uploadUrl(upload.destination, first.fileName)} alt="" />
            <strong>{t('audio.showing')}:</strong>
            <br />
            {first.width}
            {' x '}
            {first.height}
          </>
        )}
        {others.length > 0 && (
          <>
            <br />
            <strong>{t('audio.otherCrops')}:</strong>
            {others.map((crop) => (
              <>
                <br />
                {link(crop)}
              </>
            ))}
          </>
        )}
      </>
    );
  }
  if (upload.type === 'video' && 'duration' in upload && 'width' in upload) {
    const duration = upload.duration
      ? t('videos.duration', {
          minutes: Math.floor(upload.duration / 60),
          seconds: Math.floor(upload.duration % 60),
        })
      : null;
    return (
      <>
        {/* The translation has <strong> around its label */}
        {duration && <span innerHTML={unsafeHTML(duration)} />}
        {duration && <br />}
        <strong>{t('videos.dimensions')}:</strong> {upload.width}
        {' x '}
        {upload.height}
      </>
    );
  }
  return null;
}

function mediaFields(t: TFunction, upload: Media, values?: SaveFailure['values']): Field[] {
  const placeholder = t('media.placeholder');
  const isImage = upload.type === 'image';
  return [
    {
      label: '',
      prop: 'title',
      type: 'custom',
      render: () => (
        <input
          type="text"
          name="title"
          value={values ? (values.title ?? '') : (upload.title ?? '')}
          placeholder={placeholder}
          aria-label={placeholder}
          mix={css(
            merge(input, {
              height: '2.25rem',
              width: '100%',
              padding: '0.25rem 0.5rem',
              ...text.xl,
            })
          )}
        />
      ),
    },
    {
      label: '',
      prop: 'preview',
      type: 'custom',
      render: () => (
        <>
          <strong>{t('media.originalName')}:</strong> {upload.originalName}
          {preview(upload)}
        </>
      ),
    },
    ...(isImage
      ? ([
          { label: t('media.caption'), prop: 'caption', type: 'textarea' },
          { label: t('media.altText'), prop: 'altText' },
        ] satisfies Field[])
      : ([
          { label: t('media.description'), prop: 'description', type: 'textarea' },
        ] satisfies Field[])),
  ];
}

async function editPage(context: AdminEditContext, failure?: SaveFailure) {
  const t = getAdminT();
  const { media: upload } = await loadMedia({ gql: context.admin.gql, id: context.params.id });
  if (!upload) {
    return renderAdminNotFound(context);
  }
  const label = t('media.edit');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <Message text={t('media.updated')} hidden={Boolean(failure)} />
      <AdminForm
        fields={mediaFields(t, upload, failure?.values)}
        data={upload}
        failure={failure}
        buttonLabel={t('media.update')}
        meta={
          <div mix={css({ marginBlock: '1.5rem', display: 'block' })}>
            <h3 mix={css({ marginBottom: '0.5rem', ...text.sm, fontWeight: 700 })}>
              {t('admin.details')}
            </h3>
            {details(t, upload)}
          </div>
        }
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const mediaEdit = createController(media.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(editPage, updateMedia),
});
