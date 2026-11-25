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
