import SwiftUI
import HighForThisAPI

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
        print("setting cursor to: \(year)")
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
        
        getVideos(after: after, first: first, year: year) { videos in
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
