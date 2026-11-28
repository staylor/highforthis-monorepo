import { gql } from 'graphql-tag';

import { featuredMediaFragment } from '#/actions/admin/media/data.ts';
import { submitForm, type FormArgs, type GraphQLClient } from '#/lib/admin/forms.ts';
import type {
  MediaSettingsQuery,
  PodcastSettingsQuery,
  SiteSettingsQuery,
} from '#/types/graphql.ts';

// Each page edits one settings document, saved under a fixed ID.

const siteSettingsQuery = gql`
  query SiteSettings {
    siteSettings {
      id
      copyrightText
      emailAddress
      language
      siteTitle
      siteUrl
      tagline
    }
  }
`;

const updateSiteSettingsMutation = gql`
  mutation UpdateSiteSettings($id: String!, $input: SiteSettingsInput!) {
    updateSiteSettings(id: $id, input: $input) {
      id
    }
  }
`;

const mediaSettingsQuery = gql`
  query MediaSettings {
    mediaSettings {
      id
      crops {
        height
        name
        width
      }
    }
  }
`;

const updateMediaSettingsMutation = gql`
  mutation UpdateMediaSettings($id: String!, $input: MediaSettingsInput!) {
    updateMediaSettings(id: $id, input: $input) {
      id
    }
  }
`;

const podcastSettingsQuery = gql`
  query PodcastSettings {
    podcastSettings {
      id
      category
      copyrightText
      description
      explicit
      feedLink
      generator
      itunesEmail
      itunesName
      language
      managingEditor
      title
      websiteLink
      image {
        ...FeaturedMedia_media
      }
    }
  }
  ${featuredMediaFragment}
`;

const updatePodcastSettingsMutation = gql`
  mutation UpdatePodcastSettings($id: String!, $input: PodcastSettingsInput!) {
    updatePodcastSettings(id: $id, input: $input) {
      id
    }
  }
`;

// Every settings field is text, so none may become a number or a boolean, as a copyright year or
// an "explicit" of "false" would
const siteKeys = ['copyrightText', 'emailAddress', 'language', 'siteTitle', 'siteUrl', 'tagline'];

/** The podcast settings' text fields, in the form's order after the title and description. */
export const podcastTextKeys = [
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

export function loadSiteSettings({ gql: client }: { gql: GraphQLClient }) {
  return client.query<SiteSettingsQuery>(siteSettingsQuery);
}

export function updateSiteSettings(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: updateSiteSettingsMutation,
    variables: { id: 'site' },
    textFields: siteKeys,
  });
}

export function loadMediaSettings({ gql: client }: { gql: GraphQLClient }) {
  return client.query<MediaSettingsQuery>(mediaSettingsQuery);
}

/**
 * The crop sizes the form submitted as crops[0][name], crops[0][width] and so on. A row without
 * a name is left out, since GraphQL requires one, and a name stays a string, even "300".
 */
function submittedCrops(formData: FormData) {
  const rows = new Map<number, Record<string, string>>();
  for (const [key, value] of formData) {
    const match = /^crops\[(\d+)\]\[(name|width|height)\]$/.exec(key);
    if (match && typeof value === 'string') {
      const index = Number(match[1]);
      rows.set(index, { ...rows.get(index), [match[2]]: value.trim() });
    }
  }
  const size = (value?: string) => (value ? Number(value) : null);
  return [...rows.entries()]
    .sort(([a], [b]) => a - b)
    .map(([, row]) => row)
    .filter((row) => row.name)
    .map((row) => ({ name: row.name, width: size(row.width), height: size(row.height) }));
}

export function updateMediaSettings({ gql: client, formData, url }: FormArgs) {
  // The crops are the form's only field, so the save is built from them rather than parsed
  return submitForm({
    gql: client,
    url,
    formData: new FormData(),
    mutation: updateMediaSettingsMutation,
    variables: { id: 'media', input: { crops: submittedCrops(formData) } },
  });
}

export function loadPodcastSettings({ gql: client }: { gql: GraphQLClient }) {
  return client.query<PodcastSettingsQuery>(podcastSettingsQuery);
}

export function updatePodcastSettings(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: updatePodcastSettingsMutation,
    variables: { id: 'podcast' },
    textFields: ['title', 'description', 'image', ...podcastTextKeys],
  });
}
