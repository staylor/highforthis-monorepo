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

/// What an episode says about itself besides its title.
nonisolated enum EpisodeText {
    /// How long an episode is, in hours and minutes, or nil when the API has no length for it or one that can't be.
    static func length(
        seconds: Double?,
        width: Duration.UnitsFormatStyle.UnitWidth,
        locale: Locale = .autoupdatingCurrent
    ) -> String? {
        guard let seconds, seconds.isFinite, seconds > 0 else { return nil }
        return Duration.seconds(seconds).formatted(.units(allowed: [.hours, .minutes], width: width).locale(locale))
    }

    /// The start of an episode's notes for its row, which has two lines for them: the notes on one line, so a blank
    /// line or a list in them doesn't use the row's lines up.
    static func preview(of notes: String) -> String {
        notes.split(whereSeparator: \.isWhitespace).joined(separator: " ")
    }
}
