import Foundation
import HighForThisAPI

/// Whose stats to show: the artists we've seen, or the venues we've been to, as the website's stats pages have a tab
/// for each.
nonisolated enum StatsSubject: Hashable {
    case artists
    case venues
}

/// An artist or a venue in the stats, whichever of the two the API's union holds.
nonisolated struct StatsEntity: Hashable, Identifiable {
    nonisolated enum Kind: Hashable {
        case artist
        case venue
    }

    let kind: Kind
    let id: String
    let name: String
    let slug: String

    /// The name's initials, which stand in for a picture where there's none, as on the website: Madison Square Garden
    /// is MSG. Small words are left out, unless the name has nothing else.
    var initials: String {
        let words = name.split(whereSeparator: \.isWhitespace)
        let kept = words.filter { !Self.smallWords.contains($0.lowercased()) }
        return (kept.isEmpty ? words : kept).prefix(3).compactMap(\.first).map(String.init).joined().uppercased()
    }

    private static let smallWords: Set<String> = ["a", "and", "at", "of", "the", "&"]
}

/// One of the artists we've seen most or the venues we've been to most, with its place on the leaderboard, where a
/// tie shares its rank.
nonisolated struct StatsLeader: Identifiable {
    let rank: Int
    let entity: StatsEntity
    let count: Int
    /// The years of its first show and its latest, in New York.
    let years: ClosedRange<Int>
    /// Where a venue is, such as "Brooklyn, NY", or nil for an artist or a venue without a city or state.
    let place: String?
    private let artwork: StatsLeader_stat.Entity.AsArtist.AppleMusic.Artwork?

    var id: String { entity.id }

    /// The podium's three, which the website shows bigger than the rest.
    var isOnThePodium: Bool { rank <= 3 }

    /// The years from its first show to its latest: 2009–2025, or just 2019.
    var yearsText: String {
        years.lowerBound == years.upperBound ? String(years.lowerBound) : "\(years.lowerBound)–\(years.upperBound)"
    }

    init?(rank: Int, stat: StatsLeader_stat, calendar: Calendar = .newYork) {
        guard let entity = stat.entity.statsEntity else { return nil }
        self.rank = rank
        self.entity = entity
        self.count = stat.count
        let first = calendar.component(.year, from: Date(apiTimestamp: stat.firstDate))
        let last = calendar.component(.year, from: Date(apiTimestamp: stat.lastDate))
        self.years = min(first, last)...max(first, last)
        let place = [stat.entity.asVenue?.city, stat.entity.asVenue?.state]
            .compactMap { $0?.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
        self.place = place.isEmpty ? nil : place
        self.artwork = stat.entity.asArtist?.appleMusic?.artwork
    }

    /// An artist's Apple Music artwork, at most `maximumWidth` pixels wide. Venues have none.
    func artwork(maximumWidth: Int) -> Artwork? {
        artwork.flatMap { Artwork(template: $0.url, width: $0.width, height: $0.height, maximumWidth: maximumWidth) }
    }
}

/// The artists or venues after the leaders that were at the same number of shows.
nonisolated struct StatsTier: Identifiable {
    let count: Int
    let entities: [StatsEntity]

    var id: Int { count }
}

/// The stats for artists or for venues, as the website's stats page sets them out: the ones seen most, ranked, then
/// everyone else, in tiers by how many shows each had.
nonisolated struct StatsBoard {
    /// How many of the most seen the query asks for with their pictures and years, as the website does.
    static let leaderLimit = 20

    let leaders: [StatsLeader]
    let tiers: [StatsTier]

    /// The most shows any of them had, which the leaderboard's bars measure the others against.
    var most: Int { leaders.first?.count ?? 0 }

    /// `leaders` are the first of `everyone`, with their pictures and years, which the rest go without.
    init(leaders: [StatsLeader_stat], everyone: [StatsLineup_stat], limit: Int = Self.leaderLimit, calendar: Calendar = .newYork) {
        let counts = everyone.map(\.count)
        let ranks = Self.rankings(counts)
        let leaderCount = min(Self.leaderCount(counts, limit: limit), leaders.count)
        self.leaders = leaders.prefix(leaderCount).enumerated().compactMap { index, stat in
            StatsLeader(rank: index < ranks.count ? ranks[index] : index + 1, stat: stat, calendar: calendar)
        }
        self.tiers = everyone.dropFirst(leaderCount).orderedGroups(by: \.count).map { count, stats in
            StatsTier(count: count, entities: stats.compactMap(\.entity.statsEntity))
        }
    }

    init(_ data: ShowStatsQuery.Data, subject: StatsSubject) {
        switch subject {
        case .artists:
            self.init(
                leaders: data.artistLeaders.map(\.fragments.statsLeader_stat), everyone: data.artists.map(\.fragments.statsLineup_stat))
        case .venues:
            self.init(
                leaders: data.venueLeaders.map(\.fragments.statsLeader_stat), everyone: data.venues.map(\.fragments.statsLineup_stat))
        }
    }

    /// Ranks as a leaderboard has them: a tie shares its rank, and the rank after it counts past them, so 20, 20, 18
    /// are first, first and third.
    static func rankings(_ counts: [Int]) -> [Int] {
        var rank = 0
        return counts.indices.map { index in
            if index == 0 || counts[index] != counts[index - 1] {
                rank = index + 1
            }
            return rank
        }
    }

    /// How many of the most seen make the leaderboard: up to `limit`, stopping before a count that goes past it, so the
    /// tiers after it start with everyone who had that count. The podium keeps its three even so.
    static func leaderCount(_ counts: [Int], limit: Int = leaderLimit) -> Int {
        guard counts.count > limit else { return counts.count }
        var end = limit
        while end > 0, counts[end - 1] == counts[limit] {
            end -= 1
        }
        return max(end, 3)
    }
}

nonisolated extension ShowStatsQuery.Data.ShowTotals {
    /// The year of the first show we went to, in New York.
    func firstYear(calendar: Calendar = .newYork) -> Int? {
        firstDate.map { calendar.component(.year, from: Date(apiTimestamp: $0)) }
    }
}

nonisolated extension StatsLeader_stat.Entity {
    var statsEntity: StatsEntity? {
        if let artist = asArtist {
            return StatsEntity(kind: .artist, id: artist.id, name: artist.name, slug: artist.slug)
        }
        if let venue = asVenue {
            return StatsEntity(kind: .venue, id: venue.id, name: venue.name, slug: venue.slug)
        }
        return nil
    }
}

nonisolated extension StatsLineup_stat.Entity {
    var statsEntity: StatsEntity? {
        if let artist = asArtist {
            return StatsEntity(kind: .artist, id: artist.id, name: artist.name, slug: artist.slug)
        }
        if let venue = asVenue {
            return StatsEntity(kind: .venue, id: venue.id, name: venue.name, slug: venue.slug)
        }
        return nil
    }
}
