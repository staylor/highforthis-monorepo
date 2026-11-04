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
}

nonisolated extension ShowQuery.Data.Show: ShowSummary {
    var artistNames: [String] { artists.map(\.name) }
}

/// The shows on one calendar day.
nonisolated struct ShowDay: Identifiable {
    let date: Date
    let shows: [ShowList_show]

    var id: Date { date }

    /// Groups shows by the day they start, keeping the days in the order the API returns them: upcoming shows
    /// soonest first, and history most recent first. Shows on the same day are sorted by headline.
    static func days(from shows: [ShowList_show], calendar: Calendar = .current) -> [ShowDay] {
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
