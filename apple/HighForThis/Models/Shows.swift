import Foundation
import HighForThisAPI

nonisolated protocol ShowSummary {
    var title: String? { get }
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

}

nonisolated extension ShowList_show: ShowSummary {
    var venueDay: VenueDay { VenueDay(schedule.localDate) }
    var artistNames: [String] { artists.map(\.name) }

    /// The main artist's Apple Music artwork, at most `maximumWidth` pixels wide. The main artist is the first, as on
    /// the website, so a show whose main artist has none has none, rather than another artist's.
    func headlinerArtwork(maximumWidth: Int) -> Artwork? {
        guard let artwork = artists.first?.appleMusic?.artwork else { return nil }
        return Artwork(template: artwork.url, width: artwork.width, height: artwork.height, maximumWidth: maximumWidth)
    }

    /// Where the show is: its venue's city and state.
    var place: String? { Place.name(city: venue.city, state: venue.state) }

    /// Its words in the list `filter` gives, which leave out what all of the list's shows have in common. A venue's
    /// shows say who played, and an artist's say where, with the venue's city, as the website's artist page lists
    /// them, rather than the artist's name and picture on every row. The rest say both.
    func rowWords(in filter: ShowFilter) -> ShowRowWords {
        if filter.artist != nil {
            return ShowRowWords(title: venue.name, detail: place, hasPicture: false)
        }
        return ShowRowWords(title: headline, detail: filter.venue == nil ? venue.name : nil, hasPicture: true)
    }
}

/// A show's words in a list of shows.
nonisolated struct ShowRowWords: Equatable {
    let title: String
    let detail: String?
    /// Whether the row has the main artist's picture.
    let hasPicture: Bool
}

/// Where a venue is, as the website writes it: "Brooklyn, NY".
nonisolated enum Place {
    /// The city and the state, or whichever of them there is, or nil without either.
    static func name(city: String?, state: String?) -> String? {
        let name = [city, state]
            .compactMap { $0?.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
        return name.isEmpty ? nil : name
    }
}

nonisolated extension ShowQuery.Data.Show: ShowSummary {
    var artistNames: [String] { artists.map(\.name) }
}

/// The shows in one calendar month, which the show lists head them with. Each show's row has its own day.
nonisolated struct ShowMonth: Identifiable {
    let date: VenueDay
    let shows: [ShowList_show]

    var id: VenueDay { date }

    static func months(from shows: [ShowList_show]) -> [ShowMonth] {
        ShowDay.days(from: shows)
            .orderedGroups { $0.date.monthStart }
            .map { month, days in ShowMonth(date: month, shows: days.flatMap(\.shows)) }
    }
}

/// CarPlay displays venue days in API order, with each day's shows sorted by headline.
nonisolated struct ShowDay: Identifiable {
    let date: VenueDay
    let shows: [ShowList_show]

    var id: VenueDay { date }

    static func days(from shows: [ShowList_show]) -> [ShowDay] {
        shows.orderedGroups(by: \.venueDay).map { day, shows in
            ShowDay(date: day, shows: shows.sorted { $0.headline.localizedStandardCompare($1.headline) == .orderedAscending })
        }
    }
}

nonisolated extension Sequence {
    /// The elements in groups that share a key, in the order each key first appears.
    func orderedGroups<Key: Hashable>(by key: (Element) -> Key) -> [(key: Key, elements: [Element])] {
        var keys: [Key] = []
        var groups: [Key: [Element]] = [:]
        for element in self {
            let key = key(element)
            if groups[key] == nil {
                keys.append(key)
            }
            groups[key, default: []].append(element)
        }
        return keys.map { ($0, groups[$0, default: []]) }
    }
}
