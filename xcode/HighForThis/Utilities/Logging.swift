import os

nonisolated extension Logger {
    private static let subsystem = "com.scottctaylor.HighForThis"

    static let api = Logger(subsystem: subsystem, category: "API")
    static let playback = Logger(subsystem: subsystem, category: "Playback")
}
