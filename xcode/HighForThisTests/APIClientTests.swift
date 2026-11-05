import Apollo
import Foundation
import HighForThisAPI
import Testing

@testable import HighForThis

struct APIClientTests {
    private var query: ShowsQuery {
        ShowsQuery(after: .none, artist: .none, attended: .none, first: 50, includeYears: true, latest: true, venue: .none, year: .none)
    }

    @Test func graphQLErrorsAreNotCachedAsEmptySuccesses() async throws {
        let client = UITestFixtures.client(scenario: "graphqlError")
        await #expect(throws: (any Error).self) { try await client.data(for: query) }
        let cached = try await client.fetch(query: query, cachePolicy: .cacheOnly)
        #expect(cached == nil)
    }

    @Test func validResponsesCanBeReadFromCache() async throws {
        let client = UITestFixtures.client(scenario: "normal")
        let data = try await client.data(for: query)
        #expect(data.shows?.edges.count == 2)
        let cached = try await client.fetch(query: query, cachePolicy: .cacheOnly)
        #expect(cached?.data == data)
    }

    @Test func anActualEmptyConnectionIsASuccess() async {
        let feed = Feeds.shows(client: UITestFixtures.client(scenario: "empty"))
        await feed.load(ShowFilter(kind: .upcoming))
        #expect(feed.error == nil)
        #expect(feed.hasLoaded)
        #expect(feed.items.isEmpty)
    }

    @Test func postFixturesUseTheRealResponseParser() async throws {
        let client = UITestFixtures.client(scenario: "normal")
        let post = try await client.data(for: PostQuery(slug: "post-0")).post
        let blocks = PostBlock.blocks(in: post?.editorState)
        #expect(blocks.count == 5)
        guard case .code(let code) = blocks.last else {
            Issue.record("The code block is missing")
            return
        }
        #expect(String(code.characters) == "side A\nside B")
    }

    @Test func allFeedsCanPageWithoutTheProductionAPI() async {
        let client = UITestFixtures.client(scenario: "normal")
        let shows = Feeds.shows(client: client)
        await shows.load(ShowFilter(kind: .history))
        await shows.loadMore()
        await shows.loadMore()
        #expect(shows.items.count == 5)
        #expect(!shows.hasNextPage)
        let videos = Feeds.videos(client: client)
        await videos.load(VideoFilter())
        await videos.loadMore()
        #expect(videos.items.count == 4)
        let posts = Feeds.posts(client: client)
        await posts.load(.all)
        await posts.loadMore()
        #expect(posts.items.count == 4)
        let podcasts = Feeds.podcasts(client: client)
        await podcasts.load(.all)
        await podcasts.loadMore()
        #expect(podcasts.items.count == 4)
    }
}
