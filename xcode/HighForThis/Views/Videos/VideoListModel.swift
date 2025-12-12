import SwiftUI
import HighForThisAPI

typealias VideosData = HighForThisAPI.VideosQuery.Data.Videos
typealias VideoListNode = VideosData.Edge.Node

@Observable
class VideoListModel {
    private var cursor: String?
    private var lastYear: Int?
    private var currentYear: Int?

    var connection: VideosData?
    var videos: [VideoListNode]?

    func fetchCursor() async {
        cursor = connection?.edges.last?.cursor
        #if DEBUG
        print("setting cursor to: \(cursor ?? "nil")")
        #endif
        await fetchVideos()
    }

    func fetchYear(_ year: Int) async {
        currentYear = year > 0 ? year : nil
        #if DEBUG
        print("setting year to: \(year)")
        #endif
        await fetchVideos()
    }

    func fetchVideos() async {
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
        guard let data = await fetchData(query) else { return }
        guard let videosData = data.videos else { return }

        let nodes = videosData.edges.map { $0.node }

        connection = videosData
        var currentVideos = videos ?? []
        currentVideos.append(contentsOf: nodes)
        videos = currentVideos
    }
}
