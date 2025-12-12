import SwiftUI

struct ContentView: View {
    var body: some View {
        AppWrapper {
            TabView {
                NavigationView {
                    ShowList(title: "recommendedShows", latest: true)
                }.tabItem {
                    Label("shows", systemImage: "calendar")
                }
                NavigationView {
                    PodcastList()
                }.tabItem {
                    Label("podcast", systemImage: "mic.circle")
                }
                NavigationView {
                    VideoList()
                }.tabItem {
                    Label("videos", systemImage: "video")
                }
                NavigationView {
                    PostList()
                }.tabItem {
                    Label("posts", systemImage: "note.text")
                }
                NavigationView {
                    ShowList(title: "showHistory", attended: true)
                }.tabItem {
                    Label("showHistory", systemImage: "calendar")
                }
            }
            #if os(macOS)
            .padding(.vertical, 18)
            #endif
        }
    }
}

#Preview {
    ContentView()
}
