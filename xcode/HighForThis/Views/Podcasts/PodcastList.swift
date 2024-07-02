import SwiftUI
import HighForThisAPI

typealias PodcastListNode = HighForThisAPI.PodcastsQuery.Data.Podcasts.Edge.Node

struct PodcastList: View {
    @State var podcasts: [PodcastListNode]?

    var body: some View {
        VStack(alignment: .leading) {
            if podcasts == nil {
                Spacer()
                Loading()
            } else if podcasts!.count == 0 {
                Text(L10N("noPodcastEpisodes"))
            } else {
                List {
                    ForEach(podcasts!, id: \.self) { podcast in
                        let posted = L10N("posted \(parseDate(podcast.date!))")
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
            Spacer()
        }.onAppear() {
            let query = HighForThisAPI.PodcastsQuery()
            getData(query) { data in
                var nodes = [PodcastListNode]()
                for edge in data.podcasts!.edges {
                    nodes.append(edge.node)
                }
                self.podcasts = nodes
            }
        }
    }
}

#Preview {
    AppWrapper {
        PodcastList()
    }
}
