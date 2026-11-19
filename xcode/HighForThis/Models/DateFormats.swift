import Foundation

nonisolated extension FormatStyle where Self == Date.FormatStyle {
    /// A day of shows, as the show lists head it.
    static var showDay: Self { .dateTime.weekday(.abbreviated).month(.abbreviated).day().year() }

    /// The day an episode was posted, as the episode list shows it.
    static var episodeDate: Self { .dateTime.month(.abbreviated).day().year() }
}
