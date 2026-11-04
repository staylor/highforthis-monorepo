import SwiftUI

/// Artwork across the top of a list. The height is capped, so on iPad and Mac it doesn't fill the window.
struct ArtworkHeader: View {
    let artwork: Artwork

    var body: some View {
        RemoteImage(url: artwork.url, aspectRatio: artwork.aspectRatio)
            .frame(maxWidth: .infinity, maxHeight: 440)
            .listRowInsets(EdgeInsets())
            .listRowSeparator(.hidden)
    }
}

struct NotFoundView: View {
    var body: some View {
        ContentUnavailableView(.notFound, systemImage: "questionmark.circle")
    }
}
