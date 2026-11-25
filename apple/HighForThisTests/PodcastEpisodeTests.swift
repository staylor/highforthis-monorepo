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

    private static let english = Locale(identifier: "en_US")

    @Test func lengthIsInHoursAndMinutes() {
        // 14 minutes 46 seconds is nearer 15 minutes
        #expect(EpisodeText.length(seconds: 886, width: .abbreviated, locale: Self.english) == "15 min")
        #expect(EpisodeText.length(seconds: 886, width: .wide, locale: Self.english) == "15 minutes")
        #expect(EpisodeText.length(seconds: 3_720, width: .abbreviated, locale: Self.english) == "1 hr, 2 min")
    }

    @Test(arguments: [nil, 0, -5, Double.nan, Double.infinity])
    func anEpisodeHasNoLengthWithoutOneThatCanBe(seconds: Double?) {
        #expect(EpisodeText.length(seconds: seconds, width: .wide, locale: Self.english) == nil)
    }

    // A row has two lines for the notes, which a blank line or a list in them would use up
    @Test func previewPutsTheNotesOnOneLine() {
        let notes = "This year's picks include:\n\nPhoebe Bridgers - Punisher\nTame Impala  -  The Slow Rush\n"

        #expect(EpisodeText.preview(of: notes) == "This year's picks include: Phoebe Bridgers - Punisher Tame Impala - The Slow Rush")
        #expect(EpisodeText.preview(of: " \n ") == "")
    }
}
