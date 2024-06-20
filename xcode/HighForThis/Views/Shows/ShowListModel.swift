import SwiftUI
import HighForThisAPI

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
        getShowList(refresh: refresh) { nodes in
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
