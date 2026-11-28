import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct StatsTests {
    private nonisolated static func artist(_ index: Int) -> Mock<Artist> {
        Mock<Artist>(id: "artist-\(index)", name: "Artist \(index)", slug: "artist-\(index)")
    }

    @Test func aTieSharesItsRankAndTheNextRankCountsPastIt() {
        #expect(StatsBoard.rankings([20, 20, 18, 12, 12, 11]) == [1, 1, 3, 4, 4, 6])
        #expect(StatsBoard.rankings([]) == [])
    }

    // The 20th and the 21st both had 5, so neither leads, and the tiers start with everyone who had 5
    @Test func theLeaderboardStopsBeforeATieThatGoesPastIt() {
        let counts = [20, 20, 18, 12, 12, 12, 12, 11, 10, 10, 8, 8, 7, 7, 7, 7, 6, 6, 6, 5, 5, 5]
        #expect(StatsBoard.leaderCount(counts) == 19)
    }

    @Test func everyoneLeadsWhenThereAreNoMoreThanTheLimit() {
        #expect(StatsBoard.leaderCount([3, 2, 1]) == 3)
        #expect(StatsBoard.leaderCount(Array(repeating: 1, count: 20)) == 20)
    }

    @Test func thePodiumKeepsItsThreeWhenEveryoneTies() {
        #expect(StatsBoard.leaderCount(Array(repeating: 5, count: 30)) == 3)
    }

    @Test func theRestAreInTiersByHowManyShowsEachHad() async {
        let counts = [5, 5, 3, 2, 2, 1, 1]
        let everyone = await counts.enumerated().asyncMap { index, count in
            await StatsLineup_stat.from(Mock<ShowStat>(count: count, entity: Self.artist(index + 1)))
        }
        // The query asks for as many leaders as the limit, with their years and pictures
        let leaders = await counts.prefix(4).enumerated().asyncMap { index, count in
            await StatsLeader_stat.from(
                Mock<ShowStat>(count: count, entity: Self.artist(index + 1), firstLocalDate: "2019-01-01", lastLocalDate: "2025-12-31"))
        }

        let board = StatsBoard(leaders: leaders, everyone: everyone, limit: 4)

        #expect(board.leaders.map(\.entity.name) == ["Artist 1", "Artist 2", "Artist 3"])
        #expect(board.leaders.map(\.rank) == [1, 1, 3])
        #expect(board.leaders.map(\.isOnThePodium) == [true, true, true])
        #expect(board.most == 5)
        #expect(board.tiers.map(\.count) == [2, 1])
        #expect(board.tiers.map { $0.entities.map(\.name) } == [["Artist 4", "Artist 5"], ["Artist 6", "Artist 7"]])
    }

    // The website's podium has three places, so the fourth, tied with the third, shares its rank but not its place
    @Test func aTieForThirdLeavesTheFourthOffThePodium() async {
        let counts = [5, 4, 3, 3, 1]
        let everyone = await counts.enumerated().asyncMap { index, count in
            await StatsLineup_stat.from(Mock<ShowStat>(count: count, entity: Self.artist(index + 1)))
        }
        let leaders = await counts.enumerated().asyncMap { index, count in
            await StatsLeader_stat.from(
                Mock<ShowStat>(count: count, entity: Self.artist(index + 1), firstLocalDate: "2019-01-01", lastLocalDate: "2025-12-31"))
        }

        let board = StatsBoard(leaders: leaders, everyone: everyone)

        #expect(board.leaders.map(\.rank) == [1, 2, 3, 3, 5])
        #expect(board.leaders.map(\.isOnThePodium) == [true, true, true, false, false])
    }

    @Test func aLeadersYearsUseTheVenueCalendar() async throws {
        let stat = await StatsLeader_stat.from(
            Mock<ShowStat>(count: 2, entity: Self.artist(1), firstLocalDate: "2008-12-31", lastLocalDate: "2024-12-31")
        )

        let leader = try #require(StatsLeader(rank: 1, position: 0, stat: stat))

        #expect(leader.years == 2008...2024)
        #expect(leader.yearsText == "2008–2024")
    }

    @Test func aLeaderOfOneYearSaysOnlyThatYear() async throws {
        let stat = await StatsLeader_stat.from(
            Mock<ShowStat>(count: 2, entity: Self.artist(1), firstLocalDate: "2019-11-05", lastLocalDate: "2019-11-05")
        )

        #expect(try #require(StatsLeader(rank: 1, position: 0, stat: stat)).yearsText == "2019")
    }

    @Test(
        arguments: [
            (city: "Brooklyn", state: "NY", place: "Brooklyn, NY"),
            (city: "Brooklyn", state: nil, place: "Brooklyn"),
            (city: nil, state: " ", place: nil),
        ] as [(city: String?, state: String?, place: String?)])
    func aVenueSaysWhereItIs(city: String?, state: String?, place: String?) async throws {
        let stat = await StatsLeader_stat.from(
            Mock<ShowStat>(
                count: 9, entity: Mock<Venue>(city: city, id: "venue", name: "Brooklyn Bowl", slug: "brooklyn-bowl", state: state),
                firstLocalDate: "2019-01-01", lastLocalDate: "2025-12-31")
        )

        let leader = try #require(StatsLeader(rank: 1, position: 0, stat: stat))

        #expect(leader.entity == StatsEntity(kind: .venue, id: "venue", name: "Brooklyn Bowl", slug: "brooklyn-bowl"))
        #expect(leader.place == place)
    }

    @Test func anArtistHasItsArtworkAndNoPlace() async throws {
        let artist = Mock<Artist>(
            appleMusic: Mock<AppleMusicData>(
                artwork: Mock<AppleMusicArtwork>(height: 2400, url: "https://example.com/{w}x{h}bb.jpg", width: 2400)),
            id: "wilco", name: "Wilco", slug: "wilco")
        let stat = await StatsLeader_stat.from(
            Mock<ShowStat>(count: 7, entity: artist, firstLocalDate: "2019-01-01", lastLocalDate: "2025-12-31"))

        let leader = try #require(StatsLeader(rank: 4, position: 3, stat: stat))

        #expect(leader.place == nil)
        #expect(leader.isOnThePodium == false)
        #expect(leader.artwork(maximumWidth: 88)?.url.absoluteString == "https://example.com/88x88bb.jpg")
    }

    @Test(arguments: [
        ("Madison Square Garden", "MSG"),
        ("Music Hall of Williamsburg", "MHW"),
        ("The National", "N"),
        // Small words count when there's nothing else
        ("The The", "TT"),
        ("Bob Weir & Wolf Bros", "BWW"),
    ])
    func initialsLeaveOutSmallWords(name: String, initials: String) {
        #expect(StatsEntity(kind: .venue, id: "", name: name, slug: "").initials == initials)
    }

    @Test func theFirstShowUsesItsVenueYear() async {
        let totals = await ShowStatsQuery.Data.ShowTotals.from(Mock<ShowTotals>(firstLocalDate: "2008-12-31"))
        #expect(totals.firstYear == 2008)
    }
}
