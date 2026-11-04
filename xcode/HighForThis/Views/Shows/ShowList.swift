import HighForThisAPI
import SwiftUI

/// Upcoming shows we recommend, or the shows we've been to, by day.
struct ShowList: View {
    enum Kind {
        case upcoming
        case history
    }

    let kind: Kind
    @State private var year: Int?

    var body: some View {
        QueryView(query) { data in
            let days = ShowDay.days(from: data.shows?.edges.map(\.node.fragments.showList_show) ?? [])
            Group {
                if days.isEmpty {
                    ContentUnavailableView(kind == .upcoming ? .noRecommendedShows : .noShows, systemImage: "music.mic")
                } else {
                    List(days) { day in
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
                    .listStyle(.plain)
                }
            }
            .toolbar {
                if kind == .history, let years = data.shows?.years, !years.isEmpty {
                    ToolbarItem {
                        YearFilter(years: years, selection: $year)
                    }
                }
            }
        }
        .navigationTitle(kind == .upcoming ? .recommendedShows : .showHistory)
    }

    private var query: ShowsQuery {
        switch kind {
        case .upcoming:
            ShowsQuery(attended: .none, first: 200, latest: true, year: .none)
        case .history:
            ShowsQuery(attended: true, first: 200, latest: .none, year: year.map(Int32.init) ?? .none)
        }
    }
}

#Preview("Recommended") {
    NavigationStack {
        ShowList(kind: .upcoming)
    }
}

#Preview("History") {
    NavigationStack {
        ShowList(kind: .history)
    }
}
