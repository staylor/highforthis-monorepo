// @generated
// This file was automatically generated and should not be edited.

import ApolloAPI

nonisolated public protocol SelectionSet: ApolloAPI.SelectionSet & ApolloAPI.RootSelectionSet
where Schema == HighForThisAPI.SchemaMetadata {}

nonisolated public protocol InlineFragment: ApolloAPI.SelectionSet & ApolloAPI.InlineFragment
where Schema == HighForThisAPI.SchemaMetadata {}

nonisolated public protocol MutableSelectionSet: ApolloAPI.MutableRootSelectionSet
where Schema == HighForThisAPI.SchemaMetadata {}

nonisolated public protocol MutableInlineFragment: ApolloAPI.MutableSelectionSet & ApolloAPI.InlineFragment
where Schema == HighForThisAPI.SchemaMetadata {}

nonisolated public enum SchemaMetadata: ApolloAPI.SchemaMetadata {
  public static let configuration: any ApolloAPI.SchemaConfiguration.Type = SchemaConfiguration.self

  private static let objectTypeMap: [String: ApolloAPI.Object] = [
    "AppleMusicArtwork": HighForThisAPI.Objects.AppleMusicArtwork,
    "AppleMusicData": HighForThisAPI.Objects.AppleMusicData,
    "Artist": HighForThisAPI.Objects.Artist,
    "AudioUpload": HighForThisAPI.Objects.AudioUpload,
    "CodeNode": HighForThisAPI.Objects.CodeNode,
    "EditorState": HighForThisAPI.Objects.EditorState,
    "ElementNode": HighForThisAPI.Objects.ElementNode,
    "FileUpload": HighForThisAPI.Objects.FileUpload,
    "HeadingNode": HighForThisAPI.Objects.HeadingNode,
    "ImageNode": HighForThisAPI.Objects.ImageNode,
    "ImageUpload": HighForThisAPI.Objects.ImageUpload,
    "ImageUploadCrop": HighForThisAPI.Objects.ImageUploadCrop,
    "LinebreakNode": HighForThisAPI.Objects.LinebreakNode,
    "PageInfo": HighForThisAPI.Objects.PageInfo,
    "Podcast": HighForThisAPI.Objects.Podcast,
    "PodcastConnection": HighForThisAPI.Objects.PodcastConnection,
    "PodcastEdge": HighForThisAPI.Objects.PodcastEdge,
    "Post": HighForThisAPI.Objects.Post,
    "PostConnection": HighForThisAPI.Objects.PostConnection,
    "PostEdge": HighForThisAPI.Objects.PostEdge,
    "Query": HighForThisAPI.Objects.Query,
    "QuoteNode": HighForThisAPI.Objects.QuoteNode,
    "Show": HighForThisAPI.Objects.Show,
    "ShowConnection": HighForThisAPI.Objects.ShowConnection,
    "ShowEdge": HighForThisAPI.Objects.ShowEdge,
    "TextNode": HighForThisAPI.Objects.TextNode,
    "Venue": HighForThisAPI.Objects.Venue,
    "VenueCoordinates": HighForThisAPI.Objects.VenueCoordinates,
    "Video": HighForThisAPI.Objects.Video,
    "VideoConnection": HighForThisAPI.Objects.VideoConnection,
    "VideoEdge": HighForThisAPI.Objects.VideoEdge,
    "VideoNode": HighForThisAPI.Objects.VideoNode,
    "VideoThumbnail": HighForThisAPI.Objects.VideoThumbnail,
    "VideoUpload": HighForThisAPI.Objects.VideoUpload
  ]

  @_spi(Execution) public static func objectType(forTypename typename: String) -> ApolloAPI.Object? {
    objectTypeMap[typename]
  }
}

nonisolated public enum Objects {}
nonisolated public enum Interfaces {}
nonisolated public enum Unions {}
