import Foundation

nonisolated extension URL {
    static func webURL(_ string: String) -> URL? {
        guard let url = URL(string: string),
            let scheme = url.scheme?.lowercased(), ["https", "http"].contains(scheme),
            let host = url.host, !host.isEmpty, url.user == nil, url.password == nil
        else { return nil }
        return url
    }
}
