import Combine
import AVFoundation

class AudioPlayerViewModel: ObservableObject {
    private var lastUrl: String = ""
    private var audioPlayer: AVPlayer?
    private var cancellables = Set<AnyCancellable>()
    @Published var isPlaying = false
    @Published var error: String?

    #if os(iOS)
    private var session = AVAudioSession.sharedInstance()

    private func activateSession() {
        do {
            try session.setCategory(
                .playback,
                mode: .default,
                options: []
            )
        } catch {
            #if DEBUG
            print("Failed to set audio category: \(error.localizedDescription)")
            #endif
        }

        do {
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch {
            #if DEBUG
            print("Failed to activate audio session: \(error.localizedDescription)")
            #endif
        }

        do {
            try session.overrideOutputAudioPort(.speaker)
        } catch {
            #if DEBUG
            print("Failed to override audio port: \(error.localizedDescription)")
            #endif
        }
    }

    func deactivateSession() {
        do {
            try session.setActive(false, options: .notifyOthersOnDeactivation)
        } catch {
            #if DEBUG
            print("Failed to deactivate audio session: \(error.localizedDescription)")
            #endif
        }
    }
    #endif

    deinit {
        audioPlayer?.pause()
        audioPlayer = nil
        cancellables.removeAll()
    }

    private func observePlayerItem(_ playerItem: AVPlayerItem) {
        cancellables.removeAll()

        NotificationCenter.default.publisher(for: .AVPlayerItemDidPlayToEndTime, object: playerItem)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] _ in
                guard let self else { return }
                self.isPlaying = false
                #if os(iOS)
                self.deactivateSession()
                #endif
            }
            .store(in: &cancellables)

        playerItem.publisher(for: \.status)
            .receive(on: DispatchQueue.main)
            .sink { [weak self] status in
                guard let self else { return }
                switch status {
                case .failed:
                    self.isPlaying = false
                    self.error = playerItem.error?.localizedDescription ?? "Playback failed"
                    #if DEBUG
                    print("Playback failed: \(playerItem.error?.localizedDescription ?? "Unknown error")")
                    #endif
                case .readyToPlay:
                    self.error = nil
                default:
                    break
                }
            }
            .store(in: &cancellables)
    }

    func toggle(url: String) {
        #if DEBUG
        print("Toggling audio: \(url)")
        #endif

        if audioPlayer == nil {
            #if os(iOS)
            activateSession()
            #endif
        } else if isPlaying {
            pause()
            return
        }

        if lastUrl == url {
            play()
            return
        }

        guard let audioUrl = URL(string: url) else { return }

        lastUrl = url
        error = nil

        let playerItem = AVPlayerItem(url: audioUrl)
        observePlayerItem(playerItem)

        if let player = audioPlayer {
            player.replaceCurrentItem(with: playerItem)
        } else {
            audioPlayer = AVPlayer(playerItem: playerItem)
        }

        play()
    }

    func pause() {
        audioPlayer?.pause()
        isPlaying = false
    }

    func play() {
        audioPlayer?.play()
        isPlaying = true
    }
}
