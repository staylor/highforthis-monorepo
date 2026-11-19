import { createRedirectResponse } from 'remix/response/redirect';
import { createController } from 'remix/router';

import type { RedirectResult } from '@highforthis/shared/admin/forms';

import { getAdminT, type TFunction } from '../../../lib/i18n.ts';
import { requireAdmin, sameOrigin } from '../../../middleware/admin.ts';
import { routes } from '../../../routes.ts';
import { AdminForm, type Field } from '../../../ui/admin/form.tsx';
import { Message } from '../../../ui/admin/message.tsx';
import { Heading } from '../../../ui/admin/page.tsx';
import { CropsEditor } from '../../../ui/admin/public/crops-editor.tsx';
import { FeaturedMedia } from '../../../ui/admin/public/featured-media.tsx';
import { selectedMedia } from '../media/data.ts';
import { renderAdminPage } from '../render-page.tsx';
import type { AdminPageContext } from '../render-page.tsx';

import {
  loadMediaSettings,
  loadPodcastSettings,
  loadSiteSettings,
  podcastTextKeys,
  updateMediaSettings,
  updatePodcastSettings,
  updateSiteSettings,
} from './data.ts';

// Each page edits one settings document and has its own controller, since controller
// middleware doesn't apply to nested route maps.

const settings = routes.admin.settings;

const backTo = ({ redirectTo }: RedirectResult) => createRedirectResponse(redirectTo, 303);

function renderSettingsPage(
  context: AdminPageContext,
  t: TFunction,
  heading: string,
  fields: Field[],
  data?: Record<string, unknown> | null
) {
  return renderAdminPage(
    context,
    <>
      <Heading>{heading}</Heading>
      <Message text={t('settings.updated')} />
      <AdminForm fields={fields} data={data} buttonLabel={t('settings.update')} />
    </>,
    { title: heading }
  );
}

export const settingsSite = createController(settings.site, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { siteSettings } = await loadSiteSettings({ gql: context.admin.gql });
      const fields: Field[] = [
        { label: t('settings.site.siteTitle'), prop: 'siteTitle' },
        { label: t('settings.site.tagline'), prop: 'tagline' },
        { label: t('settings.site.siteUrl'), prop: 'siteUrl', inputType: 'url' },
        { label: t('settings.site.email'), prop: 'emailAddress', inputType: 'email' },
        {
          label: t('settings.site.language.label'),
          prop: 'language',
          type: 'select',
          choices: [{ value: 'en-US', label: t('settings.site.language.en-US') }],
        },
        { label: t('settings.site.copyrightText'), prop: 'copyrightText', type: 'textarea' },
      ];
      return renderSettingsPage(context, t, t('settings.site.heading'), fields, siteSettings);
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(
        await updateSiteSettings({ gql: context.admin.gql, formData, url: context.url })
      );
    },
  },
});

export const settingsMedia = createController(settings.media, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { mediaSettings } = await loadMediaSettings({ gql: context.admin.gql });
      const crops = (mediaSettings?.crops ?? []).filter(Boolean).map((crop) => ({
        name: crop!.name ?? '',
        width: crop!.width ?? null,
        height: crop!.height ?? null,
      }));
      const fields: Field[] = [
        {
          label: t('settings.media.cropSizes'),
          prop: 'crops',
          type: 'custom',
          render: () => (
            <CropsEditor
              crops={crops}
              labels={{
                add: t('settings.media.crops.add'),
                remove: t('settings.media.crops.remove'),
                name: t('settings.media.crops.name'),
                dimensions: t('settings.media.crops.dimensions'),
                width: t('settings.media.crops.width'),
                height: t('settings.media.crops.height'),
              }}
            />
          ),
        },
      ];
      return renderSettingsPage(context, t, t('settings.media.heading'), fields);
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(
        await updateMediaSettings({ gql: context.admin.gql, formData, url: context.url })
      );
    },
  },
});

export const settingsPodcast = createController(settings.podcast, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: {
    async index(context) {
      const t = getAdminT();
      const { podcastSettings } = await loadPodcastSettings({ gql: context.admin.gql });
      const fields: Field[] = [
        { label: t('settings.podcast.title'), prop: 'title' },
        { label: t('settings.podcast.description'), prop: 'description', type: 'textarea' },
        ...podcastTextKeys.map((prop) => ({ label: t(`settings.podcast.${prop}`), prop })),
        {
          label: t('settings.podcast.image'),
          prop: 'image',
          type: 'custom',
          render: () => (
            <FeaturedMedia
              name="image"
              type="image"
              media={selectedMedia(podcastSettings?.image ? [podcastSettings.image] : [])}
              buttonText={t('settings.podcast.setImage')}
              heading={t('media.heading')}
              closeLabel={t('admin.close')}
              loadingText={t('admin.loading')}
            />
          ),
        },
      ];
      return renderSettingsPage(context, t, t('settings.podcast.heading'), fields, podcastSettings);
    },

    async action(context) {
      const formData = await context.request.formData();
      return backTo(
        await updatePodcastSettings({ gql: context.admin.gql, formData, url: context.url })
      );
    },
  },
});
