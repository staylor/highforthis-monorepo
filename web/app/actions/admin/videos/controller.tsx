import { css } from 'remix/component';
import { createController } from 'remix/router';

import {
  formActions,
  listAction,
  renderAdminNotFound,
  renderAdminPage,
  type AdminEditContext,
} from '#/actions/admin/render-page.tsx';
import type { SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { VideoEditQuery, VideosAdminQuery } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListFilter, ListTable, Search, TitleCell } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { Heading } from '#/ui/admin/page.tsx';

import { deleteVideos, loadVideo, loadVideos, updateVideo } from './data.ts';

// The videos come from YouTube, so there's a list and an edit page but no add page. Each form
// route has its own controller, since controller middleware doesn't apply to nested route
// maps.

const videos = routes.admin.videos;

type VideoRow = NonNullable<VideosAdminQuery['videos']>['edges'][number]['node'];
type Video = NonNullable<VideoEditQuery['video']>;

function publishedDate(publishedAt: number) {
  const date = new Date(publishedAt);
  return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
}

function videoFields(t: TFunction, video: Video): Field[] {
  return [
    { label: t('videos.title'), prop: 'title', required: true },
    { label: t('videos.slug'), prop: 'slug', required: true },
    { label: t('videos.type'), prop: 'dataType' },
    {
      label: t('videos.playlist'),
      prop: 'dataPlaylistId',
      type: 'custom',
      render: () => (
        <a
          mix={css({ textDecoration: 'underline' })}
          href={`https://www.youtube.com/playlist?list=${encodeURIComponent(video.dataPlaylistId)}`}
        >
          {t('videos.viewPlaylist', { year: video.year })}
        </a>
      ),
    },
  ];
}

export const videosList = createController(videos.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { videos: connection } = await loadVideos({
        gql: context.admin.gql,
        searchParams: context.url.searchParams,
      });
      const columns = [
        {
          label: t('videos.title'),
          render: (video: VideoRow) => (
            <TitleCell
              href={videos.edit.index.href({ id: video.id })}
              title={video.title}
              viewHref={routes.video.href({ slug: video.slug })}
              id={video.id}
            />
          ),
        },
        { label: t('videos.slug'), render: (video: VideoRow) => video.slug },
        { label: t('videos.year'), render: (video: VideoRow) => video.year },
        {
          label: t('videos.date'),
          render: (video: VideoRow) => (
            <>
              {t('videos.published')}
              <br />
              {publishedDate(video.publishedAt)}
            </>
          ),
        },
      ];
      const years = (connection?.years ?? []).map((year) => ({
        label: String(year),
        value: String(year),
      }));

      return renderAdminPage(
        context,
        <>
          <Heading>{t('videos.heading')}</Heading>
          <Message param="deleted" text={(count) => t('videos.deleted', { count })} />
          <Search placeholder={t('videos.search')} />
          <ListTable
            connection={connection}
            columns={columns}
            filters={
              <ListFilter name="year" placeholder={t('videos.selectYear')} choices={years} />
            }
          />
        </>,
        { title: t('videos.heading') }
      );
    },

    action: listAction(deleteVideos),
  },
});

async function editPage(context: AdminEditContext, failure?: SaveFailure) {
  const t = getAdminT();
  const { video } = await loadVideo({ gql: context.admin.gql, id: context.params.id });
  if (!video) {
    return renderAdminNotFound(context);
  }
  const label = t('videos.edit');
  // A video added outside YouTube's import has no thumbnails yet
  const thumbnail = video.thumbnails.find((thumb) => thumb.width === 480);
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <Message text={t('videos.updated')} hidden={Boolean(failure)} />
      {thumbnail && (
        <figure mix={css({ marginBottom: '1.5rem', maxWidth: '100%', overflow: 'hidden' })}>
          <img
            mix={css({ position: 'relative', zIndex: 10 })}
            src={thumbnail.url}
            alt={video.title}
          />
        </figure>
      )}
      <AdminForm
        fields={videoFields(t, video)}
        data={video}
        failure={failure}
        buttonLabel={t('videos.update')}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const videosEdit = createController(videos.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(editPage, updateVideo),
});
