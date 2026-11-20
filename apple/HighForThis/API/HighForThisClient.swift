import Apollo
import ApolloAPI
import Foundation
import os

nonisolated extension ApolloClient {
    static let highForThis = makeClient()

    private static func makeClient() -> ApolloClient {
        #if DEBUG
        if UITestFixtures.isEnabled { return UITestFixtures.client() }
        #endif
        return ApolloClient(url: AppConfiguration.graphQLEndpoint, defaultRequestConfiguration: .init(requestTimeout: 30))
    }

    func data<Query: GraphQLQuery>(
        for query: Query,
        cachePolicy: CachePolicy.Query.SingleResponse = .cacheFirst
    ) async throws -> Query.Data where Query.ResponseFormat == SingleResponseFormat {
        // Apollo otherwise caches partial failures as successful data on the next cache-first fetch.
        let response = try await fetch(
            query: query, cachePolicy: cachePolicy, requestConfiguration: .init(requestTimeout: 30, writeResultsToCache: false))
        try Task.checkCancellation()
        if let error = response.errors?.first { throw error }
        guard let data = response.data else { throw MissingDataError() }
        if response.source == .server {
            do {
                try await store.withinReadWriteTransaction { try await $0.write(data: data, for: query) }
            } catch {
                Logger.api.error("Couldn't cache \(Query.operationName, privacy: .public): \(error.localizedDescription)")
            }
        }
        try Task.checkCancellation()
        return data
    }
}

nonisolated struct MissingDataError: LocalizedError {
    // Xcode 26's generated string symbols are main-actor isolated.
    var errorDescription: String? { String(localized: "missingData") }
}
