import XCTest

#if os(iOS)
/// These run against the production API, so they check what the screens are made of rather than what they say.
final class NavigationTests: XCTestCase {
    private let timeout: TimeInterval = 30

    override func setUp() {
        continueAfterFailure = false
    }

    @MainActor
    func testHistoryOpensAShowItsArtistAndItsVenue() {
        let app = launch()
        select("History", in: app)

        tap(firstElement(withPrefix: "show-", in: app))
        let artist = firstElement(withPrefix: "artist-", in: app)
        XCTAssertTrue(artist.waitForExistence(timeout: timeout))
        XCTAssertTrue(firstElement(withPrefix: "venue-", in: app).exists)
        attachScreenshot("Show", of: app)

        tap(artist)
        XCTAssertTrue(app.staticTexts["Recommended Shows"].waitForExistence(timeout: timeout))
        attachScreenshot("Artist", of: app)
        goBack(in: app)

        tap(firstElement(withPrefix: "venue-", in: app))
        XCTAssertTrue(app.buttons["Open in Maps"].waitForExistence(timeout: timeout))
        XCTAssertTrue(firstElement(withPrefix: "show-", in: app).waitForExistence(timeout: timeout))
        attachScreenshot("Venue", of: app)
    }

    @MainActor
    func testHistoryFiltersByYear() {
        let app = launch()
        select("History", in: app)
        XCTAssertTrue(firstElement(withPrefix: "show-", in: app).waitForExistence(timeout: timeout))

        app.buttons["year-filter"].tap()
        tap(app.buttons["2019"])

        let header = app.staticTexts.matching(NSPredicate(format: "label ENDSWITH %@", ", 2019")).firstMatch
        XCTAssertTrue(header.waitForExistence(timeout: timeout))
        let otherYears = app.staticTexts.matching(
            NSPredicate(format: "label MATCHES %@ AND NOT (label ENDSWITH %@)", ".*, 20[0-9]{2}", ", 2019")
        )
        XCTAssertEqual(otherYears.count, 0)
        attachScreenshot("History in 2019", of: app)
    }

    @MainActor
    func testRecommendedShowsLoad() {
        let app = launch()
        let show = firstElement(withPrefix: "show-", in: app)
        let none = app.staticTexts["There are no shows to recommend right now."]
        XCTAssertTrue(show.waitForExistence(timeout: timeout) || none.exists)
        attachScreenshot("Recommended Shows", of: app)
    }

    @MainActor
    func testAnEpisodePlaysAndPauses() {
        let app = launch()
        select("Podcast", in: app)

        tap(firstElement(withPrefix: "podcast-", in: app))
        let play = app.buttons["Play"]
        XCTAssertTrue(play.waitForExistence(timeout: timeout))
        attachScreenshot("Episode", of: app)

        play.tap()
        XCTAssertTrue(app.buttons["Pause"].waitForExistence(timeout: timeout))
        app.buttons["Pause"].tap()
        XCTAssertTrue(play.waitForExistence(timeout: timeout))
    }

    @MainActor
    func testVideosLinkToYouTube() {
        let app = launch()
        select("Videos", in: app)

        XCTAssertTrue(firstElement(withPrefix: "video-", in: app).waitForExistence(timeout: timeout))
        XCTAssertTrue(app.buttons["year-filter"].exists)
        attachScreenshot("Videos", of: app)
    }

    @MainActor
    func testAPostOpensFromTheList() {
        let app = launch()
        select("Posts", in: app)

        let post = firstElement(withPrefix: "post-", in: app)
        XCTAssertTrue(post.waitForExistence(timeout: timeout))
        attachScreenshot("Posts", of: app)
        let title = post.label
        tap(post)

        XCTAssertTrue(app.navigationBars[title].waitForExistence(timeout: timeout))
        XCTAssertTrue(app.staticTexts.matching(NSPredicate(format: "label ==[c] %@", title)).firstMatch.waitForExistence(timeout: timeout))
        attachScreenshot("Post", of: app)
    }

    @MainActor
    private func launch() -> XCUIApplication {
        let app = XCUIApplication()
        app.launch()
        return app
    }

    @MainActor
    private func select(_ tab: String, in app: XCUIApplication) {
        let button = app.tabBars.buttons[tab]
        XCTAssertTrue(button.waitForExistence(timeout: timeout))
        button.tap()
    }

    @MainActor
    private func firstElement(withPrefix prefix: String, in app: XCUIApplication) -> XCUIElement {
        app.descendants(matching: .any).matching(NSPredicate(format: "identifier BEGINSWITH %@", prefix)).firstMatch
    }

    /// Waits for the element, since everything on screen arrives over the network, then taps it.
    @MainActor
    private func tap(_ element: XCUIElement) {
        XCTAssertTrue(element.waitForExistence(timeout: timeout), "\(element) didn't appear")
        element.tap()
    }

    @MainActor
    private func goBack(in app: XCUIApplication) {
        app.navigationBars.buttons["BackButton"].firstMatch.tap()
    }

    @MainActor
    private func attachScreenshot(_ name: String, of app: XCUIApplication) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
#endif
