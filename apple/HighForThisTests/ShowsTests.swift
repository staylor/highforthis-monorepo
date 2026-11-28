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

    private nonisolated static func artist(_ name: String, artwork: String? = nil) -> Mock<Artist> {
        Mock<Artist>(
            appleMusic: artwork.map { url in Mock<AppleMusicData>(artwork: Mock<AppleMusicArtwork>(height: 2400, url: url, width: 2400)) },
            name: name)
    }

    @Test func headlinerArtworkIsTheMainArtists() async throws {
        let show = await ShowList_show.from(
            Mock<Show>(artists: [
                Self.artist("Wilco", artwork: "https://example.com/wilco/{w}x{h}bb.jpg"),
                Self.artist("Spoon", artwork: "https://example.com/spoon/{w}x{h}bb.jpg"),
            ])
        )

        let artwork = try #require(show.headlinerArtwork(maximumWidth: 132))

        #expect(artwork.url.absoluteString == "https://example.com/wilco/132x132bb.jpg")
    }

    @Test func anotherArtistsArtworkDoesNotStandInForTheMainArtists() async {
        let show = await ShowList_show.from(
            Mock<Show>(artists: [Self.artist("Wilco"), Self.artist("Spoon", artwork: "https://example.com/spoon/{w}x{h}bb.jpg")])
        )

        #expect(show.headlinerArtwork(maximumWidth: 132) == nil)
    }

    @Test func aShowWithoutArtistsHasNoHeadlinerArtwork() async {
        let show = await ShowList_show.from(Mock<Show>(artists: [], title: "Open Mic"))

        #expect(show.headlinerArtwork(maximumWidth: 132) == nil)
    }

    /// Phoebe Bridgers and Muna at Brooklyn Steel.
    private nonisolated static var billed: Mock<Show> {
        Mock<Show>(
            artists: [Mock<Artist>(name: "Phoebe Bridgers", slug: "phoebe-bridgers"), Mock<Artist>(name: "Muna", slug: "muna")],
            venue: Mock<Venue>(city: "Brooklyn", name: "Brooklyn Steel", slug: "brooklyn-steel", state: "NY")
        )
    }

    @Test func anArtistsShowsSayWhereTheyAreInsteadOfTheArtist() async {
        let show = await ShowList_show.from(Self.billed)

        let words = show.rowWords(in: ShowFilter(kind: .history, artist: "phoebe-bridgers"))

        #expect(words == ShowRowWords(title: "Brooklyn Steel", detail: "Brooklyn, NY", hasPicture: false))
    }

    @Test func aVenuesShowsSayWhoPlayedButNotWhere() async {
        let show = await ShowList_show.from(Self.billed)

        let words = show.rowWords(in: ShowFilter(kind: .upcoming, venue: "brooklyn-steel"))

        #expect(words == ShowRowWords(title: "Phoebe Bridgers / Muna", detail: nil, hasPicture: true))
    }

    @Test func everyonesShowsSayWhoPlayedAndWhere() async {
        let show = await ShowList_show.from(Self.billed)

        let words = show.rowWords(in: ShowFilter(kind: .upcoming))

        #expect(words == ShowRowWords(title: "Phoebe Bridgers / Muna", detail: "Brooklyn Steel", hasPicture: true))
    }

    @Test(
        arguments: [
            ("Brooklyn", "NY", "Brooklyn, NY"),
            (nil, "NY", "NY"),
            ("London", nil, "London"),
            (" ", "", nil),
            (nil, nil, nil),
        ] as [(String?, String?, String?)])
    func aPlaceIsItsCityAndState(city: String?, state: String?, name: String?) {
        #expect(Place.name(city: city, state: state) == name)
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

    // 8 PM on New Year's Eve in New York is 1 AM on New Year's Day in UTC, and later still to the east
    @Test func aShowIsOnItsDayInNewYorkWhereverTheDeviceIs() async throws {
        let newYearsEve = await ShowList_show.from(Mock<Show>(date: 1_735_693_200_000, id: "new-years-eve"))

        let day = try #require(ShowDay.days(from: [newYearsEve]).first)

        #expect(Calendar.newYork.component(.year, from: day.date) == 2024)
        #expect(Calendar.newYork.component(.month, from: day.date) == 12)
        #expect(Calendar.newYork.component(.day, from: day.date) == 31)
        #expect(day.date.formatted(Date.FormatStyle.showDay.locale(Self.english)).contains("Dec 31, 2024"))
    }

    @Test func aShowsTimeDisplaysTheVenuesClockWithoutAnEasternZoneLabel() {
        let start = Date(timeIntervalSince1970: 1_735_693_200)
        let displayed = start.formatted(Date.FormatStyle.showTime.locale(Self.english))
        #expect(displayed.contains("December 31, 2024") && displayed.contains("8:00"))
        #expect(!displayed.contains("EST"))
    }

    private static let english = Locale(identifier: "en_US")

    // 8 PM on November 30 in New York is 1 AM on December 1 in UTC
    @Test func showsAreHeadedByTheirMonthInNewYork() async {
        let november = await ShowList_show.from(Mock<Show>(date: 1_796_086_800_000, id: "november"))
        let december = await ShowList_show.from(Mock<Show>(date: 1_796_173_200_000, id: "december"))

        let months = ShowMonth.months(from: [november, december])

        #expect(months.map { $0.shows.map(\.id) } == [["november"], ["december"]])
        #expect(
            months.map { $0.date.formatted(Date.FormatStyle.showMonth.locale(Self.english)) } == ["November 2026", "December 2026"]
        )
    }

    // The history comes most recent first, and two shows on one day by their headlines
    @Test func monthsKeepTheAPIOrderAndTheirDays() async {
        let shows = await [
            (1_796_518_800_000, "the-fifth", "Wilco"),
            (1_796_346_000_000, "the-third-late", "Spoon"),
            (1_796_342_400_000, "the-third-early", "Low"),
            (1_795_222_800_000, "november", "Bedhead"),
        ].asyncMap { date, id, name in
            await ShowList_show.from(Mock<Show>(artists: [Mock<Artist>(name: name)], date: date, id: id))
        }

        let months = ShowMonth.months(from: shows)

        #expect(months.map { Calendar.newYork.component(.month, from: $0.date) } == [12, 11])
        #expect(months.map { $0.shows.map(\.id) } == [["the-fifth", "the-third-early", "the-third-late"], ["november"]])
    }

    @Test func aShowsBadgeHasItsDayInNewYork() {
        // 8 PM on New Year's Eve in New York, and on December 3
        let newYearsEve = Date(timeIntervalSince1970: 1_735_693_200)
        let third = Date(timeIntervalSince1970: 1_796_346_000)

        #expect(newYearsEve.formatted(Date.FormatStyle.showDayNumber.locale(Self.english)) == "31")
        #expect(newYearsEve.formatted(Date.FormatStyle.showWeekday.locale(Self.english)) == "Tue")
        #expect(newYearsEve.formatted(Date.FormatStyle.showSpokenDay.locale(Self.english)) == "Tuesday, December 31")
        // Two digits, as the website's badges have, so the days line up
        #expect(third.formatted(Date.FormatStyle.showDayNumber.locale(Self.english)) == "03")
    }

    @Test func daysKeepTheAPIOrder() async {
        let shows = await [1_793_926_800_000, 1_793_754_000_000, 1_793_833_200_000].asyncMap { date in
            await ShowList_show.from(Mock<Show>(date: date, id: String(date)))
        }

        let days = ShowDay.days(from: shows, calendar: Self.newYork)

        #expect(days.map { Self.newYork.component(.day, from: $0.date) } == [5, 3, 4])
    }
}
