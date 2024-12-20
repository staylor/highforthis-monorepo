import { gql } from 'graphql-tag';

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

const settingsFields: Fields = [
  { label: 'Podcast Title', prop: 'title', editable: true },
  { label: 'Description', prop: 'description', type: 'textarea' },
  { label: 'Managing Editor', prop: 'managingEditor' },
  {
    label: 'Copyright Text',
    prop: 'copyrightText',
  },
  {
    label: 'Website Link',
    prop: 'websiteLink',
  },
  {
    label: 'Feed Link',
    prop: 'feedLink',
  },
  {
    label: 'iTunes Name',
    prop: 'itunesName',
  },
  {
    label: 'iTunes Email',
    prop: 'itunesEmail',
  },
  {
    label: 'Generator',
    prop: 'generator',
  },
  {
    label: 'Language',
    prop: 'language',
  },
  {
    label: 'Explicit',
    prop: 'explicit',
  },
  {
    label: 'Category',
    prop: 'category',
  },
  {
    label: 'Image',
    prop: 'image',
    type: 'custom',
    render: (p: Podcast) => (
      <FeaturedMedia type="image" buttonText="Set Podcast Image" media={p.image ? [p.image] : []} />
    ),
  },
];

export default function PodcastSettings({ loaderData }: Route.ComponentProps) {
  return (
    <SettingsForm
      heading="Podcast Settings"
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
