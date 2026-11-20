// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct TextNodes_textNode: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment TextNodes_textNode on TextNode { __typename format text }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.TextNode }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("format", Int?.self),
    .field("text", String?.self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    TextNodes_textNode.self
  ] }

  public var format: Int? { __data["format"] }
  public var text: String? { __data["text"] }
}
