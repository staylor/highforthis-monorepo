// @generated
// This file was automatically generated and can be edited to
// provide custom configuration for a generated GraphQL schema.
//
// Any changes to this file will not be overwritten by future
// code generation execution.

import ApolloAPI

nonisolated public enum SchemaConfiguration: ApolloAPI.SchemaConfiguration {
  public static func cacheKeyInfo(for type: ApolloAPI.Object, object: ApolloAPI.ObjectData) -> CacheKeyInfo? {
    // Every entity in the schema has a unique `id`, so the cache can normalize them across queries.
    try? CacheKeyInfo(jsonValue: object["id"])
  }
}
