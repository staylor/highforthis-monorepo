import SwiftUI
import HighForThisAPI

struct ShowListRow: View {
    var show: ShowListNode

    private var label: String {
        let title = show.title ?? ""
        return title.isEmpty ? show.artists.map { $0.name }.joined(separator: " / ") : title
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(label)
                .foregroundStyle(Color.accentColor)
            Text(show.venue.name)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
    }
}
