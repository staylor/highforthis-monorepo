// @generated
// This file was automatically generated and should not be edited.

@_spi(Internal) @_spi(Unsafe) import ApolloAPI

nonisolated public struct EntityArg: InputObject {
  @_spi(Unsafe) public private(set) var __data: InputDict

  @_spi(Unsafe) public init(_ data: InputDict) {
    __data = data
  }

  public init(
    id: GraphQLNullable<String> = nil,
    slug: GraphQLNullable<String> = nil
  ) {
    __data = InputDict([
      "id": id,
      "slug": slug
    ])
  }

  public var id: GraphQLNullable<String> {
    get { __data["id"] }
    set { __data["id"] = newValue }
  }

  public var slug: GraphQLNullable<String> {
    get { __data["slug"] }
    set { __data["slug"] = newValue }
  }
}
