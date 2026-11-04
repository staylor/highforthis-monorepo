import HighForThisAPI
import SwiftUI

struct PodcastDetail: View {
    let id: String
    let title: String

    var body: some View {
        QueryView(PodcastQuery(id: id)) { data in
            if let podcast = data.podcast {
                ScrollView {
                    VStack(alignment: .leading, spacing: 12) {
                        Text(podcast.title)
                            .font(.title.bold())
                        VStack(alignment: .leading) {
                            if let date = podcast.date {
                                Text(.posted(Date(apiTimestamp: date).formatted(date: .long, time: .omitted)))
                            }
                            if let duration = podcast.audio?.duration {
                                Text(Duration.seconds(duration), format: .units(allowed: [.hours, .minutes], width: .wide))
                            }
                        }
                        .foregroundStyle(.secondary)
                        Text(podcast.description)
                        if let audio = podcast.audio {
                            PlayButton(
                                episode: PodcastPlayer.Episode(
                                    id: podcast.id,
                                    title: podcast.title,
                                    url: AppConfiguration.uploadURL(destination: audio.destination, fileName: audio.fileName)
                                )
                            )
                            .padding(.top)
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

private struct PlayButton: View {
    let episode: PodcastPlayer.Episode
    @Environment(PodcastPlayer.self) private var player

    var body: some View {
        let isPlaying = player.isPlaying(episode)
        HStack {
            Button {
                player.toggle(episode)
            } label: {
                Label(isPlaying ? .pause : .play, systemImage: isPlaying ? "pause.circle.fill" : "play.circle.fill")
                    .labelStyle(.iconOnly)
                    .font(.system(size: 56))
                    .contentTransition(.symbolEffect(.replace))
            }
            .buttonStyle(.plain)
            .foregroundStyle(.tint)
            Spacer()
            Image(systemName: "waveform")
                .font(.system(size: 56))
                .symbolEffect(.variableColor.iterative, isActive: isPlaying)
                .accessibilityHidden(true)
        }
    }
}

#Preview {
    NavigationStack {
        PodcastDetail(id: "cmm4apmyf02jo9hh428fvrk9c", title: "Best Albums of 2020")
    }
    .environment(PodcastPlayer())
}
