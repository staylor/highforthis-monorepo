// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI

public struct TextNodes_linebreakNode: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment TextNodes_linebreakNode on LinebreakNode { __typename type }"#
  }

  public let __data: DataDict
  public init(_dataDict: DataDict) { __data = _dataDict }

  public static var __parentType: ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
  public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("type", String?.self),
  ] }

  public var type: String? { __data["type"] }
}
