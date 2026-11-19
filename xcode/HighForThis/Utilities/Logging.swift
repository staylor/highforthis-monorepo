import os

nonisolated extension Logger {
    private static let subsystem = "com.scottctaylor.HighForThis"

    static let api = Logger(subsystem: subsystem, category: "API")
    static let carPlay = Logger(subsystem: subsystem, category: "CarPlay")
    static let playback = Logger(subsystem: subsystem, category: "Playback")
}
