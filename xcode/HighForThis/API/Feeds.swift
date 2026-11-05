import Apollo
import HighForThisAPI

nonisolated enum ShowKind: Hashable {
    case upcoming
    case history
}

nonisolated struct ShowFilter: Hashable {
    var kind: ShowKind
    var artist: String?
    var venue: String?
    var year: Int?
}

nonisolated struct VideoFilter: Hashable {
    var year: Int?
}

nonisolated enum Unfiltered: Hashable {
    case all
}

typealias ShowFeed = CursorFeed<ShowFilter, ShowList_show>
typealias VideoFeed = CursorFeed<VideoFilter, Video_video>
typealias PostFeed = CursorFeed<Unfiltered, PostsQuery.Data.Posts.Edge.Node>
typealias PodcastFeed = CursorFeed<Unfiltered, PodcastsQuery.Data.Podcasts.Edge.Node>

nonisolated extension ShowList_show: FeedItem {}
nonisolated extension Video_video: FeedItem {}
nonisolated extension PostsQuery.Data.Posts.Edge.Node: FeedItem {}
nonisolated extension PodcastsQuery.Data.Podcasts.Edge.Node: FeedItem {}

enum Feeds {
    static func shows(client: ApolloClient = .highForThis) -> ShowFeed {
        ShowFeed { filter, cursor, policy in
            let query = ShowsQuery(
                after: cursor ?? .none,
                artist: filter.artist.map { EntityArg(slug: .some($0)) } ?? .none,
                attended: filter.kind == .history ? true : .none,
                first: 50,
                includeYears: cursor == nil && filter.kind == .history,
                latest: filter.kind == .upcoming ? true : .none,
                venue: filter.venue.map { EntityArg(slug: .some($0)) } ?? .none,
                year: filter.year.flatMap(Int32.init(exactly:)) ?? .none
            )
            guard let shows = try await client.data(for: query, cachePolicy: policy).shows else { throw MissingDataError() }
            return FeedPage(
                items: shows.edges.map(\.node.fragments.showList_show),
                endCursor: shows.pageInfo.endCursor,
                hasNextPage: shows.pageInfo.hasNextPage ?? false,
                years: shows.years
            )
        }
    }

    static func videos(client: ApolloClient = .highForThis) -> VideoFeed {
        VideoFeed { filter, cursor, policy in
            let query = VideosQuery(
                after: cursor ?? .none, first: 20, includeYears: cursor == nil, year: filter.year.flatMap(Int32.init(exactly:)) ?? .none
            )
            guard let videos = try await client.data(for: query, cachePolicy: policy).videos else { throw MissingDataError() }
            return FeedPage(
                items: videos.edges.map(\.node.fragments.video_video),
                endCursor: videos.pageInfo.endCursor,
                hasNextPage: videos.pageInfo.hasNextPage ?? false,
                years: videos.years
            )
        }
    }

    static func posts(client: ApolloClient = .highForThis) -> PostFeed {
        PostFeed { _, cursor, policy in
            guard let posts = try await client.data(for: PostsQuery(after: cursor ?? .none, first: 20), cachePolicy: policy).posts else {
                throw MissingDataError()
            }
            return FeedPage(
                items: posts.edges.map(\.node), endCursor: posts.pageInfo.endCursor, hasNextPage: posts.pageInfo.hasNextPage ?? false)
        }
    }

    static func podcasts(client: ApolloClient = .highForThis) -> PodcastFeed {
        PodcastFeed { _, cursor, policy in
            guard let podcasts = try await client.data(for: PodcastsQuery(after: cursor ?? .none, first: 20), cachePolicy: policy).podcasts
            else {
                throw MissingDataError()
            }
            return FeedPage(
                items: podcasts.edges.map(\.node), endCursor: podcasts.pageInfo.endCursor,
                hasNextPage: podcasts.pageInfo.hasNextPage ?? false)
        }
    }
}
