import HighForThisAPI
import SwiftUI

struct ShowList: View {
    let kind: ShowKind
    var artist: String?
    var venue: String?
    /// The artist's or the venue's name, which their shows open with, as a detail screen opens with its title.
    var name: String?
    @State private var year: Int?
    @State private var feed = Feeds.shows()
    @Environment(\.statsHaveATab) private var statsHaveATab

    private var filter: ShowFilter { ShowFilter(kind: kind, artist: artist, venue: venue, year: year) }

    var body: some View {
        titled(
            FeedList(
                feed: feed,
                filter: filter,
                emptyTitle: kind == .upcoming ? .noRecommendedShows : .noShows,
                systemImage: "music.mic"
            ) { shows in
                if let name {
                    // Whose shows these are, and which of them, which the History tab's own title doesn't say.
                    DetailHeader(eyebrow: Text(title), title: name)
                        .padding(.vertical, 4)
                        .listRowSeparatorHidden()
                }
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
                                // Without the artist or the venue whose shows these are, which the header names
                                ShowListRow(show: show, filter: filter)
                            }
                            .accessibilityIdentifier("show-\(show.id)")
                        }
                    } header: {
                        Text(month.date, format: .showMonth)
                    }
                }
            }
        )
        #if !os(tvOS)
        .toolbar {
            if showsStatsLink {
                ToolbarItem {
                    RouteLink(.stats) {
                        Label(.showStatsTitle, systemImage: "chart.bar.xaxis")
                    }
                    .accessibilityIdentifier("show-stats")
                }
            }
            if showsYearFilter {
                ToolbarItem { yearFilter }
            }
        }
        #endif
    }

    private var title: LocalizedStringResource { kind == .upcoming ? .recommendedShows : .showHistoryTitle }

    /// An artist's or a venue's shows have the name for a title, and which shows they are under it.
    @ViewBuilder private func titled(_ list: some View) -> some View {
        if let name {
            list.detailTitle(name, subtitle: title)
        } else {
            list.navigationTitle(title)
        }
    }

    /// The History tab links to the stats where they have no tab of their own, as the website's history links to its.
    private var showsStatsLink: Bool {
        filter.isByYear && !statsHaveATab
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
