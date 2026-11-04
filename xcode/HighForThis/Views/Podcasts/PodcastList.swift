import HighForThisAPI
import SwiftUI

struct PodcastList: View {
    var body: some View {
        QueryView(PodcastsQuery()) { data in
            let episodes = data.podcasts?.edges.map(\.node) ?? []
            if episodes.isEmpty {
                ContentUnavailableView(.noPodcastEpisodes, systemImage: "mic.slash")
            } else {
                List(episodes, id: \.id) { episode in
                    NavigationLink(value: Route.podcast(id: episode.id, title: episode.title)) {
                        VStack(alignment: .leading, spacing: 2) {
                            if let date = episode.date {
                                Text(.posted(Date(apiTimestamp: date).formatted(date: .abbreviated, time: .omitted)))
                                    .font(.subheadline)
                                    .foregroundStyle(.secondary)
                            }
                            Text(episode.title)
                                .font(.title3)
                                .foregroundStyle(.tint)
                        }
                    }
                    .accessibilityIdentifier("podcast-\(episode.id)")
                }
                .listStyle(.plain)
            }
        }
        .navigationTitle(.podcastEpisodes)
    }
}

#Preview {
    NavigationStack {
        PodcastList()
    }
    .environment(PodcastPlayer())
}
