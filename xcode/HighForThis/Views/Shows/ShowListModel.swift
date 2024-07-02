import SwiftUI
import HighForThisAPI

typealias ShowListNode = HighForThisAPI.ShowsQuery.Data.Shows.Edge.Node

struct ShowGroup: Identifiable {
    var id = UUID()
    var date: Double
    var shows: [ShowListNode]
    
    func dateFormatted() -> String {
        return parseDate(date)
    }
}

class ShowListModel: ObservableObject {
    @Published var groups: [ShowGroup]?
    
    func fetchShows(refresh: Bool = false) {
        let query = HighForThisAPI.ShowsQuery()
        getData(query, cachePolicy: refresh ? .fetchIgnoringCacheData : cachePolicy) { data in
            var nodes = [ShowListNode]()
            for edge in data.shows!.edges {
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
        }
    }
}
