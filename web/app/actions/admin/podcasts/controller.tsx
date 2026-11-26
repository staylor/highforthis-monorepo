import { createController } from 'remix/router';

import { mediaField } from '#/actions/admin/media/field.tsx';
import {
  formActions,
  listAction,
  renderAdminNotFound,
  renderAdminPage,
  type AdminEditContext,
  type AdminPageContext,
} from '#/actions/admin/render-page.tsx';
import type { SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { PodcastEditQuery, PodcastsAdminQuery } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListTable, Search, TitleCell } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';

import { createPodcast, deletePodcasts, loadPodcast, loadPodcasts, updatePodcast } from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const podcasts = routes.admin.podcasts;

type PodcastRow = NonNullable<PodcastsAdminQuery['podcasts']>['edges'][number]['node'];
type Podcast = NonNullable<PodcastEditQuery['podcast']>;

function podcastFields(t: TFunction, podcast?: Podcast): Field[] {
  return [
    { label: t('podcasts.title'), prop: 'title', required: true },
    { label: t('podcasts.description'), prop: 'description', type: 'textarea' },
    mediaField({
      label: t('podcasts.image'),
      prop: 'image',
      media: podcast?.image,
      buttonText: t('podcasts.setImage'),
    }),
    mediaField({
      label: t('podcasts.audio'),
      prop: 'audio',
      type: 'audio',
      media: podcast?.audio,
      buttonText: t('podcasts.setAudio'),
    }),
  ];
}

export const podcastsList = createController(podcasts.list, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { podcasts: connection } = await loadPodcasts({
        gql: context.admin.gql,
        searchParams: context.url.searchParams,
      });
      const columns = [
        {
          label: t('podcasts.title'),
          render: (podcast: PodcastRow) => (
            <TitleCell
              href={podcasts.edit.index.href({ id: podcast.id })}
              title={podcast.title}
              viewHref={routes.podcast.show.href({ id: podcast.id })}
              id={podcast.id}
            />
          ),
        },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('podcasts.heading')}</Heading>
          <HeaderAdd href={podcasts.add.index.href()} label={t('podcasts.add')} />
          <Message param="deleted" text={(count) => t('podcasts.deleted', { count })} />
          <Search placeholder={t('podcasts.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('podcasts.heading') }
      );
    },

    action: listAction(deletePodcasts),
  },
});

function addPage(context: AdminPageContext, failure?: SaveFailure) {
  const t = getAdminT();
  const label = t('podcasts.add');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <AdminForm fields={podcastFields(t)} failure={failure} buttonLabel={label} />
    </>,
    { title: label, status: failure?.status }
  );
}

export const podcastsAdd = createController(podcasts.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(addPage, createPodcast),
});

async function editPage(context: AdminEditContext, failure?: SaveFailure) {
  const t = getAdminT();
  const { podcast } = await loadPodcast({ gql: context.admin.gql, id: context.params.id });
  if (!podcast) {
    return renderAdminNotFound(context);
  }
  const label = t('podcasts.edit');
  return renderAdminPage(
    context,
    <>
      <Heading>{label}</Heading>
      <Message text={t('podcasts.updated')} hidden={Boolean(failure)} />
      <AdminForm
        fields={podcastFields(t, podcast)}
        data={podcast}
        failure={failure}
        buttonLabel={t('podcasts.update')}
      />
    </>,
    { title: label, status: failure?.status }
  );
}

export const podcastsEdit = createController(podcasts.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(editPage, updatePodcast),
});
