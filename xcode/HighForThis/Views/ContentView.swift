import SwiftUI

struct ContentView: View {
    var body: some View {
        AppWrapper {
            TabView {
                NavigationView {
                    ShowList(title: L10N("recommendedShows"), latest: true)
                }.tabItem {
                    Label(L10N("shows"), systemImage: "calendar")
                }
                NavigationView {
                    PodcastList()
                }.tabItem {
                    Label(L10N("podcast"), systemImage: "mic.circle")
                }
                NavigationView {
                    VideoList()
                }.tabItem {
                    Label(L10N("videos"), systemImage: "video")
                }
                NavigationView {
                    PostList()
                }.tabItem {
                    Label(L10N("posts"), systemImage: "note.text")
                }
                NavigationView {
                    ShowList(title: L10N("showHistory"), attended: true)
                }.tabItem {
                    Label(L10N("showHistory"), systemImage: "calendar")
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
