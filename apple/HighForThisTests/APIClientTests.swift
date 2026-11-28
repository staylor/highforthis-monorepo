import Apollo
import Foundation
import HighForThisAPI
import Testing

@testable import HighForThis

struct APIClientTests {
    private var query: ShowsQuery {
        ShowsQuery(
            after: .none, artist: .none, attended: .none, first: 50, includeYears: true, latest: true, mostRecentYear: .none,
            venue: .none, year: .none)
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

    @Test func theHistoryAsksForOneYearAtATimeStartingWithTheMostRecent() {
        let history = ShowsQuery(ShowFilter(kind: .history), after: nil)
        #expect(history.attended == true)
        #expect(history.mostRecentYear == true)
        #expect(history.year == .none)
        #expect(history.first == 100)
        #expect(history.includeYears)

        let nextPage = ShowsQuery(ShowFilter(kind: .history), after: "100")
        #expect(nextPage.mostRecentYear == true)
        #expect(nextPage.after == "100")
        #expect(!nextPage.includeYears)

        // The years are the same for any year, so the menu keeps the ones it has.
        let chosen = ShowsQuery(ShowFilter(kind: .history, year: 2019), after: nil)
        #expect(chosen.mostRecentYear == .none)
        #expect(chosen.year == 2019)
        #expect(!chosen.includeYears)

        // An artist's or a venue's shows come whole, from every year, until one is chosen.
        let artist = ShowsQuery(ShowFilter(kind: .history, artist: "sample-artist"), after: nil)
        #expect(artist.mostRecentYear == .none)
        #expect(artist.year == .none)
        #expect(artist.first == 50)
        #expect(artist.includeYears)

        let upcoming = ShowsQuery(ShowFilter(kind: .upcoming), after: nil)
        #expect(upcoming.latest == true)
        #expect(upcoming.mostRecentYear == .none)
        #expect(!upcoming.includeYears)
    }

    @Test func theHistoryListsTheMostRecentYearAndKeepsItsYearsForTheOthers() async {
        let shows = Feeds.shows(client: UITestFixtures.client(scenario: "emptyYear"))
        await shows.load(ShowFilter(kind: .history))
        #expect(shows.years == [2025, 2019])
        #expect(shows.items.map(\.id).first == "show-2025-0")
        await shows.load(ShowFilter(kind: .history, year: 2019))
        #expect(shows.error == nil)
        #expect(shows.items.isEmpty)
        #expect(shows.years == [2025, 2019])
    }

    @Test func complicationQueryReadsTheNextShowAndAnEmptySchedule() async throws {
        let query = NextShowQuery()
        let data = try await UITestFixtures.client().data(for: query)
        let shows = try #require(data.shows)
        #expect(shows.edges.count == 1)
        let show = try #require(shows.edges.first?.node)
        #expect(show.id == "show-2025-0")
        #expect(show.venue.name == "Sample Hall")
        #expect(show.schedule.localDate == "2025-11-05")

        let empty = try await UITestFixtures.client(scenario: "empty").data(for: query)
        #expect(empty.shows?.edges.isEmpty == true)
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
        #expect(blocks.count == 7)
        guard blocks.count == 7, case .code(let code) = blocks[4] else {
            Issue.record("The code block is missing")
            return
        }
        #expect(String(code.characters) == "side A\nside B")
        #expect(
            Array(blocks.suffix(2)) == [
                .list(numbered: true, start: 1, items: [AttributedString("The opening track"), AttributedString("The encore")]),
                .list(numbered: false, start: 1, items: [AttributedString("Vinyl"), AttributedString("Tape")]),
            ]
        )
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
