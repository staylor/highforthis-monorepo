import XCTest

#if os(tvOS)
/// Apple TV flows, driven with the Siri Remote.
final class TVNavigationTests: XCTestCase {
    @MainActor private var remote: XCUIRemote { .shared }

    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testShowArtistAndVenueNavigation() {
        let app = launch()
        select("History", in: app)
        press(.down, untilFocusIsOn: row("show-show-2025-0", in: app))
        remote.press(.select)
        let artist = row("artist-sample-artist", in: app)
        waitForFocus(on: artist)
        // tvOS has no web browser to open where the show is sold.
        XCTAssertFalse(element("event-website", in: app).exists)
        screenshot("Show", app)
        remote.press(.select)
        XCTAssertTrue(app.staticTexts["Recommended Shows"].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["Artist Website"].exists)
        // An artist's shows say where they were, rather than the artist's name again.
        let artistsShow = element("show-show-2025-0", in: app)
        XCTAssertTrue(artistsShow.label.contains("Sample Hall"), artistsShow.label)
        screenshot("Artist", app)
        remote.press(.menu)
        waitForFocus(on: artist)
        press(.down, untilFocusIsOn: row("venue-sample-hall", in: app))
        remote.press(.select)
        XCTAssertTrue(app.staticTexts["123 Music Street"].waitForExistence(timeout: 10))
        // A venue's shows say who played, but not where.
        let venuesShow = element("show-show-2025-0", in: app)
        XCTAssertTrue(venuesShow.waitForExistence(timeout: 10))
        XCTAssertFalse(venuesShow.label.contains("Sample Hall"), venuesShow.label)
        screenshot("Venue", app)
    }

    @MainActor
    func testStatsLinkToTheirArtistsAndVenues() {
        let app = launch()
        select("Stats", in: app)
        // The choice of artists or venues comes first, then the leaderboard.
        let venues = app.buttons["Venues"]
        let leader = app.buttons["stats-sample-artist"]
        press(.down, untilFocusIsOn: leader, times: 4)
        screenshot("Stats", app)
        remote.press(.select)
        XCTAssertTrue(app.staticTexts["Recommended Shows"].waitForExistence(timeout: 10))
        remote.press(.menu)
        waitForFocus(on: leader)
        // Focus comes up to the chosen segment, Artists, and moves across to Venues.
        press(.up, untilFocusIsOn: app.buttons["Artists"], times: 4)
        press(.right, untilFocusIsOn: venues)
        remote.press(.select)
        let venue = app.buttons["stats-sample-hall"]
        press(.down, untilFocusIsOn: venue, times: 4)
        remote.press(.select)
        XCTAssertTrue(app.staticTexts["123 Music Street"].waitForExistence(timeout: 10))
    }

    @MainActor
    func testEmptyYearKeepsTheFilterAndCanReturnToTheMostRecentYear() {
        let app = launch(scenario: "emptyYear")
        select("History", in: app)
        press(.down, untilFocusIsOn: row("show-show-2025-0", in: app))
        let filter = app.buttons["year-filter"]
        press(.up, untilFocusIsOn: filter)
        remote.press(.select)
        press(.down, untilFocusIsOn: menuItem("2019", in: app), times: 4)
        // The history goes a year at a time, so it never loads every show at once.
        XCTAssertFalse(menuItem("All Years", in: app).exists)
        remote.press(.select)
        XCTAssertTrue(app.staticTexts["No shows."].waitForExistence(timeout: 10))
        waitForFocus(on: filter)
        screenshot("Empty Year", app)
        remote.press(.select)
        press(.up, untilFocusIsOn: menuItem("2025", in: app), times: 4)
        remote.press(.select)
        XCTAssertTrue(element("show-show-2025-0", in: app).waitForExistence(timeout: 10))
    }

    @MainActor
    func testHistoryCanLoadEveryPage() {
        let app = launch()
        select("History", in: app)
        let loadMore = row("load-more", in: app)
        press(.down, untilFocusIsOn: loadMore, times: 6)
        screenshot("History", app)
        remote.press(.select)
        XCTAssertTrue(element("show-show-2025-3", in: app).waitForExistence(timeout: 10))
        waitForFocus(on: loadMore)
        remote.press(.select)
        XCTAssertTrue(element("show-show-2025-4", in: app).waitForExistence(timeout: 10))
        XCTAssertTrue(loadMore.waitForNonExistence(timeout: 10))
    }

    @MainActor
    func testPlaybackAddsNowPlayingAndTheRemoteControlsIt() {
        let app = launch()
        XCTAssertFalse(app.buttons["Now Playing"].exists)
        select("Podcast", in: app)
        press(.down, untilFocusIsOn: row("podcast-podcast-0", in: app))
        remote.press(.select)
        let playPause = app.buttons["episode-play-pause"]
        waitForFocus(on: playPause)
        remote.press(.select)
        waitForLabel("Pause", of: playPause)
        XCTAssertTrue(app.buttons["Now Playing"].waitForExistence(timeout: 10))
        screenshot("Episode", app)

        remote.press(.playPause)
        waitForLabel("Play", of: playPause)
        remote.press(.playPause)
        waitForLabel("Pause", of: playPause)

        remote.press(.menu)
        press(.up, untilFocusIsOn: app.buttons["Podcast"])
        select("Now Playing", in: app)
        let stop = app.buttons["stop-playback"]
        XCTAssertTrue(stop.waitForExistence(timeout: 10))
        screenshot("Now Playing", app)
        press(.down, untilFocusIsOn: stop, times: 4)
        remote.press(.select)
        XCTAssertTrue(app.buttons["Now Playing"].waitForNonExistence(timeout: 10))
        XCTAssertTrue(element("podcast-podcast-0", in: app).waitForExistence(timeout: 10))
    }

    @MainActor
    func testEpisodeWithoutAudioHasNoPlayButton() {
        let app = launch()
        select("Podcast", in: app)
        press(.down, untilFocusIsOn: row("podcast-podcast-1", in: app), times: 4)
        remote.press(.select)
        XCTAssertTrue(app.staticTexts["Audio is unavailable for this episode."].waitForExistence(timeout: 10))
        XCTAssertFalse(app.buttons["episode-play-pause"].exists)
    }

    @MainActor
    func testPostScrollsThroughEveryBlock() {
        let app = launch()
        select("Posts", in: app)
        press(.down, untilFocusIsOn: row("post-post-0", in: app))
        remote.press(.select)
        waitForFocus(on: element("post-block-0", in: app))
        screenshot("Post", app)
        press(.down, untilFocusIsOn: element("post-block-4", in: app), times: 8)
        XCTAssertTrue(app.staticTexts["side A\nside B"].exists)
        screenshot("Post Scrolled", app)
    }

    @MainActor
    private func launch(scenario: String = "normal") -> XCUIApplication {
        let app = launchApp(scenario: scenario)
        XCTAssertTrue(app.buttons["Shows"].waitForExistence(timeout: 20))
        return app
    }

    /// Focus starts in the tab bar, and moving it across the tabs selects them.
    @MainActor
    private func select(_ tab: String, in app: XCUIApplication) {
        let tabs = ["Shows", "Podcast", "Posts", "History", "Stats", "Now Playing"].filter { app.buttons[$0].exists }
        let target = app.buttons[tab]
        guard let index = tabs.firstIndex(of: tab) else { return XCTFail("No \(tab) tab") }
        for _ in tabs.indices where !target.hasFocus {
            let current = tabs.firstIndex { app.buttons[$0].hasFocus } ?? 0
            remote.press(index > current ? .right : .left)
            _ = focusArrives(on: target, within: 2)
        }
        XCTAssertTrue(target.hasFocus, "\(tab) didn't get focus")
    }

    /// In a list, the cell takes focus rather than the link or button in it.
    @MainActor
    private func row(_ identifier: String, in app: XCUIApplication) -> XCUIElement {
        app.cells.containing(.any, identifier: identifier).firstMatch
    }

    @MainActor
    private func menuItem(_ title: String, in app: XCUIApplication) -> XCUIElement {
        app.cells.containing(NSPredicate(format: "label == %@", title)).firstMatch
    }

    /// A menu takes focus in a container in front of its button, with the same frame.
    @MainActor
    private func hasFocus(_ element: XCUIElement) -> Bool {
        guard element.exists else { return false }
        if element.hasFocus { return true }
        let focused = XCUIApplication().descendants(matching: .any).matching(NSPredicate(format: "hasFocus == true")).firstMatch
        return focused.exists && focused.frame == element.frame
    }

    @MainActor
    private func waitForFocus(on element: XCUIElement, timeout: TimeInterval = 10, file: StaticString = #filePath, line: UInt = #line) {
        XCTAssertTrue(focusArrives(on: element, within: timeout), "\(element) didn't get focus", file: file, line: line)
    }

    @MainActor
    private func focusArrives(on element: XCUIElement, within timeout: TimeInterval) -> Bool {
        let deadline = Date.now.addingTimeInterval(timeout)
        while !hasFocus(element) {
            guard Date.now < deadline else { return false }
            RunLoop.current.run(until: .now.addingTimeInterval(0.2))
        }
        return true
    }

    /// A press can be lost while an animation is still running, so press until the focus moves.
    @MainActor
    private func press(
        _ button: XCUIRemote.Button,
        untilFocusIsOn element: XCUIElement,
        times: Int = 3,
        file: StaticString = #filePath,
        line: UInt = #line
    ) {
        XCTAssertTrue(element.waitForExistence(timeout: 10), "\(element) doesn't exist", file: file, line: line)
        for _ in 0..<times where !hasFocus(element) {
            remote.press(button)
            _ = focusArrives(on: element, within: 2)
        }
        XCTAssertTrue(hasFocus(element), "\(element) didn't get focus", file: file, line: line)
    }

    @MainActor
    private func waitForLabel(_ label: String, of element: XCUIElement, file: StaticString = #filePath, line: UInt = #line) {
        let matches = XCTNSPredicateExpectation(predicate: NSPredicate(format: "label == %@", label), object: element)
        XCTAssertEqual(XCTWaiter.wait(for: [matches], timeout: 10), .completed, "\(element) isn't \(label)", file: file, line: line)
    }
}
#endif
