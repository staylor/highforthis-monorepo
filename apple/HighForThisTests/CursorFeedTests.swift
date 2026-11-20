import Apollo
import Foundation
import Testing

@testable import HighForThis

@Suite(.timeLimit(.minutes(1)))
struct CursorFeedTests {
    private nonisolated struct Item: FeedItem, Equatable {
        let id: String
    }

    private struct Request: Equatable {
        let filter: Int
        let cursor: String?
        let policy: CachePolicy.Query.SingleResponse
    }

    private struct Failure: Error {}
    private typealias Feed = CursorFeed<Int, Item>

    private static func page(_ ids: [String], next: String? = nil, years: [Int]? = nil) -> FeedPage<Item> {
        FeedPage(items: ids.map(Item.init), endCursor: next, hasNextPage: next != nil, years: years)
    }

    @Test func pagesAreDeduplicatedWithinAndAcrossResponses() async {
        var requests: [Request] = []
        let feed = Feed { filter, cursor, policy in
            requests.append(Request(filter: filter, cursor: cursor, policy: policy))
            return cursor == nil ? Self.page(["a", "a", "b"], next: "page2") : Self.page(["b", "c", "c"])
        }
        await feed.load(2025)
        await feed.loadMore()
        await feed.loadMore()
        await feed.load(2025)

        #expect(feed.items.map(\.id) == ["a", "b", "c"])
        #expect(requests.count == 2)
        #expect(!feed.hasNextPage)
    }

    @Test func changingFiltersDiscardsLateResults() async {
        let old = Suspended<FeedPage<Item>>()
        let feed = Feed { filter, _, _ in
            if filter == 2025 { return try await old.value() }
            return Self.page(["new"])
        }
        let first = Task { await feed.load(2025) }
        await old.waitUntilStarted()
        await feed.load(2019)
        old.finish(.success(Self.page(["old"])))
        await first.value

        #expect(feed.filter == 2019)
        #expect(feed.items.map(\.id) == ["new"])
        #expect(!feed.isLoading)
    }

    @Test func changingFiltersDiscardsLateFailures() async {
        let old = Suspended<FeedPage<Item>>()
        let feed = Feed { filter, _, _ in
            if filter == 2025 { return try await old.value() }
            return Self.page(["new"])
        }
        let first = Task { await feed.load(2025) }
        await old.waitUntilStarted()
        await feed.load(2019)
        old.finish(.failure(Failure()))
        await first.value

        #expect(feed.error == nil)
        #expect(feed.items.map(\.id) == ["new"])
    }

    @Test func cancellationDiscardsEvenANonCooperativeSuccess() async {
        let request = Suspended<FeedPage<Item>>()
        let feed = Feed { _, _, _ in try await request.value() }
        let task = Task { await feed.load(2025) }
        await request.waitUntilStarted()
        task.cancel()
        request.finish(.success(Self.page(["cancelled"])))
        await task.value

        #expect(feed.items.isEmpty)
        #expect(!feed.hasLoaded)
        #expect(!feed.isLoading)
        #expect(feed.error == nil)
    }

    @Test func retryRepeatsAFailedRefreshNotTheNextPage() async {
        var requests: [Request] = []
        let feed = Feed { filter, cursor, policy in
            requests.append(Request(filter: filter, cursor: cursor, policy: policy))
            if requests.count == 2 { throw Failure() }
            return Self.page([requests.count == 1 ? "old" : "new"])
        }
        await feed.load(2019)
        await feed.load(2019, refresh: true)
        #expect(feed.items.map(\.id) == ["old"])
        #expect(feed.error is Failure)
        await feed.retry()

        #expect(feed.items.map(\.id) == ["new"])
        #expect(requests.last == Request(filter: 2019, cursor: nil, policy: .networkOnly))
        #expect(feed.error == nil)
    }

    @Test func retryRepeatsTheFailedPageWithoutDroppingExistingRows() async {
        var requests: [Request] = []
        let feed = Feed { filter, cursor, policy in
            requests.append(Request(filter: filter, cursor: cursor, policy: policy))
            if requests.count == 2 { throw Failure() }
            return cursor == nil ? Self.page(["first"], next: "next") : Self.page(["second"])
        }
        await feed.load(2025)
        await feed.loadMore()
        #expect(feed.items.map(\.id) == ["first"])
        await feed.retry()

        #expect(feed.items.map(\.id) == ["first", "second"])
        #expect(requests.last?.cursor == "next")
    }

    @Test func concurrentPageRequestsAreCoalesced() async {
        let next = Suspended<FeedPage<Item>>()
        var requests = 0
        let feed = Feed { _, cursor, _ in
            requests += 1
            if cursor == nil { return Self.page(["first"], next: "next") }
            return try await next.value()
        }
        await feed.load(2025)
        let loading = Task { await feed.loadMore() }
        await next.waitUntilStarted()
        await feed.loadMore()
        #expect(requests == 2)
        next.finish(.success(Self.page(["second"])))
        await loading.value
    }

    @Test func aRepeatedCursorFailsInsteadOfLooping() async {
        let feed = Feed { _, _, _ in Self.page(["first"], next: "same") }
        await feed.load(2025)
        await feed.loadMore()

        #expect(feed.error is PaginationError)
        #expect(feed.items.map(\.id) == ["first"])
    }

    @Test func aMissingNextCursorIsNotTreatedAsTheEnd() async {
        let feed = Feed { _, _, _ in FeedPage(items: [Item(id: "a")], endCursor: nil, hasNextPage: true) }
        await feed.load(2025)
        #expect(feed.error is PaginationError)
        #expect(!feed.hasLoaded)
    }

    @Test func refreshCanEmptyTheListAndTheYears() async {
        var requests = 0
        let feed = Feed { _, _, _ in
            requests += 1
            return requests == 1 ? Self.page(["old"], years: [2019, 2025, 2019]) : Self.page([], years: [])
        }
        await feed.load(2025)
        #expect(feed.years == [2025, 2019])
        await feed.load(2025, refresh: true)
        #expect(feed.items.isEmpty)
        #expect(feed.years.isEmpty)
        #expect(feed.hasLoaded)
    }
}

final class Suspended<Value: Sendable> {
    private var continuation: CheckedContinuation<Value, any Error>?

    func value() async throws -> Value {
        try await withCheckedThrowingContinuation { continuation = $0 }
    }

    func waitUntilStarted() async {
        while continuation == nil { await Task.yield() }
    }

    func finish(_ result: Result<Value, any Error>) {
        continuation?.resume(with: result)
        continuation = nil
    }
}
