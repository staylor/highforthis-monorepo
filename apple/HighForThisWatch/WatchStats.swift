import HighForThisAPI
import SwiftUI

struct ShowStats: View {
    @State private var subject = StatsSubject.artists

    var body: some View {
        QueryView(ShowStatsQuery(leaders: Int32(StatsBoard.leaderLimit))) { data in
            let board = StatsBoard(data, subject: subject)
            List {
                VStack(spacing: 4) {
                    LabeledContent(.shows, value: data.showTotals.shows.formatted())
                    LabeledContent(.artists, value: data.showTotals.artists.formatted())
                    LabeledContent(.venues, value: data.showTotals.venues.formatted())
                }
                .font(.subheadline)
                .monospacedDigit()
                .accessibilityElement(children: .combine)
                Picker(.statsFor, selection: $subject) {
                    Text(.artists).tag(StatsSubject.artists)
                    Text(.venues).tag(StatsSubject.venues)
                }
                .pickerStyle(.navigationLink)
                .accessibilityIdentifier("stats-subject")
                Section(subject == .artists ? .mostSeen : .mostVisited) {
                    ForEach(board.leaders) { leader in
                        RouteLink(leader.entity.route) {
                            RowLabel(
                                eyebrow: Text(.rank(leader.rank)), title: leader.entity.name,
                                detail: String(localized: .showCount(leader.count)))
                        }
                        .accessibilityIdentifier("stats-\(leader.entity.slug)")
                    }
                }
                ForEach(board.tiers) { tier in
                    Section(.showCount(tier.count)) {
                        ForEach(tier.entities) { entity in
                            RouteLink(entity.route) { Text(entity.name) }
                                .accessibilityIdentifier("stats-\(entity.slug)")
                        }
                    }
                }
            }
        }
        .detailTitle(String(localized: .stats))
    }
}
