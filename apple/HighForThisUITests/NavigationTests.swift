import XCTest

#if os(iOS)
import UIKit

final class NavigationTests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testShowArtistAndVenueNavigation() {
        let app = launch()
        select("History", in: app)
        // The shows are headed by their month in New York.
        XCTAssertTrue(app.staticTexts["November 2025"].waitForExistence(timeout: 10))
        tap(element("show-show-2025-0", in: app))
        // A show's page links to where it's sold.
        XCTAssertTrue(element("event-website", in: app).waitForExistence(timeout: 10))
        screenshot("Show", app)
        tap(element("artist-sample-artist", in: app))
        XCTAssertTrue(app.staticTexts["Recommended Shows"].waitForExistence(timeout: 10))
        // The show this came from is among the artist's shows, and isn't drawn as the selected one, which on iPad
        // was a pink row with its words in the same pink.
        let cameFrom = app.cells.containing(.any, identifier: "show-show-2025-0").firstMatch
        XCTAssertTrue(cameFrom.waitForExistence(timeout: 10))
        XCTAssertFalse(cameFrom.isSelected)
        // An artist's shows say where they were, rather than the artist's name again.
        let artistsShow = element("show-show-2025-0", in: app)
        XCTAssertTrue(artistsShow.label.contains("Sample Hall"), artistsShow.label)
        XCTAssertFalse(artistsShow.label.contains("Evening Set"), artistsShow.label)
        screenshot("Artist", app)
        back(app)
        tap(element("venue-sample-hall", in: app))
        XCTAssertTrue(app.buttons["venue-map"].waitForExistence(timeout: 10))
        // A venue's shows say who played, but not where.
        let venuesShow = element("show-show-2025-0", in: app)
        scroll(to: venuesShow, in: app)
        XCTAssertTrue(venuesShow.label.contains("Evening Set"), venuesShow.label)
        XCTAssertFalse(venuesShow.label.contains("Sample Hall"), venuesShow.label)
        screenshot("Venue", app)
    }

    @MainActor
    func testAnArtistsHistorySaysWhoseItIs() {
        let app = launch()
        select("History", in: app)
        tap(element("show-show-2025-0", in: app))
        tap(element("artist-sample-artist", in: app))
        let viewAll = element("view-all-history", in: app)
        scroll(to: viewAll, in: app)
        tap(viewAll)
        // The History tab's title is the same, so the list opens with whose shows these are, under which shows they are.
        XCTAssertTrue(app.staticTexts["Sample Artist"].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label ==[c] %@", "Show History")).firstMatch.exists)
        XCTAssertTrue(element("show-show-2025-0", in: app).waitForExistence(timeout: 10))
        screenshot("Artist History", app)
    }

    @MainActor
    func testStatsRankTheArtistsAndVenuesAndLinkToThem() {
        let app = launch()
        openStats(in: app)
        XCTAssertTrue(app.staticTexts["Most Seen"].waitForExistence(timeout: 10))
        // Past the leaderboard, everyone else is billed by how many shows they had.
        XCTAssertTrue(element("stats-artist-24", in: app).exists)
        screenshot("Stats", app)
        tap(element("stats-sample-artist", in: app))
        XCTAssertTrue(app.staticTexts["Recommended Shows"].waitForExistence(timeout: 10))
        back(app)
        tap(app.buttons["Venues"])
        XCTAssertTrue(app.staticTexts["Most Visited"].waitForExistence(timeout: 10))
        tap(element("stats-sample-hall", in: app))
        XCTAssertTrue(app.buttons["venue-map"].waitForExistence(timeout: 10))
    }

    @MainActor
    func testHistoryCanLoadEveryPage() {
        let app = launch()
        select("History", in: app)
        tap(app.buttons["load-more"])
        tap(app.buttons["load-more"])
        XCTAssertTrue(element("show-show-2025-4", in: app).waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["load-more"].exists)
    }

    @MainActor
    func testEmptyYearKeepsTheFilterAndCanReturnToTheMostRecentYear() {
        let app = launch(scenario: "emptyYear")
        select("History", in: app)
        XCTAssertTrue(element("show-show-2025-0", in: app).waitForExistence(timeout: 10))
        tap(app.buttons["year-filter"])
        // The history goes a year at a time, so it never loads every show at once.
        XCTAssertFalse(app.buttons["All Years"].exists)
        tap(app.buttons["2019"])
        XCTAssertTrue(app.staticTexts["No shows."].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["year-filter"].exists)
        tap(app.buttons["year-filter"])
        tap(app.buttons["2025"])
        XCTAssertTrue(element("show-show-2025-0", in: app).waitForExistence(timeout: 10))
    }

    @MainActor
    func testNetworkFailureCanRetry() {
        let app = launch(scenario: "failOnce")
        tap(app.buttons["retry-load"])
        XCTAssertTrue(element("show-show-2025-0", in: app).waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["retry-load"].exists)
    }

    @MainActor
    func testPlayerStaysAvailableAcrossTabsAndCanBeStopped() {
        let app = launch()
        select("Podcast", in: app)
        tap(element("podcast-podcast-0", in: app))
        tap(app.buttons["episode-play-pause"])
        XCTAssertTrue(app.buttons["player-play-pause"].waitForExistence(timeout: 10))
        select("Videos", in: app)
        let pause = app.buttons["player-play-pause"]
        let tabBar = app.tabBars.firstMatch
        if tabBar.exists, tabBar.frame.minY > app.frame.height / 2 {
            XCTAssertLessThanOrEqual(pause.frame.maxY, tabBar.frame.minY)
        }
        XCTAssertEqual(pause.label, "Pause")
        pause.tap()
        XCTAssertEqual(pause.label, "Play")
        tap(app.buttons["open-player"])
        XCTAssertTrue(app.navigationBars["Now Playing"].waitForExistence(timeout: 10))
        screenshot("Now Playing", app)
        tap(app.buttons["stop-playback"])
        XCTAssertTrue(pause.waitForNonExistence(timeout: 10))
        XCTAssertTrue(element("video-video-0", in: app).exists)
    }

    @MainActor
    func testEpisodeWithoutAudioHasNoPlayButton() {
        let app = launch()
        select("Podcast", in: app)
        tap(element("podcast-podcast-1", in: app))
        XCTAssertTrue(app.staticTexts["Audio is unavailable for this episode."].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["episode-play-pause"].exists)
    }

    @MainActor
    func testPlaybackFailureIsVisible() {
        let app = launch(scenario: "brokenAudio")
        select("Podcast", in: app)
        tap(element("podcast-podcast-0", in: app))
        tap(app.buttons["episode-play-pause"])
        XCTAssertTrue(element("playback-error", in: app).waitForExistence(timeout: 15))
        XCTAssertEqual(app.buttons["episode-play-pause"].label, "Play")
        screenshot("Playback Failure", app)
    }

    @MainActor
    func testPostRendersHeadingParagraphQuoteAndCode() {
        let app = launch()
        select("Posts", in: app)
        tap(element("post-post-0", in: app))
        XCTAssertTrue(app.staticTexts["A second listen"].waitForExistence(timeout: 10))
        app.swipeUp()
        XCTAssertTrue(app.staticTexts["Music brings people together."].waitForExistence(timeout: 10))
        XCTAssertTrue(app.staticTexts["side A\nside B"].exists)
        screenshot("Post", app)
    }

    @MainActor
    func testAccessibilityTextAndDarkAppearanceKeepNavigationUsable() {
        let app = launch(largeText: true, dark: true)
        select("Videos", in: app)
        XCTAssertTrue(element("video-video-0", in: app).waitForExistence(timeout: 10))
        screenshot("Large Text Videos", app)
        select("Podcast", in: app)
        tap(element("podcast-podcast-0", in: app))
        // Play is over the episode's notes, so it's on screen without scrolling, at this text size too.
        let play = app.buttons["episode-play-pause"]
        XCTAssertTrue(play.waitForExistence(timeout: 10))
        XCTAssertTrue(play.isHittable)
        play.tap()
        XCTAssertTrue(app.buttons["open-player"].waitForExistence(timeout: 10))
        app.swipeUp()
        screenshot("Large Text Episode", app)
    }

    @MainActor
    func testStatsStayUsableAtAccessibilityTextSizes() {
        let app = launch(largeText: true, dark: true)
        openStats(in: app)
        let leader = element("stats-sample-artist", in: app)
        XCTAssertTrue(leader.waitForExistence(timeout: 10))
        screenshot("Large Text Stats", app)
        app.swipeUp()
        screenshot("Large Text Stats Scrolled", app)
        tap(leader)
        XCTAssertTrue(app.staticTexts["Recommended Shows"].waitForExistence(timeout: 10))
        screenshot("Large Text Artist", app)
    }

    @MainActor
    private func launch(scenario: String = "normal", largeText: Bool = false, dark: Bool = false) -> XCUIApplication {
        launchApp(
            scenario: scenario,
            arguments: largeText ? ["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityXL"] : [],
            environment: ["UI_TEST_DARK": dark ? "1" : "0"]
        )
    }

    @MainActor
    private func select(_ tab: String, in app: XCUIApplication) {
        let tabButton = app.tabBars.buttons[tab].firstMatch
        if tabButton.waitForExistence(timeout: 3) {
            tabButton.tap()
        } else {
            tap(app.buttons[tab].firstMatch)
        }
    }

    /// iPad has a Stats tab, and an iPhone's History links to the stats instead.
    @MainActor
    private func openStats(in app: XCUIApplication) {
        if UIDevice.current.userInterfaceIdiom == .phone {
            select("History", in: app)
            tap(app.buttons["show-stats"])
        } else {
            // Where the tab bar can't fit every tab, as on an 11-inch iPad held upright, it pages them.
            let nextPage = app.buttons["Next Page"]
            if !app.buttons["Stats"].waitForExistence(timeout: 3), nextPage.exists {
                nextPage.tap()
            }
            select("Stats", in: app)
        }
        XCTAssertTrue(element("stats-subject", in: app).waitForExistence(timeout: 10))
    }

    /// A list makes its rows as they come into view, so swipe until the element's is there.
    @MainActor
    private func scroll(to element: XCUIElement, in app: XCUIApplication) {
        for _ in 0..<6 where !element.exists {
            app.swipeUp()
        }
    }

    @MainActor
    private func tap(_ element: XCUIElement) {
        XCTAssertTrue(element.waitForExistence(timeout: 10))
        element.tap()
    }

    // iPhone Duo puts the Back button in its vertical bar, outside the navigation bar.
    @MainActor
    private func back(_ app: XCUIApplication) {
        tap(app.buttons["BackButton"].firstMatch)
    }
}
#endif
