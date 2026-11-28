import SwiftUI

/// A row's words, the same in every list: a title, with a line over it that says when or what it is, and a line or
/// two of detail under it.
struct RowLabel: View {
    var eyebrow: Text?
    let title: String
    var detail: String?
    /// How many lines the detail has room for, or nil for all of it.
    var detailLineLimit: Int?

    var body: some View {
        VStack(alignment: .leading, spacing: 3) {
            eyebrow?.eyebrowStyle()
            Text(title)
                .font(.headline)
                // A link colors its label, and a video's row is one.
                .foregroundStyle(.primary)
                .multilineTextAlignment(.leading)
            if let detail, !detail.isEmpty {
                Text(detail)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.leading)
                    .lineLimit(detailLineLimit)
            }
        }
    }
}

/// A row that leads with its picture, as a video's or a post's does. At accessibility text sizes the picture goes
/// above the words, which then have the row's width, and the picture fills it.
struct PictureRow<Picture: View, Words: View>: View {
    /// How wide the picture is beside the words on a phone.
    let pictureWidth: CGFloat
    /// How wide it is where the row is wider, on iPad, Mac and Apple TV.
    let regularPictureWidth: CGFloat
    @ViewBuilder let picture: Picture
    @ViewBuilder let words: Words
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize
    #if !os(watchOS)
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass
    #endif

    var body: some View {
        #if os(watchOS)
        words
        #else
        let stacked = dynamicTypeSize.isAccessibilitySize
        let layout = stacked ? AnyLayout(VStackLayout(alignment: .leading, spacing: 12)) : AnyLayout(HStackLayout(spacing: .readable(12)))
        layout {
            picture
                .frame(width: stacked ? nil : horizontalSizeClass == .regular ? .readable(regularPictureWidth) : pictureWidth)
                .clipShape(.rect(cornerRadius: 8))
                .accessibilityHidden(true)
            words
                .frame(maxWidth: .infinity, alignment: .leading)
        }
        .padding(.vertical, 4)
        #endif
    }
}
