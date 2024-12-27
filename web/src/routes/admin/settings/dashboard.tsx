import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

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

export default function DashboardSettings({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { dashboardSettings } = loaderData;
  const settingsFields = ['googleClientId', 'googleTrackingId'].map((prop) => ({
    label: t(`settings.dashboard.analytics.${prop}`),
    prop,
  }));

  return (
    <SettingsForm
      heading={t('settings.dashboard.heading')}
      data={dashboardSettings}
      fields={settingsFields}
    />
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
