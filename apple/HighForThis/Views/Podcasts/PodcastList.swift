import HighForThisAPI
import SwiftUI

struct PodcastList: View {
    @State private var feed = Feeds.podcasts()

    var body: some View {
        FeedList(feed: feed, filter: .all, emptyTitle: .noPodcastEpisodes, systemImage: "mic.slash") { episodes in
            ForEach(episodes, id: \.id) { episode in
                RouteLink(.podcast(id: episode.id, title: episode.title)) {
                    // An episode's title is often only its date, so its row says what it's about too.
                    RowLabel(
                        eyebrow: eyebrow(of: episode),
                        title: episode.title,
                        detail: EpisodeText.preview(of: episode.description),
                        detailLineLimit: 2
                    )
                    .padding(.vertical, 4)
                }
                .accessibilityIdentifier("podcast-\(episode.id)")
            }
        }
        .navigationTitle(.podcastEpisodes)
    }

    /// When the episode was posted and how long it is, as much of that as the API has.
    private func eyebrow(of episode: PodcastsQuery.Data.Podcasts.Edge.Node) -> Text? {
        let date = episode.date.map { Date(apiTimestamp: $0).formatted(.postedDate) }
        let length = EpisodeText.length(seconds: episode.audio?.duration, width: .abbreviated)
        return switch (date, length) {
        case (let date?, let length?): Text(.dateAndDuration(date, length))
        case (let text?, nil), (nil, let text?): Text(text)
        case (nil, nil): nil
        }
    }
}

#Preview {
    NavigationStack { PodcastList() }
}
