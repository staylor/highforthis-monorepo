import Foundation

/// Apple Music artwork at a size that suits the screen. Apple Music describes artwork with a URL template whose
/// `{w}` and `{h}` are replaced by the pixel size to download.
nonisolated struct Artwork: Hashable {
    /// The most pixels across the app downloads, which suits the largest screens
    static let largestWidth = 1500

    let url: URL
    let aspectRatio: Double

    init?(template: String?, width: Int?, height: Int?, maximumWidth: Int = largestWidth) {
        guard let template, let width, let height, width > 0, height > 0, maximumWidth > 0 else { return nil }
        let scale = min(1, Double(maximumWidth) / Double(max(width, height)))
        let scaledWidth = max(1, Int((Double(width) * scale).rounded()))
        let scaledHeight = max(1, Int((Double(height) * scale).rounded()))
        let urlString =
            template
            .replacingOccurrences(of: "{w}", with: String(scaledWidth))
            .replacingOccurrences(of: "{h}", with: String(scaledHeight))
        guard let url = URL.webURL(urlString) else { return nil }
        self.url = url
        self.aspectRatio = Double(width) / Double(height)
    }
}

/// Apple Music artwork before a size is picked to download it at: its URL template, and its full size. A screen picks
/// the size it draws it at.
nonisolated struct ArtworkTemplate: Hashable {
    let template: String
    let width: Int
    let height: Int

    init?(template: String?, width: Int?, height: Int?) {
        guard let template, let width, let height, width > 0, height > 0 else { return nil }
        self.template = template
        self.width = width
        self.height = height
    }

    var aspectRatio: Double { Double(width) / Double(height) }

    /// The artwork filling a square of this many points: artwork that isn't square is drawn wider or taller than it.
    func filling(square side: Double, scale: Double) -> Artwork? {
        artwork(longerSide: side * max(aspectRatio, 1 / aspectRatio), scale: scale)
    }

    /// The artwork across the screen, in a frame no taller than this many points: it's drawn no taller than that,
    /// and so no wider than that height times its aspect ratio.
    func fitting(height: Double, scale: Double) -> Artwork? {
        artwork(longerSide: height * max(aspectRatio, 1), scale: scale)
    }

    /// The artwork drawn with its longer side this many points long, on a screen of this scale
    private func artwork(longerSide points: Double, scale: Double) -> Artwork? {
        let pixels = Int((points * scale).rounded(.up))
        return Artwork(template: template, width: width, height: height, maximumWidth: min(pixels, Artwork.largestWidth))
    }
}
