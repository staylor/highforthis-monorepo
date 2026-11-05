import Apollo
import ApolloAPI
import Observation

@Observable
final class QueryState<Query: GraphQLQuery> where Query.ResponseFormat == SingleResponseFormat {
    typealias Loader = (Query, CachePolicy.Query.SingleResponse) async throws -> Query.Data

    private(set) var query: Query?
    private(set) var data: Query.Data?
    private(set) var error: (any Error)?
    private(set) var isLoading = false

    @ObservationIgnored private var generation = 0
    @ObservationIgnored private let loader: Loader

    init(loader: @escaping Loader = { try await ApolloClient.highForThis.data(for: $0, cachePolicy: $1) }) {
        self.loader = loader
    }

    func load(_ query: Query, refresh: Bool = false) async {
        guard refresh || self.query != query || (data == nil && !isLoading) else { return }
        generation += 1
        let generation = generation
        if self.query != query {
            data = nil
            self.query = query
        }
        error = nil
        isLoading = true
        defer {
            if generation == self.generation { isLoading = false }
        }
        do {
            let data = try await loader(query, refresh ? .networkOnly : .cacheFirst)
            guard generation == self.generation, !Task.isCancelled else { return }
            self.data = data
        } catch {
            guard generation == self.generation, !Task.isCancelled, !(error is CancellationError) else { return }
            self.error = error
        }
    }
}
