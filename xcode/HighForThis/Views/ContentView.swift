import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            NavigationStack {
                ShowList(title: "recommendedShows", latest: true)
            }.tabItem {
                Label("shows", systemImage: "calendar")
            }
            NavigationStack {
                PodcastList()
            }.tabItem {
                Label("podcast", systemImage: "mic.circle")
            }
            NavigationStack {
                VideoList()
            }.tabItem {
                Label("videos", systemImage: "video")
            }
            NavigationStack {
                PostList()
            }.tabItem {
                Label("posts", systemImage: "note.text")
            }
            NavigationStack {
                ShowList(title: "showHistory", attended: true)
            }.tabItem {
                Label("showHistory", systemImage: "calendar")
            }
        }
        #if os(iOS)
        .tabViewStyle(.tabBarOnly)
        #elseif os(macOS)
        .padding(.vertical, 18)
        .frame(minWidth: 640, minHeight: 640)
        #endif
    }
}

#Preview {
    ContentView()
}
