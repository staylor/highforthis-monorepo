import SwiftUI

#if os(iOS)
import CarPlay
#endif

@main
struct HighForThisApp: App {
    #if os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    #endif
    @Environment(\.scenePhase) private var scenePhase
    @State private var freshness = Freshness()

    init() {
        URLCache.shared = URLCache(memoryCapacity: 32 * 1024 * 1024, diskCapacity: 256 * 1024 * 1024)
        #if DEBUG && os(iOS)
        // A UI test waits for each animation to end before it looks at the screen again, so under one nothing animates.
        // On tvOS a pushed screen didn't take focus without its animation, so there it still animates.
        if UITestFixtures.isEnabled {
            UIView.setAnimationsEnabled(false)
        }
        #endif
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(PodcastPlayer.shared)
                .environment(freshness)
                #if DEBUG
            .preferredColorScheme(UITestFixtures.isEnabled && ProcessInfo.processInfo.environment["UI_TEST_DARK"] == "1" ? .dark : nil)
                #endif
        }
        .onChange(of: scenePhase) { _, phase in
            Task { await freshness.appIsActive(phase == .active) }
        }
        #if os(macOS)
        .defaultSize(width: 900, height: 720)
        #endif
    }
}

#if os(iOS)
final class AppDelegate: NSObject, UIApplicationDelegate {
    func application(
        _ application: UIApplication,
        configurationForConnecting connectingSceneSession: UISceneSession,
        options: UIScene.ConnectionOptions
    ) -> UISceneConfiguration {
        guard connectingSceneSession.role == .carTemplateApplication else {
            return UISceneConfiguration(name: "Default Configuration", sessionRole: connectingSceneSession.role)
        }
        let configuration = UISceneConfiguration(name: "CarPlay Configuration", sessionRole: connectingSceneSession.role)
        configuration.delegateClass = CarPlaySceneDelegate.self
        return configuration
    }
}
#endif
