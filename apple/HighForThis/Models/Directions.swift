import Foundation

nonisolated extension URL {
    /// Driving directions in Maps to a postal address, whose lines become one line, or nil when it's blank.
    static func directions(to address: String) -> URL? {
        let destination = address.split(whereSeparator: \.isNewline)
            .map { $0.trimmingCharacters(in: .whitespaces) }
            .filter { !$0.isEmpty }
            .joined(separator: ", ")
        guard !destination.isEmpty else { return nil }
        var components = URLComponents()
        components.scheme = "maps"
        components.host = ""
        components.queryItems = [URLQueryItem(name: "daddr", value: destination), URLQueryItem(name: "dirflg", value: "d")]
        return components.url
    }
}
