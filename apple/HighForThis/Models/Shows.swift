import Foundation
import HighForThisAPI

nonisolated protocol ShowSummary {
    var title: String? { get }
    var date: Double { get }
    var artistNames: [String] { get }
}

nonisolated extension ShowSummary {
    /// The show's title, or its artists when it has none, as the website lists them.
    var headline: String {
        if let title, !title.isEmpty {
            return title
        }
        return artistNames.joined(separator: " / ")
    }

    var startDate: Date {
        Date(apiTimestamp: date)
    }
}

nonisolated extension ShowList_show: ShowSummary {
    var artistNames: [String] { artists.map(\.name) }

    /// The main artist's Apple Music artwork, at most `maximumWidth` pixels wide. The main artist is the first, as on
    /// the website, so a show whose main artist has none has none, rather than another artist's.
    func headlinerArtwork(maximumWidth: Int) -> Artwork? {
        guard let artwork = artists.first?.appleMusic?.artwork else { return nil }
        return Artwork(template: artwork.url, width: artwork.width, height: artwork.height, maximumWidth: maximumWidth)
    }
}

nonisolated extension ShowQuery.Data.Show: ShowSummary {
    var artistNames: [String] { artists.map(\.name) }
}

/// The shows in one calendar month, which the show lists head them with. Each show's row has its own day.
nonisolated struct ShowMonth: Identifiable {
    /// The month's first day in New York.
    let date: Date
    let shows: [ShowList_show]

    var id: Date { date }

    /// Groups shows by the month they start in, in New York, as the website's calendar does. The months, the days in
    /// them and the shows on a day stay in the order `ShowDay` puts them in.
    static func months(from shows: [ShowList_show], calendar: Calendar = .newYork) -> [ShowMonth] {
        var order: [Date] = []
        var showsByMonth: [Date: [ShowList_show]] = [:]
        for day in ShowDay.days(from: shows, calendar: calendar) {
            let month = calendar.dateInterval(of: .month, for: day.date)?.start ?? day.date
            if showsByMonth[month] == nil {
                order.append(month)
            }
            showsByMonth[month, default: []].append(contentsOf: day.shows)
        }
        return order.map { ShowMonth(date: $0, shows: showsByMonth[$0, default: []]) }
    }
}

/// The shows on one calendar day, which CarPlay heads them with.
nonisolated struct ShowDay: Identifiable {
    let date: Date
    let shows: [ShowList_show]

    var id: Date { date }

    /// Groups shows by the day they start in New York, as the website does, keeping the days in the order the API
    /// returns them: upcoming shows soonest first, and history most recent first. Shows on the same day are sorted by
    /// headline.
    static func days(from shows: [ShowList_show], calendar: Calendar = .newYork) -> [ShowDay] {
        var order: [Date] = []
        var showsByDay: [Date: [ShowList_show]] = [:]
        for show in shows {
            let day = calendar.startOfDay(for: show.startDate)
            if showsByDay[day] == nil {
                order.append(day)
            }
            showsByDay[day, default: []].append(show)
        }
        return order.map { day in
            let shows = showsByDay[day, default: []].sorted { $0.headline.localizedStandardCompare($1.headline) == .orderedAscending }
            return ShowDay(date: day, shows: shows)
        }
    }
}
