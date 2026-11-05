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
                        Text(podcast.description)
                            .textSelection(.enabled)
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
                    .frame(maxWidth: 640, alignment: .leading)
                    .padding()
                    .frame(maxWidth: .infinity)
                }
            } else {
                NotFoundView()
            }
        }
        .detailTitle(title)
    }
}
