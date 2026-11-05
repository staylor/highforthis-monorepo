import HighForThisAPI
import SwiftUI

struct PodcastList: View {
    @State private var feed = Feeds.podcasts()

    var body: some View {
        FeedList(feed: feed, filter: .all, emptyTitle: .noPodcastEpisodes, systemImage: "mic.slash") { episodes in
            ForEach(episodes, id: \.id) { episode in
                NavigationLink(value: Route.podcast(id: episode.id, title: episode.title)) {
                    VStack(alignment: .leading, spacing: 4) {
                        Text(episode.title)
                            .font(.headline)
                        if let date = episode.date {
                            Text(Date(apiTimestamp: date), format: .dateTime.month(.abbreviated).day().year())
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                        }
                    }
                    .padding(.vertical, 4)
                }
                .accessibilityIdentifier("podcast-\(episode.id)")
            }
        }
        .navigationTitle(.podcastEpisodes)
    }
}

#Preview {
    NavigationStack { PodcastList() }
}
