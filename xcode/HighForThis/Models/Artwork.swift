import Foundation

/// Apple Music artwork at a size that suits the screen. Apple Music describes artwork with a URL template whose
/// `{w}` and `{h}` are replaced by the pixel size to download.
nonisolated struct Artwork: Hashable {
    let url: URL
    let aspectRatio: Double

    init?(template: String?, width: Int?, height: Int?, maximumWidth: Int = 1500) {
        guard let template, let width, let height, width > 0, height > 0 else { return nil }
        let scaledWidth = min(width, maximumWidth)
        let scaledHeight = Int((Double(height) * Double(scaledWidth) / Double(width)).rounded())
        let urlString =
            template
            .replacingOccurrences(of: "{w}", with: String(scaledWidth))
            .replacingOccurrences(of: "{h}", with: String(scaledHeight))
        guard let url = URL(string: urlString) else { return nil }
        self.url = url
        self.aspectRatio = Double(width) / Double(height)
    }
}
