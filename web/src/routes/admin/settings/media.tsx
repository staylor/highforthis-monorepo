import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import Crops from '~/components/Admin/Settings/Crops';
import SettingsForm from '~/components/Admin/Settings/Form';
import type { Fields } from '~/types';
import type { MediaSettings, MediaSettingsQuery } from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/media';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<MediaSettingsQuery>({ request, context, query: settingsQuery });
}

export async function action({ context, request }: Route.ActionArgs) {
  return handleSubmission({
    context,
    request,
    mutation: settingsMutation,
    variables: { id: 'media' },
  });
}

export default function MediaSettingsRoute({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const { mediaSettings } = loaderData;

  const settingsFields: Fields = [
    {
      label: t('settings.media.cropSizes'),
      prop: 'crops',
      type: 'custom',
      render: (settings: MediaSettings) => <Crops settings={settings} />,
    },
  ];
  return (
    <SettingsForm
      heading={t('settings.media.heading')}
      data={mediaSettings}
      fields={settingsFields}
    />
  );
}

const settingsQuery = gql`
  query MediaSettings {
    mediaSettings {
      crops {
        height
        name
        width
      }
      id
    }
  }
`;

const settingsMutation = gql`
  mutation UpdateMediaSettings($id: String!, $input: MediaSettingsInput!) {
    updateMediaSettings(id: $id, input: $input) {
      id
    }
  }
`;
