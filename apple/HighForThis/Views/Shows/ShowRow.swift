import HighForThisAPI
import SwiftUI

struct ShowRow: View {
    var caption: String?
    let title: String
    var subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 2) {
            if let caption {
                Text(caption)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
            Text(title)
                .foregroundStyle(.tint)
            if let subtitle {
                Text(subtitle)
                    .foregroundStyle(.secondary)
            }
        }
    }
}

/// A show in a list of shows: its main artist's picture, then its headline and venue. At accessibility text sizes the
/// picture goes above the text, which then has the row's width.
struct ShowListRow: View {
    let show: ShowList_show
    @ScaledMetric(relativeTo: .body) private var scaledImageSize: CGFloat = .readable(44)
    @Environment(\.displayScale) private var displayScale
    @Environment(\.dynamicTypeSize) private var dynamicTypeSize

    /// The picture grows with the text, but not so much that it crowds the list.
    private var imageSize: CGFloat { min(scaledImageSize, .readable(72)) }

    var body: some View {
        let layout =
            dynamicTypeSize.isAccessibilitySize
            ? AnyLayout(VStackLayout(alignment: .leading, spacing: 8)) : AnyLayout(HStackLayout(spacing: 12))
        layout {
            RemoteImage(
                url: show.headlinerArtwork(maximumWidth: Int((imageSize * displayScale).rounded(.up)))?.url,
                contentMode: .fill,
                placeholder: "music.mic"
            )
            .frame(width: imageSize, height: imageSize)
            .clipShape(.circle)
            .accessibilityHidden(true)
            ShowRow(title: show.headline, subtitle: show.venue.name)
        }
    }
}

/// A show on an artist's or venue's page, which already says who or where, so the row leads with the date.
struct DatedShowLink: View {
    let show: ShowList_show
    let title: String

    var body: some View {
        NavigationLink(value: Route.show(id: show.id, title: show.headline)) {
            ShowRow(caption: show.startDate.formatted(date: .abbreviated, time: .omitted), title: title)
        }
        .accessibilityIdentifier("show-\(show.id)")
    }
}
