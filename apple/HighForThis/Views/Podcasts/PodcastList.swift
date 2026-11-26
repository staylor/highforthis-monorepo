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

    private func eyebrow(of episode: PodcastsQuery.Data.Podcasts.Edge.Node) -> Text? {
        Text(
            posted: episode.date.map { Date(apiTimestamp: $0).formatted(.postedDate) },
            length: EpisodeText.length(seconds: episode.audio?.duration, width: .abbreviated)
        )
    }
}

extension Text {
    /// The line over an episode's title: when it was posted and how long it is, as much of that as the API has.
    init?(posted date: String?, length: String?) {
        switch (date, length) {
        case (let date?, let length?): self.init(.dateAndDuration(date, length))
        case (let text?, nil), (nil, let text?): self.init(text)
        case (nil, nil): return nil
        }
    }
}

#Preview {
    NavigationStack { PodcastList() }
}
