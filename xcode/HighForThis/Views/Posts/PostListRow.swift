import SwiftUI
import HighForThisAPI

struct PostListRow: View {
    var post: PostListNode

    private var thumbnailURL: URL? {
        guard let thumb = post.featuredMedia?.first?.asImageUpload,
              let crop = thumb.crops.first else {
            return nil
        }
        return URL(string: cdnUrl("\(thumb.destination)/\(crop.fileName)"))
    }

    var body: some View {
        HStack(spacing: 12) {
            Text(post.title)
                .font(.headline)
                .lineLimit(2)

            Spacer()

            Group {
                if let url = thumbnailURL {
                    AsyncImage(url: url) { image in
                        image.resizable()
                            .scaledToFill()
                    } placeholder: {
                        Rectangle()
                            .fill(.quaternary)
                    }
                } else {
                    Rectangle()
                        .fill(.pink.opacity(0.3))
                }
            }
            .frame(width: 100, height: 75)
            .clipShape(RoundedRectangle(cornerRadius: 8))
        }
        .padding(.vertical, 4)
    }
}
