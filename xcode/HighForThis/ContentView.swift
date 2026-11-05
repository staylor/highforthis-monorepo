import SwiftUI

struct ContentView: View {
    @Environment(PodcastPlayer.self) private var player
    @State private var showingPlayer = false

    var body: some View {
        playbackContainer
            .sheet(isPresented: $showingPlayer) {
                NowPlayingView()
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
            .onChange(of: player.episode?.id) { _, id in
                if id == nil { showingPlayer = false }
            }
    }

    @ViewBuilder private var playbackContainer: some View {
        #if os(iOS) && compiler(>=6.2.3)
        if #available(iOS 26.1, *) {
            tabs.tabViewBottomAccessory(isEnabled: player.episode != nil) {
                PlayerAccessory { showingPlayer = true }
            }
        } else {
            tabs
        }
        #elseif os(macOS)
        tabs.frame(minWidth: 560, minHeight: 440)
        #else
        tabs
        #endif
    }

    private var usesInsetPlayer: Bool {
        #if os(iOS) && compiler(>=6.2.3)
        if #available(iOS 26.1, *) { return false }
        #endif
        return true
    }

    private func stack<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        BrowseStack(showPlayer: usesInsetPlayer ? { showingPlayer = true } : nil, root: content)
    }

    private var tabs: some View {
        TabView {
            Tab(.shows, systemImage: "calendar") {
                stack { ShowList(kind: .upcoming) }
            }
            Tab(.podcast, systemImage: "mic.circle") {
                stack { PodcastList() }
            }
            Tab(.videos, systemImage: "video") {
                stack { VideoList() }
            }
            Tab(.posts, systemImage: "note.text") {
                stack { PostList() }
            }
            Tab(.showHistory, systemImage: "clock.arrow.circlepath") {
                stack { ShowList(kind: .history) }
            }
        }
        .tabViewStyle(.sidebarAdaptable)
    }
}

#Preview {
    ContentView().environment(PodcastPlayer())
}
