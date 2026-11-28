import SwiftUI

struct ContentView: View {
    @Environment(PodcastPlayer.self) private var player

    var body: some View {
        BrowseStack {
            List {
                if player.episode != nil {
                    link(.nowPlaying, "waveform", .nowPlaying, id: "now-playing")
                }
                link(.shows, "calendar", .shows(ShowFilter(kind: .upcoming), name: nil), id: "shows")
                link(.podcast, "mic.circle", .podcasts, id: "podcasts")
                link(.showHistory, "clock.arrow.circlepath", .shows(ShowFilter(kind: .history), name: nil), id: "history")
                link(.posts, "note.text", .posts, id: "posts")
                link(.stats, "chart.bar.xaxis", .stats, id: "stats")
            }
            .navigationTitle(.appName)
        }
    }

    private func link(_ title: LocalizedStringResource, _ icon: String, _ route: Route, id: String) -> some View {
        RouteLink(route) { Label(title, systemImage: icon) }
            .accessibilityIdentifier("watch-\(id)")
    }
}
