// @generated
// This file was automatically generated and should not be edited.

@_exported import ApolloAPI
@_spi(Execution) @_spi(Unsafe) import ApolloAPI

nonisolated public struct TextNodes_linebreakNode: HighForThisAPI.SelectionSet, Fragment {
  public static var fragmentDefinition: StaticString {
    #"fragment TextNodes_linebreakNode on LinebreakNode { __typename type }"#
  }

  @_spi(Unsafe) public let __data: DataDict
  @_spi(Unsafe) public init(_dataDict: DataDict) { __data = _dataDict }

  @_spi(Execution) public static var __parentType: any ApolloAPI.ParentType { HighForThisAPI.Objects.LinebreakNode }
  @_spi(Execution) public static var __selections: [ApolloAPI.Selection] { [
    .field("__typename", String.self),
    .field("type", String?.self),
  ] }
  @_spi(Execution) public static var __fulfilledFragments: [any ApolloAPI.SelectionSet.Type] { [
    TextNodes_linebreakNode.self
  ] }

  public var type: String? { __data["type"] }
}
