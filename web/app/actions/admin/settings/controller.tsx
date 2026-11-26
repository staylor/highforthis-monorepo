import { createController } from 'remix/router';

import { mediaField } from '#/actions/admin/media/field.tsx';
import {
  formActions,
  renderAdminPage,
  type AdminContext,
  type AdminPageContext,
} from '#/actions/admin/render-page.tsx';
import type { SaveFailure } from '#/lib/admin/forms.ts';
import { getAdminT } from '#/lib/i18n.ts';
import { requireAdmin, sameOrigin } from '#/middleware/admin.ts';
import { routes } from '#/routes.ts';
import { AdminForm, type Field } from '#/ui/admin/form.tsx';
import { Message } from '#/ui/admin/message.tsx';
import { Heading } from '#/ui/admin/page.tsx';
import { CropsEditor } from '#/ui/admin/public/crops-editor.tsx';

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

interface SettingsPage {
  heading: string;
  fields: Field[];
  data?: Record<string, unknown> | null;
  /** The save that just failed, whose fields the form shows again. */
  failure?: SaveFailure;
}

function renderSettingsPage(
  context: AdminPageContext,
  { heading, fields, data, failure }: SettingsPage
) {
  const t = getAdminT();
  return renderAdminPage(
    context,
    <>
      <Heading>{heading}</Heading>
      <Message text={t('settings.updated')} hidden={Boolean(failure)} />
      <AdminForm fields={fields} data={data} failure={failure} buttonLabel={t('settings.update')} />
    </>,
    { title: heading, status: failure?.status }
  );
}

async function sitePage(context: AdminContext, failure?: SaveFailure) {
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
  return renderSettingsPage(context, {
    heading: t('settings.site.heading'),
    fields,
    data: siteSettings,
    failure,
  });
}

export const settingsSite = createController(settings.site, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(sitePage, updateSiteSettings),
});

async function mediaPage(context: AdminContext, failure?: SaveFailure) {
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
  return renderSettingsPage(context, { heading: t('settings.media.heading'), fields, failure });
}

export const settingsMedia = createController(settings.media, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(mediaPage, updateMediaSettings),
});

async function podcastPage(context: AdminContext, failure?: SaveFailure) {
  const t = getAdminT();
  const { podcastSettings } = await loadPodcastSettings({ gql: context.admin.gql });
  const fields: Field[] = [
    { label: t('settings.podcast.title'), prop: 'title' },
    { label: t('settings.podcast.description'), prop: 'description', type: 'textarea' },
    ...podcastTextKeys.map((prop) => ({ label: t(`settings.podcast.${prop}`), prop })),
    mediaField({
      label: t('settings.podcast.image'),
      prop: 'image',
      media: podcastSettings?.image,
      buttonText: t('settings.podcast.setImage'),
    }),
  ];
  return renderSettingsPage(context, {
    heading: t('settings.podcast.heading'),
    fields,
    data: podcastSettings,
    failure,
  });
}

export const settingsPodcast = createController(settings.podcast, {
  middleware: [sameOrigin(), requireAdmin()],
  actions: formActions(podcastPage, updatePodcastSettings),
});
