import AVFoundation
import Foundation
import Testing

@testable import HighForThis

@Suite(.timeLimit(.minutes(1)))
struct PodcastPlayerTests {
    private struct Failure: Error {}
    private var episode: PodcastPlayer.Episode {
        PodcastPlayer.Episode(id: "episode", title: "Episode", url: UITestFixtures.audioURL)
    }

    @Test func pauseWhileActivatingDoesNotStartPlaybackLater() async {
        let activation = Suspended<Void>()
        let player = PodcastPlayer { active, _ in
            if active { try await activation.value() }
        }
        player.toggle(episode)
        await activation.waitUntilStarted()
        #expect(player.isPreparing)
        #expect(player.isPlaying)
        player.pause()
        activation.finish(.success(()))
        for _ in 0..<20 { await Task.yield() }

        #expect(!player.isPlaying)
        #expect(!player.isPreparing)
        #expect(player.error == nil)
        player.stop()
    }

    @Test func stoppingWhileActivatingClearsTheEpisode() async {
        let activation = Suspended<Void>()
        let player = PodcastPlayer { active, _ in
            if active { try await activation.value() }
        }
        player.toggle(episode)
        await activation.waitUntilStarted()
        player.stop()
        activation.finish(.success(()))
        for _ in 0..<20 { await Task.yield() }

        #expect(player.episode == nil)
        #expect(!player.isPlaying)
        #expect(player.elapsed == 0)
    }

    @Test func activationFailureIsVisibleAndRetryable() async {
        let failed = Suspended<Void>()
        let player = PodcastPlayer { active, _ in
            if active { try await failed.value() }
        }
        player.toggle(episode)
        await failed.waitUntilStarted()
        failed.finish(.failure(Failure()))
        while player.isPreparing { await Task.yield() }

        #expect(player.error is Failure)
        #expect(!player.isPlaying)
        #expect(player.episode?.id == episode.id)
        player.stop()
        #expect(player.error == nil)
    }

    @Test func repeatedPlayWhilePreparingDoesNotActivateTwice() async {
        let activation = Suspended<Void>()
        var attempts = 0
        let player = PodcastPlayer { active, _ in
            if active {
                attempts += 1
                try await activation.value()
            }
        }
        player.toggle(episode)
        await activation.waitUntilStarted()
        player.play()
        #expect(attempts == 1)
        player.stop()
        activation.finish(.success(()))
    }
}
