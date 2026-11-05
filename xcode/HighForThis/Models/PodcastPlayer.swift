import AVFoundation
import MediaPlayer
import Observation
import os

@Observable
final class PodcastPlayer {
    nonisolated struct Episode: Equatable, Identifiable {
        let id: String
        let title: String
        let url: URL
    }

    typealias SessionControl = (_ active: Bool, _ revision: Int) async throws -> Void

    private(set) var episode: Episode?
    private(set) var isPreparing = false
    private(set) var error: (any Error)?
    private(set) var elapsed: Double = 0
    private(set) var hasEnded = false
    private let player: AVPlayer

    @ObservationIgnored private let sessionControl: SessionControl
    @ObservationIgnored private var activation: Task<Void, Never>?
    @ObservationIgnored private var revision = 0
    private var wantsPlayback = false
    @ObservationIgnored private var itemObservation: NSKeyValueObservation?
    @ObservationIgnored private var observers: [NSObjectProtocol] = []
    @ObservationIgnored private var timeObserver: Any?
    #if os(iOS)
    @ObservationIgnored private var nowPlayingSession: MPNowPlayingSession?
    @ObservationIgnored private var resumeAfterInterruption = false
    #endif

    init(sessionControl: SessionControl? = nil) {
        // This must be enabled before the first AVPlayer or AVPlayerItem, including in previews and tests.
        Self.enableObservation()
        player = AVPlayer()
        let session = PlaybackAudioSession()
        self.sessionControl = sessionControl ?? { try await session.setActive($0, revision: $1) }
        timeObserver = player.addPeriodicTimeObserver(forInterval: CMTime(seconds: 1, preferredTimescale: 600), queue: .main) {
            @Sendable [weak self] _ in
            Task { @MainActor in
                guard let self, self.episode != nil else { return }
                let seconds = self.player.currentTime().seconds
                if seconds.isFinite { self.elapsed = max(0, seconds) }
            }
        }
        observePlaybackEvents()
        #if os(iOS)
        configureRemoteCommands()
        observeAudioSession()
        #endif
    }

    isolated deinit {
        activation?.cancel()
        if let timeObserver { player.removeTimeObserver(timeObserver) }
        for observer in observers { NotificationCenter.default.removeObserver(observer) }
        #if os(iOS)
        let commands = nowPlayingSession?.remoteCommandCenter
        commands?.playCommand.removeTarget(nil)
        commands?.pauseCommand.removeTarget(nil)
        commands?.togglePlayPauseCommand.removeTarget(nil)
        commands?.skipBackwardCommand.removeTarget(nil)
        commands?.skipForwardCommand.removeTarget(nil)
        commands?.changePlaybackPositionCommand.removeTarget(nil)
        #endif
    }

    private static let observationEnabled: Void = { AVPlayer.isObservationEnabled = true }()

    private static func enableObservation() { _ = observationEnabled }

    var isPlaying: Bool {
        wantsPlayback && (isPreparing || (!hasEnded && player.currentItem?.status != .failed && player.timeControlStatus != .paused))
    }

    var duration: Double {
        guard let seconds = player.currentItem?.duration.seconds, seconds.isFinite, seconds > 0 else { return 0 }
        return seconds
    }

    func isPlaying(_ episode: Episode) -> Bool { self.episode?.id == episode.id && isPlaying }

    func toggle(_ episode: Episode) {
        if self.episode?.id == episode.id, isPlaying {
            pause()
        } else {
            if self.episode != episode || error != nil || player.currentItem?.status == .failed {
                load(episode)
            }
            play()
        }
    }

    func togglePlayback() {
        if let episode { toggle(episode) }
    }

    func play() {
        guard episode != nil, !isPlaying else { return }
        if error != nil || player.currentItem?.status == .failed, let episode { load(episode) }
        revision += 1
        let revision = revision
        error = nil
        wantsPlayback = true
        isPreparing = true
        activation = Task { [weak self] in
            guard let self else { return }
            defer {
                if self.revision == revision {
                    isPreparing = false
                    activation = nil
                }
            }
            do {
                try await sessionControl(true, revision)
                try Task.checkCancellation()
                #if os(iOS)
                _ = await nowPlayingSession?.becomeActiveIfPossible()
                #endif
                if hasEnded { await player.seek(to: .zero) }
                try Task.checkCancellation()
                guard self.revision == revision else { return }
                hasEnded = false
                player.play()
            } catch {
                guard self.revision == revision, !Task.isCancelled else { return }
                fail(error)
            }
        }
    }

    func pause() {
        revision += 1
        activation?.cancel()
        activation = nil
        isPreparing = false
        wantsPlayback = false
        player.pause()
        #if os(iOS)
        resumeAfterInterruption = false
        #endif
        let revision = revision
        let sessionControl = sessionControl
        Task {
            do { try await sessionControl(false, revision) } catch {
                Logger.playback.error("Couldn't release audio session: \(error.localizedDescription)")
            }
        }
    }

    func stop() {
        pause()
        player.replaceCurrentItem(with: nil)
        itemObservation = nil
        episode = nil
        elapsed = 0
        error = nil
        hasEnded = false
    }

    func seek(to seconds: Double) {
        guard seconds.isFinite, duration > 0 else { return }
        hasEnded = false
        let target = min(max(0, seconds), duration)
        player.seek(to: CMTime(seconds: target, preferredTimescale: 600))
        elapsed = target
    }

    func skip(by seconds: Double) { seek(to: elapsed + seconds) }

    private func load(_ episode: Episode) {
        pause()
        let item = AVPlayerItem(url: episode.url)
        #if os(iOS)
        item.nowPlayingInfo = [MPMediaItemPropertyTitle: episode.title, MPMediaItemPropertyArtist: "High For This"]
        #endif
        self.episode = episode
        elapsed = 0
        hasEnded = false
        error = nil
        let identity = ObjectIdentifier(item)
        itemObservation = item.observe(\.status, options: [.new]) { @Sendable [weak self] item, _ in
            guard item.status == .failed else { return }
            let error = item.error ?? PlaybackError.unavailable
            Task { @MainActor in
                guard let self, self.player.currentItem.map(ObjectIdentifier.init) == identity else { return }
                self.fail(error)
            }
        }
        player.replaceCurrentItem(with: item)
    }

    private func observePlaybackEvents() {
        observers.append(
            NotificationCenter.default.addObserver(forName: .AVPlayerItemDidPlayToEndTime, object: nil, queue: nil) {
                @Sendable [weak self] notification in
                guard let item = notification.object as? AVPlayerItem else { return }
                let identity = ObjectIdentifier(item)
                Task { @MainActor in
                    guard let self, self.player.currentItem.map(ObjectIdentifier.init) == identity else { return }
                    self.pause()
                    self.hasEnded = true
                }
            })
        observers.append(
            NotificationCenter.default.addObserver(forName: .AVPlayerItemFailedToPlayToEndTime, object: nil, queue: nil) {
                @Sendable [weak self] notification in
                guard let item = notification.object as? AVPlayerItem else { return }
                let identity = ObjectIdentifier(item)
                let error = notification.userInfo?[AVPlayerItemFailedToPlayToEndTimeErrorKey] as? any Error ?? PlaybackError.unavailable
                Task { @MainActor in
                    guard let self, self.player.currentItem.map(ObjectIdentifier.init) == identity else { return }
                    self.fail(error)
                }
            })
    }

    private func fail(_ error: any Error) {
        pause()
        self.error = error
        Logger.playback.error("Playback failed: \(error.localizedDescription)")
    }

    #if os(iOS)
    private func configureRemoteCommands() {
        let session = MPNowPlayingSession(players: [player])
        session.automaticallyPublishesNowPlayingInfo = true
        nowPlayingSession = session
        let commands = session.remoteCommandCenter
        commands.playCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.play() }
            return .success
        }
        commands.pauseCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.pause() }
            return .success
        }
        commands.togglePlayPauseCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.togglePlayback() }
            return .success
        }
        commands.skipBackwardCommand.preferredIntervals = [15]
        commands.skipForwardCommand.preferredIntervals = [15]
        commands.skipBackwardCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.skip(by: -15) }
            return .success
        }
        commands.skipForwardCommand.addTarget { @Sendable [weak self] _ in
            Task { @MainActor in self?.skip(by: 15) }
            return .success
        }
        commands.changePlaybackPositionCommand.addTarget { @Sendable [weak self] event in
            guard let event = event as? MPChangePlaybackPositionCommandEvent else { return .commandFailed }
            let position = event.positionTime
            Task { @MainActor in self?.seek(to: position) }
            return .success
        }
    }

    private func observeAudioSession() {
        observers.append(
            NotificationCenter.default.addObserver(forName: AVAudioSession.interruptionNotification, object: nil, queue: nil) {
                @Sendable [weak self] notification in
                let type = notification.userInfo?[AVAudioSessionInterruptionTypeKey] as? UInt
                let options = notification.userInfo?[AVAudioSessionInterruptionOptionKey] as? UInt ?? 0
                Task { @MainActor in
                    guard let self else { return }
                    if type == AVAudioSession.InterruptionType.began.rawValue {
                        let wasPlaying = self.wantsPlayback
                        self.pause()
                        self.resumeAfterInterruption = wasPlaying
                    } else if type == AVAudioSession.InterruptionType.ended.rawValue {
                        let shouldResume =
                            self.resumeAfterInterruption && AVAudioSession.InterruptionOptions(rawValue: options).contains(.shouldResume)
                        self.resumeAfterInterruption = false
                        if shouldResume { self.play() }
                    }
                }
            })
        observers.append(
            NotificationCenter.default.addObserver(forName: AVAudioSession.routeChangeNotification, object: nil, queue: nil) {
                @Sendable [weak self] notification in
                let reason = notification.userInfo?[AVAudioSessionRouteChangeReasonKey] as? UInt
                if reason == AVAudioSession.RouteChangeReason.oldDeviceUnavailable.rawValue {
                    Task { @MainActor in self?.pause() }
                }
            })
    }
    #endif
}

private actor PlaybackAudioSession {
    private var revision = 0

    func setActive(_ active: Bool, revision: Int) throws {
        guard revision >= self.revision else { return }
        self.revision = revision
        #if os(iOS)
        let session = AVAudioSession.sharedInstance()
        if active {
            try session.setCategory(.playback, mode: .spokenAudio, policy: .longFormAudio)
        }
        try session.setActive(active, options: active ? [] : .notifyOthersOnDeactivation)
        #endif
    }
}

nonisolated enum PlaybackError: LocalizedError {
    case unavailable

    var errorDescription: String? { String(localized: "playbackUnavailable") }
}
