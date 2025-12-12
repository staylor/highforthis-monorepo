import SwiftUI
import HighForThisAPI

typealias PodcastListNode = HighForThisAPI.PodcastsQuery.Data.Podcasts.Edge.Node

struct PodcastList: View {
    @State private var podcasts: [PodcastListNode]?

    var body: some View {
        Group {
            if let podcasts {
                if podcasts.isEmpty {
                    ContentUnavailableView(
                        "noPodcastEpisodes",
                        systemImage: "mic.slash"
                    )
                } else {
                    List {
                        ForEach(podcasts, id: \.self) { podcast in
                            NavigationLink {
                                PodcastDetail(id: podcast.id)
                            } label: {
                                PodcastListRow(podcast: podcast)
                            }
                        }
                    }
                    .listStyle(.plain)
                }
            } else {
                ProgressView()
            }
        }
        .navigationTitle("podcastEpisodes")
        .task {
            let query = HighForThisAPI.PodcastsQuery()
            if let data = await fetchData(query) {
                podcasts = data.podcasts?.edges.map { $0.node } ?? []
            }
        }
    }
}

#Preview {
    AppWrapper {
        PodcastList()
    }
}
