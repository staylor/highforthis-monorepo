import { gql } from 'graphql-tag';

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

const settingsFields: Fields = [
  { label: 'Site Title', prop: 'siteTitle' },
  { label: 'Tagline', prop: 'tagline' },
  { label: 'Site URL', inputType: 'url', prop: 'siteUrl' },
  {
    label: 'Email Address',
    inputType: 'email',
    prop: 'emailAddress',
  },
  {
    label: 'Site Language',
    prop: 'language',
    type: 'select',
    choices: [{ value: 'en-US', label: 'English (United States)' }],
  },
  {
    label: 'Copyright Text',
    prop: 'copyrightText',
    type: 'textarea',
  },
];

export default function SiteSettings({ loaderData }: Route.ComponentProps) {
  const { siteSettings } = loaderData;
  return <SettingsForm heading="General Settings" data={siteSettings} fields={settingsFields} />;
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
