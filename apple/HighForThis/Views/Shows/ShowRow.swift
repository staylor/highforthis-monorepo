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
