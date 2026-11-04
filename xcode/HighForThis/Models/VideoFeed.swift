import Apollo
import HighForThisAPI
import Observation

/// The videos list, a page at a time, for every year or just one.
@Observable
final class VideoFeed {
    struct Page {
        var videos: [Video_video]
        var endCursor: String?
        var hasNextPage: Bool
        var years: [Int]
    }

    typealias LoadPage = (_ year: Int?, _ after: String?, _ cachePolicy: CachePolicy.Query.SingleResponse) async throws -> Page

    private(set) var videos: [Video_video] = []
    private(set) var years: [Int] = []
    private(set) var year: Int?
    private(set) var hasNextPage = false
    private(set) var isLoading = false
    private(set) var hasLoaded = false
    private(set) var error: (any Error)?

    @ObservationIgnored private var endCursor: String?
    /// Incremented by every reload, so a page that arrives after the list started over is dropped.
    @ObservationIgnored private var generation = 0
    @ObservationIgnored private let loadPage: LoadPage

    init(loadPage: @escaping LoadPage = VideoFeed.pages(from: .highForThis)) {
        self.loadPage = loadPage
    }

    /// Shows a year's videos, or every year's for `nil`, unless they're showing already.
    func show(year: Int?) async {
        guard year != self.year || !hasLoaded else { return }
        await reload(year: year)
    }

    /// Starts over from the first page. A new year clears the list right away; the same year keeps it until the
    /// first page arrives, as pulling to refresh does.
    func reload(year: Int?, cachePolicy: CachePolicy.Query.SingleResponse = .cacheFirst) async {
        generation += 1
        if year != self.year {
            self.year = year
            videos = []
            hasNextPage = false
            hasLoaded = false
        }
        await fetch(after: nil, cachePolicy: cachePolicy)
    }

    func loadMore() async {
        guard hasNextPage, !isLoading, let endCursor else { return }
        await fetch(after: endCursor, cachePolicy: .cacheFirst)
    }

    private func fetch(after cursor: String?, cachePolicy: CachePolicy.Query.SingleResponse) async {
        let generation = generation
        isLoading = true
        error = nil
        defer {
            if generation == self.generation {
                isLoading = false
            }
        }
        do {
            let page = try await loadPage(year, cursor, cachePolicy)
            guard generation == self.generation else { return }
            if cursor == nil {
                videos = page.videos
            } else {
                let ids = Set(videos.map(\.id))
                videos += page.videos.filter { !ids.contains($0.id) }
            }
            endCursor = page.endCursor
            hasNextPage = page.hasNextPage
            hasLoaded = true
            if !page.years.isEmpty {
                years = page.years
            }
        } catch {
            guard generation == self.generation, !Task.isCancelled else { return }
            self.error = error
        }
    }

    static func pages(from client: ApolloClient, pageSize: Int32 = 10) -> LoadPage {
        { year, cursor, cachePolicy in
            let query = VideosQuery(after: cursor ?? .none, first: .some(pageSize), year: year.map(Int32.init) ?? .none)
            let videos = try await client.data(for: query, cachePolicy: cachePolicy).videos
            return Page(
                videos: videos?.edges.map(\.node.fragments.video_video) ?? [],
                endCursor: videos?.edges.last?.cursor,
                hasNextPage: videos?.pageInfo.hasNextPage ?? false,
                years: videos?.years ?? []
            )
        }
    }
}
