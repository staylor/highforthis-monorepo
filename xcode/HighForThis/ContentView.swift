import SwiftUI

struct ContentView: View {
    @Environment(PodcastPlayer.self) private var player
    @State private var selection = AppTab.shows
    @State private var showingPlayer = false

    var body: some View {
        #if os(tvOS)
        tabs
            .onPlayPauseCommand { player.togglePlayback() }
            .onChange(of: player.episode == nil) { _, stopped in
                if stopped, selection == .nowPlaying { selection = .podcast }
            }
        #else
        playbackContainer
            .sheet(isPresented: $showingPlayer) {
                NowPlayingView()
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
            .onChange(of: player.episode?.id) { _, id in
                if id == nil { showingPlayer = false }
            }
        #endif
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
        #if os(tvOS)
        return false
        #elseif os(iOS) && compiler(>=6.2.3)
        if #available(iOS 26.1, *) { return false }
        return true
        #else
        return true
        #endif
    }

    private func stack<Content: View>(@ViewBuilder content: () -> Content) -> some View {
        BrowseStack(showPlayer: usesInsetPlayer ? { showingPlayer = true } : nil, root: content)
    }

    private var tabs: some View {
        TabView(selection: $selection) {
            Tab(.shows, systemImage: "calendar", value: .shows) {
                stack { ShowList(kind: .upcoming) }
            }
            Tab(.podcast, systemImage: "mic.circle", value: .podcast) {
                stack { PodcastList() }
            }
            #if !os(tvOS)
            // tvOS can't open YouTube.
            Tab(.videos, systemImage: "video", value: .videos) {
                stack { VideoList() }
            }
            #endif
            Tab(.posts, systemImage: "note.text", value: .posts) {
                stack { PostList() }
            }
            Tab(.showHistory, systemImage: "clock.arrow.circlepath", value: .history) {
                stack { ShowList(kind: .history) }
            }
            #if os(tvOS)
            // While an episode is loaded, the player is a tab of its own. It comes last, because adding a tab
            // before the others resets their navigation.
            if player.episode != nil {
                Tab(.nowPlaying, systemImage: "waveform", value: .nowPlaying) {
                    NowPlayingView()
                }
            }
            #endif
        }
        #if !os(tvOS)
        .tabViewStyle(.sidebarAdaptable)
        #endif
    }
}

private enum AppTab: Hashable {
    case nowPlaying, shows, podcast, videos, posts, history
}

#Preview {
    ContentView().environment(PodcastPlayer())
}
