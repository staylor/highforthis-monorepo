import SwiftUI
import HighForThisAPI

struct PodcastListRow: View {
    var podcast: PodcastListNode

    private var posted: String {
        podcast.date.map { L10N("posted \(parseDate($0))") } ?? ""
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(podcast.title)
                .font(.headline)
                .foregroundStyle(.pink)
            Text(posted)
                .font(.subheadline)
                .foregroundStyle(.secondary)
        }
        .padding(.vertical, 4)
    }
}
