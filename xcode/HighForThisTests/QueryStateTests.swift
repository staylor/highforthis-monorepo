import Apollo
import ApolloTestSupport
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

@Suite(.timeLimit(.minutes(1)))
struct QueryStateTests {
    private struct Failure: Error {}

    private static func data(_ id: String) async -> ShowQuery.Data {
        await ShowQuery.Data.from(Mock<Query>(show: Mock<Show>(id: id)))
    }

    @Test func aCancelledQueryCannotOverwriteItsReplacement() async {
        let old = Suspended<ShowQuery.Data>()
        let newData = await Self.data("new")
        let state = QueryState<ShowQuery> { query, _ in
            if query.id == "old" { return try await old.value() }
            return newData
        }
        let first = Task { await state.load(ShowQuery(id: "old")) }
        await old.waitUntilStarted()
        first.cancel()
        await state.load(ShowQuery(id: "new"))
        old.finish(.success(await Self.data("old")))
        await first.value

        #expect(state.data?.show?.id == "new")
        #expect(!state.isLoading)
        #expect(state.error == nil)
    }

    @Test func overlappingRefreshesKeepTheNewestResponse() async {
        let old = Suspended<ShowQuery.Data>()
        let newData = await Self.data("new")
        var requests = 0
        let state = QueryState<ShowQuery> { _, _ in
            requests += 1
            if requests == 1 { return try await old.value() }
            return newData
        }
        let query = ShowQuery(id: "show")
        let first = Task { await state.load(query) }
        await old.waitUntilStarted()
        await state.load(query, refresh: true)
        old.finish(.success(await Self.data("old")))
        await first.value
        #expect(state.data?.show?.id == "new")
    }

    @Test func staleErrorsCannotEraseNewerData() async {
        let old = Suspended<ShowQuery.Data>()
        let newData = await Self.data("new")
        let state = QueryState<ShowQuery> { query, _ in
            if query.id == "old" { return try await old.value() }
            return newData
        }
        let first = Task { await state.load(ShowQuery(id: "old")) }
        await old.waitUntilStarted()
        await state.load(ShowQuery(id: "new"))
        old.finish(.failure(Failure()))
        await first.value
        #expect(state.error == nil)
        #expect(state.data?.show?.id == "new")
    }

    @Test func failedRefreshKeepsDataAndExposesTheError() async {
        let data = await Self.data("old")
        let state = QueryState<ShowQuery> { _, policy in
            if policy == .networkOnly { throw Failure() }
            return data
        }
        let query = ShowQuery(id: "show")
        await state.load(query)
        await state.load(query, refresh: true)
        #expect(state.data?.show?.id == "old")
        #expect(state.error is Failure)
        #expect(!state.isLoading)
    }

    @Test func returningToALoadedQueryDoesNotFetchAgain() async {
        let data = await Self.data("show")
        var requests = 0
        let state = QueryState<ShowQuery> { _, _ in
            requests += 1
            return data
        }
        let query = ShowQuery(id: "show")
        await state.load(query)
        await state.load(query)
        #expect(requests == 1)
    }
}
