import ApolloTestSupport
import Foundation
import HighForThisAPI
import HighForThisAPITestMocks
import Testing

@testable import HighForThis

struct PodcastEpisodeTests {
    @Test func episodePlaysTheUploadedAudio() async throws {
        let podcast = await PodcastQuery.Data.Podcast.from(
            Mock<Podcast>(
                audio: Mock<AudioUpload>(destination: "audio", fileName: "episode-1.mp3"),
                id: "episode-1",
                title: "Episode One"
            )
        )
        let episode = try #require(PodcastPlayer.Episode(podcast))
        #expect(episode.id == "episode-1")
        #expect(episode.title == "Episode One")
        #expect(episode.url == AppConfiguration.uploadsURL.appending(path: "audio").appending(path: "episode-1.mp3"))
    }

    @Test func episodeWithoutAudioCannotPlay() async {
        let podcast = await PodcastQuery.Data.Podcast.from(Mock<Podcast>(id: "episode-2", title: "Episode Two"))
        #expect(PodcastPlayer.Episode(podcast) == nil)
    }
}
