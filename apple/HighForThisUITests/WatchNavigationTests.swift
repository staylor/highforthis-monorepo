#if os(watchOS)
import XCTest

nonisolated final class WatchNavigationTests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testShowOpensVenueAndMapsAction() {
        let app = launchApp()
        screenshot("Watch Home", app)
        tap("watch-shows", in: app)
        tap("show-show-2025-0", in: app)
        screenshot("Watch Show", app)
        tap("venue-sample-hall", in: app)
        XCTAssertTrue(element("venue-map", in: app).waitForExistence(timeout: 10))
    }

    @MainActor
    func testEpisodeOffersPlayback() {
        let app = launchApp()
        tap("watch-podcasts", in: app)
        tap("podcast-podcast-0", in: app)
        tap("episode-play-pause", in: app)
        let pause = app.buttons.matching(NSPredicate(format: "identifier == %@ AND label == %@", "episode-play-pause", "Pause")).firstMatch
        XCTAssertTrue(pause.waitForExistence(timeout: 10))
        pause.tap()
        XCTAssertEqual(element("episode-play-pause", in: app).label, "Play")
        app.buttons["BackButton"].tap()
        app.buttons["BackButton"].tap()
        tap("watch-now-playing", in: app)
        tap("stop-playback", in: app)
        XCTAssertTrue(element("watch-shows", in: app).waitForExistence(timeout: 10))
        XCTAssertFalse(element("watch-now-playing", in: app).exists)
    }

    @MainActor
    func testComplicationLinkOpensTheShowAboveTheUpcomingList() {
        let app = launchApp(environment: ["UI_TEST_WIDGET_URL": "highforthis://shows?id=show-2025-0&title=Evening%20Set%201"])
        XCTAssertTrue(element("artist-sample-artist", in: app).waitForExistence(timeout: 10))
        app.buttons["BackButton"].tap()
        XCTAssertTrue(element("show-show-2025-0", in: app).waitForExistence(timeout: 10))
    }

    @MainActor
    func testHistoryCanChangeYear() {
        let app = launchApp()
        tap("watch-history", in: app)
        tap("year-filter", in: app)
        app.buttons["2019"].tap()
        XCTAssertTrue(element("show-show-2019-0", in: app).waitForExistence(timeout: 10))
    }

    @MainActor
    func testPostsOpenTheReader() {
        let app = launchApp()
        tap("watch-posts", in: app)
        tap("post-post-0", in: app)
        XCTAssertTrue(app.staticTexts["A second listen"].waitForExistence(timeout: 10))
    }

    @MainActor
    func testStatsOpenAnArtist() {
        let app = launchApp()
        tap("watch-stats", in: app)
        tap("stats-sample-artist", in: app)
        XCTAssertTrue(app.staticTexts["Sample Artist"].waitForExistence(timeout: 10))
    }

    @MainActor
    private func tap(_ identifier: String, in app: XCUIApplication) {
        let row = element(identifier, in: app)
        for _ in 0..<8 {
            if row.waitForExistence(timeout: 1), row.isHittable { break }
            // A flick can coast several screens on the 40 mm SE, skipping the row between snapshots.
            let start = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.75))
            let end = app.coordinate(withNormalizedOffset: CGVector(dx: 0.5, dy: 0.4))
            start.press(forDuration: 0.1, thenDragTo: end, withVelocity: .slow, thenHoldForDuration: 0.2)
        }
        XCTAssertTrue(row.isHittable, "Couldn't reach \(identifier)\n\(app.debugDescription)")
        row.tap()
    }
}
#endif
