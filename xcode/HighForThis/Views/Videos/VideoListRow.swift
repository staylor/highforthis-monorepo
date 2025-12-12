import SwiftUI
import CachedAsyncImage

struct VideoListRow: View {
    var video: VideoListNode

    private var thumbnailURL: URL? {
        guard let thumb = video.thumbnails.first(where: { $0.width != 0 }) else {
            return nil
        }
        return URL(string: thumb.url)
    }

    var body: some View {
        HStack(spacing: 12) {
            VStack(alignment: .leading) {
                Text(video.title)
                    .font(.subheadline)
                    .lineLimit(3)
                Spacer()
            }

            Spacer()

            if let url = thumbnailURL {
                CachedAsyncImage(url: url) { image in
                    image.resizable()
                        .aspectRatio(contentMode: .fill)
                        .frame(width: 120, height: 90)
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                } placeholder: {
                    RoundedRectangle(cornerRadius: 8)
                        .fill(.quaternary)
                        .frame(width: 120, height: 90)
                }
            }
        }
        .padding(.vertical, 4)
    }
}
