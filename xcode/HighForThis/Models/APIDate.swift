import Foundation

nonisolated extension Date {
    /// The API sends dates as milliseconds since 1970.
    init(apiTimestamp: Double) {
        self.init(timeIntervalSince1970: apiTimestamp / 1000)
    }
}
