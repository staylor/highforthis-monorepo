import SwiftUI

/// An image from the network, in a frame that holds its space while it loads: a frame of the given aspect ratio, or
/// with none, all the space the image is offered. `contentMode` is how the image fits that frame.
struct RemoteImage: View {
    let url: URL?
    var aspectRatio: Double? = 1
    var contentMode: ContentMode = .fit

    var body: some View {
        frame
            .overlay {
                AsyncImage(url: url, transaction: Transaction(animation: .easeIn(duration: 0.2))) { phase in
                    if let image = phase.image {
                        image
                            .resizable()
                            .aspectRatio(contentMode: contentMode)
                    } else if phase.error != nil || url == nil {
                        Image(systemName: "photo")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .clipped()
    }

    @ViewBuilder private var frame: some View {
        if let aspectRatio {
            Rectangle()
                .fill(.quaternary)
                .aspectRatio(CGFloat(aspectRatio), contentMode: .fit)
        } else {
            Rectangle()
                .fill(.quaternary)
        }
    }
}
