import { gql } from 'graphql-tag';
import { useTranslation } from 'react-i18next';

import FeaturedMedia from '~/components/Admin/Form/FeaturedMedia';
import SettingsForm from '~/components/Admin/Settings/Form';
import type { Fields } from '~/types';
import type {
  Podcast,
  PodcastSettings as PodcastSettingsType,
  PodcastSettingsQuery,
} from '~/types/graphql';
import { handleSubmission } from '~/utils/action';
import query from '~/utils/query';

import type { Route } from './+types/podcast';

export async function loader({ request, context }: Route.LoaderArgs) {
  return query<PodcastSettingsQuery>({ request, context, query: settingsQuery });
}

export async function action({ request, context }: Route.ActionArgs) {
  return handleSubmission({
    context,
    request,
    mutation: settingsMutation,
    variables: { id: 'podcast' },
  });
}

export default function PodcastSettings({ loaderData }: Route.ComponentProps) {
  const { t } = useTranslation();
  const fields = [
    'managingEditor',
    'copyrightText',
    'websiteLink',
    'feedLink',
    'itunesName',
    'itunesEmail',
    'generator',
    'language',
    'explicit',
    'category',
  ];
  const settingsFields: Fields = [
    { label: t('settings.podcast.title'), prop: 'title', editable: true },
    { label: t('settings.podcast.description'), prop: 'description', type: 'textarea' },
    ...fields.map((prop) => ({ label: t(`settings.podcast.${prop}`), prop })),
    {
      label: t('settings.podcast.image'),
      prop: 'image',
      type: 'custom',
      render: (p: Podcast) => (
        <FeaturedMedia
          type="image"
          buttonText={t('settings.podcast.setImage')}
          media={p.image ? [p.image] : []}
        />
      ),
    },
  ];

  return (
    <SettingsForm
      heading={t('settings.podcast.heading')}
      data={loaderData.podcastSettings as PodcastSettingsType}
      fields={settingsFields}
    />
  );
}

const settingsQuery = gql`
  query PodcastSettings {
    podcastSettings {
      category
      copyrightText
      description
      explicit
      feedLink
      generator
      id
      image {
        crops {
          fileName
          width
        }
        destination
        fileName
        id
        type
      }
      itunesEmail
      itunesName
      language
      managingEditor
      title
      websiteLink
    }
  }
`;

const settingsMutation = gql`
  mutation UpdatePodcastSettings($id: String!, $input: PodcastSettingsInput!) {
    updatePodcastSettings(id: $id, input: $input) {
      id
    }
  }
`;
