import Foundation

/// What the watch's Next Show complication keeps between its runs: the last show a fetch found, and how many fetches
/// have failed since. When a fetch fails, as one does while the watch is away from its phone and Wi-Fi, the
/// complication shows that show until its day has passed, rather than none, and asks again less often while fetches
/// keep failing, so it stays within WidgetKit's daily budget of reloads.
nonisolated struct NextShowMemory: Codable, Equatable {
    /// A show as the complication shows it
    struct Show: Codable, Equatable {
        let id: String
        let title: String
        let venue: String
        /// The venue's day for the show (YYYY-MM-DD)
        let localDate: String
    }

    private(set) var show: Show?
    private(set) var failures = 0

    init() {}

    /// A fetch that found the next show, or found none to come
    mutating func found(_ show: Show?) {
        self.show = show
        failures = 0
    }

    mutating func failed() {
        failures += 1
    }

    /// The show to keep showing when a fetch fails: the last one found, while its day hasn't passed in New York, where
    /// the API's list of shows to come changes at midnight
    func fallback(at now: Date) -> Show? {
        guard let show, show.localDate >= now.formatted(Self.newYorkDay) else { return nil }
        return show
    }

    /// How long to wait before asking again after failures in a row: 15 minutes, then 30, then an hour
    static func retryDelay(afterFailures failures: Int) -> TimeInterval {
        [15.0, 30, 60][min(max(failures, 1), 3) - 1] * 60
    }

    private static let newYorkDay = Date.ISO8601FormatStyle(timeZone: .newYork).year().month().day().dateSeparator(.dash)
    private static let key = "nextShowMemory"

    /// What an earlier run kept, or nothing when there's nothing it can read
    static func load(from defaults: UserDefaults) -> NextShowMemory {
        defaults.data(forKey: key).flatMap { try? JSONDecoder().decode(NextShowMemory.self, from: $0) } ?? NextShowMemory()
    }

    func save(to defaults: UserDefaults) {
        if let data = try? JSONEncoder().encode(self) {
            defaults.set(data, forKey: Self.key)
        }
    }
}
