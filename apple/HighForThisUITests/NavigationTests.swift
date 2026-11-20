import XCTest

#if os(iOS)
final class NavigationTests: XCTestCase {
    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testShowArtistAndVenueNavigation() {
        let app = launch()
        select("History", in: app)
        tap(element("show-show-2025-0", in: app))
        tap(element("artist-sample-artist", in: app))
        XCTAssertTrue(app.staticTexts["Recommended Shows"].waitForExistence(timeout: 10))
        screenshot("Artist", app)
        back(app)
        tap(element("venue-sample-hall", in: app))
        XCTAssertTrue(app.buttons["venue-map"].waitForExistence(timeout: 10))
        screenshot("Venue", app)
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
    func testEmptyYearKeepsTheFilterAndCanReturnToAllYears() {
        let app = launch(scenario: "emptyYearMetadata")
        select("History", in: app)
        tap(app.buttons["year-filter"])
        tap(app.buttons["2027"])
        XCTAssertTrue(app.staticTexts["No shows."].waitForExistence(timeout: 10))
        XCTAssertTrue(app.buttons["year-filter"].exists)
        tap(app.buttons["year-filter"])
        tap(app.buttons["All Years"])
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
        app.swipeUp()
        tap(app.buttons["episode-play-pause"])
        XCTAssertTrue(app.buttons["open-player"].waitForExistence(timeout: 10))
        app.swipeUp()
        screenshot("Large Text Episode", app)
    }

    @MainActor
    private func launch(scenario: String = "normal", largeText: Bool = false, dark: Bool = false) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-AppleLanguages", "(en)", "-AppleLocale", "en_US"]
        if largeText { app.launchArguments += ["-UIPreferredContentSizeCategoryName", "UICTContentSizeCategoryAccessibilityXL"] }
        app.launchEnvironment["UI_TEST_DARK"] = dark ? "1" : "0"
        app.launchEnvironment["UI_TEST_SCENARIO"] = scenario
        app.launchEnvironment["TZ"] = "America/New_York"
        app.launch()
        return app
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

    @MainActor
    private func element(_ identifier: String, in app: XCUIApplication) -> XCUIElement {
        app.descendants(matching: .any).matching(identifier: identifier).firstMatch
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

    @MainActor
    private func screenshot(_ name: String, _ app: XCUIApplication) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
#endif
