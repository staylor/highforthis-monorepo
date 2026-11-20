import Foundation
import HighForThisAPI

nonisolated extension PodcastPlayer.Episode {
    /// The episode's audio, or nil when the podcast has none.
    init?(_ podcast: PodcastQuery.Data.Podcast) {
        guard let audio = podcast.audio else { return nil }
        self.init(
            id: podcast.id,
            title: podcast.title,
            url: AppConfiguration.uploadURL(destination: audio.destination, fileName: audio.fileName)
        )
    }
}
