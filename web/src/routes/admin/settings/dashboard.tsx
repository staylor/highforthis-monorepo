import { gql } from 'graphql-tag';

import SettingsForm from '~/components/Admin/Settings/Form';
import type { DashboardSettingsQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/dashboard';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<DashboardSettingsQuery>({ request, context, query: settingsQuery });
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleSubmission({
    context,
    request,
    mutation: settingsMutation,
    variables: { id: 'dashboard' },
  });
}

const settingsFields = [
  { label: 'Google Analytics Client ID', prop: 'googleClientId' },
  { label: 'Google Analytics Tracking ID', prop: 'googleTrackingId' },
];

export default function DashboardSettings({ loaderData }: Route.ComponentProps) {
  const { dashboardSettings } = loaderData;
  return (
    <SettingsForm heading="Dashboard Settings" data={dashboardSettings} fields={settingsFields} />
  );
}

const settingsQuery = gql`
  query DashboardSettings {
    dashboardSettings {
      googleClientId
      googleTrackingId
      id
    }
  }
`;

const settingsMutation = gql`
  mutation UpdateDashboardSettings($id: String!, $input: DashboardSettingsInput!) {
    updateDashboardSettings(id: $id, input: $input) {
      id
    }
  }
`;
