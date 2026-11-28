import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct ShowsTests {
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

    @Test func showsOnTheSameLocalDayShareADay() async throws {
        let early = await ShowList_show.from(
            Mock<Show>(artists: [Mock<Artist>(name: "Wilco")], id: "early", schedule: Mock<ShowSchedule>(localDate: "2026-11-04")))
        let late = await ShowList_show.from(
            Mock<Show>(artists: [Mock<Artist>(name: "Beck")], id: "late", schedule: Mock<ShowSchedule>(localDate: "2026-11-04")))

        let days = ShowDay.days(from: [early, late])

        let day = try #require(days.first)
        #expect(days.count == 1)
        #expect(day.date == VenueDay("2026-11-04"))
        #expect(day.shows.map(\.id) == ["late", "early"])
    }

    @Test func aShowKeepsItsVenueDayAtTheYearBoundary() async throws {
        let newYearsEve = await ShowList_show.from(Mock<Show>(id: "new-years-eve", schedule: Mock<ShowSchedule>(localDate: "2024-12-31")))

        let day = try #require(ShowDay.days(from: [newYearsEve]).first)

        #expect(day.date == VenueDay("2024-12-31"))
        #expect(day.date.formatted(Date.FormatStyle.showDay.locale(Self.english)).contains("Dec 31, 2024"))
    }

    @Test func venueDayLabelsUseTheSameCalendarAsTheMonthGroups() {
        var style = Date.FormatStyle.showDay.locale(Self.english)
        style.calendar = Calendar(identifier: .hebrew)
        style.timeZone = TimeZone(identifier: "Pacific/Honolulu")!
        #expect(VenueDay("2024-12-31").formatted(style).contains("Dec 31, 2024"))
    }

    @Test func aShowsTimeDisplaysTheVenuesClockWithoutAnEasternZoneLabel() {
        let displayed = venueScheduleLabel(day: "2026-03-08", time: "02:30", locale: Self.english)
        #expect(displayed?.contains("March 8, 2026") == true && displayed?.contains("2:30") == true)
        #expect(venueScheduleLabel(day: "2026-03-08", time: nil, locale: Self.english) == "Sunday, March 8, 2026")
    }

    private static let english = Locale(identifier: "en_US")

    @Test func showsAreHeadedByTheirVenueMonth() async {
        let november = await ShowList_show.from(Mock<Show>(id: "november", schedule: Mock<ShowSchedule>(localDate: "2026-11-30")))
        let december = await ShowList_show.from(Mock<Show>(id: "december", schedule: Mock<ShowSchedule>(localDate: "2026-12-01")))

        let months = ShowMonth.months(from: [november, december])

        #expect(months.map { $0.shows.map(\.id) } == [["november"], ["december"]])
        #expect(
            months.map { $0.date.formatted(Date.FormatStyle.showMonth.locale(Self.english)) } == ["November 2026", "December 2026"]
        )
    }

    // The history comes most recent first, and two shows on one day by their headlines
    @Test func monthsKeepTheAPIOrderAndTheirDays() async {
        let shows = await [
            ("2026-12-05", "the-fifth", "Wilco"),
            ("2026-12-03", "the-third-late", "Spoon"),
            ("2026-12-03", "the-third-early", "Low"),
            ("2026-11-20", "november", "Bedhead"),
        ].asyncMap { date, id, name in
            await ShowList_show.from(Mock<Show>(artists: [Mock<Artist>(name: name)], id: id, schedule: Mock<ShowSchedule>(localDate: date)))
        }

        let months = ShowMonth.months(from: shows)

        #expect(months.map(\.date.iso) == ["2026-12-01", "2026-11-01"])
        #expect(months.map { $0.shows.map(\.id) } == [["the-fifth", "the-third-early", "the-third-late"], ["november"]])
    }

    @Test func aShowsBadgeHasItsVenueDay() {
        let newYearsEve = VenueDay("2024-12-31")
        let third = VenueDay("2026-12-03")

        #expect(newYearsEve.formatted(Date.FormatStyle.showDayNumber.locale(Self.english)) == "31")
        #expect(newYearsEve.formatted(Date.FormatStyle.showWeekday.locale(Self.english)) == "Tue")
        #expect(newYearsEve.formatted(Date.FormatStyle.showSpokenDay.locale(Self.english)) == "Tuesday, December 31")
        // Two digits, as the website's badges have, so the days line up
        #expect(third.formatted(Date.FormatStyle.showDayNumber.locale(Self.english)) == "03")
    }

    @Test func daysKeepTheAPIOrder() async {
        let shows = await ["2026-11-05", "2026-11-03", "2026-11-04"].asyncMap { date in
            await ShowList_show.from(Mock<Show>(id: date, schedule: Mock<ShowSchedule>(localDate: date)))
        }

        let days = ShowDay.days(from: shows)

        #expect(days.map(\.date.iso) == ["2026-11-05", "2026-11-03", "2026-11-04"])
    }
}
