import Foundation

nonisolated extension TimeZone {
    /// The site's editorial time zone for posts and episodes.
    static let newYork = TimeZone(identifier: "America/New_York")!
}

/// The venue's advertised Gregorian calendar day (YYYY-MM-DD).
nonisolated struct VenueDay: Hashable {
    let iso: String

    init(_ iso: String) { self.iso = iso }

    var monthStart: VenueDay { VenueDay(String(iso.prefix(7)) + "-01") }

    func formatted(_ style: Date.FormatStyle) -> String {
        formatVenueClock(day: iso, time: nil, style: style) ?? iso
    }
}

nonisolated extension FormatStyle where Self == Date.FormatStyle {
    static var showDay: Self { .dateTime.weekday(.abbreviated).month(.abbreviated).day().year() }
    static var showMonth: Self { .dateTime.month(.wide).year() }
    static var showDayNumber: Self { .dateTime.day(.twoDigits) }
    static var showWeekday: Self { .dateTime.weekday(.abbreviated) }
    static var showSpokenDay: Self { .dateTime.weekday(.wide).month(.wide).day() }

    /// The day an episode or a post was posted, as their lists show it.
    static var postedDate: Self { inNewYork(.dateTime.month(.abbreviated).day().year()) }

    /// The day an episode or a post was posted, as its own page shows it.
    static var postedDay: Self { inNewYork(.dateTime.month(.wide).day().year()) }
}

/// The style, showing New York's clocks rather than the device's.
private nonisolated func inNewYork(_ style: Date.FormatStyle) -> Date.FormatStyle {
    var style = style
    style.timeZone = .newYork
    return style
}

nonisolated func venueScheduleLabel(day: String, time: String?, locale: Locale = .current) -> String? {
    var style = Date.FormatStyle.dateTime.weekday(.wide).month(.wide).day().year().locale(locale)
    if time != nil { style = style.hour().minute() }
    return formatVenueClock(day: day, time: time, style: style)
}

/// UTC lets Foundation localize civil fields even when the venue's clock skips or repeats an hour.
private nonisolated func formatVenueClock(day: String, time: String?, style: Date.FormatStyle) -> String? {
    let clock = time.map { String($0.prefix(5)) } ?? "00:00"
    guard let value = try? Date("\(day)T\(clock):00Z", strategy: .iso8601) else { return nil }
    var style = style
    style.calendar = Calendar(identifier: .gregorian)
    style.timeZone = .gmt
    return value.formatted(style)
}
