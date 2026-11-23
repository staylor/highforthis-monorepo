import { css } from 'remix/component';
import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { renderAdminPage, type AdminContext } from '#/actions/admin/render-page.tsx';
import { isRedirect, type RedirectResult, type SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { VideoEditQuery, VideosAdminQuery } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListFilter, ListTable, RowActions, RowTitle, Search } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { Heading } from '#/ui/admin/page.tsx';

import { deleteVideos, loadVideo, loadVideos, updateVideo } from './data.ts';

// The videos come from YouTube, so there's a list and an edit page but no add page. Each form
// route has its own controller, since controller middleware doesn't apply to nested route
// maps.

const videos = routes.admin.videos;

type VideoRow = NonNullable<VideosAdminQuery['videos']>['edges'][number]['node'];
type Video = NonNullable<VideoEditQuery['video']>;

const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

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
      const deleted = Number(context.url.searchParams.get('deleted') || 0);
      const columns = [
        {
          label: t('videos.title'),
          render: (video: VideoRow) => {
            const href = videos.edit.index.href({ id: video.id });
            return (
              <>
                <RowTitle href={href} title={video.title} />
                <RowActions
                  editHref={href}
                  viewHref={routes.video.href({ slug: video.slug })}
                  id={video.id}
                />
              </>
            );
          },
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
          {deleted > 0 && (
            <Message param="deleted" text={t('videos.deleted', { count: deleted })} />
          )}
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

    // The row and bulk delete forms post intent=delete. Apply with no action chosen posts an
    // empty intent and just comes back to the list.
    async action(context) {
      const formData = await context.request.formData();
      if (formData.get('intent') !== 'delete') {
        return createRedirectResponse(`${context.url.pathname}${context.url.search}`, 303);
      }
      return backTo(await deleteVideos({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

async function editPage(context: AdminContext, id: string, failure?: SaveFailure) {
  const t = getAdminT();
  const { video } = await loadVideo({ gql: context.admin.gql, id });
  if (!video) {
    return renderAdminPage(context, <Heading>{t('table.noItems')}</Heading>, { status: 404 });
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
  actions: {
    index: (context) => editPage(context, context.params.id),

    async action(context) {
      const { id } = context.params;
      const formData = await context.request.formData();
      const result = await updateVideo({ gql: context.admin.gql, id, formData, url: context.url });
      return isRedirect(result) ? backTo(result) : editPage(context, id, result);
    },
  },
});
