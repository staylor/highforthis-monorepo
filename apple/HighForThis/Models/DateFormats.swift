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
    /// A show's day with its weekday, in New York, as CarPlay heads a day of shows and as a show's row says it at the
    /// text sizes that leave no room for its date badge.
    static var showDay: Self { inNewYork(.dateTime.weekday(.abbreviated).month(.abbreviated).day().year()) }

    /// A month of shows, as the show lists head it, in New York.
    static var showMonth: Self { inNewYork(.dateTime.month(.wide).year()) }

    /// The day of the month in a show's date badge, in New York: two digits, as the website's are.
    static var showDayNumber: Self { inNewYork(.dateTime.day(.twoDigits)) }

    /// The weekday in a show's date badge, in New York.
    static var showWeekday: Self { inNewYork(.dateTime.weekday(.abbreviated)) }

    /// A show's day as VoiceOver reads its date badge, which only has room for "30 Mon", in New York.
    static var showSpokenDay: Self { inNewYork(.dateTime.weekday(.wide).month(.wide).day()) }

    /// A show's date, as an artist's or a venue's shows list it, in New York.
    static var showDate: Self { inNewYork(.dateTime.month(.abbreviated).day().year()) }

    /// When a show starts, in New York. On a device that keeps another time, it names New York's time zone, so 8:00 PM
    /// doesn't read as 8:00 PM where the device is.
    static func showTime(_ start: Date, on device: TimeZone = .current) -> Self {
        let style = inNewYork(.dateTime.weekday(.wide).month(.wide).day().year().hour().minute())
        let sameClocks = device.secondsFromGMT(for: start) == TimeZone.newYork.secondsFromGMT(for: start)
        return sameClocks ? style : style.timeZone(.specificName(.short))
    }

    /// The day an episode or a post was posted, as their lists show it.
    static var postedDate: Self { .dateTime.month(.abbreviated).day().year() }

    /// The day an episode or a post was posted, as its own page shows it.
    static var postedDay: Self { .dateTime.month(.wide).day().year() }
}

/// The style, showing New York's clocks rather than the device's.
private nonisolated func inNewYork(_ style: Date.FormatStyle) -> Date.FormatStyle {
    var style = style
    style.timeZone = .newYork
    return style
}
