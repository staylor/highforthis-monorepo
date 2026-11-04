import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            Tab(.shows, systemImage: "calendar") {
                BrowseStack {
                    ShowList(kind: .upcoming)
                }
            }
            Tab(.podcast, systemImage: "mic.circle") {
                BrowseStack {
                    PodcastList()
                }
            }
            Tab(.videos, systemImage: "video") {
                BrowseStack {
                    VideoList()
                }
            }
            Tab(.posts, systemImage: "note.text") {
                BrowseStack {
                    PostList()
                }
            }
            Tab(.showHistory, systemImage: "clock.arrow.circlepath") {
                BrowseStack {
                    ShowList(kind: .history)
                }
            }
        }
        .tabViewStyle(.sidebarAdaptable)
    }
}

#Preview {
    ContentView()
        .environment(PodcastPlayer())
}
