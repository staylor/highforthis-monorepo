import Apollo
import ApolloTestSupport
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct VideoFeedTests {
    private struct Request: Equatable {
        let year: Int?
        let after: String?
    }

    private struct Failure: Error {}

    /// Answers each request with the next of `pages`, and records what was asked for.
    private final class Pages {
        var requests: [Request] = []
        private var results: [Result<VideoFeed.Page, any Error>]

        init(_ results: [Result<VideoFeed.Page, any Error>]) {
            self.results = results
        }

        func load(year: Int?, after: String?, cachePolicy: CachePolicy.Query.SingleResponse) throws -> VideoFeed.Page {
            requests.append(Request(year: year, after: after))
            return try results.removeFirst().get()
        }
    }

    private static func page(_ ids: [String], cursor: String? = nil, years: [Int] = [2024, 2023]) async -> VideoFeed.Page {
        let videos = await ids.asyncMap { id in await Video_video.from(Mock<Video>(id: id)) }
        return VideoFeed.Page(videos: videos, endCursor: cursor, hasNextPage: cursor != nil, years: years)
    }

    @Test func theFirstPageShowsItsVideosAndTheYears() async {
        let pages = Pages([.success(await Self.page(["a", "b"], cursor: "b"))])
        let feed = VideoFeed(loadPage: pages.load)

        await feed.show(year: nil)

        #expect(feed.videos.map(\.id) == ["a", "b"])
        #expect(feed.years == [2024, 2023])
        #expect(feed.hasNextPage)
        #expect(pages.requests == [Request(year: nil, after: nil)])
    }

    @Test func loadingMoreAppendsTheNextPageUntilTheLast() async {
        let pages = Pages([
            .success(await Self.page(["a", "b"], cursor: "b")),
            .success(await Self.page(["b", "c"])),
        ])
        let feed = VideoFeed(loadPage: pages.load)

        await feed.show(year: nil)
        await feed.loadMore()
        await feed.loadMore()

        #expect(feed.videos.map(\.id) == ["a", "b", "c"])
        #expect(!feed.hasNextPage)
        #expect(pages.requests == [Request(year: nil, after: nil), Request(year: nil, after: "b")])
    }

    @Test func showingTheSameYearAgainKeepsWhatsLoaded() async {
        let pages = Pages([.success(await Self.page(["a"], cursor: "a")), .success(await Self.page(["b"]))])
        let feed = VideoFeed(loadPage: pages.load)

        await feed.show(year: nil)
        await feed.loadMore()
        await feed.show(year: nil)

        #expect(feed.videos.map(\.id) == ["a", "b"])
        #expect(pages.requests.count == 2)
    }

    @Test func anotherYearStartsOver() async {
        let pages = Pages([.success(await Self.page(["a"], cursor: "a")), .success(await Self.page(["2019"]))])
        let feed = VideoFeed(loadPage: pages.load)

        await feed.show(year: nil)
        await feed.show(year: 2019)

        #expect(feed.year == 2019)
        #expect(feed.videos.map(\.id) == ["2019"])
        #expect(pages.requests.last == Request(year: 2019, after: nil))
    }

    @Test func aPageThatArrivesAfterStartingOverIsDropped() async {
        var resumeFirstPage: CheckedContinuation<Void, Never>?
        let allYears = await Self.page(["old"])
        let year2019 = await Self.page(["2019"])
        let feed = VideoFeed { year, _, _ in
            guard year == nil else { return year2019 }
            await withCheckedContinuation { resumeFirstPage = $0 }
            return allYears
        }

        let firstLoad = Task { await feed.show(year: nil) }
        while resumeFirstPage == nil {
            await Task.yield()
        }
        await feed.show(year: 2019)
        resumeFirstPage?.resume()
        await firstLoad.value

        #expect(feed.videos.map(\.id) == ["2019"])
        #expect(!feed.isLoading)
    }

    @Test func aFailureIsShownUntilARetrySucceeds() async {
        let pages = Pages([.failure(Failure()), .success(await Self.page(["a"]))])
        let feed = VideoFeed(loadPage: pages.load)

        await feed.show(year: nil)
        #expect(feed.error is Failure)
        #expect(!feed.hasLoaded)

        await feed.reload(year: nil)
        #expect(feed.error == nil)
        #expect(feed.videos.map(\.id) == ["a"])
    }
}
