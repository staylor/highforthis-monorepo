import SwiftUI

/// A post's images, tiled as the website's post cards tile them: one fills the frame, two sit side by side, three put
/// the first beside the other two, four make a grid, and five put the first beside a grid of the rest.
struct PostArtworkCollage: View {
    let images: [PostArtworkImage]

    private let spacing: CGFloat = 2

    var body: some View {
        let urls = images.prefix(PostArtworkImage.maximumCount).map(\.url)
        Group {
            switch urls.count {
            case 1:
                tile(urls[0])
            case 2:
                HStack(spacing: spacing) {
                    tile(urls[0])
                    tile(urls[1])
                }
            case 3:
                HStack(spacing: spacing) {
                    tile(urls[0])
                    VStack(spacing: spacing) {
                        tile(urls[1])
                        tile(urls[2])
                    }
                }
            case 4:
                VStack(spacing: spacing) {
                    HStack(spacing: spacing) {
                        tile(urls[0])
                        tile(urls[1])
                    }
                    HStack(spacing: spacing) {
                        tile(urls[2])
                        tile(urls[3])
                    }
                }
            case 5...:
                HStack(spacing: spacing) {
                    tile(urls[0])
                    VStack(spacing: spacing) {
                        tile(urls[1])
                        tile(urls[3])
                    }
                    VStack(spacing: spacing) {
                        tile(urls[2])
                        tile(urls[4])
                    }
                }
            default:
                EmptyView()
            }
        }
        .background(.black)
    }

    private func tile(_ url: URL) -> some View {
        RemoteImage(url: url, aspectRatio: nil, contentMode: .fill)
    }
}
