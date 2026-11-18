import { useTranslation } from 'react-i18next';

import SettingsForm from '#/components/Admin/Settings/Form';
import { loadSiteSettings, updateSiteSettings } from '#/server/settings';
import type { Fields } from '#/types';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/site';

export async function loader({ request, context }: Route.LoaderArgs) {
  return loadSiteSettings({ gql: graphqlClient({ request, context }) });
}

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await updateSiteSettings({ gql, formData: await request.formData(), url }));
}

export default function SiteSettings({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { siteSettings } = loaderData;
  const settingsFields: Fields = [
    { label: t('settings.site.siteTitle'), prop: 'siteTitle' },
    { label: t('settings.site.tagline'), prop: 'tagline' },
    { label: t('settings.site.siteUrl'), inputType: 'url', prop: 'siteUrl' },
    {
      label: t('settings.site.email'),
      inputType: 'email',
      prop: 'emailAddress',
    },
    {
      label: t('settings.site.language.label'),
      prop: 'language',
      type: 'select',
      choices: [{ value: 'en-US', label: t('settings.site.language.en-US') }],
    },
    {
      label: t('settings.site.copyrightText'),
      prop: 'copyrightText',
      type: 'textarea',
    },
  ];
  return (
    <SettingsForm
      heading={t('settings.site.heading')}
      data={siteSettings}
      fields={settingsFields}
    />
  );
}
