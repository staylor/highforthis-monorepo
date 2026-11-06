import SwiftUI

struct PlaybackControls: View {
    let episode: PodcastPlayer.Episode
    @Environment(PodcastPlayer.self) private var player
    @Environment(\.colorScheme) private var colorScheme
    #if !os(tvOS)
    @State private var scrubPosition = 0.0
    @State private var isScrubbing = false
    #endif

    private var isCurrent: Bool { player.episode?.id == episode.id }

    var body: some View {
        VStack(spacing: 16) {
            if isCurrent, player.duration > 0 {
                VStack(spacing: 4) {
                    position
                        .accessibilityValue(Duration.seconds(player.elapsed).formatted(.time(pattern: .minuteSecond)))
                    HStack {
                        Text(Duration.seconds(player.elapsed), format: .time(pattern: .minuteSecond))
                        Spacer()
                        Text(Duration.seconds(player.duration), format: .time(pattern: .minuteSecond))
                    }
                    .font(.caption.monospacedDigit())
                    .foregroundStyle(.secondary)
                    .accessibilityHidden(true)
                }
            }
            GlassEffectContainer(spacing: 16) {
                HStack(spacing: 20) {
                    Button(.skipBackward, systemImage: "gobackward.15") { player.skip(by: -15) }
                        .disabled(!isCurrent || player.duration == 0)
                    Button(player.isPlaying(episode) ? .pause : .play, systemImage: player.isPlaying(episode) ? "pause.fill" : "play.fill")
                    {
                        player.toggle(episode)
                    }
                    .buttonStyle(.glassProminent)
                    #if !os(tvOS)
                    // The accent tint needs a dark symbol in dark mode. On tvOS, the focus effect sets the colors.
                    .foregroundStyle(colorScheme == .dark ? .black : .white)
                    #endif
                    .accessibilityIdentifier("episode-play-pause")
                    Button(.skipForward, systemImage: "goforward.15") { player.skip(by: 15) }
                        .disabled(!isCurrent || player.duration == 0)
                }
                .labelStyle(.iconOnly)
                .font(.title2)
                .controlSize(.large)
                .buttonStyle(.glass)
                .buttonBorderShape(.circle)
            }
            if isCurrent, player.isPreparing {
                ProgressView(.preparingPlayback)
            }
            if isCurrent, player.error != nil {
                Label(.playbackUnavailable, systemImage: "exclamationmark.triangle")
                    .font(.callout)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .accessibilityIdentifier("playback-error")
            }
        }
    }

    /// tvOS has no slider; the remote moves through the episode with the skip buttons.
    @ViewBuilder private var position: some View {
        #if os(tvOS)
        ProgressView(value: min(player.elapsed, player.duration), total: player.duration)
            .accessibilityLabel(.playbackPosition)
        #else
        Slider(
            value: Binding(get: { isScrubbing ? scrubPosition : min(player.elapsed, player.duration) }, set: { scrubPosition = $0 }),
            in: 0...player.duration
        ) {
            Text(.playbackPosition)
        } onEditingChanged: { editing in
            if editing { scrubPosition = player.elapsed } else { player.seek(to: scrubPosition) }
            isScrubbing = editing
        }
        .accessibilityAdjustableAction { direction in
            switch direction {
            case .increment: player.skip(by: 15)
            case .decrement: player.skip(by: -15)
            @unknown default: break
            }
        }
        #endif
    }
}

struct PlayerAccessory: View {
    @Environment(PodcastPlayer.self) private var player
    let openPlayer: () -> Void

    var body: some View {
        if let episode = player.episode {
            HStack(spacing: 12) {
                Button(action: openPlayer) {
                    HStack(spacing: 10) {
                        Image(systemName: player.error == nil ? "waveform" : "exclamationmark.triangle")
                            .foregroundStyle(.tint)
                        Text(episode.title).font(.subheadline.weight(.medium)).lineLimit(1)
                            .frame(maxWidth: .infinity, alignment: .leading)
                    }
                    .frame(minHeight: 44)
                    .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .accessibilityHint(.openPlayer)
                .accessibilityIdentifier("open-player")
                Button {
                    player.togglePlayback()
                } label: {
                    Label(player.isPlaying ? .pause : .play, systemImage: player.isPlaying ? "pause.fill" : "play.fill")
                        .labelStyle(.iconOnly)
                        .font(.title3)
                        .frame(minWidth: 44, minHeight: 44)
                        .contentShape(.rect)
                }
                .buttonStyle(.plain)
                .accessibilityIdentifier("player-play-pause")
            }
            .padding(.horizontal)
        }
    }
}

struct NowPlayingView: View {
    @Environment(PodcastPlayer.self) private var player
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        #if os(tvOS)
        // On tvOS this is a tab, so it has no Done button.
        content
            .frame(maxHeight: .infinity)
        #else
        NavigationStack {
            ScrollView { content }
                .navigationTitle(.nowPlaying)
                .toolbar {
                    ToolbarItem(placement: .confirmationAction) {
                        Button(.done) { dismiss() }
                    }
                }
        }
        #if os(macOS)
        .frame(minWidth: 400, minHeight: 420)
        #endif
        #endif
    }

    @ViewBuilder private var content: some View {
        if let episode = player.episode {
            VStack(spacing: 24) {
                Image(systemName: "waveform")
                    .font(.largeTitle)
                    .foregroundStyle(.tint)
                    .accessibilityHidden(true)
                Text(episode.title).font(.title2.bold()).multilineTextAlignment(.center)
                PlaybackControls(episode: episode)
                Button(.stopPlayback, role: .destructive) {
                    player.stop()
                    dismiss()
                }
                .accessibilityIdentifier("stop-playback")
            }
            .frame(maxWidth: .readable(480))
            .padding(24)
            .frame(maxWidth: .infinity)
        }
    }
}
