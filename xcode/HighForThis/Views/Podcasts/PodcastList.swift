import SwiftUI
import HighForThisAPI

typealias PodcastListNode = HighForThisAPI.PodcastsQuery.Data.Podcasts.Edge.Node

struct PodcastList: View {
    @State private var podcasts: [PodcastListNode]?

    var body: some View {
        VStack(alignment: .leading) {
            if let podcasts {
                if podcasts.isEmpty {
                    Text(L10N("noPodcastEpisodes"))
                } else {
                    List {
                        ForEach(podcasts, id: \.self) { podcast in
                            let posted = podcast.date.map { L10N("posted \(parseDate($0))") } ?? ""
                            NavigationLink {
                                PodcastDetail(id: podcast.id)
                            } label: {
                                VStack(alignment: .leading) {
                                    Text(posted).foregroundColor(.gray).padding(.bottom, 1)
                                    Text(podcast.title).font(.title3).foregroundColor(.pink)
                                }
                            }
                        }
                    }
                    .listStyle(.plain)
                    .navigationTitle(L10N("podcastEpisodes"))
                }
            } else {
                Spacer()
                Loading()
            }
            Spacer()
        }
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
