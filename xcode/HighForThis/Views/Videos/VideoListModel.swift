import SwiftUI
import HighForThisAPI

typealias VideosData = HighForThisAPI.VideosQuery.Data.Videos
typealias VideoListNode = VideosData.Edge.Node

class VideoListModel: ObservableObject {
    private var cursor: String?
    private var lastYear: Int?
    private var currentYear: Int?

    @Published var connection: VideosData?
    @Published var videos: [VideoListNode]?

    func fetchCursor() {
        cursor = connection?.edges.last?.cursor
        #if DEBUG
        print("setting cursor to: \(cursor ?? "nil")")
        #endif
        fetchData()
    }

    func fetchYear(_ year: Int) {
        currentYear = year > 0 ? year : nil
        #if DEBUG
        print("setting year to: \(year)")
        #endif
        fetchData()
    }

    func fetchData() {
        var after: GraphQLNullable<String> = .none
        let first: GraphQLNullable<Int> = 10
        var year: GraphQLNullable<Int> = .none

        if lastYear != currentYear {
            after = .none
            videos = nil
        } else if let cursor {
            after = .some(cursor)
        }

        if let currentYear {
            year = .some(currentYear)
            lastYear = currentYear
        } else {
            lastYear = nil
        }

        let query = HighForThisAPI.VideosQuery(after: after, first: first, year: year)
        getData(query) { [weak self] data in
            guard let self else { return }
            guard let videosData = data.videos else { return }

            let nodes = videosData.edges.map { $0.node }

            DispatchQueue.main.async {
                self.connection = videosData
                var currentVideos = self.videos ?? []
                currentVideos.append(contentsOf: nodes)
                self.videos = currentVideos
            }
        }
    }
}
