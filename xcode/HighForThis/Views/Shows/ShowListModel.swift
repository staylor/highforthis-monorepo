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

class ShowListModel: ObservableObject {
    @Published var connection: ShowListData?
    @Published var groups: [ShowGroup]?
    
    func fetchShows(
        first: Int = 200,
        latest: GraphQLNullable<Bool> = false,
        attended: GraphQLNullable<Bool> = false,
        year: GraphQLNullable<Int> = nil,
        refresh: Bool = false
    ) {
        let query = HighForThisAPI.ShowsQuery(attended: attended, first: first, latest: latest, year: year)
        getData(query, cachePolicy: refresh ? .fetchIgnoringCacheData : cachePolicy) { data in
            let shows = data.shows!
            var nodes = [ShowListNode]()
            for edge in shows.edges {
                nodes.append(edge.node)
            }
            var dict: [Double:ShowGroup] = [:]
            for show in nodes {
                if dict[show.date] == nil {
                    dict[show.date] = ShowGroup(date: show.date, shows: []);
                }
                dict[show.date]!.shows.append(show)
            }
            let sortedKeys = dict.keys.sorted()
            var byDate: [ShowGroup] = []
            for key in sortedKeys {
                var group = dict[key]!
                group.shows.sort { $0.artists[0].name < $1.artists[0].name }
                byDate.append(group)
            }
            self.groups = byDate
            self.connection = shows
        }
    }
}
