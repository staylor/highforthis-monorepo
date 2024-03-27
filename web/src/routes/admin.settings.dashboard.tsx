import { gql } from 'graphql-tag';
import type { ActionFunction, LoaderFunction } from '@remix-run/server-runtime';
import { useLoaderData } from '@remix-run/react';

import SettingsForm from '@/components/Admin/Settings/Form';
import query from '@/utils/query';
import { handleSubmission } from '@/utils/action';
import type { DashboardSettingsQuery } from '@/types/graphql';

export const loader: LoaderFunction = ({ request, context }) => {
  return query({ request, context, query: settingsQuery });
};

export const action: ActionFunction = async ({ context, request }) => {
  return handleSubmission({
    context,
    request,
    mutation: settingsMutation,
    variables: { id: 'dashboard' },
  });
};

const settingsFields = [
  { label: 'Google Analytics Client ID', prop: 'googleClientId' },
  { label: 'Google Analytics Tracking ID', prop: 'googleTrackingId' },
];

export default function DashboardSettings() {
  const { dashboardSettings } = useLoaderData<DashboardSettingsQuery>();
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
