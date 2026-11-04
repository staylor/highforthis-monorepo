import AVFoundation
import MediaPlayer
import Observation
import os

/// Plays podcast episodes. There's one for the app, so an episode keeps playing after its page closes, from the
/// Lock Screen and Control Center too.
@Observable
final class PodcastPlayer {
    struct Episode: Equatable {
        let id: String
        let title: String
        let url: URL
    }

    private(set) var episode: Episode?
    private var player: AVPlayer?
    #if os(iOS)
    @ObservationIgnored private var nowPlayingSession: MPNowPlayingSession?
    #endif

    /// Whether the player is playing or waiting to, which AVPlayer reports through Observation once
    /// `AVPlayer.isObservationEnabled` is on.
    var isPlaying: Bool {
        player.map { $0.timeControlStatus != .paused } ?? false
    }

    func isPlaying(_ episode: Episode) -> Bool {
        self.episode == episode && isPlaying
    }

    func toggle(_ episode: Episode) {
        if self.episode == episode, isPlaying {
            player?.pause()
        } else {
            if self.episode != episode {
                load(episode)
            }
            play()
        }
    }

    private func togglePlayback() {
        if let episode {
            toggle(episode)
        }
    }

    private func load(_ episode: Episode) {
        let item = AVPlayerItem(url: episode.url)
        #if os(iOS)
        item.nowPlayingInfo = [MPMediaItemPropertyTitle: episode.title, MPMediaItemPropertyArtist: "High For This"]
        #endif
        if let player {
            player.replaceCurrentItem(with: item)
        } else {
            player = makePlayer(with: item)
        }
        self.episode = episode
    }

    private func play() {
        guard let player else { return }
        if let item = player.currentItem, item.currentTime() >= item.duration {
            player.seek(to: .zero)
        }
        #if os(iOS)
        Task {
            await Self.activateAudioSession()
            _ = await nowPlayingSession?.becomeActiveIfPossible()
            player.play()
        }
        #else
        player.play()
        #endif
    }

    #if os(iOS)
    /// Activation can take a while, and iOS 27 warns when it blocks the main thread.
    @concurrent private nonisolated static func activateAudioSession() async {
        do {
            try AVAudioSession.sharedInstance().setActive(true)
        } catch {
            Logger.playback.error("Couldn't activate the audio session: \(error.localizedDescription, privacy: .public)")
        }
    }
    #endif

    private func makePlayer(with item: AVPlayerItem) -> AVPlayer {
        let player = AVPlayer(playerItem: item)
        #if os(iOS)
        do {
            try AVAudioSession.sharedInstance().setCategory(.playback, mode: .spokenAudio, policy: .longFormAudio)
        } catch {
            Logger.playback.error("Couldn't set the audio session category: \(error.localizedDescription, privacy: .public)")
        }
        let session = MPNowPlayingSession(players: [player])
        session.automaticallyPublishesNowPlayingInfo = true
        let commands = session.remoteCommandCenter
        // MediaPlayer doesn't promise to call these on the main thread.
        commands.playCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.play() }
            return .success
        }
        commands.pauseCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.player?.pause() }
            return .success
        }
        commands.togglePlayPauseCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.togglePlayback() }
            return .success
        }
        nowPlayingSession = session
        #endif
        return player
    }
}
