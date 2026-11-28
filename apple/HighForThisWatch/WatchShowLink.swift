import Foundation

/// The complication can open either its show or the upcoming list, including when the app is already browsing.
nonisolated struct WatchShowLink {
    let id: String?
    let title: String?

    init(id: String? = nil, title: String? = nil) {
        self.id = id
        self.title = title
    }

    var url: URL {
        var components = URLComponents()
        components.scheme = "highforthis"
        components.host = "shows"
        if let id {
            components.queryItems = [URLQueryItem(name: "id", value: id), URLQueryItem(name: "title", value: title)]
        }
        return components.url!
    }

    init?(url: URL) {
        guard let components = URLComponents(url: url, resolvingAgainstBaseURL: false),
            components.scheme == "highforthis", components.host == "shows", components.path.isEmpty
        else { return nil }
        let id = components.queryItems?.first { $0.name == "id" }?.value
        self.id = id?.isEmpty == false ? id : nil
        title = components.queryItems?.first { $0.name == "title" }?.value
    }
}
