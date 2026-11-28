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
