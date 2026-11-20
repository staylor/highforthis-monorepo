import Apollo
import Foundation
import Observation

nonisolated protocol FeedItem: Sendable {
    var id: String { get }
}

nonisolated struct FeedPage<Item: Sendable>: Sendable {
    var items: [Item]
    var endCursor: String?
    var hasNextPage: Bool
    var years: [Int]? = nil
}

@Observable
final class CursorFeed<Filter: Equatable, Item: FeedItem> {
    typealias Loader = (Filter, String?, CachePolicy.Query.SingleResponse) async throws -> FeedPage<Item>

    private(set) var filter: Filter?
    private(set) var items: [Item] = []
    private(set) var years: [Int] = []
    private(set) var hasLoaded = false
    private(set) var isLoading = false
    private(set) var error: (any Error)?
    private(set) var endCursor: String?
    private(set) var hasNextPage = false

    @ObservationIgnored private let loader: Loader
    @ObservationIgnored private var generation = 0
    @ObservationIgnored private var failedRequest: (cursor: String?, policy: CachePolicy.Query.SingleResponse)?
    @ObservationIgnored private var visitedCursors: Set<String> = []

    init(loader: @escaping Loader) {
        self.loader = loader
    }

    func load(_ filter: Filter, refresh: Bool = false) async {
        guard refresh || self.filter != filter || (!hasLoaded && !isLoading) else { return }
        generation += 1
        if self.filter != filter {
            self.filter = filter
            items = []
            hasLoaded = false
            endCursor = nil
            hasNextPage = false
        }
        await fetch(after: nil, policy: refresh ? .networkOnly : .cacheFirst)
    }

    func loadMore() async {
        guard hasLoaded, hasNextPage, !isLoading, error == nil, let endCursor else { return }
        await fetch(after: endCursor, policy: .cacheFirst)
    }

    func retry() async {
        guard !isLoading, let failedRequest else { return }
        await fetch(after: failedRequest.cursor, policy: failedRequest.policy)
    }

    private func fetch(after cursor: String?, policy: CachePolicy.Query.SingleResponse) async {
        guard let filter else { return }
        let generation = generation
        isLoading = true
        error = nil
        failedRequest = nil
        defer {
            if generation == self.generation { isLoading = false }
        }
        do {
            let page = try await loader(filter, cursor, policy)
            guard generation == self.generation, !Task.isCancelled else { return }
            var visited = cursor == nil ? Set<String>() : visitedCursors
            if let cursor { visited.insert(cursor) }
            if page.hasNextPage {
                guard let next = page.endCursor, !next.isEmpty, !visited.contains(next) else {
                    throw PaginationError()
                }
            }
            var ids = Set(cursor == nil ? [] : items.map(\.id))
            let newItems = page.items.filter { ids.insert($0.id).inserted }
            items = cursor == nil ? newItems : items + newItems
            visitedCursors = visited
            endCursor = page.endCursor
            hasNextPage = page.hasNextPage
            if let years = page.years { self.years = Array(Set(years)).sorted(by: >) }
            hasLoaded = true
            failedRequest = nil
        } catch {
            guard generation == self.generation, !Task.isCancelled, !(error is CancellationError) else { return }
            self.error = error
            failedRequest = (cursor, policy)
        }
    }
}

nonisolated struct PaginationError: LocalizedError {
    var errorDescription: String? { String(localized: "couldNotLoadNextPage") }
}
