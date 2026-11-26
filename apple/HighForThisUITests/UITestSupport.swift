import XCTest

extension XCTestCase {
    /// Launches the app on the fixture transport, in English and New York's time zone, answering with `scenario`.
    @MainActor
    func launchApp(scenario: String = "normal", arguments: [String] = [], environment: [String: String] = [:]) -> XCUIApplication {
        let app = XCUIApplication()
        app.launchArguments = ["-ui-testing", "-AppleLanguages", "(en)", "-AppleLocale", "en_US"] + arguments
        app.launchEnvironment = environment.merging(["UI_TEST_SCENARIO": scenario, "TZ": "America/New_York"]) { $1 }
        app.launch()
        return app
    }

    @MainActor
    func element(_ identifier: String, in app: XCUIApplication) -> XCUIElement {
        app.descendants(matching: .any).matching(identifier: identifier).firstMatch
    }

    @MainActor
    func screenshot(_ name: String, _ app: XCUIApplication) {
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = name
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}
