import { gql } from 'graphql-tag';

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

const settingsFields: Fields = [
  {
    label: 'Crop Sizes',
    prop: 'crops',
    type: 'custom',
    render: (settings: MediaSettings) => <Crops settings={settings} />,
  },
];

export default function MediaSettingsRoute({ loaderData }: Route.ComponentProps) {
  const { mediaSettings } = loaderData;
  return <SettingsForm heading="Media Settings" data={mediaSettings} fields={settingsFields} />;
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
