import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct ShowsTests {
    private static let newYork: Calendar = {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = TimeZone(identifier: "America/New_York")!
        return calendar
    }()

    @Test func headlineIsTheTitleWhenThereIsOne() async {
        let show = await ShowList_show.from(Mock<Show>(artists: [Mock<Artist>(name: "Phish")], title: "New Year’s Eve"))
        #expect(show.headline == "New Year’s Eve")
    }

    @Test(arguments: [nil, ""])
    func headlineNamesTheArtistsWithoutATitle(title: String?) async {
        let show = await ShowList_show.from(
            Mock<Show>(artists: [Mock<Artist>(name: "Bob Weir"), Mock<Artist>(name: "Wolf Bros")], title: title)
        )
        #expect(show.headline == "Bob Weir / Wolf Bros")
    }

    @Test func startDateReadsMilliseconds() async {
        let show = await ShowList_show.from(Mock<Show>(date: 1_793_840_400_000))
        #expect(show.startDate == Date(timeIntervalSince1970: 1_793_840_400))
    }

    @Test func showsOnTheSameLocalDayShareADay() async throws {
        // 6 PM and 9:30 PM in New York fall on different days in UTC.
        let early = await ShowList_show.from(Mock<Show>(artists: [Mock<Artist>(name: "Wilco")], date: 1_793_833_200_000, id: "early"))
        let late = await ShowList_show.from(Mock<Show>(artists: [Mock<Artist>(name: "Beck")], date: 1_793_845_800_000, id: "late"))

        let days = ShowDay.days(from: [early, late], calendar: Self.newYork)

        let day = try #require(days.first)
        #expect(days.count == 1)
        #expect(day.date == Self.newYork.date(from: DateComponents(year: 2026, month: 11, day: 4)))
        #expect(day.shows.map(\.id) == ["late", "early"])
    }

    @Test func daysKeepTheAPIOrder() async {
        let shows = await [1_793_926_800_000, 1_793_754_000_000, 1_793_833_200_000].asyncMap { date in
            await ShowList_show.from(Mock<Show>(date: date, id: String(date)))
        }

        let days = ShowDay.days(from: shows, calendar: Self.newYork)

        #expect(days.map { Self.newYork.component(.day, from: $0.date) } == [5, 3, 4])
    }
}

extension Sequence {
    func asyncMap<T>(_ transform: (Element) async -> T) async -> [T] {
        var results: [T] = []
        for element in self {
            await results.append(transform(element))
        }
        return results
    }
}
