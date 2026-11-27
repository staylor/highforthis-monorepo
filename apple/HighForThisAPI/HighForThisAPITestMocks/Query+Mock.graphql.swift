// @generated
// This file was automatically generated and should not be edited.

import ApolloTestSupport
@testable import HighForThisAPI

nonisolated public final class Query: MockObject {
  public static let objectType: ApolloAPI.Object = HighForThisAPI.Objects.Query
  public static let _mockFields = MockFields()
  public typealias MockValueCollectionType = Array<Mock<Query>>

  public struct MockFields: Sendable {
    @Field<Artist>("artist") public var artist
    @Field<[ShowStat]>("artistLeaders") public var artistLeaders
    @Field<[ShowStat]>("artists") public var artists
    @Field<ShowConnection>("attended") public var attended
    @Field<Podcast>("podcast") public var podcast
    @Field<PodcastConnection>("podcasts") public var podcasts
    @Field<Post>("post") public var post
    @Field<PostConnection>("posts") public var posts
    @Field<Show>("show") public var show
    @Field<ShowTotals>("showTotals") public var showTotals
    @Field<ShowConnection>("shows") public var shows
    @Field<Venue>("venue") public var venue
    @Field<[ShowStat]>("venueLeaders") public var venueLeaders
    @Field<[ShowStat]>("venues") public var venues
    @Field<VideoConnection>("videos") public var videos
  }
}

public extension Mock where O == Query {
  convenience init(
    artist: Mock<Artist>? = nil,
    artistLeaders: [Mock<ShowStat>] = [],
    artists: [Mock<ShowStat>] = [],
    attended: Mock<ShowConnection>? = nil,
    podcast: Mock<Podcast>? = nil,
    podcasts: Mock<PodcastConnection>? = nil,
    post: Mock<Post>? = nil,
    posts: Mock<PostConnection>? = nil,
    show: Mock<Show>? = nil,
    showTotals: Mock<ShowTotals> = Mock<ShowTotals>(),
    shows: Mock<ShowConnection>? = nil,
    venue: Mock<Venue>? = nil,
    venueLeaders: [Mock<ShowStat>] = [],
    venues: [Mock<ShowStat>] = [],
    videos: Mock<VideoConnection>? = nil
  ) {
    self.init()
    _setEntity(artist, for: \.artist)
    _setList(artistLeaders, for: \.artistLeaders)
    _setList(artists, for: \.artists)
    _setEntity(attended, for: \.attended)
    _setEntity(podcast, for: \.podcast)
    _setEntity(podcasts, for: \.podcasts)
    _setEntity(post, for: \.post)
    _setEntity(posts, for: \.posts)
    _setEntity(show, for: \.show)
    _setEntity(showTotals, for: \.showTotals)
    _setEntity(shows, for: \.shows)
    _setEntity(venue, for: \.venue)
    _setList(venueLeaders, for: \.venueLeaders)
    _setList(venues, for: \.venues)
    _setEntity(videos, for: \.videos)
  }
}
