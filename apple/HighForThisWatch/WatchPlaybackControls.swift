import SwiftUI

struct PlaybackControls: View {
    let episode: PodcastPlayer.Episode
    @Environment(PodcastPlayer.self) private var player

    var body: some View {
        VStack(spacing: 6) {
            Button(player.isPlaying(episode) ? .pause : .play, systemImage: player.isPlaying(episode) ? "pause.fill" : "play.fill") {
                player.toggle(episode)
            }
            .buttonStyle(.borderedProminent)
            .accessibilityIdentifier("episode-play-pause")

            if player.episode?.id == episode.id {
                if player.isPreparing { ProgressView(.preparingPlayback) }
                if player.error != nil {
                    Label(.playbackUnavailable, systemImage: "exclamationmark.triangle")
                        .accessibilityIdentifier("playback-error")
                }
                if player.duration > 0 {
                    ProgressView(value: min(player.elapsed, player.duration), total: player.duration)
                        .accessibilityLabel(.playbackPosition)
                        .accessibilityValue(Duration.seconds(player.elapsed).formatted(.time(pattern: .minuteSecond)))
                    Text(Duration.seconds(player.elapsed), format: .time(pattern: .minuteSecond))
                        .font(.caption.monospacedDigit())
                        .accessibilityHidden(true)
                    HStack {
                        Button(.skipBackward, systemImage: "gobackward.15") { player.skip(by: -15) }
                        Button(.skipForward, systemImage: "goforward.15") { player.skip(by: 15) }
                    }
                    .labelStyle(.iconOnly)
                }
            }
        }
    }
}

struct NowPlayingView: View {
    @Environment(PodcastPlayer.self) private var player
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            if let episode = player.episode {
                VStack {
                    Text(episode.title).font(.headline)
                    PlaybackControls(episode: episode)
                    Button(.stopPlayback, role: .destructive) {
                        player.stop()
                        dismiss()
                    }
                    .accessibilityIdentifier("stop-playback")
                }
            }
        }
        .navigationTitle(.nowPlaying)
    }
}
