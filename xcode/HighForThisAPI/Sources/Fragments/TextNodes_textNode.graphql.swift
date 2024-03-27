// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct TextNodes_textNode: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment TextNodes_textNode on TextNode { __typename detail format mode style text type }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("detail", Int?.self),
    .field("format", Int?.self),
    .field("mode", GraphQLEnum<HighForThisAPI.TextModeType>?.self),
    .field("style", String?.self),
    .field("text", String?.self),
    .field("type", String?.self),
  ] }

  public var detail: Int? { __data["detail"] }
  public var format: Int? { __data["format"] }
  public var mode: GraphQLEnum<HighForThisAPI.TextModeType>? { __data["mode"] }
  public var style: String? { __data["style"] }
  public var text: String? { __data["text"] }
  public var type: String? { __data["type"] }
}
