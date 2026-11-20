import SwiftUI

#if os(iOS)
import CarPlay
#endif

@main
struct HighForThisApp: App {
    #if os(iOS)
    @UIApplicationDelegateAdaptor(AppDelegate.self) private var appDelegate
    #endif
    @State private var player: PodcastPlayer

    init() {
        URLCache.shared = URLCache(memoryCapacity: 32 * 1024 * 1024, diskCapacity: 256 * 1024 * 1024)
        _player = State(initialValue: .shared)
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
