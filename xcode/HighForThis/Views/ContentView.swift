import SwiftUI

struct ContentView: View {
    var body: some View {
        AppWrapper {
            TabView {
                Tab(L10N("shows"), systemImage: "calendar") {
                    NavigationStack {
                        ShowList(title: L10N("recommendedShows"), latest: true)
                    }
                }
                Tab(L10N("podcast"), systemImage: "mic.circle") {
                    NavigationStack {
                        PodcastList()
                    }
                }
                Tab(L10N("videos"), systemImage: "video") {
                    NavigationStack {
                        VideoList()
                    }
                }
                Tab(L10N("posts"), systemImage: "note.text") {
                    NavigationStack {
                        PostList()
                    }
                }
                Tab(L10N("showHistory"), systemImage: "calendar") {
                    NavigationStack {
                        ShowList(title: L10N("showHistory"), attended: true)
                    }
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
