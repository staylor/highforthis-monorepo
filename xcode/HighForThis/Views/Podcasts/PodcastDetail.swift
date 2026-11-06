import HighForThisAPI
import SwiftUI

struct PodcastDetail: View {
    let id: String
    let title: String

    var body: some View {
        QueryView(PodcastQuery(id: id)) { data in
            if let podcast = data.podcast {
                ScrollView {
                    VStack(alignment: .leading, spacing: 16) {
                        Text(podcast.title)
                            .font(.title.bold())
                            .accessibilityAddTraits(.isHeader)
                        VStack(alignment: .leading) {
                            if let date = podcast.date {
                                Text(.posted(Date(apiTimestamp: date).formatted(date: .long, time: .omitted)))
                            }
                            if let duration = podcast.audio?.duration, duration.isFinite, duration > 0 {
                                Text(Duration.seconds(duration), format: .units(allowed: [.hours, .minutes], width: .wide))
                            }
                        }
                        .foregroundStyle(.secondary)
                        #if os(tvOS)
                        // The remote can only reach controls, so on tvOS Play comes first and takes focus.
                        playback(podcast)
                        notes(podcast)
                        #else
                        notes(podcast)
                        playback(podcast)
                        #endif
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

    private func notes(_ podcast: PodcastQuery.Data.Podcast) -> some View {
        Text(podcast.description)
            .selectableText()
    }

    @ViewBuilder private func playback(_ podcast: PodcastQuery.Data.Podcast) -> some View {
        if let audio = podcast.audio {
            PlaybackControls(
                episode: PodcastPlayer.Episode(
                    id: podcast.id,
                    title: podcast.title,
                    url: AppConfiguration.uploadURL(destination: audio.destination, fileName: audio.fileName)
                )
            )
            .frame(maxWidth: .infinity)
            .padding(.vertical)
        } else {
            Label(.audioUnavailable, systemImage: "speaker.slash")
                .foregroundStyle(.secondary)
        }
    }
}
