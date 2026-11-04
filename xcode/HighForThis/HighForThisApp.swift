import AVFoundation
import SwiftUI

@main
struct HighForThisApp: App {
    @State private var player: PodcastPlayer

    init() {
        // AVPlayer only reports changes through Observation if it's switched on before any player exists.
        AVPlayer.isObservationEnabled = true
        // Images load with AsyncImage, which caches in the shared URL cache. The default is too small to keep artwork.
        URLCache.shared = URLCache(memoryCapacity: 32 * 1024 * 1024, diskCapacity: 256 * 1024 * 1024)
        _player = State(initialValue: PodcastPlayer())
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(player)
        }
    }
}
