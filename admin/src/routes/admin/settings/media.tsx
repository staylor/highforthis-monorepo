import { useTranslation } from 'react-i18next';

import Crops from '#/components/Admin/Settings/Crops';
import SettingsForm from '#/components/Admin/Settings/Form';
import { loadMediaSettings, updateMediaSettings } from '#/server/settings';
import type { Fields } from '#/types';
import type { MediaSettings } from '#/types/graphql';
import { graphqlClient, respond } from '#/utils/route.server';

import type { Route } from './+types/media';

export async function loader({ request, context }: Route.LoaderArgs) {
  return loadMediaSettings({ gql: graphqlClient({ request, context }) });
}

export async function action({ request, context, url }: Route.ActionArgs) {
  const gql = graphqlClient({ request, context });
  return respond(await updateMediaSettings({ gql, formData: await request.formData(), url }));
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
