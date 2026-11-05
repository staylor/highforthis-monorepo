import HighForThisAPI
import SwiftUI

struct ShowList: View {
    let kind: ShowKind
    var artist: String?
    var venue: String?
    @State private var year: Int?
    @State private var feed = Feeds.shows()

    var body: some View {
        FeedList(
            feed: feed,
            filter: ShowFilter(kind: kind, artist: artist, venue: venue, year: year),
            emptyTitle: kind == .upcoming ? .noRecommendedShows : .noShows,
            systemImage: "music.mic"
        ) { shows in
            ForEach(ShowDay.days(from: shows)) { day in
                Section {
                    ForEach(day.shows, id: \.id) { show in
                        NavigationLink(value: Route.show(id: show.id, title: show.headline)) {
                            ShowRow(title: show.headline, subtitle: show.venue.name)
                        }
                        .accessibilityIdentifier("show-\(show.id)")
                    }
                } header: {
                    Text(day.date, format: .dateTime.weekday(.abbreviated).month(.abbreviated).day().year())
                }
            }
        }
        .navigationTitle(kind == .upcoming ? .recommendedShows : .showHistory)
        .toolbar {
            if kind == .history, !feed.years.isEmpty || year != nil {
                ToolbarItem { YearFilter(years: feed.years, selection: $year) }
            }
        }
    }
}

#Preview {
    NavigationStack { ShowList(kind: .upcoming) }
}
