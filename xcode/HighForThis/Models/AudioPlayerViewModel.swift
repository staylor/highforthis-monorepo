import Combine
import AVFoundation

class AudioPlayerViewModel: ObservableObject {
    private var lastUrl: String = ""
    private var audioPlayer: AVPlayer?
    private var cancellable: AnyCancellable?
    @Published var isPlaying = false

    #if os(iOS)
    private var session = AVAudioSession.sharedInstance()
    
    deinit {
        cancellable?.cancel()
    }
    
    private func activateSession() {
        do {
            try session.setCategory(
                .playback,
                mode: .default,
                options: []
            )
        } catch _ {}
        
        do {
            try session.setActive(true, options: .notifyOthersOnDeactivation)
        } catch _ {}
        
        do {
            try session.overrideOutputAudioPort(.speaker)
        } catch _ {}
        
        cancellable = NotificationCenter.default.publisher(for: .AVPlayerItemDidPlayToEndTime)
            .sink { [weak self] _ in
                guard let me = self else { return }
                
                me.deactivateSession()
            }
    }
    
    func deactivateSession() {
        do {
            try session.setActive(false, options: .notifyOthersOnDeactivation)
        } catch let error as NSError {
            print("Failed to deactivate audio session: \(error.localizedDescription)")
        }
    }
    #endif
    
    func toggle(url: String) {
        print("Toggling audio: \(url)")
        
        if (audioPlayer == nil) {
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
        
        let playerItem = AVPlayerItem(url: audioUrl)
        
        if let player = audioPlayer {
            player.replaceCurrentItem(with: playerItem)
        } else {
            audioPlayer = AVPlayer(playerItem: playerItem)
        }

        play()
    }
    
    func pause() {
        audioPlayer!.pause()
        isPlaying = false
    }
    
    func play() {
        audioPlayer!.play()
        isPlaying = true
    }
}
