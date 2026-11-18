const Settings = `#graphql      
  type SiteSettings {
    id: String!
    siteTitle: String
    tagline: String
    siteUrl: String
    emailAddress: String
    language: String
    copyrightText: String
  }

  input SiteSettingsInput {
    siteTitle: String
    tagline: String
    siteUrl: String
    emailAddress: String
    language: String
    copyrightText: String
  }

  type PodcastSettings {
    id: String!
    title: String
    description: String
    managingEditor: String
    copyrightText: String
    websiteLink: String
    feedLink: String
    image: ImageUpload
    itunesName: String
    itunesEmail: String
    generator: String
    language: String
    explicit: String
    category: String
  }

  input PodcastSettingsInput {
    title: String
    description: String
    managingEditor: String
    copyrightText: String
    websiteLink: String
    feedLink: String
    image: String
    itunesName: String
    itunesEmail: String
    generator: String
    language: String
    explicit: String
    category: String
  }

  type MediaCropSetting {
    name: String!
    width: Int
    height: Int
  }

  input MediaCropSettingInput {
    name: String
    width: Int
    height: Int
  }

  type MediaSettings {
    id: String!
    crops: [MediaCropSetting!]!
  }

  input MediaSettingsInput {
    crops: [MediaCropSettingInput]
  }

  extend type Query {
    siteSettings: SiteSettings!
    mediaSettings: MediaSettings!
    podcastSettings: PodcastSettings!
  }

  extend type Mutation {
    updateSiteSettings(id: String!, input: SiteSettingsInput!): SiteSettings
    updateMediaSettings(id: String!, input: MediaSettingsInput!): MediaSettings
    updatePodcastSettings(id: String!, input: PodcastSettingsInput!): PodcastSettings
  }
`;

export default Settings;
