import SwiftUI

@main
struct HighForThisApp: App {
    @State private var player: PodcastPlayer

    init() {
        URLCache.shared = URLCache(memoryCapacity: 32 * 1024 * 1024, diskCapacity: 256 * 1024 * 1024)
        _player = State(initialValue: PodcastPlayer())
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(player)
                #if DEBUG
            .preferredColorScheme(UITestFixtures.isEnabled && ProcessInfo.processInfo.environment["UI_TEST_DARK"] == "1" ? .dark : nil)
                #endif
        }
        #if os(macOS)
        .defaultSize(width: 900, height: 720)
        #endif
    }
}
