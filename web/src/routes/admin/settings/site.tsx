import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import SettingsForm from '~/components/Admin/Settings/Form';
import type { Fields } from '~/types';
import type { SiteSettingsQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/site';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<SiteSettingsQuery>({ request, context, query: settingsQuery });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    context,
    request,
    mutation: settingsMutation,
    variables: { id: 'site' },
  });
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

const settingsQuery = gql`
  query SiteSettings {
    siteSettings {
      copyrightText
      emailAddress
      id
      language
      siteTitle
      siteUrl
      tagline
    }
  }
`;

const settingsMutation = gql`
  mutation UpdateSiteSettings($id: String!, $input: SiteSettingsInput!) {
    updateSiteSettings(id: $id, input: $input) {
      id
    }
  }
`;
