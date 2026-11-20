import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import { selectedMedia } from '#/actions/admin/media/data.ts';
import { renderAdminPage } from '#/actions/admin/render-page.tsx';
import type { RedirectResult } from '#/lib/admin/forms.ts';
import { getAdminT, type TFunction } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import type { PodcastEditQuery, PodcastsAdminQuery } from '#/types/graphql.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { ListTable, RowActions, RowTitle, Search } from '#/ui/admin/list-table.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { HeaderAdd, Heading } from '#/ui/admin/page.tsx';
import { FeaturedMedia } from '#/ui/admin/public/featured-media.tsx';

import { createPodcast, deletePodcasts, loadPodcast, loadPodcasts, updatePodcast } from './data.ts';

// Each form route has its own controller, since controller middleware doesn't apply to nested
// route maps.

const podcasts = routes.admin.podcasts;

type PodcastRow = NonNullable<PodcastsAdminQuery['podcasts']>['edges'][number]['node'];
type Podcast = NonNullable<PodcastEditQuery['podcast']>;

const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

function podcastFields(t: TFunction, podcast?: Podcast): Field[] {
  const media = (prop: 'image' | 'audio', buttonText: string): Field => ({
    label: t(`podcasts.${prop}`),
    prop,
    type: 'custom',
    render: () => (
      <FeaturedMedia
        name={prop}
        type={prop}
        media={selectedMedia(podcast?.[prop] ? [podcast[prop]] : [])}
        buttonText={buttonText}
        heading={t('media.heading')}
        closeLabel={t('admin.close')}
        loadingText={t('admin.loading')}
      />
    ),
  });
  return [
    { label: t('podcasts.title'), prop: 'title' },
    { label: t('podcasts.description'), prop: 'description', type: 'textarea' },
    media('image', t('podcasts.setImage')),
    media('audio', t('podcasts.setAudio')),
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
      const deleted = Number(context.url.searchParams.get('deleted') || 0);
      const columns = [
        {
          label: t('podcasts.title'),
          render: (podcast: PodcastRow) => {
            const href = podcasts.edit.index.href({ id: podcast.id });
            return (
              <>
                <RowTitle href={href} title={podcast.title} />
                <RowActions
                  editHref={href}
                  viewHref={routes.podcast.show.href({ id: podcast.id })}
                  id={podcast.id}
                />
              </>
            );
          },
        },
      ];

      return renderAdminPage(
        context,
        <>
          <Heading>{t('podcasts.heading')}</Heading>
          <HeaderAdd href={podcasts.add.index.href()} label={t('podcasts.add')} />
          {deleted > 0 && (
            <Message param="deleted" text={t('podcasts.deleted', { count: deleted })} />
          )}
          <Search placeholder={t('podcasts.search')} />
          <ListTable connection={connection} columns={columns} />
        </>,
        { title: t('podcasts.heading') }
      );
    },

    // The row and bulk delete forms post intent=delete. Apply with no action chosen posts an
    // empty intent and just comes back to the list.
    async action(context) {
      const formData = await context.request.formData();
      if (formData.get('intent') !== 'delete') {
        return createRedirectResponse(`${context.url.pathname}${context.url.search}`, 303);
      }
      return backTo(await deletePodcasts({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

export const podcastsAdd = createController(podcasts.add, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    index(context) {
      const t = getAdminT();
      const label = t('podcasts.add');
      return renderAdminPage(
        context,
        <>
          <Heading>{label}</Heading>
          <AdminForm fields={podcastFields(t)} buttonLabel={label} />
        </>,
        { title: label }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(await createPodcast({ gql: context.admin.gql, formData, url: context.url }));
    },
  },
});

export const podcastsEdit = createController(podcasts.edit, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { podcast } = await loadPodcast({ gql: context.admin.gql, id: context.params.id });
      if (!podcast) {
        return renderAdminPage(context, <Heading>{t('table.noItems')}</Heading>, { status: 404 });
      }
      const label = t('podcasts.edit');
      return renderAdminPage(
        context,
        <>
          <Heading>{label}</Heading>
          <Message text={t('podcasts.updated')} />
          <AdminForm
            fields={podcastFields(t, podcast)}
            data={podcast}
            buttonLabel={t('podcasts.update')}
          />
        </>,
        { title: label }
      );
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(
        await updatePodcast({
          gql: context.admin.gql,
          id: context.params.id,
          formData,
          url: context.url,
        })
      );
    },
  },
});
