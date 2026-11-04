import Apollo
import ApolloAPI
import Foundation
import os

extension ApolloClient {
    nonisolated static let highForThis = ApolloClient(url: AppConfiguration.graphQLEndpoint)

    /// The query's data, or an error when there's none to show. Errors alongside data are logged, since the data
    /// that did resolve is still worth showing.
    func data<Query: GraphQLQuery>(
        for query: Query,
        cachePolicy: CachePolicy.Query.SingleResponse = .cacheFirst
    ) async throws -> Query.Data where Query.ResponseFormat == SingleResponseFormat {
        let response = try await fetch(query: query, cachePolicy: cachePolicy)
        let errors = response.errors ?? []
        guard let data = response.data else {
            throw errors.first ?? MissingDataError()
        }
        for error in errors {
            Logger.api.error("\(Query.operationName, privacy: .public): \(error.localizedDescription, privacy: .public)")
        }
        return data
    }
}

nonisolated struct MissingDataError: LocalizedError {
    // Xcode 26 makes the string catalog's generated symbols main-actor isolated, so this uses the key.
    var errorDescription: String? { String(localized: "missingData") }
}
