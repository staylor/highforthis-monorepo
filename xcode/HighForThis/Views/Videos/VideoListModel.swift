import SwiftUI
import HighForThisAPI

typealias VideosData = HighForThisAPI.VideosQuery.Data.Videos
typealias VideoListNode = VideosData.Edge.Node

class VideoListModel: ObservableObject {
    var cursor: String?
    var lastYear: Int?
    var currentYear: Int?

    @Published var connection: VideosData?
    @Published var videos: [VideoListNode]?
    
    func fetchCursor() {
        cursor = connection?.edges.last?.cursor
        print("setting cursor to: \(cursor!)")
        fetchData()
    }
    
    func fetchYear(_ year: Int) {
        currentYear = year > 0 ? year : nil
        print("setting year to: \(year)")
        fetchData()
    }
    
    func fetchData() {
        var after: GraphQLNullable<String> = .none
        let first: GraphQLNullable<Int> = 10
        var year: GraphQLNullable<Int> = .none
        
        if lastYear != currentYear {
            after = .none
            videos = nil
        } else if (cursor != nil) {
            after = .some(cursor!)
        }
        if currentYear != nil {
            year = .some(currentYear!)
            lastYear = currentYear
        } else {
            lastYear = nil
        }
        
        let query = HighForThisAPI.VideosQuery(after: after, first: first, year: year)
        getData(query) { data in
            let videos = data.videos!
            var nodes = [VideoListNode]()
            for edge in videos.edges {
                nodes.append(edge.node)
            }
            
            self.connection = videos
            self.videos = self.videos ?? []
            self.videos!.append(contentsOf: nodes)
        }
    }
}
