import HighForThisAPI
import SwiftUI

struct ShowList: View {
    let kind: ShowKind
    var artist: String?
    var venue: String?
    @State private var year: Int?
    @State private var feed = Feeds.shows()

    private var filter: ShowFilter { ShowFilter(kind: kind, artist: artist, venue: venue, year: year) }

    var body: some View {
        FeedList(
            feed: feed,
            filter: filter,
            emptyTitle: kind == .upcoming ? .noRecommendedShows : .noShows,
            systemImage: "music.mic"
        ) { shows in
            #if os(tvOS)
            // A tvOS toolbar button shows neither the selected year nor the filter's accessibility label.
            if showsYearFilter {
                yearFilter
            }
            #endif
            ForEach(ShowMonth.months(from: shows)) { month in
                Section {
                    ForEach(month.shows, id: \.id) { show in
                        RouteLink(.show(id: show.id, title: show.headline)) {
                            ShowListRow(show: show)
                        }
                        .accessibilityIdentifier("show-\(show.id)")
                    }
                } header: {
                    Text(month.date, format: .showMonth)
                }
            }
        }
        .navigationTitle(kind == .upcoming ? .recommendedShows : .showHistoryTitle)
        #if !os(tvOS)
        .toolbar {
            if showsYearFilter {
                ToolbarItem { yearFilter }
            }
        }
        #endif
    }

    private var showsYearFilter: Bool {
        kind == .history && (!feed.years.isEmpty || year != nil)
    }

    /// The History tab's menu has only years, so it never loads them all.
    private var yearFilter: some View {
        YearFilter(years: feed.years, selection: yearSelection, includesAllYears: !filter.isByYear)
    }

    /// The History tab shows the most recent year until another is chosen, and choosing it again goes back to that.
    private var yearSelection: Binding<Int?> {
        guard filter.isByYear else { return $year }
        return Binding {
            year ?? feed.years.first
        } set: { selection in
            year = selection == feed.years.first ? nil : selection
        }
    }
}

#Preview {
    NavigationStack { ShowList(kind: .upcoming) }
}
