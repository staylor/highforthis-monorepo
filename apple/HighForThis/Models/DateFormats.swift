import Foundation

nonisolated extension TimeZone {
    /// New York's, where the shows are. The app dates shows there, as the website does, wherever the device is.
    static let newYork = TimeZone(identifier: "America/New_York")!
}

nonisolated extension Calendar {
    /// The calendar that says which day a show is on: New York's.
    static let newYork: Calendar = {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = .newYork
        return calendar
    }()
}

nonisolated extension FormatStyle where Self == Date.FormatStyle {
    /// A day of shows, as the show lists head it, in New York.
    static var showDay: Self { inNewYork(.dateTime.weekday(.abbreviated).month(.abbreviated).day().year()) }

    /// A show's date, as an artist's or a venue's shows list it, in New York.
    static var showDate: Self { inNewYork(.dateTime.month(.abbreviated).day().year()) }

    /// When a show starts, in New York. On a device that keeps another time, it names New York's time zone, so 8:00 PM
    /// doesn't read as 8:00 PM where the device is.
    static func showTime(_ start: Date, on device: TimeZone = .current) -> Self {
        let style = inNewYork(.dateTime.weekday(.wide).month(.wide).day().year().hour().minute())
        let sameClocks = device.secondsFromGMT(for: start) == TimeZone.newYork.secondsFromGMT(for: start)
        return sameClocks ? style : style.timeZone(.specificName(.short))
    }

    /// The day an episode was posted, as the episode list shows it.
    static var episodeDate: Self { .dateTime.month(.abbreviated).day().year() }
}

/// The style, showing New York's clocks rather than the device's.
private nonisolated func inNewYork(_ style: Date.FormatStyle) -> Date.FormatStyle {
    var style = style
    style.timeZone = .newYork
    return style
}
