import SwiftUI

struct ContentView: View {
    @Environment(PodcastPlayer.self) private var player
    @State private var selection = AppTab.shows
    @State private var showingPlayer = false

    var body: some View {
        #if os(tvOS)
        tabs()
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

    /// The tabs, with the player in the tab bar's accessory where there's one for it, and otherwise at the bottom of
    /// each screen.
    @ViewBuilder private var playbackContainer: some View {
        #if os(iOS) && compiler(>=6.2.3)
        if #available(iOS 26.1, *) {
            tabs().tabViewBottomAccessory(isEnabled: player.episode != nil) {
                PlayerAccessory(openPlayer: openPlayer)
            }
        } else {
            tabs(showPlayer: openPlayer)
        }
        #elseif os(macOS)
        tabs(showPlayer: openPlayer)
            .frame(minWidth: 560, minHeight: 440)
        #else
        tabs(showPlayer: openPlayer)
        #endif
    }

    private var openPlayer: () -> Void {
        { showingPlayer = true }
    }

    /// The tabs, each with its own stack. `showPlayer` puts the player at the bottom of each screen, and opens Now
    /// Playing from it.
    private func tabs(showPlayer: (() -> Void)? = nil) -> some View {
        TabView(selection: $selection) {
            Tab(.shows, systemImage: "calendar", value: .shows) {
                BrowseStack(showPlayer: showPlayer) { ShowList(kind: .upcoming) }
            }
            Tab(.podcast, systemImage: "mic.circle", value: .podcast) {
                BrowseStack(showPlayer: showPlayer) { PodcastList() }
            }
            #if !os(tvOS)
            // tvOS can't open YouTube.
            Tab(.videos, systemImage: "video", value: .videos) {
                BrowseStack(showPlayer: showPlayer) { VideoList() }
            }
            #endif
            Tab(.posts, systemImage: "note.text", value: .posts) {
                BrowseStack(showPlayer: showPlayer) { PostList() }
            }
            Tab(.showHistory, systemImage: "clock.arrow.circlepath", value: .history) {
                BrowseStack(showPlayer: showPlayer) { ShowList(kind: .history) }
            }
            if ShowStats.hasItsOwnTab {
                Tab(.stats, systemImage: "chart.bar.xaxis", value: .stats) {
                    BrowseStack(showPlayer: showPlayer) { ShowStats() }
                }
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
    case nowPlaying, shows, podcast, videos, posts, history, stats
}

#Preview {
    ContentView().environment(PodcastPlayer())
}
