import { gql } from 'graphql-tag';

import type { MediaSettingsQuery, PodcastSettingsQuery, SiteSettingsQuery } from '#/types/graphql';

import { submitForm, type FormArgs } from './forms';
import type { GraphQLClient } from './graphql';

// Each settings page edits one settings document, saved under a fixed ID

const siteSettingsQuery = gql`
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
      crops {
        height
        name
        width
      }
      id
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

const updatePodcastSettingsMutation = gql`
  mutation UpdatePodcastSettings($id: String!, $input: PodcastSettingsInput!) {
    updatePodcastSettings(id: $id, input: $input) {
      id
    }
  }
`;

export function loadSiteSettings({ gql }: { gql: GraphQLClient }) {
  return gql.query<SiteSettingsQuery>(siteSettingsQuery);
}

export function updateSiteSettings(args: FormArgs) {
  return submitForm({ ...args, mutation: updateSiteSettingsMutation, variables: { id: 'site' } });
}

export function loadMediaSettings({ gql }: { gql: GraphQLClient }) {
  return gql.query<MediaSettingsQuery>(mediaSettingsQuery);
}

export function updateMediaSettings(args: FormArgs) {
  return submitForm({ ...args, mutation: updateMediaSettingsMutation, variables: { id: 'media' } });
}

export function loadPodcastSettings({ gql }: { gql: GraphQLClient }) {
  return gql.query<PodcastSettingsQuery>(podcastSettingsQuery);
}

export function updatePodcastSettings(args: FormArgs) {
  return submitForm({
    ...args,
    mutation: updatePodcastSettingsMutation,
    variables: { id: 'podcast' },
  });
}
