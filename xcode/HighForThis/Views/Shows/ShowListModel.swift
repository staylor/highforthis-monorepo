import SwiftUI
import HighForThisAPI

typealias ShowListData = HighForThisAPI.ShowsQuery.Data.Shows
typealias ShowListNode = ShowListData.Edge.Node

struct ShowGroup: Identifiable {
    var id = UUID()
    var date: Double
    var shows: [ShowListNode]

    func dateFormatted() -> String {
        return parseDate(date)
    }
}

@Observable
class ShowListModel {
    var connection: ShowListData?
    var groups: [ShowGroup]?

    func fetchShows(
        first: Int = 200,
        latest: GraphQLNullable<Bool> = false,
        attended: GraphQLNullable<Bool> = false,
        year: GraphQLNullable<Int> = nil,
        refresh: Bool = false
    ) async {
        let query = HighForThisAPI.ShowsQuery(attended: attended, first: first, latest: latest, year: year)
        guard let data = await fetchData(query, cachePolicy: refresh ? .fetchIgnoringCacheData : cachePolicy) else { return }
        guard let shows = data.shows else { return }

        let nodes = shows.edges.map { $0.node }
        var dict: [Double: ShowGroup] = [:]

        for show in nodes {
            if dict[show.date] == nil {
                dict[show.date] = ShowGroup(date: show.date, shows: [])
            }
            dict[show.date]?.shows.append(show)
        }

        let byDate = dict.keys.sorted().compactMap { key -> ShowGroup? in
            guard var group = dict[key] else { return nil }
            group.shows.sort {
                ($0.artists.first?.name ?? "") < ($1.artists.first?.name ?? "")
            }
            return group
        }

        groups = byDate
        connection = shows
    }
}
