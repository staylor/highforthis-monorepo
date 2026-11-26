import HighForThisAPI
import SwiftUI

struct PodcastDetail: View {
    let id: String
    let title: String

    var body: some View {
        QueryView(PodcastQuery(id: id)) { data in
            if let podcast = data.podcast {
                ScrollView {
                    VStack(alignment: .leading, spacing: 20) {
                        DetailHeader(eyebrow: eyebrow(of: podcast), title: podcast.title)
                        // Play comes before the notes, which can run past the bottom of the screen. On tvOS the
                        // remote can only reach controls, so it's also what takes focus.
                        playback(podcast)
                        Text(podcast.description)
                            .selectableText()
                    }
                    .frame(maxWidth: .readable(640), alignment: .leading)
                    .padding()
                    .frame(maxWidth: .infinity)
                }
            } else {
                NotFoundView()
            }
        }
        .detailTitle(title)
    }

    private func eyebrow(of podcast: PodcastQuery.Data.Podcast) -> Text? {
        Text(
            posted: podcast.date.map { Date(apiTimestamp: $0).formatted(.postedDay) },
            length: EpisodeText.length(seconds: podcast.audio?.duration, width: .wide)
        )
    }

    @ViewBuilder private func playback(_ podcast: PodcastQuery.Data.Podcast) -> some View {
        if let episode = PodcastPlayer.Episode(podcast) {
            PlaybackControls(episode: episode)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 4)
        } else {
            Label(.audioUnavailable, systemImage: "speaker.slash")
                .foregroundStyle(.secondary)
        }
    }
}
